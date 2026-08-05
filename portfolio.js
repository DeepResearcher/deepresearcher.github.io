(() => {
  const menuToggle = document.querySelector(".menu-toggle");
  const primaryNav = document.querySelector(".primary-nav");
  const header = document.querySelector(".site-header");

  menuToggle?.addEventListener("click", () => {
    const open = primaryNav?.classList.toggle("is-open") ?? false;
    menuToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  });

  primaryNav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    primaryNav.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  }));

  window.addEventListener("scroll", () => header?.classList.toggle("is-scrolled", window.scrollY > 12), { passive: true });

  const yearElement = document.getElementById("year");
  if (yearElement) yearElement.textContent = new Date().getFullYear();

  document.querySelectorAll(".portfolio-filter").forEach(button => button.addEventListener("click", () => {
    const selected = button.dataset.filter;
    document.querySelectorAll(".portfolio-filter").forEach(item => item.classList.toggle("is-active", item === button));
    document.querySelectorAll(".portfolio-card").forEach(card => card.classList.toggle("is-hidden", selected !== "all" && card.dataset.category !== selected));
  }));
})();
