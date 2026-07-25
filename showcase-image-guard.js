(() => {
  const version = '20260725-guard-1';
  const verified = [
    `assets/services/project-websites/futureskills.webp?v=${version}`,
    `assets/hero-narli-showcase-hq.webp?v=${version}`,
    `assets/portfolio/optimized/portfolio-04.webp?v=${version}`,
    `assets/hero-narli-showcase-hq.webp?v=${version}`
  ];
  const secondary = [
    `assets/services/project-websites/ai4cities-dark.webp?v=${version}`,
    `assets/services/project-websites/futureskills.webp?v=${version}`
  ];
  const knownBroken = [
    'assets/services/ai-toolkits/ai-assistant.webp',
    'assets/services/ai-toolkits/greened-toolkit.webp',
    'assets/services/project-websites/ai4cities-light.webp',
    'assets/services/web-mobile-apps/learning-dashboard.webp',
    'assets/services/web-mobile-apps/greenmind-ecosystem.webp',
    'assets/services/serious-games/' ,
    'assets/portfolio/digital-learning-gallery.webp'
  ];

  function categoryIndex(image) {
    const card = image.closest('.service-showcase-card');
    const index = Number(card?.dataset.serviceIndex);
    return Number.isInteger(index) && index >= 0 && index < verified.length ? index : 0;
  }

  function candidates(image) {
    const primary = verified[categoryIndex(image)];
    return [...new Set([primary, ...secondary])];
  }

  function useNextFallback(image) {
    if (!(image instanceof HTMLImageElement) || !image.closest('#portfolio')) return;
    const list = candidates(image);
    const attempt = Number(image.dataset.imageGuardAttempt || 0);
    if (attempt >= list.length) {
      image.style.visibility = 'hidden';
      return;
    }
    image.dataset.imageGuardAttempt = String(attempt + 1);
    image.style.visibility = '';
    image.src = list[attempt];
  }

  function inspect(image) {
    if (!(image instanceof HTMLImageElement) || !image.closest('#portfolio')) return;
    const src = image.getAttribute('src') || '';
    const index = categoryIndex(image);

    // The AI fallback used previously is itself corrupted. Replace it before paint.
    if (index === 3 && (src.includes('digital-learning-gallery') || src.includes('ai-assistant'))) {
      image.dataset.imageGuardAttempt = '1';
      image.src = verified[3];
      return;
    }

    // Replace the original corrupted service uploads if an older cached slider creates them.
    if (knownBroken.some(fragment => src.includes(fragment))) {
      image.dataset.imageGuardAttempt = '1';
      image.src = verified[index];
      return;
    }

    if (image.complete && image.naturalWidth === 0) useNextFallback(image);
  }

  document.addEventListener('error', event => {
    if (event.target instanceof HTMLImageElement) useNextFallback(event.target);
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
