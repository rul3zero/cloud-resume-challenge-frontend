// reCAPTCHA v3 Visitor Counter with LocalStorage Cache
const recaptchaKey = document.querySelector('meta[name="recaptcha-key"]')?.getAttribute('content');

// Your API Gateway endpoint
const API_ENDPOINT = 'https://api.joshcarl.dev/count';

// Check if we already have visitor count in localStorage
function hasValidCache() {
    const cachedCount = localStorage.getItem('visitor_count');
    const cachedTimestamp = localStorage.getItem('visitor_timestamp');
    
    if (!cachedCount || !cachedTimestamp) return false;
    
    // Cache is valid for 24 hours (same as IP TTL)
    const now = Date.now();
    const hoursSinceCached = (now - parseInt(cachedTimestamp)) / (1000 * 60 * 60);
    
    return hoursSinceCached < 24;
}

// Get cached visitor count
function getCachedCount() {
    return localStorage.getItem('visitor_count');
}

// Save visitor count to cache
function cacheVisitorCount(count) {
    localStorage.setItem('visitor_count', count.toString());
    localStorage.setItem('visitor_timestamp', Date.now().toString());
}

// Fallback: fetch count without reCAPTCHA verification (no increment)
async function fetchVisitorCountDirect() {
    try {
        console.log('Fetching visitor count (read-only)...');
        
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: 'fallback', readOnly: true }) // Read-only mode
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('Visitor count fetched:', data.count);
            cacheVisitorCount(data.count);
            displayVisitorCount(data.count);
        } else {
            console.error('Failed to fetch count:', data.error);
            // Still try to display something if we have any cached data
            const fallbackCount = localStorage.getItem('visitor_count');
            if (fallbackCount) {
                displayVisitorCount(parseInt(fallbackCount));
            }
        }
    } catch (error) {
        console.error('Network error:', error);
        // Try to display cached count as fallback
        const fallbackCount = localStorage.getItem('visitor_count');
        if (fallbackCount) {
            displayVisitorCount(parseInt(fallbackCount));
        }
    }
}

if (recaptchaKey) {
    document.addEventListener('DOMContentLoaded', function() {
        const isHomePage = window.location.pathname === '/' || window.location.pathname === '';
        
        // Always try to display cached count first (on all pages)
        if (hasValidCache()) {
            const cachedCount = getCachedCount();
            console.log('Using cached visitor count:', cachedCount);
            displayVisitorCount(parseInt(cachedCount));
            
            // If on home page and cache is valid, don't increment
            if (isHomePage) {
                return; // Don't call API, we already have a recent count
            }
        } else if (isHomePage) {
            // Only on home page: no valid cache - proceed with reCAPTCHA to increment
            console.log('No valid cache found, calling API...');
            grecaptcha.ready(function() {
                grecaptcha.execute(recaptchaKey, {action: 'homepage'})
                    .then(function(token) {
                        console.log('reCAPTCHA token generated');
                        incrementVisitorCount(token);
                    })
                    .catch(function(error) {
                        console.error('reCAPTCHA Error:', error);
                        // Fallback: try to fetch count without reCAPTCHA
                        fetchVisitorCountDirect();
                    });
            });
        } else {
            // Not home page and no cache - try to fetch count without incrementing
            fetchVisitorCountDirect();
        }
    });
} else {
    // No reCAPTCHA key configured - fetch count directly
    document.addEventListener('DOMContentLoaded', function() {
        const isHomePage = window.location.pathname === '/' || window.location.pathname === '';
        
        // Always try to display cached count first (on all pages)
        if (hasValidCache()) {
            const cachedCount = getCachedCount();
            console.log('Using cached visitor count:', cachedCount);
            displayVisitorCount(parseInt(cachedCount));
            
            // If not on home page, we're done (just showing cached count)
            if (!isHomePage) {
                return;
            }
        }
        
        // Only fetch/increment on home page
        if (isHomePage) {
            fetchVisitorCountDirect();
        }
    });
}

async function incrementVisitorCount(token) {
    try {
        console.log('Calling API to increment visitor count...');
        
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: token })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('Visitor count:', data.count);
            
            // Cache the count for 24 hours
            cacheVisitorCount(data.count);
            
            displayVisitorCount(data.count);
        } else {
            console.error('API returned error:', data.error);
            // Try fallback method
            fetchVisitorCountDirect();
        }
    } catch (error) {
        console.error('Network error:', error);
        // Try fallback method
        fetchVisitorCountDirect();
    }
}

function displayVisitorCount(count) {
    const tokenDisplay = document.getElementById('recaptcha-token');
    if (tokenDisplay) {
        tokenDisplay.innerHTML = '<span class="visitor-label">Visitor Count: </span><span class="visitor-count">' + count.toLocaleString() + '</span>';
    }
}
