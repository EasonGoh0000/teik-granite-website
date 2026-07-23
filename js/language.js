// ============================================================
// LANGUAGE SWITCHER - Teik Granite Quarry Website
// ============================================================

(function() {
  'use strict';

  // ---- CONFIG ----
  const DEFAULT_LANG = 'en';
  const STORAGE_KEY = 'teik_language';

  // ---- STATE ----
  let currentLang = DEFAULT_LANG;
  let translations = window.TRANSLATIONS || {};

  // ---- HELPERS ----
  function getSavedLang() {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
    } catch (e) {
      return DEFAULT_LANG;
    }
  }

  function saveLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      // ignore
    }
  }

  function getBrowserLang() {
    const langs = navigator.languages || [navigator.language];
    for (let l of langs) {
      const code = l.split('-')[0].toLowerCase();
      if (['en', 'ms', 'zh'].includes(code)) return code;
    }
    return DEFAULT_LANG;
  }

  function getLang() {
    const saved = getSavedLang();
    if (saved && translations[saved]) return saved;
    const browser = getBrowserLang();
    if (translations[browser]) return browser;
    return DEFAULT_LANG;
  }

  // ---- GET NESTED VALUE ----
  function getNestedValue(obj, path) {
    if (!obj || !path) return undefined;
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    return current;
  }

  // ---- TRANSLATE PAGE ----
  function translatePage(lang) {
    const t = translations[lang];
    if (!t) {
      console.warn('Translation not found for language:', lang);
      return;
    }

    currentLang = lang;
    saveLang(lang);

    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // ---- TRANSLATE ALL ELEMENTS WITH data-i18n ----
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = getNestedValue(t, key);
      if (value !== undefined && value !== null) {
        el.textContent = value;
      }
    });

    // ---- TRANSLATE HTML CONTENT (for rich text) ----
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const value = getNestedValue(t, key);
      if (value !== undefined && value !== null) {
        el.innerHTML = value;
      }
    });

    // ---- TRANSLATE PLACEHOLDERS ----
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const value = getNestedValue(t, key);
      if (value !== undefined && value !== null) {
        el.placeholder = value;
      }
    });

    // ---- TRANSLATE LANGUAGE DROPDOWN LABELS ----
    document.querySelectorAll('.lang-option-nav .lang-label').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = getNestedValue(t, key);
      if (value !== undefined && value !== null) {
        el.textContent = value;
      }
    });

    // ---- UPDATE SELECT OPTIONS ----
    document.querySelectorAll('select[data-i18n-options]').forEach(select => {
      const key = select.getAttribute('data-i18n-options');
      const options = getNestedValue(t, key);
      if (options && typeof options === 'object') {
        const currentValue = select.value;
        const hasPlaceholder = select.options[0] && select.options[0].value === '';
        let newHTML = '';
        if (hasPlaceholder) {
          const placeholderKey = select.getAttribute('data-i18n-placeholder');
          const placeholderText = placeholderKey ? getNestedValue(t, placeholderKey) : 'Select...';
          newHTML += `<option value="">${placeholderText}</option>`;
        }
        for (const [val, label] of Object.entries(options)) {
          const selected = val === currentValue ? 'selected' : '';
          newHTML += `<option value="${val}" ${selected}>${label}</option>`;
        }
        select.innerHTML = newHTML;
      }
    });

    // ---- UPDATE WHATSAPP LINK ----
    const whatsappLinks = document.querySelectorAll('a.whatsapp-float');
    const waMessages = {
      en: 'Hi%2C%20I%27m%20interested%20in%20your%20granite%20products',
      ms: 'Hi%2C%20Saya%20berminat%20dengan%20produk%20granit%20anda',
      zh: 'Hi%2C%20我对您的花岗岩产品感兴趣'
    };
    whatsappLinks.forEach(link => {
      const msg = waMessages[lang] || waMessages.en;
      link.href = `https://wa.me/601116595751?text=${msg}`;
    });

    // ---- UPDATE LANGUAGE TOGGLE BUTTON ----
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
      const toggleLabels = {
        en: 'EN',
        ms: 'MS',
        zh: '中文'
      };
      langToggle.innerHTML = (toggleLabels[lang] || 'EN') + ' <span class="arrow">▼</span>';
    }

    // ---- UPDATE ACTIVE STATE IN DROPDOWN ----
    document.querySelectorAll('.lang-option-nav').forEach(option => {
      option.classList.remove('active');
      const check = option.querySelector('.check');
      if (check) check.remove();
      if (option.getAttribute('data-lang') === lang) {
        option.classList.add('active');
        const checkSpan = document.createElement('span');
        checkSpan.className = 'check';
        checkSpan.textContent = '✓';
        option.appendChild(checkSpan);
      }
    });

    // ---- SHOW PAGE AFTER TRANSLATION (prevents flash of English) ----
    document.body.classList.add('translated');

    // ---- TRIGGER CUSTOM EVENT ----
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));

    console.log('✅ Language changed to:', lang);
  }

  // ---- INIT LANGUAGE SWITCHER ----
  function initSwitcher() {
    const langToggle = document.getElementById('langToggle');
    const langDropdown = document.getElementById('langDropdown');

    if (!langToggle || !langDropdown) {
      console.warn('⚠️ Language switcher elements not found');
      return;
    }

    console.log('🌐 Language switcher initialized');

    // Toggle dropdown
    langToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      langDropdown.classList.toggle('open');
      const arrow = this.querySelector('.arrow');
      if (arrow) arrow.classList.toggle('open');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!langToggle.contains(e.target) && !langDropdown.contains(e.target)) {
        langDropdown.classList.remove('open');
        const arrow = langToggle.querySelector('.arrow');
        if (arrow) arrow.classList.remove('open');
      }
    });

    // Language options click - using event delegation
    langDropdown.addEventListener('click', function(e) {
      const option = e.target.closest('.lang-option-nav');
      if (!option) return;
      
      e.stopPropagation();
      const lang = option.getAttribute('data-lang');
      
      if (lang && translations[lang]) {
        translatePage(lang);
        langDropdown.classList.remove('open');
        const arrow = langToggle.querySelector('.arrow');
        if (arrow) arrow.classList.remove('open');
      }
    });

    // Set initial language
    const initialLang = getLang();
    translatePage(initialLang);
  }

  // ---- INIT ----
  function init() {
    if (typeof window.TRANSLATIONS === 'undefined') {
      console.warn('⚠️ Translations not loaded. Check that translations.js is included.');
      return;
    }
    translations = window.TRANSLATIONS;
    console.log('📚 Translations loaded:', Object.keys(translations));

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initSwitcher);
    } else {
      initSwitcher();
    }
  }

  // Expose for debugging
  window.__translate = translatePage;
  window.__getLang = getLang;

  // Start
  init();

})();