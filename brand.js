(() => {
  const version = "20260724-2";

  function installStylesheet() {
    let link = document.querySelector('link[href*="brand-update.css"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = `brand-update.css?v=${version}`;
  }

  function applyBrand() {
    document.querySelectorAll(".brand-mark img").forEach((image, index) => {
      image.src = `assets/brand-mark.svg?v=${version}`;
      image.alt = "";
      image.width = 560;
      image.height = 390;
      image.decoding = "async";
      image.loading = "eager";
      if (index === 0) image.fetchPriority = "high";
    });

    document.querySelectorAll(".footer-brand").forEach(link => {
      link.classList.add("brand-full-lockup");
      if (!link.querySelector(".brand-full-logo")) {
        link.innerHTML = `<img class="brand-full-logo" src="assets/narli-digital-logo-full.svg?v=${version}" width="680" height="820" loading="lazy" decoding="async" alt="NARLI DIGITAL">`;
      }
    });
  }

  function activateDeferredStyles() {
    document.querySelectorAll('link[data-deferred-style][media="print"]').forEach(link => {
      link.media = "all";
    });
  }

  function scheduleDeferredStyles() {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(activateDeferredStyles, { timeout: 1500 });
    } else {
      window.setTimeout(activateDeferredStyles, 250);
    }
  }

  installStylesheet();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyBrand, { once: true });
  } else {
    applyBrand();
  }

  if (document.readyState === "complete") {
    scheduleDeferredStyles();
  } else {
    window.addEventListener("load", scheduleDeferredStyles, { once: true });
  }
})();