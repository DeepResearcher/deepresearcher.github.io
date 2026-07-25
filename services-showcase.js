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
        ["assets/services/project-websites/ai4cities-dark.webp", "AI4Cities dark project website concept"],
        ["assets/services/project-websites/futureskills.webp", "FutureSkills European project website concept"]
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
        ["assets/portfolio/digital-learning-gallery.webp", "Web and mobile digital learning application concept"],
        ["assets/hero-narli-banner.webp", "Connected web and mobile solution presentation"]
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
        ["assets/portfolio/sustainable-millionaire.webp", "Browser-based quiz and serious game concept"],
        ["assets/portfolio/chrono-cogs.webp", "Narrative decision-based serious game concept"]
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
        ["assets/hero-ecosystem.svg", "AI-supported project tool ecosystem concept"],
        ["assets/hero-narli-showcase-hq.webp", "NARLI DIGITAL coordinated digital toolkit concept"]
      ]
    }
  ];

  const getLanguage = () => document.documentElement.lang === "en" ? "en" : "de";
  let lightboxImages = [];
  let lightboxIndex = 0;

  section.innerHTML = `
    <div class="container">
      <div class="services-showcase-heading reveal">
        <span class="section-kicker" data-showcase-heading="kicker"></span>
        <h2 data-showcase-heading="title"></h2>
        <p data-showcase-heading="intro"></p>
      </div>
      <div class="services-showcase-grid"></div>
    </div>
    <div class="services-lightbox" role="dialog" aria-modal="true" aria-label="Image preview" hidden>
      <button class="services-lightbox-close" type="button" aria-label="Close image">×</button>
      <button class="services-lightbox-nav services-lightbox-prev" type="button" aria-label="Previous image">‹</button>
      <img class="services-lightbox-image" alt="">
      <button class="services-lightbox-nav services-lightbox-next" type="button" aria-label="Next image">›</button>
    </div>
  `;

  const grid = section.querySelector(".services-showcase-grid");
  const lightbox = section.querySelector(".services-lightbox");
  const lightboxImage = section.querySelector(".services-lightbox-image");

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
          <div class="service-slider-track">
            ${service.images.map(([src, alt], imageIndex) => `
              <figure class="service-slide">
                <button class="service-slide-button" type="button" data-open-image="${serviceIndex}:${imageIndex}" aria-label="Open image">
                  <img src="${src}" alt="${alt}" loading="lazy" decoding="async">
                </button>
              </figure>
            `).join("")}
          </div>
        </div>
        <button class="service-slider-control service-slider-prev" type="button" aria-label="Previous slide">‹</button>
        <button class="service-slider-control service-slider-next" type="button" aria-label="Next slide">›</button>
        <div class="service-slider-dots">
          ${service.images.map((_, dotIndex) => `<button class="service-slider-dot${dotIndex === 0 ? " is-active" : ""}" type="button" data-slide-dot="${dotIndex}" aria-label="Slide ${dotIndex + 1}"></button>`).join("")}
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
    card.querySelectorAll(".service-slider-dot").forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  }

  grid.addEventListener("click", event => {
    const card = event.target.closest(".service-showcase-card");
    if (!card) return;
    const current = Number(card.querySelector(".service-slider").dataset.sliderIndex || 0);

    if (event.target.closest(".service-slider-prev")) updateSlider(card, current - 1);
    if (event.target.closest(".service-slider-next")) updateSlider(card, current + 1);

    const dot = event.target.closest("[data-slide-dot]");
    if (dot) updateSlider(card, Number(dot.dataset.slideDot));

    const opener = event.target.closest("[data-open-image]");
    if (opener) {
      const [serviceIndex, imageIndex] = opener.dataset.openImage.split(":").map(Number);
      lightboxImages = services[serviceIndex].images;
      lightboxIndex = imageIndex;
      showLightboxImage();
      lightbox.hidden = false;
      document.body.classList.add("services-lightbox-open");
      section.querySelector(".services-lightbox-close").focus();
    }
  });

  function showLightboxImage() {
    const [src, alt] = lightboxImages[lightboxIndex];
    lightboxImage.src = src;
    lightboxImage.alt = alt;
  }

  function moveLightbox(direction) {
    lightboxIndex = (lightboxIndex + direction + lightboxImages.length) % lightboxImages.length;
    showLightboxImage();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImage.removeAttribute("src");
    document.body.classList.remove("services-lightbox-open");
  }

  lightbox.addEventListener("click", event => {
    if (event.target === lightbox || event.target.closest(".services-lightbox-close")) closeLightbox();
    if (event.target.closest(".services-lightbox-prev")) moveLightbox(-1);
    if (event.target.closest(".services-lightbox-next")) moveLightbox(1);
  });

  document.addEventListener("keydown", event => {
    if (lightbox.hidden) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") moveLightbox(-1);
    if (event.key === "ArrowRight") moveLightbox(1);
  });

  function translateShowcase() {
    const lang = getLanguage();
    section.querySelector('[data-showcase-heading="kicker"]').textContent = lang === "en" ? "Our Services" : "Unsere Leistungen";
    section.querySelector('[data-showcase-heading="title"]').textContent = lang === "en"
      ? "Digital solutions designed around the needs of European projects."
      : "Digitale Lösungen, abgestimmt auf die Anforderungen europäischer Projekte.";
    section.querySelector('[data-showcase-heading="intro"]').textContent = lang === "en"
      ? "Explore concept examples across websites, applications, serious games and AI-supported tools."
      : "Entdecken Sie Konzeptbeispiele für Websites, Anwendungen, Serious Games und KI-gestützte Werkzeuge.";

    section.querySelectorAll(".service-showcase-card").forEach((card, index) => {
      card.querySelector("[data-service-badge]").textContent = lang === "en" ? "Concept examples" : "Konzeptbeispiele";
      card.querySelector("[data-service-title]").textContent = services[index].title[lang];
      card.querySelector("[data-service-description]").textContent = services[index].description[lang];
    });
  }

  translateShowcase();
  document.querySelectorAll("[data-lang]").forEach(button => {
    button.addEventListener("click", () => window.setTimeout(translateShowcase, 0));
  });
})();
