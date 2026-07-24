(() => {
  let language = "de";
  try {
    language = localStorage.getItem("narli-language") === "en" ? "en" : "de";
  } catch (_) {}

  document.documentElement.lang = language;

  if (language === "en") {
    const englishHero = {
      "hero.eyebrow": "Digital Outputs for European Projects",
      "hero.title": "We design and deliver websites, apps, serious games, AI tools and other digital solutions for European projects.",
      "hero.lead": "From concept and development to deployment, documentation and ongoing support.",
      "hero.ctaPrimary": "Discuss Your Project",
      "hero.ctaSecondary": "Explore Services",
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

  document.querySelectorAll("[data-lang]").forEach(button => {
    const active = button.dataset.lang === language;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  /* Reveal only after the final language and final text are in place. */
  document.documentElement.classList.add("hero-ready");
})();
