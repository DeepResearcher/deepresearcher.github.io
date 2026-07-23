(() => {
  const EMAIL = "info@narli-digital.de";
  const SUBJECT_HOME = "Anfrage an NARLI DIGITAL";
  const SUBJECT_OUTPUTS = "Digital Output Anfrage";

  function mailto(subject) {
    return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;
  }

  function installStylesheet() {
    let link = document.querySelector('link[href*="site-email.css"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = "site-email.css?v=20260723-2";
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

  function installFooterEmail() {
    const footer = document.querySelector(".footer-meta");
    if (!footer || footer.querySelector(".site-email-footer")) return;

    const line = document.createElement("span");
    line.className = "site-email-footer";
    line.innerHTML = `<a href="${mailto(document.body.classList.contains("outputs-page") ? SUBJECT_OUTPUTS : SUBJECT_HOME)}">${EMAIL}</a>`;

    const copyright = footer.querySelector("#year")?.closest("span");
    copyright ? footer.insertBefore(line, copyright) : footer.prepend(line);
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
    installStylesheet();
    replaceExistingMailLinks();
    installHomepageEmail();
    installOutputsEmail();
    installFooterEmail();
    installLegalLinks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }

  document.querySelectorAll("[data-lang]").forEach(button => {
    button.addEventListener("click", () => requestAnimationFrame(installLegalLinks));
  });
})();