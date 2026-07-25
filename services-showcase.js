(() => {
  const section = document.querySelector("#portfolio");
  if (!section || section.dataset.servicesShowcaseReady === "true") return;
  section.dataset.servicesShowcaseReady = "true";

  const services = [
    {
      title: {
        de: "Projektwebsites & digitale Plattformen",
        en: "Project Websites & Digital Platforms"
      },
      description: {
        de: "Mehrsprachige Projektwebsites und digitale Plattformen, die Ziele, Partner, Aktivitäten, Ergebnisse und Ressourcen übersichtlich präsentieren.",
        en: "Multilingual project websites and digital platforms that clearly present objectives, partners, activities, results and resources."
      },
      images: [
        {
          src: "assets/services/project-websites/ai4cities-dark.webp",
          alt: "Dunkles AI4Cities-Konzept für eine europäische Projektwebsite",
          width: 1536,
          height: 1024
        },
        {
          src: "assets/services/project-websites/ai4cities-light.webp",
          alt: "Helles AI4Cities-Konzept für eine europäische Projektwebsite",
          width: 1536,
          height: 1024
        },
        {
          src: "assets/services/project-websites/futureskills.webp",
          alt: "FutureSkills-Konzept für eine Bildungsprojektwebsite",
          width: 1536,
          height: 1024
        }
      ]
    },
    {
      title: {
        de: "Web- & Mobile-Apps",
        en: "Web & Mobile Apps"
      },
      description: {
        de: "Responsive Web- und Mobile-Anwendungen, die Lernen, Beteiligung und Projektdienste auf unterschiedlichen Geräten zugänglich machen.",
        en: "Responsive web and mobile applications that make learning, participation and project services available across devices."
      },
      images: [
        {
          src: "assets/services/web-mobile-apps/learning-dashboard.webp",
          alt: "Mobiles Lern-Dashboard mit zugehöriger Webplattform",
          width: 1448,
          height: 1086
        },
        {
          src: "assets/services/web-mobile-apps/greenmind-ecosystem.webp",
          alt: "GreenMind-Web- und Mobile-App als zusammenhängendes digitales Ökosystem",
          width: 1536,
          height: 1024
        }
      ]
    },
    {
      title: {
        de: "Serious Games & spielbasierte Lernaktivitäten",
        en: "Serious Games & Gamified Learning Activities"
      },
      description: {
        de: "Digitale und physische spielbasierte Formate, die komplexe Projektthemen in motivierende und messbare Lernerfahrungen verwandeln.",
        en: "Digital and physical game-based formats that transform complex project topics into engaging and measurable learning experiences."
      },
      images: [
        {
          src: "assets/services/serious-games/knowledge-challenge.webp",
          alt: "Knowledge Challenge als spielbasierte Quiz-Anwendung",
          width: 1536,
          height: 1024
        },
        {
          src: "assets/services/serious-games/life-saver.webp",
          alt: "Life Saver als entscheidungsbasiertes Notfall-Lernspiel",
          width: 1536,
          height: 1024
        },
        {
          src: "assets/services/serious-games/word-quest.webp",
          alt: "Word Quest als gamifizierte Sprachlernaktivität",
          width: 1536,
          height: 1024
        },
        {
          src: "assets/services/serious-games/fake-news-detective.webp",
          alt: "Fake News Detective als Medienkompetenz-Lernspiel",
          width: 1536,
          height: 1024
        },
        {
          src: "assets/services/serious-games/truth-detectives.webp",
          alt: "Truth Detectives als physisches Medienkompetenz-Brettspiel",
          width: 1448,
          height: 1086
        },
        {
          src: "assets/services/serious-games/ecofuture-board-game.webp",
          alt: "EcoFuture als nachhaltigkeitsorientiertes Brettspiel",
          width: 1535,
          height: 1024
        }
      ]
    },
    {
      title: {
        de: "KI-Tools & digitale Toolkits",
        en: "AI Tools & Digital Toolkits"
      },
      description: {
        de: "KI-gestützte Werkzeuge und abgestimmte digitale Toolkits für Lernen, Content-Erstellung, Reporting und Projektkommunikation.",
        en: "AI-assisted tools and coordinated digital toolkits that support learning, content creation, reporting and project communication."
      },
      images: [
        {
          src: "assets/services/ai-toolkits/ai-assistant.webp",
          alt: "KI-Assistent für Dokumente, Quiz-Erstellung und Projektanalysen",
          width: 1448,
          height: 1086
        },
        {
          src: "assets/services/ai-toolkits/greened-toolkit.webp",
          alt: "GreenEd als koordiniertes digitales Projekt- und Kommunikations-Toolkit",
          width: 1448,
          height: 1086
        }
      ]
    }
  ];

  const copy = {
    de: {
      kicker: "Unsere Leistungen",
      title: "Digitale Lösungen, abgestimmt auf die Anforderungen europäischer Projekte.",
      intro: "Entdecken Sie Konzeptbeispiele für Projektwebsites, Anwendungen, Serious Games und KI-gestützte Werkzeuge.",
      concept: "Konzeptbeispiele",
      previous: "Vorheriges Bild",
      next: "Nächstes Bild",
      open: "Bild vergrößern",
      close: "Bild schließen",
      dialog: "Vergrößerte Projektansicht"
    },
    en: {
      kicker: "Our Services",
      title: "Digital solutions designed around the needs of European projects.",
      intro: "Explore concept examples across project websites, applications, serious games and AI-supported tools.",
      concept: "Concept examples",
      previous: "Previous image",
      next: "Next image",
      open: "Open larger image",
      close: "Close image",
      dialog: "Enlarged project preview"
    }
  };

  const getLanguage = () => document.documentElement.lang === "en" ? "en" : "de";
  const sliderStates = services.map(() => 0);
  let lightboxImages = [];
  let lightboxIndex = 0;
  let lastFocusedElement = null;

  section.innerHTML = `
    <div class="container">
      <div class="services-showcase-heading reveal">
        <span class="section-kicker" data-showcase-heading="kicker"></span>
        <h2 data-showcase-heading="title"></h2>
        <p data-showcase-heading="intro"></p>
      </div>
      <div class="services-showcase-grid"></div>
    </div>
    <div class="services-lightbox" role="dialog" aria-modal="true" hidden>
      <button class="services-lightbox-close" type="button">×</button>
      <button class="services-lightbox-nav services-lightbox-prev" type="button">‹</button>
      <div class="services-lightbox-stage">
        <img class="services-lightbox-image" alt="" decoding="async">
        <span class="services-lightbox-counter" aria-live="polite"></span>
      </div>
      <button class="services-lightbox-nav services-lightbox-next" type="button">›</button>
    </div>
  `;

  const grid = section.querySelector(".services-showcase-grid");
  const lightbox = section.querySelector(".services-lightbox");
  const lightboxImage = section.querySelector(".services-lightbox-image");
  const lightboxCounter = section.querySelector(".services-lightbox-counter");
  const lightboxClose = section.querySelector(".services-lightbox-close");

  function slideMarkup(service, serviceIndex) {
    return service.images.map((image, imageIndex) => `
      <figure class="service-slide">
        <button
          class="service-slide-button"
          type="button"
          data-open-image="${serviceIndex}:${imageIndex}">
          <img
            src="${image.src}"
            alt="${image.alt}"
            width="${image.width}"
            height="${image.height}"
            loading="lazy"
            decoding="async">
        </button>
      </figure>
    `).join("");
  }

  services.forEach((service, serviceIndex) => {
    const card = document.createElement("article");
    card.className = "service-showcase-card reveal";
    card.dataset.serviceIndex = String(serviceIndex);
    card.innerHTML = `
      <div class="service-showcase-copy">
        <span class="service-showcase-badge" data-service-badge></span>
        <h3 data-service-title></h3>
        <p data-service-description></p>
      </div>
      <div class="service-slider" data-slider-index="0">
        <div class="service-slider-viewport">
          <div class="service-slider-track">${slideMarkup(service, serviceIndex)}</div>
        </div>
        <button class="service-slider-control service-slider-prev" type="button">‹</button>
        <button class="service-slider-control service-slider-next" type="button">›</button>
        <div class="service-slider-footer">
          <span class="service-slider-counter" aria-live="polite">1 / ${service.images.length}</span>
          <div class="service-slider-dots">
            ${service.images.map((_, dotIndex) => `
              <button
                class="service-slider-dot${dotIndex === 0 ? " is-active" : ""}"
                type="button"
                data-slide-dot="${dotIndex}">
              </button>
            `).join("")}
          </div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  function updateSlider(card, nextIndex) {
    const slider = card.querySelector(".service-slider");
    const count = card.querySelectorAll(".service-slide").length;
    const index = (nextIndex + count) % count;
    slider.dataset.sliderIndex = String(index);
    card.querySelector(".service-slider-track").style.transform = `translateX(-${index * 100}%)`;
    card.querySelector(".service-slider-counter").textContent = `${index + 1} / ${count}`;
    card.querySelectorAll(".service-slider-dot").forEach((dot, dotIndex) => {
      const active = dotIndex === index;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-current", active ? "true" : "false");
    });
  }

  function installSwipe(target, onSwipe) {
    let startX = null;
    let startY = null;

    target.addEventListener("pointerdown", event => {
      if (event.target.closest("button") && !event.target.closest(".service-slide-button")) return;
      startX = event.clientX;
      startY = event.clientY;
    });

    target.addEventListener("pointerup", event => {
      if (startX === null || startY === null) return;
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      startX = null;
      startY = null;
      if (Math.abs(deltaX) >= 55 && Math.abs(deltaX) > Math.abs(deltaY)) {
        onSwipe(deltaX < 0 ? 1 : -1);
      }
    });

    target.addEventListener("pointercancel", () => {
      startX = null;
      startY = null;
    });
  }

  grid.querySelectorAll(".service-showcase-card").forEach((card, serviceIndex) => {
    const viewport = card.querySelector(".service-slider-viewport");
    installSwipe(viewport, direction => {
      sliderStates[serviceIndex] += direction;
      updateSlider(card, sliderStates[serviceIndex]);
      sliderStates[serviceIndex] = Number(card.querySelector(".service-slider").dataset.sliderIndex);
    });
  });

  grid.addEventListener("click", event => {
    const card = event.target.closest(".service-showcase-card");
    if (!card) return;
    const serviceIndex = Number(card.dataset.serviceIndex);
    const current = Number(card.querySelector(".service-slider").dataset.sliderIndex || 0);

    if (event.target.closest(".service-slider-prev")) {
      sliderStates[serviceIndex] = current - 1;
      updateSlider(card, sliderStates[serviceIndex]);
      sliderStates[serviceIndex] = Number(card.querySelector(".service-slider").dataset.sliderIndex);
      return;
    }

    if (event.target.closest(".service-slider-next")) {
      sliderStates[serviceIndex] = current + 1;
      updateSlider(card, sliderStates[serviceIndex]);
      sliderStates[serviceIndex] = Number(card.querySelector(".service-slider").dataset.sliderIndex);
      return;
    }

    const dot = event.target.closest("[data-slide-dot]");
    if (dot) {
      sliderStates[serviceIndex] = Number(dot.dataset.slideDot);
      updateSlider(card, sliderStates[serviceIndex]);
      return;
    }

    const opener = event.target.closest("[data-open-image]");
    if (opener) {
      const [, imageIndex] = opener.dataset.openImage.split(":").map(Number);
      lightboxImages = services[serviceIndex].images;
      lightboxIndex = imageIndex;
      lastFocusedElement = opener;
      showLightboxImage();
      lightbox.hidden = false;
      document.body.classList.add("services-lightbox-open");
      lightboxClose.focus();
    }
  });

  function showLightboxImage() {
    const image = lightboxImages[lightboxIndex];
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxImage.width = image.width;
    lightboxImage.height = image.height;
    lightboxCounter.textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;
  }

  function moveLightbox(direction) {
    if (!lightboxImages.length) return;
    lightboxIndex = (lightboxIndex + direction + lightboxImages.length) % lightboxImages.length;
    showLightboxImage();
  }

  function closeLightbox() {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    lightboxImage.removeAttribute("src");
    document.body.classList.remove("services-lightbox-open");
    lastFocusedElement?.focus();
  }

  lightbox.addEventListener("click", event => {
    if (event.target === lightbox || event.target.closest(".services-lightbox-close")) closeLightbox();
    if (event.target.closest(".services-lightbox-prev")) moveLightbox(-1);
    if (event.target.closest(".services-lightbox-next")) moveLightbox(1);
  });

  installSwipe(lightbox, moveLightbox);

  document.addEventListener("keydown", event => {
    if (lightbox.hidden) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") moveLightbox(-1);
    if (event.key === "ArrowRight") moveLightbox(1);
  });

  function translateShowcase() {
    const lang = getLanguage();
    const text = copy[lang];

    section.querySelector('[data-showcase-heading="kicker"]').textContent = text.kicker;
    section.querySelector('[data-showcase-heading="title"]').textContent = text.title;
    section.querySelector('[data-showcase-heading="intro"]').textContent = text.intro;
    lightbox.setAttribute("aria-label", text.dialog);
    lightboxClose.setAttribute("aria-label", text.close);
    section.querySelector(".services-lightbox-prev").setAttribute("aria-label", text.previous);
    section.querySelector(".services-lightbox-next").setAttribute("aria-label", text.next);

    section.querySelectorAll(".service-showcase-card").forEach((card, serviceIndex) => {
      const service = services[serviceIndex];
      card.querySelector("[data-service-badge]").textContent = text.concept;
      card.querySelector("[data-service-title]").textContent = service.title[lang];
      card.querySelector("[data-service-description]").textContent = service.description[lang];
      card.querySelector(".service-slider-prev").setAttribute("aria-label", text.previous);
      card.querySelector(".service-slider-next").setAttribute("aria-label", text.next);
      card.querySelectorAll(".service-slide-button").forEach(button => button.setAttribute("aria-label", text.open));
      card.querySelectorAll(".service-slider-dot").forEach((dot, dotIndex) => {
        dot.setAttribute("aria-label", `${dotIndex + 1} / ${service.images.length}`);
      });
    });
  }

  translateShowcase();
  document.querySelectorAll("[data-lang]").forEach(button => {
    button.addEventListener("click", () => window.setTimeout(translateShowcase, 0));
  });
})();