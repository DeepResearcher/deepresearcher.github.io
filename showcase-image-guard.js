(() => {
  const fallback = 'assets/hero-narli-showcase-hq.webp';

  function useFallback(image) {
    if (!(image instanceof HTMLImageElement) || !image.closest('#portfolio')) return;
    if (image.dataset.imageGuardFallback === 'true') {
      image.style.visibility = 'hidden';
      return;
    }
    image.dataset.imageGuardFallback = 'true';
    image.src = fallback;
  }

  function inspect(image) {
    if (!(image instanceof HTMLImageElement) || !image.closest('#portfolio')) return;
    if (image.complete && image.naturalWidth === 0) useFallback(image);
  }

  document.addEventListener('error', event => {
    if (event.target instanceof HTMLImageElement) useFallback(event.target);
  }, true);

  function scan(root = document) {
    root.querySelectorAll?.('#portfolio img').forEach(inspect);
  }

  const start = () => {
    scan();
    const portfolio = document.querySelector('#portfolio');
    if (!portfolio) return;
    new MutationObserver(records => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType === 1) scan(node);
        }
      }
    }).observe(portfolio, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
