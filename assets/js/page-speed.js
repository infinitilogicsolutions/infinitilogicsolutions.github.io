// Navigation-to-load timing for this visit, not a Lighthouse score.
(() => {
  function showTiming() {
    // Read after the load event finishes so loadEventEnd is populated.
    setTimeout(() => {
      const timing = performance.getEntriesByType('navigation')[0];
      const duration = timing && timing.loadEventEnd - timing.startTime;
      document.querySelectorAll('[data-page-load]').forEach((element) => {
        element.textContent = duration > 0
          ? `Page load: ${(duration / 1000).toFixed(2)} s`
          : 'Page load: unavailable';
        element.title = 'Time from navigation start to the load event for this visit.';
      });
    }, 0);
  }
  if (document.readyState === 'complete') showTiming();
  else window.addEventListener('load', showTiming, { once: true });
})();
