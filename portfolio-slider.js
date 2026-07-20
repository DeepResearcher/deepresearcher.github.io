(() => {
  const labels = {
    de: {
      previous: "Vorherige Beispiele",
      next: "Nächste Beispiele",
      region: "Portfolio-Slider"
    },
    en: {
      previous: "Previous examples",
      next: "Next examples",
      region: "Portfolio slider"
    }
  };

  function initialiseSlider() {
    const track = document.querySelector("#portfolio .portfolio-gallery");
    if (!track || track.dataset.sliderReady === "true") return false;

    track.dataset.sliderReady = "true";
    track.tabIndex = 0;

    const shell = document.createElement("div");
    shell.className = "portfolio-slider";
    track.parentNode.insertBefore(shell, track);
    shell.appendChild(track);

    const toolbar = document.createElement("div");
    toolbar.className = "portfolio-slider-toolbar";

    const previousButton = document.createElement("button");
    previousButton.type = "button";
    previousButton.className = "portfolio-slider-button portfolio-slider-previous";
    previousButton.innerHTML = "&#8592;";

    const status = document.createElement("span");
    status.className = "portfolio-slider-status";
    status.setAttribute("aria-live", "polite");

    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.className = "portfolio-slider-button portfolio-slider-next";
    nextButton.innerHTML = "&#8594;";

    toolbar.append(previousButton, status, nextButton);
    shell.insertBefore(toolbar, track);

    const cards = [...track.querySelectorAll(".portfolio-item")];

    function currentLanguage() {
      return document.documentElement.lang === "en" ? "en" : "de";
    }

    function updateLabels() {
      const language = currentLanguage();
      track.setAttribute("aria-label", labels[language].region);
      previousButton.setAttribute("aria-label", labels[language].previous);
      nextButton.setAttribute("aria-label", labels[language].next);
    }

    function cardStep() {
      const firstCard = cards[0];
      if (!firstCard) return track.clientWidth;
      const styles = getComputedStyle(track);
      const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
      return firstCard.getBoundingClientRect().width + gap;
    }

    function activeIndex() {
      const step = cardStep();
      return step > 0 ? Math.round(track.scrollLeft / step) : 0;
    }

    function updateState() {
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      const tolerance = 4;
      previousButton.disabled = track.scrollLeft <= tolerance;
      nextButton.disabled = track.scrollLeft >= maxScroll - tolerance;
      const index = Math.min(cards.length - 1, Math.max(0, activeIndex()));
      status.textContent = `${index + 1} / ${cards.length}`;
    }

    function move(direction) {
      track.scrollBy({
        left: direction * cardStep(),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
    }

    previousButton.addEventListener("click", () => move(-1));
    nextButton.addEventListener("click", () => move(1));
    track.addEventListener("scroll", () => requestAnimationFrame(updateState), { passive: true });
    window.addEventListener("resize", updateState, { passive: true });

    track.addEventListener("keydown", event => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      }
    });

    document.querySelectorAll("[data-lang]").forEach(button => {
      button.addEventListener("click", () => requestAnimationFrame(updateLabels));
    });

    updateLabels();
    updateState();
    return true;
  }

  function waitForPortfolio() {
    if (initialiseSlider()) return;

    const observer = new MutationObserver(() => {
      if (initialiseSlider()) observer.disconnect();
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 10000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForPortfolio, { once: true });
  } else {
    waitForPortfolio();
  }
})();
