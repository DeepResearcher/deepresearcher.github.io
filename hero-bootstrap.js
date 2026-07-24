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
    const href = "hero-layout.css?v=20260724-hero-artwork-1";
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
    image.width = 384;
    image.height = 384;
    image.alt = language === "en"
      ? "NARLI DIGITAL presentation of digital solutions for education and innovation"
      : "NARLI DIGITAL Präsentation digitaler Lösungen für Bildung und Innovation";
    image.addEventListener("load", resolve, { once: true });
    image.addEventListener("error", resolve, { once: true });
    image.src = "assets/hero-narli-banner.webp?v=20260724-1";

    if (image.complete) resolve();
  });

  await Promise.race([
    Promise.allSettled([loadStyles(), loadArtwork()]),
    new Promise(resolve => window.setTimeout(resolve, 2500))
  ]);

  if (heroGrid) heroGrid.hidden = false;
  document.documentElement.classList.add("hero-ready");
})();