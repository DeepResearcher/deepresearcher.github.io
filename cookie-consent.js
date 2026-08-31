(function () {
  var STORAGE_KEY = 'nd-cookie-consent';
  var GA_ID = 'G-1TMB9MX889';
  var isEnglish = document.documentElement.lang === 'en';

  var TEXT = isEnglish
    ? {
        message:
          'We use Google Analytics to understand how this site is used. This is optional and only runs with your consent.',
        accept: 'Accept all',
        reject: 'Necessary only',
        linkText: 'Privacy Policy',
        linkHref: '/shot-privacy-policy',
      }
    : {
        message:
          'Wir verwenden Google Analytics, um zu verstehen, wie diese Website genutzt wird. Das ist freiwillig und läuft nur mit Ihrer Einwilligung.',
        accept: 'Alle akzeptieren',
        reject: 'Nur erforderliche',
        linkText: 'Datenschutz',
        linkHref: '/datenschutz',
      };

  function getConsent() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      /* localStorage unavailable - consent will be asked again next visit */
    }
  }

  function loadAnalytics() {
    if (window.__ndAnalyticsLoaded) return;
    window.__ndAnalyticsLoaded = true;

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  function buildBanner() {
    var banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', isEnglish ? 'Cookie notice' : 'Cookie-Hinweis');

    var text = document.createElement('p');
    text.textContent = TEXT.message + ' ';
    var link = document.createElement('a');
    link.href = TEXT.linkHref;
    link.textContent = TEXT.linkText;
    text.appendChild(link);

    var actions = document.createElement('div');
    actions.className = 'cookie-banner-actions';

    var rejectBtn = document.createElement('button');
    rejectBtn.type = 'button';
    rejectBtn.className = 'cookie-reject';
    rejectBtn.textContent = TEXT.reject;

    var acceptBtn = document.createElement('button');
    acceptBtn.type = 'button';
    acceptBtn.className = 'cookie-accept';
    acceptBtn.textContent = TEXT.accept;

    actions.appendChild(rejectBtn);
    actions.appendChild(acceptBtn);
    banner.appendChild(text);
    banner.appendChild(actions);
    document.body.appendChild(banner);

    acceptBtn.addEventListener('click', function () {
      setConsent('accepted');
      loadAnalytics();
      banner.remove();
    });

    rejectBtn.addEventListener('click', function () {
      setConsent('rejected');
      banner.remove();
    });

    requestAnimationFrame(function () {
      banner.classList.add('is-visible');
    });

    return banner;
  }

  function showBanner() {
    if (document.querySelector('.cookie-banner')) return;
    buildBanner();
  }

  function init() {
    var consent = getConsent();
    if (consent === 'accepted') {
      loadAnalytics();
    } else if (consent !== 'rejected') {
      showBanner();
    }

    var settingsButtons = document.querySelectorAll('[data-cookie-settings]');
    for (var i = 0; i < settingsButtons.length; i++) {
      settingsButtons[i].addEventListener('click', showBanner);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
