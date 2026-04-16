/**
 * RadikalBikesRace — bookingForm.js
 * Módulo del formulario de reserva.
 * Expuesto como window.BookingFormModule para que main.js lo inicialice.
 */
(function () {
  'use strict';

  var _containerId = null;
  var _container = null;
  var _currentDate = null;
  var _currentSlot = null;

  var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_REGEX = /^\+?[\d\s\-()]{6,20}$/;

  var FIELDS = [
    { name: 'name', label: 'Nombre completo', type: 'input', placeholder: 'Ej: Juan García' },
    { name: 'phone', label: 'Teléfono', type: 'input', placeholder: 'Ej: 612345678' },
    { name: 'email', label: 'Correo electrónico', type: 'input', placeholder: 'Ej: juan@example.com' },
    { name: 'bikeModel', label: 'Modelo de moto', type: 'input', placeholder: 'Ej: Yamaha MT-07' },
    { name: 'serviceDescription', label: 'Descripción del servicio', type: 'textarea', placeholder: 'Describe brevemente el servicio que necesitas' }
  ];

  var FIELD_MESSAGES = {
    name: 'El nombre completo es obligatorio',
    phone: 'El teléfono es obligatorio',
    email: 'El correo electrónico es obligatorio',
    bikeModel: 'El modelo de moto es obligatorio',
    serviceDescription: 'La descripción del servicio es obligatoria'
  };

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                           */
  /* ------------------------------------------------------------------ */

  /** Format date for display (YYYY-MM-DD → DD/MM/YYYY) */
  function formatDateDisplay(dateStr) {
    var parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */

  function buildFormHTML(date, slot) {
    var html = '';

    html += '<div class="booking-form">';
    html += '<h3 class="booking-form__title">Reservar Cita</h3>';

    html += '<div class="booking-form__selected-info">';
    html += '<span><strong>Fecha:</strong> ' + formatDateDisplay(date) + '</span>';
    html += '<span><strong>Hora:</strong> ' + slot.time + '</span>';
    html += '</div>';

    html += '<form id="booking-form" novalidate>';

    for (var i = 0; i < FIELDS.length; i++) {
      var field = FIELDS[i];
      html += '<div class="booking-form__group">';
      html += '<label class="booking-form__label" for="booking-' + field.name + '">' + field.label + '</label>';

      if (field.type === 'textarea') {
        html += '<textarea class="booking-form__textarea" id="booking-' + field.name + '" name="' + field.name + '" placeholder="' + field.placeholder + '" required></textarea>';
      } else {
        html += '<input class="booking-form__input" id="booking-' + field.name + '" name="' + field.name + '" type="text" placeholder="' + field.placeholder + '" required>';
      }

      html += '<span class="booking-form__error" id="error-' + field.name + '"></span>';
      html += '</div>';
    }

    html += '<button type="submit" class="booking-form__submit">Confirmar Reserva</button>';
    html += '</form>';
    html += '</div>';

    return html;
  }

  /* ------------------------------------------------------------------ */
  /*  Show form                                                         */
  /* ------------------------------------------------------------------ */

  function show(date, slot) {
    if (!_container) return;

    _currentDate = date;
    _currentSlot = slot;

    _container.innerHTML = buildFormHTML(date, slot);
    _container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    bindFormEvents();
  }

  /* ------------------------------------------------------------------ */
  /*  Validation                                                        */
  /* ------------------------------------------------------------------ */

  function validate() {
    var errors = [];

    for (var i = 0; i < FIELDS.length; i++) {
      var field = FIELDS[i];
      var el = document.getElementById('booking-' + field.name);
      var value = el ? el.value.trim() : '';

      if (!value) {
        errors.push({ field: field.name, message: FIELD_MESSAGES[field.name] });
        continue;
      }

      if (field.name === 'email' && !EMAIL_REGEX.test(value)) {
        errors.push({ field: 'email', message: 'El formato del email no es válido' });
      }

      if (field.name === 'phone' && !PHONE_REGEX.test(value)) {
        errors.push({ field: 'phone', message: 'El formato del teléfono no es válido' });
      }
    }

    return { valid: errors.length === 0, errors: errors };
  }

  /* ------------------------------------------------------------------ */
  /*  Show / clear errors                                               */
  /* ------------------------------------------------------------------ */

  function clearErrors() {
    for (var i = 0; i < FIELDS.length; i++) {
      var field = FIELDS[i];
      var el = document.getElementById('booking-' + field.name);
      var errEl = document.getElementById('error-' + field.name);
      if (el) {
        el.classList.remove('has-error');
      }
      if (errEl) {
        errEl.textContent = '';
      }
    }
  }

  function showErrors(errors) {
    clearErrors();

    for (var i = 0; i < errors.length; i++) {
      var err = errors[i];
      var el = document.getElementById('booking-' + err.field);
      var errEl = document.getElementById('error-' + err.field);
      if (el) {
        el.classList.add('has-error');
      }
      if (errEl) {
        errEl.textContent = err.message;
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Submit                                                            */
  /* ------------------------------------------------------------------ */

  function getFormData() {
    return {
      date: _currentDate,
      slotId: _currentSlot ? _currentSlot.id : '',
      name: (document.getElementById('booking-name') || {}).value || '',
      phone: (document.getElementById('booking-phone') || {}).value || '',
      email: (document.getElementById('booking-email') || {}).value || '',
      bikeModel: (document.getElementById('booking-bikeModel') || {}).value || '',
      serviceDescription: (document.getElementById('booking-serviceDescription') || {}).value || ''
    };
  }

  function submit(data) {
    // Demo mode: simulate successful booking
    return Promise.resolve({
      status: 201,
      body: {
        success: true,
        booking: {
          id: 'demo-' + Date.now(),
          date: data.date,
          time: _currentSlot ? _currentSlot.time : '',
          name: data.name,
          bikeModel: data.bikeModel,
          serviceDescription: data.serviceDescription
        }
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Confirmation                                                      */
  /* ------------------------------------------------------------------ */

  function showConfirmation(booking) {
    if (!_container) return;

    var html = '';
    html += '<div class="booking-confirmation">';
    html += '<h3 class="booking-confirmation__title">¡Reserva Confirmada!</h3>';
    html += '<div class="booking-confirmation__details">';
    html += '<p><strong>Fecha:</strong> ' + formatDateDisplay(booking.date) + '</p>';
    html += '<p><strong>Hora:</strong> ' + booking.time + '</p>';
    html += '<p><strong>Nombre:</strong> ' + booking.name + '</p>';
    html += '<p><strong>Moto:</strong> ' + booking.bikeModel + '</p>';
    html += '<p><strong>Servicio:</strong> ' + booking.serviceDescription + '</p>';
    html += '</div>';
    html += '</div>';

    _container.innerHTML = html;
    _container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ------------------------------------------------------------------ */
  /*  Error messages                                                    */
  /* ------------------------------------------------------------------ */

  function showServerError() {
    if (!_container) return;

    var html = '';
    html += '<div class="booking-error">';
    html += '<h3 class="booking-error__title">Error</h3>';
    html += '<p class="booking-error__message">Error al registrar la reserva. Por favor, inténtelo de nuevo o contacte al taller por teléfono.</p>';
    html += '</div>';

    _container.innerHTML = html;
    _container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showConflictError() {
    if (!_container) return;

    var html = '';
    html += '<div class="booking-error">';
    html += '<h3 class="booking-error__title">Franja no disponible</h3>';
    html += '<p class="booking-error__message">La franja horaria seleccionada ya no está disponible</p>';
    html += '</div>';

    _container.innerHTML = html;

    // Reload slots for the current date
    if (window.TimeSlotsModule && _currentDate) {
      window.TimeSlotsModule.fetchSlots(_currentDate);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Form events                                                       */
  /* ------------------------------------------------------------------ */

  function bindFormEvents() {
    var form = document.getElementById('booking-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var result = validate();
      if (!result.valid) {
        showErrors(result.errors);
        return;
      }

      clearErrors();
      var data = getFormData();

      // Disable submit button while sending
      var submitBtn = form.querySelector('.booking-form__submit');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando…';
      }

      submit(data)
        .then(function (res) {
          if (res.status === 201 && res.body.success) {
            showConfirmation(res.body.booking);
          } else if (res.status === 409) {
            showConflictError();
          } else if (res.status === 400 && res.body.errors) {
            showErrors(res.body.errors);
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Confirmar Reserva';
            }
          } else {
            showServerError();
          }
        })
        .catch(function () {
          showServerError();
        });
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Init                                                              */
  /* ------------------------------------------------------------------ */

  function init(containerId) {
    _containerId = containerId;
    _container = document.getElementById(containerId);
  }

  /* ------------------------------------------------------------------ */
  /*  Public API                                                        */
  /* ------------------------------------------------------------------ */

  window.BookingFormModule = {
    init: init,
    show: show,
    validate: validate,
    submit: submit,
    showErrors: showErrors,
    showConfirmation: showConfirmation,
    showServerError: showServerError
  };
})();
