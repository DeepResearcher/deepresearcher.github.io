(function () {
  // Consent banner with Google Consent Mode v2 ("basic" mode: no Google script
  // is loaded before the visitor agrees to at least one optional purpose).
  var STORAGE_KEY = 'nd-cookie-consent';
  var GA_ID = 'G-1TMB9MX889';
  // Google Ads conversion tracking, used only with "Marketing" consent.
  var ADS_ID = 'AW-18092711804';
  var ADS_LEAD_LABEL = 'cELVCP6U6bgdEPy-o7ND'; // "Anfrage" conversion (account 393-666-0446)

  var isEnglish = document.documentElement.lang === 'en';

  var TEXT = isEnglish
    ? {
        label: 'Cookie settings',
        message:
          'With your consent we use Google Analytics to understand how this site is used, and Google Ads to measure whether our ads lead to enquiries. Both are optional and can be withdrawn at any time.',
        accept: 'Accept all',
        reject: 'Necessary only',
        settings: 'Settings',
        save: 'Save selection',
        analyticsTitle: 'Statistics (Google Analytics)',
        analyticsText: 'Shows us which pages are used and where visitors come from.',
        marketingTitle: 'Marketing (Google Ads)',
        marketingText: 'Measures whether our Google ads lead to enquiries. No personalised advertising.',
        linkText: 'Privacy policy (German)',
        linkHref: '/datenschutz',
      }
    : {
        label: 'Cookie-Einstellungen',
        message:
          'Mit Ihrer Einwilligung nutzen wir Google Analytics, um die Nutzung dieser Website zu verstehen, und Google Ads, um zu messen, ob unsere Anzeigen zu Anfragen führen. Beides ist freiwillig und jederzeit widerrufbar.',
        accept: 'Alle akzeptieren',
        reject: 'Nur erforderliche',
        settings: 'Einstellungen',
        save: 'Auswahl speichern',
        analyticsTitle: 'Statistik (Google Analytics)',
        analyticsText: 'Zeigt uns, welche Seiten genutzt werden und woher Besucher kommen.',
        marketingTitle: 'Marketing (Google Ads)',
        marketingText: 'Misst, ob unsere Anzeigen bei Google zu Anfragen führen. Keine personalisierte Werbung.',
        linkText: 'Datenschutz',
        linkHref: '/datenschutz',
      };

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }

  var state = { loaded: false, analytics: false, marketing: false, configured: {} };

  // Stored value: {"v":2,"analytics":bool,"marketing":bool}. Older versions stored
  // "accepted" / "rejected" and only covered Google Analytics.
  function readConsent() {
    var raw = null;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
    if (raw === 'accepted') return { analytics: true, marketing: false, outdated: true };
    if (raw === 'rejected') return { analytics: false, marketing: false };
    try {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.v === 2) return { analytics: !!parsed.analytics, marketing: !!parsed.marketing };
    } catch (error) {
      /* unreadable value: ask again */
    }
    return null;
  }

  function saveConsent(choice) {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ v: 2, analytics: choice.analytics, marketing: choice.marketing, at: new Date().toISOString() })
      );
    } catch (error) {
      /* localStorage unavailable - consent will be asked again next visit */
    }
  }

  function consentState(choice) {
    return {
      analytics_storage: choice.analytics ? 'granted' : 'denied',
      ad_storage: choice.marketing ? 'granted' : 'denied',
      ad_user_data: choice.marketing ? 'granted' : 'denied',
      // No remarketing or personalised ads, whatever the choice.
      ad_personalization: 'denied',
    };
  }

  function configure(id) {
    if (!id || state.configured[id]) return;
    state.configured[id] = true;
    gtag('config', id);
  }

  function start(choice) {
    state.analytics = choice.analytics;
    state.marketing = choice.marketing;
    var adsReady = choice.marketing && ADS_ID;
    if (!choice.analytics && !adsReady) return;

    if (!state.loaded) {
      state.loaded = true;
      gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
      gtag('consent', 'update', consentState(choice));
      gtag('set', 'ads_data_redaction', !choice.marketing);
      gtag('js', new Date());
      window.gtag = gtag;

      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + (choice.analytics ? GA_ID : ADS_ID);
      document.head.appendChild(script);
    } else {
      gtag('consent', 'update', consentState(choice));
      gtag('set', 'ads_data_redaction', !choice.marketing);
    }

    if (choice.analytics) configure(GA_ID);
    if (adsReady) configure(ADS_ID);
  }

  function deleteGoogleCookies() {
    var host = window.location.hostname;
    var domains = ['', host, '.' + host.replace(/^www\./, '')];
    document.cookie.split(';').forEach(function (part) {
      var name = part.split('=')[0].trim();
      if (!/^(_ga|_gid|_gat|_gcl_)/.test(name)) return;
      domains.forEach(function (domain) {
        document.cookie =
          name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (domain ? '; domain=' + domain : '');
      });
    });
  }

  function apply(choice) {
    var withdrawn = (state.analytics && !choice.analytics) || (state.marketing && !choice.marketing);
    saveConsent(choice);
    if (withdrawn) {
      // Remove what Google already stored and reload, so no Google script keeps running.
      if (state.loaded) gtag('consent', 'update', consentState(choice));
      deleteGoogleCookies();
      window.location.reload();
      return;
    }
    start(choice);
  }

  // Called by contact-form.js after a successful submit.
  window.ndTrackLead = function (kind) {
    if (!state.loaded) return;
    if (state.analytics) gtag('event', 'generate_lead', { send_to: GA_ID, form_name: kind + '_request' });
    if (state.marketing && ADS_ID && ADS_LEAD_LABEL) gtag('event', 'conversion', { send_to: ADS_ID + '/' + ADS_LEAD_LABEL });
  };

  function trackContactClick(event) {
    if (!state.loaded || !state.analytics) return;
    var link = event.target.closest && event.target.closest('a[href^="tel:"], a[href^="mailto:"]');
    if (!link) return;
    var method = link.getAttribute('href').indexOf('tel:') === 0 ? 'phone' : 'email';
    gtag('event', 'contact_click', { send_to: GA_ID, method: method });
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function option(name, title, text, checked) {
    var label = el('label', 'cookie-option');
    var input = el('input');
    input.type = 'checkbox';
    input.name = name;
    input.checked = checked;
    var body = el('span', 'cookie-option-text');
    body.appendChild(el('strong', '', title));
    body.appendChild(el('span', '', text));
    label.appendChild(input);
    label.appendChild(body);
    return { label: label, input: input };
  }

  function buildBanner(current, openSettings) {
    var banner = el('div', 'cookie-banner');
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', TEXT.label);

    var text = el('p', '', TEXT.message + ' ');
    var link = el('a', '', TEXT.linkText);
    link.href = TEXT.linkHref;
    text.appendChild(link);

    var panel = el('div', 'cookie-options');
    panel.id = 'cookie-options';
    panel.hidden = !openSettings;
    var analytics = option('analytics', TEXT.analyticsTitle, TEXT.analyticsText, !!(current && current.analytics));
    var marketing = option('marketing', TEXT.marketingTitle, TEXT.marketingText, !!(current && current.marketing));
    panel.appendChild(analytics.label);
    panel.appendChild(marketing.label);

    var actions = el('div', 'cookie-banner-actions');
    var settingsBtn = el('button', 'cookie-settings-toggle', TEXT.settings);
    settingsBtn.type = 'button';
    settingsBtn.setAttribute('aria-controls', panel.id);
    settingsBtn.setAttribute('aria-expanded', String(!panel.hidden));
    var rejectBtn = el('button', 'cookie-reject', TEXT.reject);
    rejectBtn.type = 'button';
    var acceptBtn = el('button', 'cookie-accept', TEXT.accept);
    acceptBtn.type = 'button';
    var saveBtn = el('button', 'cookie-save', TEXT.save);
    saveBtn.type = 'button';
    saveBtn.hidden = panel.hidden;

    actions.appendChild(settingsBtn);
    actions.appendChild(rejectBtn);
    actions.appendChild(saveBtn);
    actions.appendChild(acceptBtn);
    banner.appendChild(text);
    banner.appendChild(panel);
    banner.appendChild(actions);
    document.body.appendChild(banner);

    function close(choice) {
      banner.remove();
      apply(choice);
    }

    settingsBtn.addEventListener('click', function () {
      panel.hidden = !panel.hidden;
      saveBtn.hidden = panel.hidden;
      settingsBtn.setAttribute('aria-expanded', String(!panel.hidden));
      if (!panel.hidden) analytics.input.focus();
    });
    acceptBtn.addEventListener('click', function () {
      close({ analytics: true, marketing: true });
    });
    rejectBtn.addEventListener('click', function () {
      close({ analytics: false, marketing: false });
    });
    saveBtn.addEventListener('click', function () {
      close({ analytics: analytics.input.checked, marketing: marketing.input.checked });
    });

    requestAnimationFrame(function () {
      banner.classList.add('is-visible');
    });
  }

  function showBanner(openSettings) {
    if (document.querySelector('.cookie-banner')) return;
    buildBanner(readConsent() || { analytics: state.analytics, marketing: state.marketing }, openSettings);
  }

  function init() {
    var consent = readConsent();
    if (consent) start(consent);
    // A consent given before marketing was added only covers Google Analytics: ask again.
    if (!consent || consent.outdated) showBanner(false);

    document.addEventListener('click', trackContactClick, true);

    var settingsButtons = document.querySelectorAll('[data-cookie-settings]');
    for (var i = 0; i < settingsButtons.length; i++) {
      if (isEnglish) settingsButtons[i].textContent = TEXT.label;
      settingsButtons[i].addEventListener('click', function () {
        showBanner(true);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
