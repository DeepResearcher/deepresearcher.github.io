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
      example: "Beispiel"
    },
    en: {
      intro: "The examples are grouped into three clear solution categories. Browse the related concepts within each category.",
      previous: "Previous example",
      next: "Next example",
      example: "Example"
    }
  };

  const locationCopy = {
    de: {
      hero: "Standort Berlin/Brandenburg · Europaweit tätig",
      contact: "Persönliche Gespräche in Berlin · Digitale Zusammenarbeit europaweit",
      why: "Gute digitale Outputs brauchen mehr als Code. Sie müssen zur Zielgruppe, zum Inhalt, zum Zeitplan, zum Budget und zur langfristigen Nutzung passen. Genau diese Verbindung bildet den Kern unserer Arbeit. Aus der Region Berlin/Brandenburg arbeiten wir mit internationalen Projektteams und Organisationen in ganz Europa zusammen.",
      footer: "Standort Berlin/Brandenburg · Europaweit tätig"
    },
    en: {
      hero: "Berlin/Brandenburg location · Working across Europe",
      contact: "In-person meetings in Berlin · Digital collaboration across Europe",
      why: "Strong digital outputs require more than code. They must fit the target group, content, timeline, budget and long-term use. Connecting these elements is at the core of our work. From the Berlin/Brandenburg region, we collaborate with international project teams and organisations across Europe.",
      footer: "Berlin/Brandenburg location · Working across Europe"
    }
  };

  function language() {
    return document.documentElement.lang === "en" ? "en" : "de";
  }

  function installLocationStyles() {
    if (document.getElementById("location-identity-styles")) return;
    const style = document.createElement("style");
    style.id = "location-identity-styles";
    style.textContent = `
      .location-identity-note {
        display: flex;
        align-items: center;
        gap: 9px;
        margin: 18px 0 0;
        color: #c9f7f0;
        font-size: 0.9rem;
        font-weight: 680;
      }
      .location-identity-note::before {
        content: "";
        flex: 0 0 auto;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--accent);
        box-shadow: 0 0 0 5px rgba(76, 215, 195, 0.1);
      }
      @media (max-width: 700px) {
        .location-identity-note {
          align-items: flex-start;
          font-size: 0.86rem;
          line-height: 1.5;
        }
        .location-identity-note::before {
          margin-top: 0.42em;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function applyLocationIdentity() {
    const lang = language();
    const text = locationCopy[lang];

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
        const offerList = contactCard.querySelector(".offer-list");
        if (offerList) contactCard.insertBefore(note, offerList);
        else contactCard.appendChild(note);
      }
      note.textContent = text.contact;
    }
  }

  function categoryMarkup(category, categoryIndex) {
    return `
      <article class="portfolio-category" data-category="${categoryIndex}">
        <div class="portfolio-category-media">
          <img class="portfolio-category-image" src="${category.items[0].image}" alt="${category.items[0].title}" loading="lazy">
          <div class="portfolio-category-shade" aria-hidden="true"></div>
          <span class="portfolio-category-label"></span>
          <div class="portfolio-category-copy">
            <p class="portfolio-category-description"></p>
            <h3 class="portfolio-category-item-title">${category.items[0].title}</h3>
          </div>
          <div class="portfolio-category-controls">
            <button type="button" class="portfolio-category-button portfolio-category-prev" aria-label="Previous example">&#8592;</button>
            <span class="portfolio-category-counter" aria-live="polite">1 / ${category.items.length}</span>
            <button type="button" class="portfolio-category-button portfolio-category-next" aria-label="Next example">&#8594;</button>
          </div>
        </div>
        <div class="portfolio-category-dots" aria-hidden="true">
          ${category.items.map((_, index) => `<span class="portfolio-category-dot${index === 0 ? " is-active" : ""}"></span>`).join("")}
        </div>
      </article>`;
  }

  function initialiseCategories() {
    const oldGallery = document.querySelector("#portfolio .portfolio-gallery");
    if (!oldGallery || document.querySelector("#portfolio .portfolio-category-grid")) return false;

    const oldSlider = oldGallery.closest(".portfolio-slider");
    const grid = document.createElement("div");
    grid.className = "portfolio-category-grid";
    grid.innerHTML = categories.map(categoryMarkup).join("");

    if (oldSlider) oldSlider.replaceWith(grid);
    else oldGallery.replaceWith(grid);

    const states = categories.map(() => 0);

    function renderCard(categoryIndex) {
      const category = categories[categoryIndex];
      const card = grid.querySelector(`[data-category="${categoryIndex}"]`);
      const index = states[categoryIndex];
      const item = category.items[index];
      const lang = language();

      const image = card.querySelector(".portfolio-category-image");
      image.src = item.image;
      image.alt = item.title;
      card.querySelector(".portfolio-category-label").textContent = category.title[lang];
      card.querySelector(".portfolio-category-description").textContent = category.description[lang];
      card.querySelector(".portfolio-category-item-title").textContent = item.title;
      card.querySelector(".portfolio-category-counter").textContent = `${index + 1} / ${category.items.length}`;
      card.querySelector(".portfolio-category-prev").setAttribute("aria-label", copy[lang].previous);
      card.querySelector(".portfolio-category-next").setAttribute("aria-label", copy[lang].next);
      card.querySelectorAll(".portfolio-category-dot").forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function move(categoryIndex, direction) {
      const count = categories[categoryIndex].items.length;
      states[categoryIndex] = (states[categoryIndex] + direction + count) % count;
      renderCard(categoryIndex);
    }

    grid.querySelectorAll(".portfolio-category").forEach((card, categoryIndex) => {
      card.querySelector(".portfolio-category-prev").addEventListener("click", () => move(categoryIndex, -1));
      card.querySelector(".portfolio-category-next").addEventListener("click", () => move(categoryIndex, 1));

      let startX = 0;
      card.addEventListener("pointerdown", event => {
        startX = event.clientX;
      });
      card.addEventListener("pointerup", event => {
        const delta = event.clientX - startX;
        if (Math.abs(delta) < 45) return;
        move(categoryIndex, delta < 0 ? 1 : -1);
      });
    });

    function updateLanguage() {
      const lang = language();
      const intro = document.querySelector("#portfolio [data-i18n='portfolio.intro']");
      if (intro) intro.textContent = copy[lang].intro;
      categories.forEach((_, index) => renderCard(index));
      applyLocationIdentity();
    }

    document.querySelectorAll("[data-lang]").forEach(button => {
      button.addEventListener("click", () => requestAnimationFrame(updateLanguage));
    });

    updateLanguage();
    return true;
  }

  function waitForPortfolio() {
    if (initialiseCategories()) return;
    const observer = new MutationObserver(() => {
      if (initialiseCategories()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 10000);
  }

  function initialiseLocationIdentity() {
    installLocationStyles();
    applyLocationIdentity();
    document.querySelectorAll("[data-lang]").forEach(button => {
      button.addEventListener("click", () => requestAnimationFrame(applyLocationIdentity));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initialiseLocationIdentity();
      waitForPortfolio();
    }, { once: true });
  } else {
    initialiseLocationIdentity();
    waitForPortfolio();
  }
})();