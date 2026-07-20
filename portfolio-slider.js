(() => {
  const categories = [
    {
      title: { de: "Digitale Lernspiele", en: "Digital Learning Games" },
      description: {
        de: "Mobile und browserbasierte Lernspiele für Wissenstransfer, Awareness und Gamification.",
        en: "Mobile and browser-based learning games for knowledge transfer, awareness and gamification."
      },
      items: [
        { title: "EcoSort Challenge", image: "assets/portfolio/originals/portfolio-08.jpg" },
        { title: "CyberWise Mission", image: "assets/portfolio/originals/portfolio-09.jpg" },
        { title: "Sustainable Millionaire", image: "assets/portfolio/originals/portfolio-01.jpg" },
        { title: "GreenFuture Academy", image: "assets/portfolio/originals/portfolio-10.jpg" }
      ]
    },
    {
      title: { de: "Szenario- & Simulationsspiele", en: "Scenario & Simulation Games" },
      description: {
        de: "Entscheidungsbasierte Formate mit Rollen, Ressourcen, Konsequenzen und messbarem Fortschritt.",
        en: "Decision-based formats with roles, resources, consequences and measurable progress."
      },
      items: [
        { title: "Chrono-Cogs", image: "assets/portfolio/originals/portfolio-02.jpg" },
        { title: "Scenario Lab", image: "assets/portfolio/originals/portfolio-07.jpg" },
        { title: "Project Nexus", image: "assets/portfolio/originals/portfolio-06.jpg" },
        { title: "Project Aegis", image: "assets/portfolio/originals/portfolio-03.jpg" }
      ]
    },
    {
      title: { de: "Workshop- & Brettspielformate", en: "Workshop & Board Game Formats" },
      description: {
        de: "Analoge und hybride Lernformate für moderierte Diskussionen, Teamarbeit und Reflexion.",
        en: "Analogue and hybrid learning formats for facilitated discussion, teamwork and reflection."
      },
      items: [
        { title: "Ethical Choices Workshop", image: "assets/portfolio/originals/portfolio-05.jpg" },
        { title: "Collaborative Board Game", image: "assets/portfolio/originals/portfolio-04.jpg" }
      ]
    }
  ];

  const copy = {
    de: {
      intro: "Die Beispiele sind in drei klaren Lösungskategorien gebündelt. Innerhalb jeder Kategorie können Sie durch die zugehörigen Konzepte blättern.",
      previous: "Vorheriges Beispiel",
      next: "Nächstes Beispiel",
      dots: "Beispiele auswählen",
      hero: "Standort Berlin/Brandenburg · Europaweit tätig",
      contact: "Persönliche Gespräche in Berlin · Digitale Zusammenarbeit europaweit",
      why: "Gute digitale Outputs brauchen mehr als Code. Sie müssen zur Zielgruppe, zum Inhalt, zum Zeitplan, zum Budget und zur langfristigen Nutzung passen. Genau diese Verbindung bildet den Kern unserer Arbeit. Aus der Region Berlin/Brandenburg arbeiten wir mit internationalen Projektteams und Organisationen in ganz Europa zusammen.",
      footer: "Standort Berlin/Brandenburg · Europaweit tätig"
    },
    en: {
      intro: "The examples are grouped into three clear solution categories. Browse the related concepts within each category.",
      previous: "Previous example",
      next: "Next example",
      dots: "Select examples",
      hero: "Berlin/Brandenburg location · Working across Europe",
      contact: "In-person meetings in Berlin · Digital collaboration across Europe",
      why: "Strong digital outputs require more than code. They must fit the target group, content, timeline, budget and long-term use. Connecting these elements is at the core of our work. From the Berlin/Brandenburg region, we collaborate with international project teams and organisations across Europe.",
      footer: "Berlin/Brandenburg location · Working across Europe"
    }
  };

  const states = categories.map(() => 0);

  function language() {
    return document.documentElement.lang === "en" ? "en" : "de";
  }

  function ensureStylesheet() {
    const href = "portfolio-gallery.css?v=20260720-stable-2";
    let link = document.querySelector('link[href*="portfolio-gallery.css"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    if (!link.href.endsWith("portfolio-gallery.css?v=20260720-stable-2")) {
      link.href = href;
    }
  }

  function categoryMarkup(category, categoryIndex) {
    const first = category.items[0];
    return `
      <article class="portfolio-category" data-category="${categoryIndex}">
        <div class="portfolio-category-media">
          <img class="portfolio-category-image" src="${first.image}" alt="${first.title}" loading="lazy" decoding="async">
          <div class="portfolio-category-shade" aria-hidden="true"></div>
          <span class="portfolio-category-label"></span>
          <div class="portfolio-category-copy">
            <p class="portfolio-category-description"></p>
            <h3 class="portfolio-category-item-title">${first.title}</h3>
          </div>
          <div class="portfolio-category-controls">
            <button type="button" class="portfolio-category-button portfolio-category-prev">←</button>
            <span class="portfolio-category-counter" aria-live="polite">1 / ${category.items.length}</span>
            <button type="button" class="portfolio-category-button portfolio-category-next">→</button>
          </div>
        </div>
        <div class="portfolio-category-dots"></div>
      </article>`;
  }

  function buildStablePortfolio() {
    const portfolio = document.getElementById("portfolio");
    if (!portfolio) return false;

    let grid = portfolio.querySelector(".portfolio-category-grid");
    if (!grid) {
      const oldGallery = portfolio.querySelector(".portfolio-gallery, .concept-grid");
      if (!oldGallery) return false;

      const oldShell = oldGallery.closest(".portfolio-slider");
      grid = document.createElement("div");
      grid.className = "portfolio-category-grid";
      grid.setAttribute("aria-label", "Portfolio categories");
      grid.innerHTML = categories.map(categoryMarkup).join("");
      oldShell ? oldShell.replaceWith(grid) : oldGallery.replaceWith(grid);
    }

    if (grid.dataset.initialised === "true") return true;
    grid.dataset.initialised = "true";

    grid.querySelectorAll(".portfolio-category").forEach((card, categoryIndex) => {
      const category = categories[categoryIndex];
      const dots = card.querySelector(".portfolio-category-dots");
      dots.innerHTML = category.items.map((item, itemIndex) =>
        `<button type="button" class="portfolio-category-dot${itemIndex === 0 ? " is-active" : ""}" aria-label="${item.title}" aria-current="${itemIndex === 0 ? "true" : "false"}"></button>`
      ).join("");

      card.querySelector(".portfolio-category-prev").addEventListener("click", () => move(categoryIndex, -1));
      card.querySelector(".portfolio-category-next").addEventListener("click", () => move(categoryIndex, 1));
      dots.querySelectorAll(".portfolio-category-dot").forEach((dot, itemIndex) => {
        dot.addEventListener("click", () => {
          states[categoryIndex] = itemIndex;
          renderCard(categoryIndex, true);
        });
      });

      let startX = null;
      const media = card.querySelector(".portfolio-category-media");
      media.addEventListener("pointerdown", event => {
        if (event.target.closest("button")) return;
        startX = event.clientX;
      });
      media.addEventListener("pointerup", event => {
        if (startX === null) return;
        const delta = event.clientX - startX;
        startX = null;
        if (Math.abs(delta) >= 50) move(categoryIndex, delta < 0 ? 1 : -1);
      });
      media.addEventListener("pointercancel", () => { startX = null; });

      category.items.forEach(item => {
        const preload = new Image();
        preload.src = item.image;
      });
    });

    applyLanguageAndLocation();
    return true;
  }

  function renderCard(categoryIndex, animate = false) {
    const card = document.querySelector(`.portfolio-category[data-category="${categoryIndex}"]`);
    if (!card) return;

    const category = categories[categoryIndex];
    const itemIndex = states[categoryIndex];
    const item = category.items[itemIndex];
    const lang = language();
    const image = card.querySelector(".portfolio-category-image");

    const apply = () => {
      image.src = item.image;
      image.alt = item.title;
      card.querySelector(".portfolio-category-label").textContent = category.title[lang];
      card.querySelector(".portfolio-category-description").textContent = category.description[lang];
      card.querySelector(".portfolio-category-item-title").textContent = item.title;
      card.querySelector(".portfolio-category-counter").textContent = `${itemIndex + 1} / ${category.items.length}`;
      card.querySelector(".portfolio-category-prev").setAttribute("aria-label", copy[lang].previous);
      card.querySelector(".portfolio-category-next").setAttribute("aria-label", copy[lang].next);
      card.querySelector(".portfolio-category-dots").setAttribute("aria-label", copy[lang].dots);
      card.querySelectorAll(".portfolio-category-dot").forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === itemIndex);
        dot.setAttribute("aria-current", dotIndex === itemIndex ? "true" : "false");
      });
      requestAnimationFrame(() => image.classList.remove("is-changing"));
    };

    if (animate) {
      image.classList.add("is-changing");
      window.setTimeout(apply, 100);
    } else {
      apply();
    }
  }

  function move(categoryIndex, direction) {
    const count = categories[categoryIndex].items.length;
    states[categoryIndex] = (states[categoryIndex] + direction + count) % count;
    renderCard(categoryIndex, true);
  }

  function applyLanguageAndLocation() {
    const lang = language();
    const text = copy[lang];

    const intro = document.querySelector('#portfolio [data-i18n="portfolio.intro"]');
    if (intro) intro.textContent = text.intro;
    categories.forEach((_, index) => renderCard(index));

    const heroLocation = document.querySelector('[data-i18n="hero.trust3"]');
    if (heroLocation) heroLocation.textContent = text.hero;
    const whyText = document.querySelector('[data-i18n="why.text"]');
    if (whyText) whyText.textContent = text.why;
    const footerLocation = document.querySelector(".footer-meta > span:first-child");
    if (footerLocation) footerLocation.textContent = text.footer;

    const contactCard = document.querySelector(".contact-step-card");
    if (contactCard) {
      let note = contactCard.querySelector(".location-identity-note");
      if (!note) {
        note = document.createElement("p");
        note.className = "location-identity-note";
        const cta = contactCard.querySelector(".button");
        cta ? contactCard.insertBefore(note, cta) : contactCard.appendChild(note);
      }
      note.textContent = text.contact;
    }
  }

  function start() {
    ensureStylesheet();
    if (!buildStablePortfolio()) {
      const observer = new MutationObserver(() => {
        if (buildStablePortfolio()) observer.disconnect();
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
      window.setTimeout(() => observer.disconnect(), 5000);
    }

    document.querySelectorAll("[data-lang]").forEach(button => {
      button.addEventListener("click", () => requestAnimationFrame(applyLanguageAndLocation));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
