// Language by address. Pages that exist in German and English list both addresses as
// <link rel="alternate" hreflang="de|en">. On those pages the address decides the language
// (/ is German, /en/ is English), and the DE/EN buttons move to the other address instead of
// translating in place, so each language has its own indexable URL.
// Must load before the other deferred scripts: they read window.NARLI_PAGE_LANG.
(() => {
  const alternates = {};
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((link) => {
    const lang = link.getAttribute("hreflang");
    if (lang === "de" || lang === "en") alternates[lang] = link.href;
  });
  if (!alternates.de || !alternates.en) return;

  const pageLang = document.documentElement.lang === "en" ? "en" : "de";
  window.NARLI_PAGE_LANG = pageLang;

  document.addEventListener(
    "click",
    (event) => {
      const button = event.target.closest("[data-lang]");
      if (!button) return;
      const target = button.dataset.lang === "en" ? "en" : "de";
      if (target === pageLang) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      try {
        localStorage.setItem("narli-language", target);
      } catch (error) {}
      const url = new URL(alternates[target]);
      url.hash = location.hash;
      location.assign(url.href);
    },
    true
  );
})();
