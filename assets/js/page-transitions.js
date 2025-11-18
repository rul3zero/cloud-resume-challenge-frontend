// Page transition effect
document.addEventListener('DOMContentLoaded', () => {
    // Fade in on page load
    document.body.classList.add('page-loaded');
    
    // Handle navigation links
    const links = document.querySelectorAll('a:not([target="_blank"]):not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"])');
    
    links.forEach(link => {
        // Only handle internal links
        if (link.hostname === window.location.hostname) {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Skip if it's a hash link or special link
                if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                    return;
                }
                
                e.preventDefault();
                document.body.classList.add('page-transitioning');
                
                setTimeout(() => {
                    window.location.href = href;
                }, 300); // Match transition duration
            });
        }
    });
});
