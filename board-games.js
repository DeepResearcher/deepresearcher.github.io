(() => {
  const files = {
    ecofuture: [
      "assets/portfolio/boardgames/ecofuture-1.txt",
      "assets/portfolio/boardgames/ecofuture-2.txt"
    ],
    ecomission: [
      "assets/portfolio/boardgames/ecomission-1.txt",
      "assets/portfolio/boardgames/ecomission-2.txt"
    ]
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

  function moveCapabilityFramework() {
    const hero = document.querySelector(".outputs-hero");
    const capability = document.querySelector(".capability-section");
    if (hero && capability && hero.nextElementSibling !== capability) {
      hero.insertAdjacentElement("afterend", capability);
    }
  }

  async function readImage(parts) {
    const chunks = await Promise.all(parts.map(async path => {
      const response = await fetch(`${path}?v=20260723-2`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Image data could not be loaded: ${path}`);
      return (await response.text()).replace(/\s+/g, "");
    }));

    const binary = atob(chunks.join(""));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return URL.createObjectURL(new Blob([bytes], { type: "image/webp" }));
  }

  function cardMarkup(title, key, image, tags, fallback) {
    return `
      <img src="${image}" data-fallback="${fallback}" alt="${title} board game concept" loading="lazy" decoding="async" style="object-fit:cover;background:#dfe8e3">
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

    const grid = document.querySelector(".output-grid");
    if (!grid) return;

    const [ecofutureResult, ecomissionResult] = await Promise.allSettled([
      readImage(files.ecofuture),
      readImage(files.ecomission)
    ]);

    const ecofutureImage = ecofutureResult.status === "fulfilled"
      ? ecofutureResult.value
      : "assets/portfolio/examples/collaborative-board-game.svg";
    const ecomissionImage = ecomissionResult.status === "fulfilled"
      ? ecomissionResult.value
      : "assets/portfolio/examples/ethical-choices-workshop.svg";

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
  install().catch(error => {
    console.error("Board-game concepts could not be installed.", error);
  });

  document.querySelectorAll("[data-lang]").forEach(button => {
    button.addEventListener("click", () => requestAnimationFrame(refreshLanguage));
  });
})();