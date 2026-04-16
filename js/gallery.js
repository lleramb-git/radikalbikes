/**
 * RadikalBikesRace — gallery.js
 * Lightbox interactivo para la galería de imágenes.
 * Click en imagen → abre a pantalla completa con navegación.
 */
(function () {
  'use strict';

  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxCounter = document.getElementById('lightbox-counter');
  var closeBtn = lightbox ? lightbox.querySelector('.lightbox__close') : null;
  var prevBtn = lightbox ? lightbox.querySelector('.lightbox__prev') : null;
  var nextBtn = lightbox ? lightbox.querySelector('.lightbox__next') : null;

  var images = [];
  var currentIndex = 0;

  function init() {
    if (!lightbox) return;

    var items = document.querySelectorAll('.gallery__item');
    items.forEach(function (item) {
      var img = item.querySelector('img');
      if (img) {
        images.push(img.src);
      }

      item.addEventListener('click', function () {
        var idx = parseInt(item.getAttribute('data-index'), 10);
        openLightbox(idx);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', showPrev);
    if (nextBtn) nextBtn.addEventListener('click', showNext);

    // Close on backdrop click
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target.classList.contains('lightbox__content')) {
        closeLightbox();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;

      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    });

    // Touch swipe support
    var touchStartX = 0;
    lightbox.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
      var touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) showNext();
        else showPrev();
      }
    }, { passive: true });
  }

  function openLightbox(index) {
    if (images.length === 0) return;
    currentIndex = index;
    updateImage();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateImage();
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    updateImage();
  }

  function updateImage() {
    if (lightboxImg) {
      lightboxImg.src = images[currentIndex];
      lightboxImg.alt = 'Imagen ' + (currentIndex + 1) + ' de ' + images.length;
    }
    if (lightboxCounter) {
      lightboxCounter.textContent = (currentIndex + 1) + ' / ' + images.length;
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
