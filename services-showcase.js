(() => {
  const section = document.querySelector('#portfolio');
  if (!section) return;

  const services = [
    {
      title: { de: 'Projektwebsites & digitale Plattformen', en: 'Project Websites & Digital Platforms' },
      description: {
        de: 'Mehrsprachige Projektwebsites und digitale Plattformen, die Ziele, Partner, Aktivitäten, Ergebnisse und Ressourcen übersichtlich präsentieren.',
        en: 'Multilingual project websites and digital platforms that clearly present objectives, partners, activities, results and resources.'
      },
      images: [
        { src: 'assets/services/project-websites/futureskills.webp', alt: 'FutureSkills concept for a European education project website', width: 1536, height: 1024 },
        { src: 'assets/services/project-websites/ai4cities-light.webp', alt: 'Light AI4Cities concept for a European project website', width: 1536, height: 1024 },
        { src: 'assets/services/project-websites/ai4cities-dark.webp', alt: 'Dark AI4Cities concept for a European project website', width: 1536, height: 1024 },
        { src: 'assets/services/ai-toolkits/greened-toolkit.webp', alt: 'GreenEd project website, communication materials and responsive digital presence', width: 1448, height: 1086 }
      ]
    },
    {
      title: { de: 'Web- & Mobile-Apps', en: 'Web & Mobile Apps' },
      description: {
        de: 'Responsive Web- und Mobile-Anwendungen, die Lernen, Beteiligung und Projektdienste auf unterschiedlichen Geräten zugänglich machen.',
        en: 'Responsive web and mobile applications that make learning, participation and project services available across devices.'
      },
      images: [
        { src: 'assets/services/web-mobile-apps/learning-dashboard.webp', alt: 'European education learning application presented on mobile and desktop devices', width: 1448, height: 1086 },
        { src: 'assets/services/web-mobile-apps/greenmind-ecosystem.webp', alt: 'GreenMind website, mobile application and connected project ecosystem', width: 1536, height: 1024 },
        { src: 'assets/hero-narli-showcase-hq.webp', alt: 'EduInnovate event website and mobile schedule application', width: 1536, height: 1024 }
      ]
    },
    {
      title: { de: 'Serious Games & spielbasierte Lernaktivitäten', en: 'Serious Games & Gamified Learning Activities' },
      description: {
        de: 'Digitale und physische spielbasierte Formate, die komplexe Projektthemen in motivierende und messbare Lernerfahrungen verwandeln.',
        en: 'Digital and physical game-based formats that transform complex project topics into engaging and measurable learning experiences.'
      },
      images: [
        { src: 'assets/services/serious-games/truth-detectives.webp', alt: 'Truth Detectives physical media-literacy board game', width: 1448, height: 1086 },
        { src: 'assets/services/serious-games/ecofuture-board-game.webp', alt: 'EcoFuture sustainability board game', width: 1535, height: 1024 },
        { src: 'assets/services/serious-games/life-saver.webp', alt: 'Life Saver decision-based emergency training serious game', width: 1536, height: 1024 },
        { src: 'assets/services/serious-games/word-quest.webp', alt: 'Word Quest gamified language-learning interface', width: 1536, height: 1024 },
        { src: 'assets/services/serious-games/knowledge-challenge.webp', alt: 'Knowledge Challenge quiz-based serious game', width: 1536, height: 1024 },
        { src: 'assets/services/serious-games/fake-news-detective.webp', alt: 'Fake News Detective media-literacy serious game', width: 1536, height: 1024 }
      ]
    },
    {
      title: { de: 'KI-gestützte Werkzeuge', en: 'AI-Supported Tools' },
      description: {
        de: 'KI-gestützte Werkzeuge für Dokumentenanalyse, intelligente Suche, Quiz-Erstellung, Reporting und Wissensmanagement.',
        en: 'AI-supported tools for document analysis, intelligent search, quiz generation, reporting and knowledge management.'
      },
      images: [
        { src: 'assets/services/ai-toolkits/ai-assistant.webp', alt: 'EduAssistant AI workspace for document summaries, quiz generation and project analytics', width: 1448, height: 1086 }
      ]
    }
  ];

  const copy = {
    de: {
      kicker: 'Unsere Leistungen',
      title: 'Digitale Lösungen, abgestimmt auf die Anforderungen europäischer Projekte.',
      intro: 'Entdecken Sie Konzeptbeispiele für Projektwebsites, Anwendungen, Serious Games und KI-gestützte Werkzeuge.',
      concept: 'Konzeptbeispiele', previous: 'Vorheriges Bild', next: 'Nächstes Bild', open: 'Bild vergrößern', close: 'Bild schließen', dialog: 'Vergrößerte Projektansicht'
    },
    en: {
      kicker: 'Our Services',
      title: 'Digital solutions designed around the needs of European projects.',
      intro: 'Explore concept examples across project websites, applications, serious games and AI-supported tools.',
      concept: 'Concept examples', previous: 'Previous image', next: 'Next image', open: 'Open larger image', close: 'Close image', dialog: 'Enlarged project preview'
    }
  };

  const language = () => document.documentElement.lang === 'en' ? 'en' : 'de';
  const states = services.map(() => 0);
  let lightboxItems = [];
  let lightboxIndex = 0;
  let returnFocus = null;

  section.dataset.servicesShowcaseReady = 'true';
  section.innerHTML = `
    <div class="container">
      <div class="services-showcase-heading reveal is-visible">
        <span class="section-kicker" data-showcase="kicker"></span>
        <h2 data-showcase="title"></h2>
        <p data-showcase="intro"></p>
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
    </div>`;

  const grid = section.querySelector('.services-showcase-grid');
  const lightbox = section.querySelector('.services-lightbox');
  const lightboxImage = section.querySelector('.services-lightbox-image');
  const lightboxCounter = section.querySelector('.services-lightbox-counter');
  const closeButton = section.querySelector('.services-lightbox-close');

  services.forEach((service, serviceIndex) => {
    const single = service.images.length === 1;
    const card = document.createElement('article');
    card.className = `service-showcase-card reveal is-visible${single ? ' is-single-slide' : ''}`;
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
            ${service.images.map((image, imageIndex) => `
              <figure class="service-slide">
                <button class="service-slide-button" type="button" data-open-image="${serviceIndex}:${imageIndex}">
                  <img src="${image.src}" alt="${image.alt}" width="${image.width}" height="${image.height}" loading="lazy" decoding="async">
                </button>
              </figure>`).join('')}
          </div>
        </div>
        <button class="service-slider-control service-slider-prev" type="button"${single ? ' hidden' : ''}>‹</button>
        <button class="service-slider-control service-slider-next" type="button"${single ? ' hidden' : ''}>›</button>
        <div class="service-slider-footer">
          <span class="service-slider-counter" aria-live="polite">1 / ${service.images.length}</span>
          <div class="service-slider-dots"${single ? ' hidden' : ''}>
            ${service.images.map((_, index) => `<button class="service-slider-dot${index === 0 ? ' is-active' : ''}" type="button" data-slide-dot="${index}"></button>`).join('')}
          </div>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  function renderSlider(card, requestedIndex) {
    const count = card.querySelectorAll('.service-slide').length;
    const index = (requestedIndex + count) % count;
    card.querySelector('.service-slider').dataset.sliderIndex = String(index);
    card.querySelector('.service-slider-track').style.transform = `translateX(-${index * 100}%)`;
    card.querySelector('.service-slider-counter').textContent = `${index + 1} / ${count}`;
    card.querySelectorAll('.service-slider-dot').forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
      dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
    });
    return index;
  }

  function installSwipe(element, callback) {
    let x = null;
    let y = null;
    element.addEventListener('pointerdown', event => {
      x = event.clientX;
      y = event.clientY;
    });
    element.addEventListener('pointerup', event => {
      if (x === null || y === null) return;
      const dx = event.clientX - x;
      const dy = event.clientY - y;
      x = null;
      y = null;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) callback(dx < 0 ? 1 : -1);
    });
    element.addEventListener('pointercancel', () => { x = null; y = null; });
  }

  grid.querySelectorAll('.service-showcase-card').forEach((card, serviceIndex) => {
    if (services[serviceIndex].images.length < 2) return;
    installSwipe(card.querySelector('.service-slider-viewport'), direction => {
      states[serviceIndex] = renderSlider(card, states[serviceIndex] + direction);
    });
  });

  grid.addEventListener('click', event => {
    const card = event.target.closest('.service-showcase-card');
    if (!card) return;
    const serviceIndex = Number(card.dataset.serviceIndex);
    const current = Number(card.querySelector('.service-slider').dataset.sliderIndex || 0);

    if (event.target.closest('.service-slider-prev')) {
      states[serviceIndex] = renderSlider(card, current - 1);
      return;
    }
    if (event.target.closest('.service-slider-next')) {
      states[serviceIndex] = renderSlider(card, current + 1);
      return;
    }
    const dot = event.target.closest('[data-slide-dot]');
    if (dot) {
      states[serviceIndex] = renderSlider(card, Number(dot.dataset.slideDot));
      return;
    }
    const opener = event.target.closest('[data-open-image]');
    if (opener) {
      const [, imageIndex] = opener.dataset.openImage.split(':').map(Number);
      lightboxItems = services[serviceIndex].images;
      lightboxIndex = imageIndex;
      returnFocus = opener;
      showLightbox();
    }
  });

  function updateLightbox() {
    const item = lightboxItems[lightboxIndex];
    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt;
    lightboxCounter.textContent = `${lightboxIndex + 1} / ${lightboxItems.length}`;
    const multiple = lightboxItems.length > 1;
    section.querySelector('.services-lightbox-prev').hidden = !multiple;
    section.querySelector('.services-lightbox-next').hidden = !multiple;
  }

  function showLightbox() {
    updateLightbox();
    lightbox.hidden = false;
    document.body.classList.add('services-lightbox-open');
    closeButton.focus();
  }

  function moveLightbox(direction) {
    if (lightboxItems.length < 2) return;
    lightboxIndex = (lightboxIndex + direction + lightboxItems.length) % lightboxItems.length;
    updateLightbox();
  }

  function hideLightbox() {
    lightbox.hidden = true;
    lightboxImage.removeAttribute('src');
    document.body.classList.remove('services-lightbox-open');
    returnFocus?.focus();
  }

  lightbox.addEventListener('click', event => {
    if (event.target === lightbox || event.target.closest('.services-lightbox-close')) hideLightbox();
    else if (event.target.closest('.services-lightbox-prev')) moveLightbox(-1);
    else if (event.target.closest('.services-lightbox-next')) moveLightbox(1);
  });
  installSwipe(lightbox, moveLightbox);
  document.addEventListener('keydown', event => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') hideLightbox();
    if (event.key === 'ArrowLeft') moveLightbox(-1);
    if (event.key === 'ArrowRight') moveLightbox(1);
  });

  function translate() {
    const lang = language();
    const text = copy[lang];
    section.querySelector('[data-showcase="kicker"]').textContent = text.kicker;
    section.querySelector('[data-showcase="title"]').textContent = text.title;
    section.querySelector('[data-showcase="intro"]').textContent = text.intro;
    lightbox.setAttribute('aria-label', text.dialog);
    closeButton.setAttribute('aria-label', text.close);
    section.querySelector('.services-lightbox-prev').setAttribute('aria-label', text.previous);
    section.querySelector('.services-lightbox-next').setAttribute('aria-label', text.next);
    section.querySelectorAll('.service-showcase-card').forEach((card, index) => {
      const service = services[index];
      card.querySelector('[data-service-badge]').textContent = text.concept;
      card.querySelector('[data-service-title]').textContent = service.title[lang];
      card.querySelector('[data-service-description]').textContent = service.description[lang];
      card.querySelector('.service-slider-prev').setAttribute('aria-label', text.previous);
      card.querySelector('.service-slider-next').setAttribute('aria-label', text.next);
      card.querySelectorAll('.service-slide-button').forEach(button => button.setAttribute('aria-label', text.open));
      card.querySelectorAll('.service-slider-dot').forEach((dot, dotIndex) => dot.setAttribute('aria-label', `${dotIndex + 1} / ${service.images.length}`));
    });
  }

  translate();
  document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setTimeout(translate, 0)));
})();
