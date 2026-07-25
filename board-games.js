(() => {
  const images = {
    ecofuture: "assets/portfolio/boardgames/ecofuture.webp",
    ecomission: "assets/portfolio/boardgames/ecomission.webp"
  };

  const copy = {
    de: {
      filter: "Workshops & Brettspiele",
      status: "Konzeptbeispiel",
      ecofuture: "Ein physisches Lernspiel, mit dem Teilnehmende Nachhaltigkeitsentscheidungen, Zielkonflikte und Umweltauswirkungen kollaborativ erkunden.",
      ecomission: "Ein kooperatives Brettspielkonzept für Umweltbewusstsein, Gruppendiskussion und spielerisches Lernen rund um nachhaltige Handlungen."
    },
    en: {
      filter: "Workshops & Board Games",
      status: "Concept Example",
      ecofuture: "A physical learning game that helps participants explore sustainability choices, project trade-offs and environmental impact through collaborative play.",
      ecomission: "A collaborative board game concept for environmental awareness, group discussion and game-based learning around sustainable actions."
    }
  };

  const language = () => document.documentElement.lang === "en" ? "en" : "de";

  function loadSiteEmail() {
    if (document.querySelector('script[src*="site-email.js"]')) return;
    const script = document.createElement("script");
    script.src = "site-email.js?v=20260723-1";
    document.head.appendChild(script);
  }

  function moveCapabilityFramework() {
    const hero = document.querySelector(".outputs-hero");
    const capability = document.querySelector(".capability-section");
    if (hero && capability && hero.nextElementSibling !== capability) {
      hero.insertAdjacentElement("afterend", capability);
    }
  }

  function cardMarkup(title, key, image, tags, fallback) {
    return `
      <img src="${image}" data-fallback="${fallback}" alt="${title} board game concept" loading="lazy" decoding="async">
      <div class="output-card-body">
        <span class="output-status" data-board-status></span>
        <h3>${title}</h3>
        <p data-board-copy="${key}"></p>
        <div class="output-tags">${tags.map(tag => `<span>${tag}</span>`).join("")}</div>
      </div>`;
  }

  function protectImage(card) {
    const image = card?.querySelector("img[data-fallback]");
    if (!image) return;
    image.addEventListener("error", () => {
      if (image.src.endsWith(image.dataset.fallback)) return;
      image.src = image.dataset.fallback;
    }, { once: true });
  }

  function refreshLanguage() {
    const text = copy[language()];
    const filter = document.querySelector('.output-filter[data-filter="workshop"]');
    if (filter) filter.textContent = text.filter;

    document.querySelectorAll("[data-board-status]").forEach(node => {
      node.textContent = text.status;
    });

    document.querySelectorAll("[data-board-copy]").forEach(node => {
      node.textContent = text[node.dataset.boardCopy] || "";
    });
  }

  async function install() {
    moveCapabilityFramework();
    loadSiteEmail();

    const grid = document.querySelector(".output-grid");
    if (!grid) return;

    const ecofutureImage = images.ecofuture;
    const ecomissionImage = images.ecomission;

    let ecofuture = grid.querySelector('[data-board-game="ecofuture"]');
    if (!ecofuture) {
      const generic = [...grid.querySelectorAll('.output-card[data-category="workshop"]')]
        .find(card => card.querySelector("h3")?.textContent.trim() === "Collaborative Board Game");

      ecofuture = generic || document.createElement("article");
      ecofuture.className = "output-card output-card--photo reveal is-visible";
      ecofuture.dataset.category = "workshop";
      ecofuture.dataset.boardGame = "ecofuture";
      ecofuture.innerHTML = cardMarkup(
        "EcoFuture – The Board Game",
        "ecofuture",
        ecofutureImage,
        ["Board Game", "Sustainability", "Group Learning"],
        "assets/portfolio/examples/collaborative-board-game.svg"
      );
      if (!generic) grid.appendChild(ecofuture);
    } else {
      const image = ecofuture.querySelector("img");
      if (image) image.src = ecofutureImage;
    }
    protectImage(ecofuture);

    let ecomission = grid.querySelector('[data-board-game="ecomission"]');
    if (!ecomission) {
      ecomission = document.createElement("article");
      ecomission.className = "output-card output-card--photo reveal is-visible";
      ecomission.dataset.category = "workshop";
      ecomission.dataset.boardGame = "ecomission";
      ecomission.innerHTML = cardMarkup(
        "EcoMission",
        "ecomission",
        ecomissionImage,
        ["Board Game", "Environmental Education", "Team Activity"],
        "assets/portfolio/examples/ethical-choices-workshop.svg"
      );
      ecofuture.insertAdjacentElement("afterend", ecomission);
    } else {
      const image = ecomission.querySelector("img");
      if (image) image.src = ecomissionImage;
    }
    protectImage(ecomission);

    const count = document.querySelector(".outputs-hero-panel > div:first-child strong");
    if (count) count.textContent = "11";

    refreshLanguage();
  }

  moveCapabilityFramework();
  loadSiteEmail();
  install().catch(error => {
    console.error("Board-game concepts could not be installed.", error);
  });

  document.querySelectorAll("[data-lang]").forEach(button => {
    button.addEventListener("click", () => requestAnimationFrame(refreshLanguage));
  });
})();