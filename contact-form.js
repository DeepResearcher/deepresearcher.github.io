// Request form: the "Website anfragen" / "Projekt anfragen" buttons open a dialog instead of the mail program.
// Without JavaScript (or without <dialog> support) the buttons stay plain mailto links.
// Messages go to /api/contact, a Cloudflare Worker that forwards them to our inbox
// (see workers/contact-form). All texts live in the page, so both languages work.
(() => {
  const dialog = document.getElementById("contact-dialog");
  if (!dialog || typeof dialog.showModal !== "function") return;

  const form = dialog.querySelector("form");
  const content = form.querySelector(".contact-form-body");
  const success = form.querySelector(".contact-success");
  const submit = form.querySelector('button[type="submit"]');
  const messages = form.querySelectorAll("[data-msg]");
  let openedAt = 0;
  let trigger = null;

  const show = (name) => messages.forEach((message) => { message.hidden = message.dataset.msg !== name; });

  const open = (event) => {
    event.preventDefault();
    trigger = event.currentTarget;
    if (!success.hidden) {
      success.hidden = true;
      content.hidden = false;
    }
    show(null);
    dialog.showModal();
    openedAt = Date.now();
    form.querySelector('[name="name"]').focus();
  };

  document.querySelectorAll("[data-contact-open]").forEach((link) => link.addEventListener("click", open));
  form.querySelectorAll("[data-contact-close]").forEach((button) => button.addEventListener("click", () => dialog.close()));
  // A click on the dimmed backdrop closes the dialog (the form fills the dialog box itself).
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => trigger?.focus());

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      show("invalid");
      form.reportValidity();
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    data.elapsed = Date.now() - openedAt;
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
        success.querySelector("button").focus();
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
})();
