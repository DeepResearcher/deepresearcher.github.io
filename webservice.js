// Website-Service page: the promo video plays muted in a loop, except for visitors who ask the
// system for reduced motion; they get the poster and the controls instead.
(() => {
  const video = document.querySelector(".webservice-video");
  if (!video) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    video.removeAttribute("autoplay");
    video.pause();
    video.controls = true;
  }
})();
