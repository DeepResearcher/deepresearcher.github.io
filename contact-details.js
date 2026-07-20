(() => {
  const phones = [
    { href: "+4915257848836", display: "+49 152 57848836" },
    { href: "+4917755845906", display: "+49 177 55845906" }
  ];

  const labels = {
    de: { phone: "Telefon", outputs: "Digital Outputs", allOutputs: "Alle digitalen Outputs ansehen" },
    en: { phone: "Phone", outputs: "Digital Outputs", allOutputs: "View all digital outputs" }
  };

  function language() {
    return document.documentElement.lang === "en" ? "en" : "de";
  }

  function phoneLinks(className) {
    return phones
      .map(phone => `<a class="${className}" href="tel:${phone.href}" aria-label="${phone.display}">${phone.display}</a>`)
      .join("");
  }

  function installStylesheet() {
    const href = "contact-details.css?v=20260720-outputs-1";
    let link = document.querySelector('link[href*="contact-details.css"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = href;
  }

  function installContacts() {
    const card = document.querySelector(".contact-step-card");
    if (card && !card.querySelector(".contact-phone-block")) {
      const block = document.createElement("div");
      block.className = "contact-phone-block";
      block.innerHTML = `
        <span class="contact-phone-label"></span>
        <div class="contact-phone-links">${phoneLinks("contact-phone-link")}</div>
      `;
      const cta = card.querySelector(".button");
      cta ? card.insertBefore(block, cta) : card.appendChild(block);
    }

    const footer = document.querySelector(".footer-meta");
    if (footer && !footer.querySelector(".footer-phone-list")) {
      const list = document.createElement("span");
      list.className = "footer-phone-list";
      list.innerHTML = phoneLinks("footer-phone-link");
      const copyright = footer.querySelector("#year")?.closest("span");
      copyright ? footer.insertBefore(list, copyright) : footer.appendChild(list);
    }

    const label = document.querySelector(".contact-phone-label");
    if (label) label.textContent = labels[language()].phone;
  }

  function installOutputsNavigation() {
    const text = labels[language()];
    const nav = document.querySelector(".primary-nav");
    if (nav) {
      let outputLink = nav.querySelector(".digital-outputs-nav-link");
      if (!outputLink) {
        outputLink = document.createElement("a");
        outputLink.className = "digital-outputs-nav-link";
        outputLink.href = "digital-outputs.html";
        const portfolioLink = nav.querySelector('a[href="#portfolio"]');
        portfolioLink ? portfolioLink.insertAdjacentElement("afterend", outputLink) : nav.appendChild(outputLink);
      }
      outputLink.textContent = text.outputs;
    }

    const footerLinks = document.querySelector(".footer-links");
    if (footerLinks) {
      let outputLink = footerLinks.querySelector(".digital-outputs-footer-link");
      if (!outputLink) {
        outputLink = document.createElement("a");
        outputLink.className = "digital-outputs-footer-link";
        outputLink.href = "digital-outputs.html";
        const portfolioLink = footerLinks.querySelector('a[href="#portfolio"]');
        portfolioLink ? portfolioLink.insertAdjacentElement("afterend", outputLink) : footerLinks.appendChild(outputLink);
      }
      outputLink.textContent = text.outputs;
    }

    const section = document.getElementById("portfolio");
    if (section) {
      const container = section.querySelector(".container");
      if (container) {
        let action = container.querySelector(".portfolio-page-action");
        if (!action) {
          action = document.createElement("div");
          action.className = "portfolio-page-action reveal is-visible";
          action.innerHTML = '<a class="button button-primary" href="digital-outputs.html"></a>';
          container.appendChild(action);
        }
        const link = action.querySelector("a");
        if (link) link.textContent = text.allOutputs;
      }
    }
  }

  function refresh() {
    installContacts();
    installOutputsNavigation();
  }

  installStylesheet();
  refresh();

  document.querySelectorAll("[data-lang]").forEach(button => {
    button.addEventListener("click", () => requestAnimationFrame(refresh));
  });
})();
