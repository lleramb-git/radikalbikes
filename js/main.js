/**
 * RadikalBikesRace — main.js
 * Inicialización general, navegación suave y menú hamburguesa.
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /*  Año dinámico en el footer                                         */
  /* ------------------------------------------------------------------ */
  function setFooterYear() {
    var el = document.getElementById('footer-year');
    if (el) {
      el.textContent = new Date().getFullYear();
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Smooth scroll para enlaces de navegación                          */
  /* ------------------------------------------------------------------ */
  function initSmoothScroll() {
    var links = document.querySelectorAll('.navbar__link');
    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          var target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
          // Cerrar menú móvil al hacer clic en un enlace
          closeMobileMenu();
        }
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Menú hamburguesa (móvil)                                          */
  /* ------------------------------------------------------------------ */
  var toggle = null;
  var menu = null;

  function openMobileMenu() {
    if (!toggle || !menu) return;
    toggle.classList.add('is-active');
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Cerrar menú de navegación');
  }

  function closeMobileMenu() {
    if (!toggle || !menu) return;
    toggle.classList.remove('is-active');
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú de navegación');
  }

  function toggleMobileMenu() {
    if (toggle && toggle.classList.contains('is-active')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  function initHamburgerMenu() {
    toggle = document.querySelector('.navbar__toggle');
    menu = document.querySelector('.navbar__menu');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      toggleMobileMenu();
    });

    // Soporte teclado: Enter y Space en el botón toggle
    toggle.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMobileMenu();
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Navegación por teclado                                            */
  /* ------------------------------------------------------------------ */
  function initKeyboardNav() {
    // Los enlaces de navegación ya son focusables por defecto (Tab).
    // Añadimos soporte para Enter en elementos interactivos custom.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var active = document.activeElement;
        // Si el foco está en un enlace de navegación, disparar click
        if (active && active.classList.contains('navbar__link')) {
          active.click();
        }
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Inicializar módulos externos (calendario, franjas, formulario)    */
  /* ------------------------------------------------------------------ */
  var _selectedDate = null;

  function initModules() {
    var hasCalendar = window.CalendarModule && typeof window.CalendarModule.init === 'function';
    var hasSlots = window.TimeSlotsModule && typeof window.TimeSlotsModule.init === 'function';
    var hasForm = window.BookingFormModule && typeof window.BookingFormModule.init === 'function';

    if (hasCalendar) {
      window.CalendarModule.init('calendar-container');
    }
    if (hasSlots) {
      window.TimeSlotsModule.init('slots-container');
    }
    if (hasForm) {
      window.BookingFormModule.init('booking-form-container');
    }

    // Wire up: calendar day selected → fetch time slots for that day
    if (hasCalendar && hasSlots) {
      window.CalendarModule.onDaySelect(function (date) {
        _selectedDate = date;
        window.TimeSlotsModule.fetchSlots(date);
      });
    }

    // Wire up: time slot selected → show booking form with date and slot
    if (hasSlots && hasForm) {
      window.TimeSlotsModule.onSlotSelect(function (slot) {
        if (_selectedDate) {
          window.BookingFormModule.show(_selectedDate, slot);
        }
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Hero video rotation                                               */
  /* ------------------------------------------------------------------ */
  var heroVideos = [
    'https://videos.pexels.com/video-files/2556610/2556610-hd_1920_1080_30fps.mp4',
    'https://videos.pexels.com/video-files/2491284/2491284-hd_1920_1080_24fps.mp4',
    'https://videos.pexels.com/video-files/4488057/4488057-hd_1920_1080_25fps.mp4'
  ];
  var currentVideoIndex = 0;

  function initHeroVideoRotation() {
    var video = document.getElementById('hero-video');
    if (!video) return;

    video.addEventListener('ended', function () {
      currentVideoIndex = (currentVideoIndex + 1) % heroVideos.length;
      video.src = heroVideos[currentVideoIndex];
      video.load();
      video.play();
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Punto de entrada                                                  */
  /* ------------------------------------------------------------------ */
  function init() {
    setFooterYear();
    initHamburgerMenu();
    initSmoothScroll();
    initKeyboardNav();
    initModules();
    initHeroVideoRotation();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
