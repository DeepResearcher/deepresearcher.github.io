// Website-Service page: the promo video plays muted in a loop (browsers only autoplay muted video),
// except for visitors who ask the system for reduced motion; they get the poster and the controls.
// A button restarts the video with sound and turns it off again.
(() => {
  const video = document.querySelector(".webservice-video");
  if (!video) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    video.removeAttribute("autoplay");
    video.pause();
    video.controls = true;
  }

  const button = document.querySelector(".webservice-sound");
  if (!button) return;
  const label = button.querySelector("span");
  const english = document.documentElement.lang === "en";
  const text = english
    ? { on: "Play with sound", off: "Sound off" }
    : { on: "Mit Ton abspielen", off: "Ton aus" };

  const sync = () => {
    const audible = !video.muted && !video.paused;
    button.setAttribute("aria-pressed", String(audible));
    button.classList.toggle("is-on", audible);
    label.textContent = audible ? text.off : text.on;
  };

  button.addEventListener("click", () => {
    if (!video.muted && !video.paused) {
      video.muted = true;
    } else {
      video.muted = false;
      video.currentTime = 0;
      const playing = video.play();
      if (playing && typeof playing.catch === "function") playing.catch(() => { video.muted = true; sync(); });
    }
    sync();
  });
  video.addEventListener("volumechange", sync);
  video.addEventListener("play", sync);
  video.addEventListener("pause", sync);
  button.hidden = false;
  sync();
})();
