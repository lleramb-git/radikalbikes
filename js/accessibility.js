/**
 * RadikalBikesRace — accessibility.js
 * Widget de accesibilidad con opciones básicas
 */
(function () {
  'use strict';

  let fontSize = 0; // 0, 1, 2, 3 (normal, grande, extra grande, super grande)

  function init() {
    const toggle = document.getElementById('accessibility-toggle');
    const panel = document.getElementById('accessibility-panel');
    const increaseFont = document.getElementById('increase-font');
    const highContrast = document.getElementById('high-contrast');
    const reset = document.getElementById('reset-accessibility');

    if (!toggle || !panel) {
      console.error('Accessibility widget elements not found');
      return;
    }

    // Toggle panel
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = panel.classList.contains('is-open');
      panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', !isOpen);
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.accessibility-widget')) {
        panel.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Increase font size
    if (increaseFont) {
      increaseFont.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Increase font clicked. Current fontSize:', fontSize);
        if (fontSize < 3) {
          fontSize++;
          console.log('New fontSize:', fontSize);
          applyFontSize();
          saveFontSize();
        }
      });
    }

    // High contrast
    if (highContrast) {
      highContrast.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('High contrast clicked');
        document.body.classList.toggle('high-contrast');
        console.log('High contrast active:', document.body.classList.contains('high-contrast'));
        saveHighContrast();
      });
    }

    // Reset
    if (reset) {
      reset.addEventListener('click', (e) => {
        e.stopPropagation();
        fontSize = 0;
        document.body.classList.remove('font-large', 'font-xlarge', 'font-xxlarge', 'high-contrast');
        localStorage.removeItem('accessibility-font-size');
        localStorage.removeItem('accessibility-high-contrast');
      });
    }

    // Load saved preferences
    loadPreferences();
  }

  function applyFontSize() {
    console.log('Applying font size:', fontSize);
    document.body.classList.remove('font-large', 'font-xlarge', 'font-xxlarge');
    if (fontSize === 1) {
      document.body.classList.add('font-large');
      console.log('Added font-large class');
    } else if (fontSize === 2) {
      document.body.classList.add('font-xlarge');
      console.log('Added font-xlarge class');
    } else if (fontSize === 3) {
      document.body.classList.add('font-xxlarge');
      console.log('Added font-xxlarge class');
    }
    console.log('Body classes:', document.body.className);
  }

  function saveFontSize() {
    localStorage.setItem('accessibility-font-size', fontSize);
  }

  function saveHighContrast() {
    const isHighContrast = document.body.classList.contains('high-contrast');
    localStorage.setItem('accessibility-high-contrast', isHighContrast);
  }

  function loadPreferences() {
    // Load font size
    const savedFontSize = localStorage.getItem('accessibility-font-size');
    if (savedFontSize !== null) {
      fontSize = parseInt(savedFontSize, 10);
      applyFontSize();
    }

    // Load high contrast
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast');
    if (savedHighContrast === 'true') {
      document.body.classList.add('high-contrast');
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
