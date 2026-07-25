(() => {
  const EMAIL = "info@narli-digital.de";
  const SUBJECT_HOME = "Anfrage an NARLI DIGITAL";
  const SUBJECT_OUTPUTS = "Digital Output Anfrage";

  function mailto(subject) {
    return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;
  }

  function installLandingPageStylesheet(onReady) {
    let link = document.querySelector('link[href*="landing-pages.css"]');
    if (link) {
      onReady?.();
      return;
    }

    link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "landing-pages.css?v=20260724-1";
    link.addEventListener("load", () => onReady?.(), { once: true });
    document.head.appendChild(link);
  }

  function installServicesShowcase() {
    if (!document.querySelector("#portfolio")) return;

    if (!document.querySelector('link[href*="services-showcase.css"]')) {
      const style = document.createElement("link");
      style.rel = "stylesheet";
      style.href = "services-showcase.css?v=20260725-guard-1";
      document.head.appendChild(style);
    }

    if (!document.querySelector('script[src*="services-showcase.js"]')) {
      const script = document.createElement("script");
      script.src = "services-showcase.js?v=20260725-guard-1";
      script.defer = true;
      document.head.appendChild(script);
    }
  }

  function replaceExistingMailLinks() {
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
      const isOutputsPage = document.body.classList.contains("outputs-page");
      link.href = mailto(isOutputsPage ? SUBJECT_OUTPUTS : SUBJECT_HOME);
      if (link.textContent.includes("@")) link.textContent = EMAIL;
      link.setAttribute("aria-label", `E-Mail an ${EMAIL}`);
    });

    document.querySelectorAll("body *").forEach(node => {
      if (node.children.length === 0 && node.textContent.includes("serhan.narli@gmail.com")) {
        node.textContent = node.textContent.replaceAll("serhan.narli@gmail.com", EMAIL);
      }
    });
  }

  function installHomepageEmail() {
    const card = document.querySelector(".contact-step-card");
    if (!card || card.querySelector(".site-email-card")) return;

    const block = document.createElement("div");
    block.className = "site-email-card";
    block.innerHTML = `
      <span class="site-email-label">E-Mail</span>
      <a class="site-email-link" href="${mailto(SUBJECT_HOME)}">${EMAIL}</a>
    `;

    const phoneBlock = card.querySelector(".contact-phone-block");
    const button = card.querySelector(".button");
    if (phoneBlock) card.insertBefore(block, phoneBlock);
    else if (button) card.insertBefore(block, button);
    else card.appendChild(block);
  }

  function installOutputsEmail() {
    const cta = document.querySelector(".outputs-cta");
    if (!cta || cta.querySelector(".site-email-cta")) return;

    const copy = cta.querySelector(":scope > div");
    if (!copy) return;

    const email = document.createElement("p");
    email.className = "site-email-cta";
    email.innerHTML = `<span>E-Mail</span><a href="${mailto(SUBJECT_OUTPUTS)}">${EMAIL}</a>`;
    copy.appendChild(email);
  }

  function serviceLinkCopy() {
    const english = document.documentElement.lang === "en";
    return {
      websitesTitle: "EU Project Websites",
      websitesText: english
        ? "Multilingual project websites, results platforms and resource libraries."
        : "Mehrsprachige Projektwebsites, Ergebnisplattformen und Ressourcenbibliotheken.",
      gamesTitle: english ? "Serious Games & Digital Outputs" : "Serious Games & Digitale Outputs",
      gamesText: english
        ? "Interactive learning modules, simulations, quizzes and digital toolkits."
        : "Interaktive Lernmodule, Simulationen, Quizformate und digitale Toolkits."
    };
  }

  function updateServiceLandingLinks() {
    const grid = document.querySelector(".service-link-grid");
    if (!grid) return;
    const copy = serviceLinkCopy();
    grid.querySelector('[data-service-link="websites"] strong').textContent = copy.websitesTitle;
    grid.querySelector('[data-service-link="websites"] span').textContent = copy.websitesText;
    grid.querySelector('[data-service-link="games"] strong').textContent = copy.gamesTitle;
    grid.querySelector('[data-service-link="games"] span').textContent = copy.gamesText;
  }

  function installServiceLandingLinks() {
    const serviceGrid = document.querySelector("#services .service-grid");
    if (!serviceGrid || document.querySelector(".service-link-grid")) return;

    installLandingPageStylesheet(() => {
      if (document.querySelector(".service-link-grid")) return;
      const copy = serviceLinkCopy();
      const grid = document.createElement("div");
      grid.className = "service-link-grid";
      grid.setAttribute("aria-label", "Specialised service pages");
      grid.innerHTML = `
        <a class="service-link-card" data-service-link="websites" href="/eu-project-websites">
          <div><strong>${copy.websitesTitle}</strong><span>${copy.websitesText}</span></div>
        </a>
        <a class="service-link-card" data-service-link="games" href="/serious-games-digital-outputs">
          <div><strong>${copy.gamesTitle}</strong><span>${copy.gamesText}</span></div>
        </a>
      `;
      serviceGrid.insertAdjacentElement("afterend", grid);
    });
  }

  function installOutputsServiceLink() {
    const heroActions = document.querySelector(".outputs-hero .hero-actions");
    if (!heroActions || heroActions.querySelector('a[href="/serious-games-digital-outputs"]')) return;

    const link = document.createElement("a");
    link.className = "button button-secondary";
    link.href = "/serious-games-digital-outputs";
    link.textContent = document.documentElement.lang === "en" ? "Serious Games Service" : "Serious-Games-Leistung";
    heroActions.appendChild(link);
  }

  function installFooterEmail() {
    const footer = document.querySelector(".footer-meta");
    if (!footer || footer.querySelector(".site-email-footer")) return;

    const line = document.createElement("span");
    line.className = "site-email-footer";
    line.innerHTML = `<a href="${mailto(document.body.classList.contains("outputs-page") ? SUBJECT_OUTPUTS : SUBJECT_HOME)}">${EMAIL}</a>`;

    const year = footer.querySelector("#year");
    const copyright = year?.parentElement;
    if (copyright && copyright.parentElement === footer) footer.insertBefore(line, copyright);
    else footer.prepend(line);
  }

  function installServiceFooterLinks() {
    const footerLinks = document.querySelector(".footer-links");
    if (!footerLinks) return;

    const links = [
      ["/eu-project-websites", "EU Project Websites"],
      ["/serious-games-digital-outputs", "Serious Games & Digital Outputs"]
    ];

    links.forEach(([href, text]) => {
      if (footerLinks.querySelector(`a[href="${href}"]`)) return;
      const link = document.createElement("a");
      link.href = href;
      link.textContent = text;
      footerLinks.appendChild(link);
    });
  }

  function installLegalLinks() {
    const footerLinks = document.querySelector(".footer-links");
    if (!footerLinks) return;

    if (!footerLinks.querySelector('a[href="/impressum"]')) {
      const impressum = document.createElement("a");
      impressum.href = "/impressum";
      impressum.textContent = "Impressum";
      footerLinks.appendChild(impressum);
    }

    if (!footerLinks.querySelector('a[href="/datenschutz"]')) {
      const privacy = document.createElement("a");
      privacy.href = "/datenschutz";
      privacy.textContent = document.documentElement.lang === "en" ? "Privacy" : "Datenschutz";
      footerLinks.appendChild(privacy);
    }
  }

  function install() {
    installServicesShowcase();
    replaceExistingMailLinks();
    installHomepageEmail();
    installOutputsEmail();
    installServiceLandingLinks();
    installOutputsServiceLink();
    installFooterEmail();
    installServiceFooterLinks();
    installLegalLinks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }

  document.querySelectorAll("[data-lang]").forEach(button => {
    button.addEventListener("click", () => requestAnimationFrame(() => {
      updateServiceLandingLinks();
      installOutputsServiceLink();
      installLegalLinks();
    }));
  });
})();