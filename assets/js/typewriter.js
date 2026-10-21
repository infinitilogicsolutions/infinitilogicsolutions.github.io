// Keep the brand readable immediately, including offline and reduced-motion use.
(() => {
  document.querySelectorAll('.brand-text.typewriter').forEach(element => {
    element.textContent = (element.dataset.text || element.textContent || 'InfinitiLogicSolutions').trim();
    element.classList.remove('typewriter');
  });
})();
