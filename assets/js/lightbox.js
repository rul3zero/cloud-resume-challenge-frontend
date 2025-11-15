// Lightbox functionality for images
// Opens images in fullscreen overlay with close button
// Supports keyboard (ESC), click outside, and X button to close

(function() {
  'use strict';

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightbox);
  } else {
    initLightbox();
  }

  function initLightbox() {
    // Create lightbox overlay
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.innerHTML = `
      <span class="lightbox-close">&times;</span>
      <img class="lightbox-content" id="lightbox-img" alt="">
      <div class="lightbox-caption"></div>
    `;
    document.body.appendChild(lightbox);

    // Get the lightbox elements
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const closeBtn = document.querySelector('.lightbox-close');

    // Function to open lightbox
    function openLightbox(imgSrc, imgAlt) {
      lightbox.style.display = 'flex';
      lightboxImg.src = imgSrc;
      lightboxImg.alt = imgAlt || '';
      lightboxCaption.textContent = imgAlt || '';
      document.body.style.overflow = 'hidden';
    }

    // Function to close lightbox
    function closeLightbox() {
      lightbox.style.display = 'none';
      document.body.style.overflow = 'auto';
    }

    // Add click event to gallery links (prevent default and open lightbox)
    document.querySelectorAll('.gallery-link').forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const img = this.querySelector('img');
        if (img) {
          openLightbox(img.src, img.alt);
        }
      });
    });

    // Add click event to terminal-figure containers
    document.querySelectorAll('.terminal-figure-container').forEach(function(container) {
      container.addEventListener('click', function(e) {
        e.preventDefault();
        const img = this.querySelector('.terminal-figure-img');
        if (img) {
          // Get caption from figcaption if available
          const figure = this.closest('.terminal-figure-wrapper');
          const caption = figure ? figure.querySelector('.caption') : null;
          const captionText = caption ? caption.textContent : img.alt;
          openLightbox(img.src, captionText);
        }
      });
    });

    // Add click event to regular content images (not in gallery or terminal-figure)
    document.querySelectorAll('.content img').forEach(function(img) {
      // Skip if image is inside a gallery or terminal-figure
      if (!img.closest('.gallery-item') && !img.closest('.terminal-figure-container')) {
        img.style.cursor = 'pointer';
        img.addEventListener('click', function(e) {
          e.preventDefault();
          openLightbox(this.src, this.alt);
        });
      }
    });

    // Close lightbox when clicking X button
    closeBtn.addEventListener('click', closeLightbox);

    // Close lightbox when clicking outside image
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox || e.target === closeBtn) {
        closeLightbox();
      }
    });

    // Close lightbox with Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && lightbox.style.display === 'flex') {
        closeLightbox();
      }
    });
  }
})();
