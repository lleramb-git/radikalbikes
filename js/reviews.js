/**
 * RadikalBikesRace — reviews.js
 * Carrusel de reseñas con cambio automático cada 5 segundos
 */
(function () {
  'use strict';

  let currentIndex = 0;
  let autoplayInterval = null;
  let isPaused = false;

  function init() {
    const track = document.getElementById('reviews-track');
    const dotsContainer = document.getElementById('reviews-dots');
    
    if (!track || !dotsContainer) return;

    const cards = track.querySelectorAll('.review-card');
    if (cards.length === 0) return;

    // Create dots
    cards.forEach((_, index) => {
      const dot = document.createElement('span');
      dot.className = 'reviews__dot';
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(index));
      dotsContainer.appendChild(dot);
    });

    // Pause on hover
    track.addEventListener('mouseenter', pauseAutoplay);
    track.addEventListener('mouseleave', resumeAutoplay);

    // Start autoplay
    startAutoplay();
  }

  function goToSlide(index) {
    const track = document.getElementById('reviews-track');
    const dotsContainer = document.getElementById('reviews-dots');
    
    if (!track || !dotsContainer) return;

    const cards = track.querySelectorAll('.review-card');
    const dots = dotsContainer.querySelectorAll('.reviews__dot');

    // Remove active class from all
    cards.forEach(card => card.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    // Add active class to current
    cards[index].classList.add('active');
    dots[index].classList.add('active');

    currentIndex = index;
  }

  function nextSlide() {
    const track = document.getElementById('reviews-track');
    if (!track) return;

    const cards = track.querySelectorAll('.review-card');
    const nextIndex = (currentIndex + 1) % cards.length;
    goToSlide(nextIndex);
  }

  function startAutoplay() {
    if (autoplayInterval) return;
    autoplayInterval = setInterval(() => {
      if (!isPaused) {
        nextSlide();
      }
    }, 5000); // 5 segundos
  }

  function pauseAutoplay() {
    isPaused = true;
  }

  function resumeAutoplay() {
    isPaused = false;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
