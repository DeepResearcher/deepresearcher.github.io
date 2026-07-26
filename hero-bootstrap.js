(async () => {
  const heroGrid = document.querySelector(".hero-grid");
  if (heroGrid) heroGrid.hidden = true;

  let language = "de";
  try {
    language = localStorage.getItem("narli-language") === "en" ? "en" : "de";
  } catch (_) {}

  document.documentElement.lang = language;

  if (language === "en") {
    const englishHero = {
      "hero.eyebrow": "Digital Outputs for European Projects",
      "hero.title": "We design and deliver websites, apps, serious games, AI tools and other digital solutions for European projects.",
      "hero.ctaPrimary": "Discuss Your Project",
      "hero.trust1": "Focused on digital outputs",
      "hero.trust2": "Concept, development & handover",
      "hero.trust3": "Berlin · Europe-wide"
    };

    Object.entries(englishHero).forEach(([key, value]) => {
      const element = document.querySelector(`[data-i18n="${key}"]`);
      if (element) element.textContent = value;
    });
  }

  const heroCopy = document.querySelector(".hero-copy");
  const figure = document.querySelector(".hero-product-figure");
  const eyebrow = heroCopy?.querySelector(":scope > .eyebrow");

  if (figure && eyebrow) {
    eyebrow.classList.add("hero-figure-eyebrow");
    figure.insertBefore(eyebrow, figure.firstChild);
  }

  heroCopy?.querySelector(":scope > .hero-lead")?.remove();
  heroCopy?.querySelector('.hero-actions > .button-secondary[href="#services"]')?.remove();
  figure?.querySelector("figcaption")?.remove();

  document.querySelectorAll("[data-lang]").forEach(button => {
    const active = button.dataset.lang === language;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  const loadStyles = () => new Promise(resolve => {
    const href = "hero-layout.css?v=20260725-stable-1";
    let stylesheet = document.querySelector('link[href*="hero-layout.css"]');

    if (stylesheet?.sheet) {
      resolve();
      return;
    }

    if (!stylesheet) {
      stylesheet = document.createElement("link");
      stylesheet.rel = "stylesheet";
      stylesheet.href = href;
      document.head.appendChild(stylesheet);
    }

    stylesheet.addEventListener("load", resolve, { once: true });
    stylesheet.addEventListener("error", resolve, { once: true });
  });

  const loadArtwork = () => new Promise(resolve => {
    const image = figure?.querySelector(".hero-product-art");
    if (!image) {
      resolve();
      return;
    }

    image.classList.add("hero-product-photo");
    image.width = 1041;
    image.height = 858;
    image.alt = language === "en"
      ? "NARLI DIGITAL presentation of digital solutions for education and innovation"
      : "NARLI DIGITAL Präsentation digitaler Lösungen für Bildung und Innovation";
    image.addEventListener("load", resolve, { once: true });
    image.addEventListener("error", resolve, { once: true });
    image.src = "assets/hero-narli-devices.webp?v=20260726-photo-1";

    if (image.complete) resolve();
  });

  await Promise.race([
    Promise.allSettled([loadStyles(), loadArtwork()]),
    new Promise(resolve => window.setTimeout(resolve, 2500))
  ]);

  if (heroGrid) heroGrid.hidden = false;
  document.documentElement.classList.add("hero-ready");

  requestAnimationFrame(() => initHeroBrandMorph());

  function initHeroBrandMorph() {
    const heroBrand = document.querySelector(".hero-brand");
    const headerBrand = document.querySelector(".site-header .brand");
    if (!heroBrand || !headerBrand) return;

    let startRect, endRect, scaleX, scaleY, deltaX, distance;

    function measure() {
      heroBrand.style.transform = "none";
      startRect = heroBrand.getBoundingClientRect();
      endRect = headerBrand.getBoundingClientRect();

      scaleX = endRect.width / startRect.width;
      scaleY = endRect.height / startRect.height;
      deltaX = endRect.left - startRect.left;
      // Natural scrolling already carries the element's own top edge up the
      // page; sizing the animation distance to that exact gap means no
      // vertical transform is needed - it arrives at the header's Y position
      // by scroll alone, right as the horizontal/scale interpolation ends.
      distance = Math.max(startRect.top - endRect.top, 80);
      update();
    }

    function update() {
      const progress = Math.min(Math.max(window.scrollY / distance, 0), 1);
      const eased = progress * progress * (3 - 2 * progress);
      const scaleXNow = 1 + (scaleX - 1) * eased;
      const scaleYNow = 1 + (scaleY - 1) * eased;
      heroBrand.style.transform = `translateX(${deltaX * eased}px) scale(${scaleXNow}, ${scaleYNow})`;
      heroBrand.style.opacity = String(1 - eased);
    }

    measure();

    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    }, { passive: true });

    let resizeTimer;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measure, 150);
    });
  }
})();
