/**
 * Resume Download with reCAPTCHA Protection, Download Tracking, and S3 Presigned URLs
 * Features:
 * - Bot protection via Google reCAPTCHA v3
 * - Download count tracking
 * - Secure S3 presigned URL downloads (5-minute expiration)
 * - Success/error notifications
 * - Proper error handling and user feedback
 */

document.addEventListener('DOMContentLoaded', () => {
    const resumeBtn = document.getElementById('resumeDownloadBtn');
    
    if (!resumeBtn) {
        console.warn('Resume download button not found');
        return;
    }
    
    // Store original button HTML
    const originalButtonHTML = resumeBtn.innerHTML;
    
    resumeBtn.addEventListener('click', async () => {
        const recaptchaKey = document.querySelector('meta[name="recaptcha-key"]')?.content;
        
        if (!recaptchaKey) {
            showError('reCAPTCHA is not configured. Please contact the site administrator.');
            return;
        }
        
        // Check if grecaptcha is loaded
        if (typeof grecaptcha === 'undefined') {
            showError('reCAPTCHA script not loaded. Please refresh the page.');
            return;
        }
        
        // Disable button during processing
        setButtonState(resumeBtn, 'loading', 'Verifying...');
        
        try {
            // Execute reCAPTCHA
            const token = await grecaptcha.execute(recaptchaKey, { action: 'resume_download' });
            
            // Verify the token and get download URL from backend
            const response = await fetch('https://api.joshcarl.dev/resume-download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                    action: 'resume_download'
                })
            });
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Check for rate limiting (429 Too Many Requests)
            if (response.status === 429) {
                const limitMsg = data.message || 'Daily download limit reached';
                const detailMsg = data.downloadsToday && data.maxDownloads 
                    ? ` You've downloaded ${data.downloadsToday} time(s) today (max: ${data.maxDownloads})`
                    : '';
                throw new Error(limitMsg + detailMsg);
            }
            
            // Check if verification was successful and download is allowed
            if (data.success && data.downloadAllowed) {
                // Use the presigned S3 URL from backend
                if (data.downloadUrl) {
                    setButtonState(resumeBtn, 'loading', 'Downloading...');
                    await downloadResumeFromUrl(data.downloadUrl);
                    
                    // Show success notification
                    showSuccess(`Resume downloaded successfully!${data.downloadCount ? ` (Download #${data.downloadCount})` : ''}`);
                } else {
                    throw new Error('Download URL not provided');
                }
                
                // Reset button after short delay
                setTimeout(() => {
                    resetButton(resumeBtn, originalButtonHTML);
                }, 1500);
            } else {
                throw new Error(data.message || 'Download verification failed. Please try again.');
            }
        } catch (error) {
            console.error('Resume download failed:', error);
            showError(error.message || 'Failed to verify download. Please try again.');
            resetButton(resumeBtn, originalButtonHTML);
        }
    });
});

/**
 * Download resume from S3 presigned URL
 */
async function downloadResumeFromUrl(url) {
    return new Promise((resolve, reject) => {
        try {
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';  // Open in new tab as fallback
            
            // Track if download started
            link.addEventListener('click', () => {
                setTimeout(() => resolve(), 100);
            });
            
            // Append, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Fallback: Trigger resume download from local file (not used with S3)
 */
async function downloadResume() {
    return new Promise((resolve, reject) => {
        try {
            const link = document.createElement('a');
            link.href = '/resume.pdf';
            link.download = 'Joshua_Carl_Soguilon_Resume.pdf';
            
            // Track if download started
            link.addEventListener('click', () => {
                setTimeout(() => resolve(), 100);
            });
            
            // Append, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Set button state (loading, success, error)
 */
function setButtonState(button, state, text) {
    button.disabled = true;
    
    const icons = {
        loading: '<span class="spinner"></span>',
        success: '<svg class="state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
        error: '<svg class="state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
    };
    
    button.innerHTML = `${icons[state] || ''}<span>${text}</span>`;
}

/**
 * Reset button to original state
 */
function resetButton(button, originalHTML) {
    button.disabled = false;
    button.innerHTML = originalHTML;
}

/**
 * Show success notification
 */
function showSuccess(message) {
    showNotification(message, 'success');
}

/**
 * Show error notification
 */
function showError(message) {
    showNotification(message, 'error');
}

/**
 * Show notification to user with custom toast styling
 */
function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingToast = document.querySelector('.resume-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `resume-toast resume-toast-${type}`;
    
    // Add icon based on type
    const icons = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };
    
    toast.innerHTML = `
        <div class="resume-toast-icon">${icons[type] || icons.info}</div>
        <div class="resume-toast-message">${message}</div>
    `;
    
    // Add to document
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('resume-toast-show'), 10);
    
    // Auto-remove after delay
    const duration = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
        toast.classList.remove('resume-toast-show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
    
    // Also log to console
    const logPrefix = { success: '✓', error: '✗', info: 'ℹ' }[type] || '';
    console.log(`${logPrefix} ${message}`);
}