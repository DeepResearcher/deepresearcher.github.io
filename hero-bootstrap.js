(() => {
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
      "hero.trust3": "Berlin · Europe-wide",
      "hero.visualCaption": "Illustrative ecosystem of digital outputs"
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

  document.querySelectorAll("[data-lang]").forEach(button => {
    const active = button.dataset.lang === language;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  let revealed = false;
  const revealHero = () => {
    if (revealed) return;
    revealed = true;
    if (heroGrid) heroGrid.hidden = false;
    document.documentElement.classList.add("hero-ready");
  };

  const stylesheetHref = "hero-layout.css?v=20260724-hero-layout-1";
  let stylesheet = document.querySelector('link[href*="hero-layout.css"]');

  if (stylesheet?.sheet) {
    revealHero();
    return;
  }

  if (!stylesheet) {
    stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = stylesheetHref;
    document.head.appendChild(stylesheet);
  }

  stylesheet.addEventListener("load", revealHero, { once: true });
  stylesheet.addEventListener("error", revealHero, { once: true });
  window.setTimeout(revealHero, 2000);
})();
