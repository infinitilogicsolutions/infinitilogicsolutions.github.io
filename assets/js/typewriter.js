(() => {
  const elements = document.querySelectorAll('.brand-text.typewriter');
  if (!elements.length) return;

  const defaultText = 'InfinitiLogicSolutions';
  const defaultColors = [
    'g-blue',
    'g-red',
    'g-yellow',
    'g-blue',
    'g-green',
    'g-red',
    'g-blue',
    'g-red',
    'g-yellow',
    'g-blue',
    'g-green',
    'g-red',
    'g-blue',
    'g-red',
    'g-yellow',
    'g-blue',
    'g-green',
    'g-red',
    'g-blue',
    'g-red',
    'g-yellow',
    'g-blue'
  ];

  const reduceMotion = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const typeSpeed = 120;
  const deleteSpeed = 60;
  const pauseAfterTyping = 900;
  const pauseBeforeTyping = 300;

  const createLetter = (char, colorClass) => {
    const span = document.createElement('span');
    if (colorClass) {
      span.classList.add(colorClass);
    }
    span.textContent = char;
    return span;
  };

  const renderFullText = (textSpan, text, colors) => {
    textSpan.textContent = '';
    for (let i = 0; i < text.length; i += 1) {
      textSpan.appendChild(createLetter(text[i], colors[i % colors.length]));
    }
  };

  elements.forEach((element, index) => {
    const text = (element.dataset.text || element.textContent || defaultText).trim() || defaultText;
    const parsedColors = element.dataset.colors
      ? element.dataset.colors.split(',').map((item) => item.trim()).filter(Boolean)
      : defaultColors;
    const colors = parsedColors.length ? parsedColors : defaultColors;

    element.textContent = '';

    const textSpan = document.createElement('span');
    textSpan.className = 'typewriter-text';

    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    cursor.textContent = '_';
    cursor.setAttribute('aria-hidden', 'true');

    element.appendChild(textSpan);
    element.appendChild(cursor);

    if (reduceMotion) {
      renderFullText(textSpan, text, colors);
      cursor.style.display = 'none';
      return;
    }

    let currentIndex = 0;
    let deleting = false;

    const tick = () => {
      if (!deleting) {
        if (currentIndex < text.length) {
          textSpan.appendChild(createLetter(text[currentIndex], colors[currentIndex % colors.length]));
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
        textSpan.removeChild(textSpan.lastChild);
        currentIndex -= 1;
        setTimeout(tick, deleteSpeed);
        return;
      }

      deleting = false;
      setTimeout(tick, pauseBeforeTyping);
    };

    setTimeout(tick, pauseBeforeTyping + index * 150);
  });
})();
