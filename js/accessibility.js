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
    const toggleTheme = document.getElementById('toggle-theme');
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

    // Toggle theme (light/dark mode)
    if (toggleTheme) {
      toggleTheme.addEventListener('click', (e) => {
        e.stopPropagation();
        document.body.classList.toggle('light-mode');
        updateThemeIcon();
        saveTheme();
      });
    }

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
        document.body.classList.remove('font-large', 'font-xlarge', 'font-xxlarge', 'high-contrast', 'light-mode');
        updateThemeIcon();
        localStorage.removeItem('accessibility-font-size');
        localStorage.removeItem('accessibility-high-contrast');
        localStorage.removeItem('accessibility-theme');
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

  function saveTheme() {
    const isLightMode = document.body.classList.contains('light-mode');
    localStorage.setItem('accessibility-theme', isLightMode ? 'light' : 'dark');
  }

  function updateThemeIcon() {
    const iconContainer = document.getElementById('theme-icon');
    if (!iconContainer) return;

    if (document.body.classList.contains('light-mode')) {
      // Moon icon for light mode
      iconContainer.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M484-80q-84 0-157.5-32t-128-86.5Q144-253 112-326.5T80-484q0-146 93-257.5T410-880q-18 99 11 193.5T521-521q71 71 165.5 100T880-410q-26 144-138 237T484-80Zm0-80q88 0 163-44t118-121q-86-8-163-43.5T464-465q-61-61-97-138t-43-163q-77 43-120.5 118.5T160-484q0 135 94.5 229.5T484-160Zm-20-305Z"/></svg>';
    } else {
      // Sun icon for dark mode
      iconContainer.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M480-360q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0 80q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Z"/></svg>';
    }
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

    // Load theme
    const savedTheme = localStorage.getItem('accessibility-theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
    }
    updateThemeIcon();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
