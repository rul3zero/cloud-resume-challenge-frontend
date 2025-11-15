// Typewriter effect for homepage greeting
// Runs once on page load, types out the greeting character by character

(function() {
  'use strict';

  // Only run on homepage
  if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
    return;
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTypewriter);
  } else {
    initTypewriter();
  }

  function initTypewriter() {
    const element = document.getElementById('typewriter-greeting');
    if (!element) return;

    const text = element.getAttribute('data-text');
    if (!text) {
      element.textContent = 'Welcome';
      return;
    }

    // Check if typewriter has already run (using sessionStorage)
    const hasTyped = sessionStorage.getItem('typewriter-complete');
    
    if (hasTyped) {
      // Already typed in this session, show immediately
      element.textContent = text;
      element.classList.add('typewriter-complete');
      return;
    }

    // Clear the element and add typewriter class
    element.textContent = '';
    element.classList.add('typewriter-active');

    let charIndex = 0;
    const typingSpeed = 80; // milliseconds per character
    const cursorBlinkSpeed = 530; // cursor blink speed

    // Add cursor
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    cursor.textContent = '|';
    element.appendChild(cursor);

    function typeNextChar() {
      if (charIndex < text.length) {
        // Insert character before cursor
        const textNode = document.createTextNode(text.charAt(charIndex));
        element.insertBefore(textNode, cursor);
        charIndex++;
        setTimeout(typeNextChar, typingSpeed);
      } else {
        // Typing complete
        setTimeout(function() {
          cursor.remove();
          element.classList.remove('typewriter-active');
          element.classList.add('typewriter-complete');
          // Mark as complete in sessionStorage (only for this session)
          sessionStorage.setItem('typewriter-complete', 'true');
        }, 500); // Brief pause before removing cursor
      }
    }

    // Start typing after a short delay
    setTimeout(typeNextChar, 300);
  }
})();
