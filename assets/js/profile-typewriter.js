// Profile whoami typewriter animation
(function() {
  'use strict';

  function initProfileTypewriter() {
    const outputs = document.querySelectorAll('.profile-output');
    if (!outputs.length) return;

    outputs.forEach(output => {
      const name = output.getAttribute('data-name');
      if (!name) return;

      const prompt = 'root@joshcarl.dev:~$ ';
      const command = 'whoami';
      
      // Clear the element
      output.textContent = '';
      
      let charIndex = 0;
      const typingSpeed = 80; // milliseconds per character
      const initialDelay = 1500; // delay before typing starts
      const clearDelay = 1800; // delay before clearing command
      const resultDelay = 300; // delay before showing result

      // Add colored prompt wrapper (not typed)
      const promptSpan = document.createElement('span');
      promptSpan.className = 'profile-prompt';
      promptSpan.textContent = prompt;
      output.appendChild(promptSpan);

      // Add command wrapper for typing
      const commandSpan = document.createElement('span');
      commandSpan.className = 'profile-command';
      output.appendChild(commandSpan);

      // Add cursor
      const cursor = document.createElement('span');
      cursor.className = 'profile-cursor';
      cursor.textContent = '|';
      commandSpan.appendChild(cursor);

      // Start typing command after initial delay
      setTimeout(() => {
        const typeCommand = () => {
          if (charIndex < command.length) {
            const textNode = document.createTextNode(command.charAt(charIndex));
            commandSpan.insertBefore(textNode, cursor);
            charIndex++;
            setTimeout(typeCommand, typingSpeed);
          } else {
            // After command is typed, wait then clear and show result
            setTimeout(() => {
              // Clear everything
              output.textContent = '';
              
              // Show result after brief delay
              setTimeout(() => {
                output.textContent = name;
                output.classList.add('profile-output-complete');
              }, resultDelay);
            }, clearDelay);
          }
        };
        typeCommand();
      }, initialDelay);
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfileTypewriter);
  } else {
    initProfileTypewriter();
  }
})();
