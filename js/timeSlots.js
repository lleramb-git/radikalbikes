/**
 * RadikalBikesRace — timeSlots.js
 * Módulo de franjas horarias.
 * Expuesto como window.TimeSlotsModule para que main.js lo inicialice.
 */
(function () {
  'use strict';

  var _containerId = null;
  var _container = null;
  var _selectCallback = null;
  var _selectedSlotId = null;
  var _currentDate = null;
  var _currentSlots = [];

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */

  function buildSlotsHTML(slots) {
    var html = '';

    html += '<div class="slots">';
    html += '<h3 class="slots__title">Franjas horarias</h3>';
    html += '<div class="slots__list">';

    for (var i = 0; i < slots.length; i++) {
      var slot = slots[i];
      var classes = 'slot-btn';

      if (!slot.available) {
        classes += ' unavailable';
      }
      if (slot.id === _selectedSlotId && slot.available) {
        classes += ' selected';
      }

      html += '<button class="' + classes + '"';
      html += ' data-slot-id="' + slot.id + '"';
      html += ' data-slot-time="' + slot.time + '"';
      html += ' data-slot-available="' + slot.available + '"';
      if (!slot.available) {
        html += ' disabled';
      }
      html += '>' + slot.time + '</button>';
    }

    html += '</div>';
    html += '</div>';

    return html;
  }

  function render(slots) {
    _currentSlots = slots || [];
    if (!_container) return;

    if (_currentSlots.length === 0) {
      renderNoAvailability();
      return;
    }

    _container.innerHTML = buildSlotsHTML(_currentSlots);
    bindEvents();
  }

  function renderNoAvailability() {
    if (!_container) return;
    _container.innerHTML =
      '<div class="slots">' +
      '<h3 class="slots__title">Franjas horarias</h3>' +
      '<p class="slots__empty">No hay disponibilidad para esta fecha</p>' +
      '</div>';
  }

  /* ------------------------------------------------------------------ */
  /*  Events                                                            */
  /* ------------------------------------------------------------------ */

  function bindEvents() {
    if (!_container) return;

    var btns = _container.querySelectorAll('.slot-btn:not(.unavailable)');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', handleSlotClick);
    }
  }

  function handleSlotClick(e) {
    var btn = e.currentTarget;
    if (btn.disabled) return;

    var slotId = btn.getAttribute('data-slot-id');
    var slotTime = btn.getAttribute('data-slot-time');
    var slotAvailable = btn.getAttribute('data-slot-available') === 'true';

    if (!slotAvailable) return;

    _selectedSlotId = slotId;

    // Re-render to update selected state
    render(_currentSlots);

    if (_selectCallback) {
      _selectCallback({ id: slotId, time: slotTime, available: slotAvailable });
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Fetch slots                                                       */
  /* ------------------------------------------------------------------ */

  function fetchSlots(date) {
    if (!_container) return Promise.resolve([]);

    _currentDate = date;
    _selectedSlotId = null;
    showLoading();

    return fetch('/api/slots/' + date)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        var slots = data.slots || [];
        render(slots);
        return slots;
      })
      .catch(function () {
        showError();
        return [];
      });
  }

  /* ------------------------------------------------------------------ */
  /*  Loading / Error states                                            */
  /* ------------------------------------------------------------------ */

  function showLoading() {
    if (!_container) return;
    _container.innerHTML =
      '<div class="slots">' +
      '<div class="calendar__loading">Cargando franjas horarias…</div>' +
      '</div>';
  }

  function showError() {
    if (!_container) return;
    _container.innerHTML =
      '<div class="slots">' +
      '<div class="calendar__error">' +
      '<p>No se pudieron cargar las franjas horarias</p>' +
      '<button class="calendar__retry-btn">Reintentar</button>' +
      '</div>' +
      '</div>';

    var retryBtn = _container.querySelector('.calendar__retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', function () {
        if (_currentDate) {
          fetchSlots(_currentDate);
        }
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Init                                                              */
  /* ------------------------------------------------------------------ */

  function init(containerId) {
    _containerId = containerId;
    _container = document.getElementById(containerId);
  }

  function onSlotSelect(callback) {
    _selectCallback = callback;
  }

  /* ------------------------------------------------------------------ */
  /*  Public API                                                        */
  /* ------------------------------------------------------------------ */

  window.TimeSlotsModule = {
    init: init,
    fetchSlots: fetchSlots,
    render: render,
    onSlotSelect: onSlotSelect,
    renderNoAvailability: renderNoAvailability
  };
})();
