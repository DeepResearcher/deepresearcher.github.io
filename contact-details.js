(() => {
  const phones = [
    { href: "+4915257848836", display: "+49 152 57848836" },
    { href: "+4917755845906", display: "+49 177 55845906" }
  ];

  const labels = {
    de: { phone: "Telefon" },
    en: { phone: "Phone" }
  };

  function loadBrand() {
    if (document.querySelector('script[src*="brand.js"]')) return;
    const script = document.createElement("script");
    script.src = "brand.js?v=20260721-2";
    document.head.appendChild(script);
  }

  function loadSiteEmail() {
    if (document.querySelector('script[src*="site-email.js"]')) return;
    const script = document.createElement("script");
    script.src = "site-email.js?v=20260723-2";
    document.head.appendChild(script);
  }

  function language() {
    return document.documentElement.lang === "en" ? "en" : "de";
  }

  function phoneLinks(className) {
    return phones
      .map(phone => `<a class="${className}" href="tel:${phone.href}" aria-label="${phone.display}">${phone.display}</a>`)
      .join("");
  }

  function installStylesheet() {
    const href = "contact-details.css?v=20260723-hero-1";
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

  function refresh() {
    installContacts();
    loadSiteEmail();
  }

  loadBrand();
  installStylesheet();
  refresh();

  document.querySelectorAll("[data-lang]").forEach(button => {
    button.addEventListener("click", () => requestAnimationFrame(refresh));
  });
})();