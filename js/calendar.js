/**
 * RadikalBikesRace — calendar.js
 * Módulo del calendario de disponibilidad.
 * Expuesto como window.CalendarModule para que main.js lo inicialice.
 */
(function () {
  'use strict';

  var MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  var WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  var _containerId = null;
  var _container = null;
  var _year = 0;
  var _month = 0; // 0-indexed internally
  var _availability = [];
  var _selectCallback = null;
  var _selectedDate = null;

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                           */
  /* ------------------------------------------------------------------ */

  /** Pad number to 2 digits */
  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  /** Format date as YYYY-MM-DD */
  function formatDate(y, m, d) {
    return y + '-' + pad(m + 1) + '-' + pad(d);
  }

  /** Get today as YYYY-MM-DD */
  function todayStr() {
    var now = new Date();
    return formatDate(now.getFullYear(), now.getMonth(), now.getDate());
  }

  /** Check if a date string is in the past (before today) */
  function isPast(dateStr) {
    return dateStr < todayStr();
  }

  /** Get the day of week for the 1st of a month (0=Mon … 6=Sun) */
  function firstDayOfWeek(year, month) {
    var d = new Date(year, month, 1).getDay(); // 0=Sun
    return d === 0 ? 6 : d - 1; // convert to Mon=0
  }

  /** Days in a month */
  function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */

  function buildCalendarHTML(availability) {
    var today = todayStr();
    var totalDays = daysInMonth(_year, _month);
    var startDay = firstDayOfWeek(_year, _month);

    // Build availability lookup
    var availMap = {};
    if (availability && availability.length) {
      for (var i = 0; i < availability.length; i++) {
        availMap[availability[i].date] = availability[i].available;
      }
    }

    var html = '';

    // Header
    html += '<div class="calendar__header">';
    html += '<button class="calendar__nav-btn" data-dir="-1" aria-label="Mes anterior">&lsaquo;</button>';
    html += '<span class="calendar__month-label">' + MONTH_NAMES[_month] + ' ' + _year + '</span>';
    html += '<button class="calendar__nav-btn" data-dir="1" aria-label="Mes siguiente">&rsaquo;</button>';
    html += '</div>';

    // Weekday headers
    html += '<div class="calendar__weekdays">';
    for (var w = 0; w < 7; w++) {
      html += '<span class="calendar__weekday">' + WEEKDAY_LABELS[w] + '</span>';
    }
    html += '</div>';

    // Day grid
    html += '<div class="calendar__days">';

    // Empty cells before the 1st
    for (var e = 0; e < startDay; e++) {
      html += '<span class="calendar__day calendar__day--empty"></span>';
    }

    for (var d = 1; d <= totalDays; d++) {
      var dateStr = formatDate(_year, _month, d);
      var classes = 'calendar__day';
      var isToday = dateStr === today;
      var past = isPast(dateStr);
      var avail = availMap[dateStr] === true;
      var unavail = availMap[dateStr] === false;
      var selected = dateStr === _selectedDate;

      if (past) {
        classes += ' past';
      } else if (avail) {
        classes += ' available';
      } else if (unavail) {
        classes += ' unavailable';
      }

      if (isToday) {
        classes += ' today';
      }
      if (selected && !past) {
        classes += ' selected';
      }

      var tabIndex = (avail && !past) ? '0' : '-1';
      var ariaLabel = d + ' de ' + MONTH_NAMES[_month] + ' de ' + _year;
      if (past) ariaLabel += ' (pasado)';
      else if (avail) ariaLabel += ' (disponible)';
      else if (unavail) ariaLabel += ' (no disponible)';

      html += '<button class="' + classes + '" data-date="' + dateStr + '"';
      html += ' tabindex="' + tabIndex + '"';
      html += ' aria-label="' + ariaLabel + '"';
      if (past || unavail || !avail) {
        html += ' disabled';
      }
      html += '>' + d + '</button>';
    }

    html += '</div>';

    return html;
  }

  function render(availability) {
    _availability = availability || [];
    if (!_container) return;
    _container.innerHTML = '<div class="calendar">' + buildCalendarHTML(_availability) + '</div>';
    bindEvents();
  }

  /* ------------------------------------------------------------------ */
  /*  Events                                                            */
  /* ------------------------------------------------------------------ */

  function bindEvents() {
    if (!_container) return;

    // Navigation buttons
    var navBtns = _container.querySelectorAll('.calendar__nav-btn');
    for (var i = 0; i < navBtns.length; i++) {
      navBtns[i].addEventListener('click', handleNavClick);
    }

    // Day buttons
    var dayBtns = _container.querySelectorAll('.calendar__day:not(.calendar__day--empty)');
    for (var j = 0; j < dayBtns.length; j++) {
      dayBtns[j].addEventListener('click', handleDayClick);
    }
  }

  function handleNavClick(e) {
    var dir = parseInt(e.currentTarget.getAttribute('data-dir'), 10);
    navigateMonth(dir);
  }

  function handleDayClick(e) {
    var btn = e.currentTarget;
    if (btn.disabled) return;
    if (btn.classList.contains('past') || btn.classList.contains('unavailable')) return;
    if (!btn.classList.contains('available')) return;

    var dateStr = btn.getAttribute('data-date');
    _selectedDate = dateStr;

    // Re-render to update selected state
    render(_availability);

    if (_selectCallback) {
      _selectCallback(dateStr);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Fetch availability                                                */
  /* ------------------------------------------------------------------ */

  function fetchAvailability(year, month) {
    if (!_container) return Promise.resolve([]);

    showLoading();

    return fetch('/api/availability/' + year + '/' + (month + 1))
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        var days = data.days || [];
        render(days);
        return days;
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
      '<div class="calendar">' +
      '<div class="calendar__loading">Cargando disponibilidad…</div>' +
      '</div>';
  }

  function showError() {
    if (!_container) return;
    _container.innerHTML =
      '<div class="calendar">' +
      '<div class="calendar__error">' +
      '<p>No se pudo cargar la disponibilidad</p>' +
      '<button class="calendar__retry-btn">Reintentar</button>' +
      '</div>' +
      '</div>';

    var retryBtn = _container.querySelector('.calendar__retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', function () {
        fetchAvailability(_year, _month);
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Navigation                                                        */
  /* ------------------------------------------------------------------ */

  function navigateMonth(direction) {
    _month += direction;
    if (_month < 0) {
      _month = 11;
      _year--;
    } else if (_month > 11) {
      _month = 0;
      _year++;
    }
    _selectedDate = null;
    fetchAvailability(_year, _month);
  }

  /* ------------------------------------------------------------------ */
  /*  Init                                                              */
  /* ------------------------------------------------------------------ */

  function init(containerId) {
    _containerId = containerId;
    _container = document.getElementById(containerId);
    if (!_container) return;

    var now = new Date();
    _year = now.getFullYear();
    _month = now.getMonth();
    _selectedDate = null;

    fetchAvailability(_year, _month);
  }

  function onDaySelect(callback) {
    _selectCallback = callback;
  }

  /* ------------------------------------------------------------------ */
  /*  Public API                                                        */
  /* ------------------------------------------------------------------ */

  window.CalendarModule = {
    init: init,
    fetchAvailability: fetchAvailability,
    render: render,
    onDaySelect: onDaySelect,
    navigateMonth: navigateMonth
  };
})();
