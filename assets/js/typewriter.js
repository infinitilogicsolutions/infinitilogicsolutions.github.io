(() => {
  const elements = document.querySelectorAll('.brand-text.typewriter');
  if (!elements.length) return;

  const defaultText = 'InfinitiLogicSolutions';
  const reduceMotion = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const typeSpeed = 120;
  const deleteSpeed = 60;
  const pauseAfterTyping = 900;
  const pauseBeforeTyping = 300;

  elements.forEach((element, index) => {
    const text = (element.dataset.text || element.textContent || defaultText).trim() || defaultText;

    element.textContent = '';

    const textSpan = document.createElement('span');
    textSpan.className = 'typewriter-text gradient-text';

    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    cursor.textContent = '_';
    cursor.setAttribute('aria-hidden', 'true');

    element.appendChild(textSpan);
    element.appendChild(cursor);

    if (reduceMotion) {
      textSpan.textContent = text;
      cursor.style.display = 'none';
      return;
    }

    let currentIndex = 0;
    let deleting = false;

    const tick = () => {
      if (!deleting) {
        if (currentIndex < text.length) {
          textSpan.textContent = text.slice(0, currentIndex + 1);
          currentIndex += 1;
          if (currentIndex === text.length) {
            deleting = true;
            setTimeout(tick, pauseAfterTyping);
            return;
          }
          setTimeout(tick, typeSpeed);
          return;
        }

        deleting = true;
        setTimeout(tick, pauseAfterTyping);
        return;
      }

      if (currentIndex > 0) {
        currentIndex -= 1;
        textSpan.textContent = text.slice(0, currentIndex);
        setTimeout(tick, deleteSpeed);
        return;
      }

      deleting = false;
      setTimeout(tick, pauseBeforeTyping);
    };

    setTimeout(tick, pauseBeforeTyping + index * 150);
  });
})();
