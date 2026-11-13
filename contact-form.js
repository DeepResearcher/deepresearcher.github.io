// Request forms. Two variants share this script and the /api/contact endpoint
// (a Cloudflare Worker, see workers/contact-form):
// - a dialog (website-service page): the "Website anfragen" buttons open it instead of the mail
//   program; without JavaScript or <dialog> support they stay plain mailto links;
// - an inline form (homepage contact section), always open; links with data-contact-focus jump
//   to it and put the cursor in the first field.
// All texts live in the page, so both languages work.
(() => {
  document.querySelectorAll("form.contact-form").forEach(setup);

  function setup(form) {
    const dialog = form.closest("dialog");
    if (dialog && typeof dialog.showModal !== "function") return;

    const content = form.querySelector(".contact-form-body");
    const success = form.querySelector(".contact-success");
    const submit = form.querySelector('button[type="submit"]');
    const messages = form.querySelectorAll("[data-msg]");
    const firstField = form.querySelector('[name="name"]');
    let startedAt = Date.now();

    const show = (name) => messages.forEach((message) => { message.hidden = message.dataset.msg !== name; });
    const showForm = () => {
      success.hidden = true;
      content.hidden = false;
      show(null);
    };

    if (dialog) {
      let trigger = null;
      document.querySelectorAll("[data-contact-open]").forEach((link) => link.addEventListener("click", (event) => {
        event.preventDefault();
        trigger = event.currentTarget;
        showForm();
        dialog.showModal();
        startedAt = Date.now();
        firstField.focus();
      }));
      form.querySelectorAll("[data-contact-close]").forEach((button) => button.addEventListener("click", () => dialog.close()));
      // A click on the dimmed backdrop closes the dialog (the form fills the dialog box itself).
      dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
      dialog.addEventListener("close", () => trigger?.focus());
    } else {
      // The 3-second bot check counts from the first time someone actually uses the form.
      form.addEventListener("focusin", () => { if (!form.dataset.touched) { form.dataset.touched = "1"; startedAt = Date.now(); } });
      form.querySelectorAll("[data-contact-reset]").forEach((button) => button.addEventListener("click", () => {
        showForm();
        firstField.focus();
      }));
      document.querySelectorAll("[data-contact-focus]").forEach((link) => link.addEventListener("click", () => {
        if (!success.hidden) showForm();
        setTimeout(() => firstField.focus({ preventScroll: true }), 450);
      }));
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        show("invalid");
        form.reportValidity();
        return;
      }

      const data = Object.fromEntries(new FormData(form));
      data.elapsed = Date.now() - startedAt;
      data.lang = document.documentElement.lang === "en" ? "en" : "de";
      data.page = location.pathname;
      data.kind = form.dataset.kind === "project" ? "project" : "website";

      submit.disabled = true;
      form.setAttribute("aria-busy", "true");
      show("sending");
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json().catch(() => ({}));
        if (response.ok && result.ok) {
          form.reset();
          show(null);
          content.hidden = true;
          success.hidden = false;
          success.querySelector("button").focus({ preventScroll: true });
          if (!dialog) success.scrollIntoView({ block: "nearest", behavior: "smooth" });
          // Counted only when the visitor allowed analytics (gtag is not loaded otherwise).
          if (typeof window.gtag === "function") window.gtag("event", "generate_lead", { form_name: `${data.kind}_request` });
        } else {
          show(response.status === 429 ? "rate" : response.status === 422 ? "invalid" : "error");
        }
      } catch {
        show("error");
      } finally {
        submit.disabled = false;
        form.removeAttribute("aria-busy");
      }
    });
  }
})();
