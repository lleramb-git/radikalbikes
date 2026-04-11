/**
 * Tests para js/bookingForm.js
 * Verifica renderizado del formulario, validación, envío, confirmación y errores.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const bookingFormSource = readFileSync(resolve(__dirname, 'bookingForm.js'), 'utf-8');

function createDOM() {
  const html = `<!DOCTYPE html><html lang="es"><body>
    <div id="booking-form-container"></div>
    <div id="slots-container"></div>
  </body></html>`;
  return new JSDOM(html, {
    url: 'http://localhost',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
  });
}

function loadModule(dom) {
  dom.window.eval(bookingFormSource);
  return dom.window.BookingFormModule;
}

const SAMPLE_DATE = '2024-12-15';
const SAMPLE_SLOT = { id: 'slot-3', time: '11:00', available: true };

describe('bookingForm.js — BookingFormModule', () => {
  let dom;
  let doc;
  let BookingFormModule;
  let container;

  beforeEach(() => {
    dom = createDOM();
    doc = dom.window.document;
    container = doc.getElementById('booking-form-container');

    dom.window.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ success: true, booking: {} }),
      })
    );

    // Mock scrollIntoView
    dom.window.HTMLElement.prototype.scrollIntoView = vi.fn();

    BookingFormModule = loadModule(dom);
    BookingFormModule.init('booking-form-container');
  });

  describe('show()', () => {
    it('should render the booking form inside the container', () => {
      BookingFormModule.show(SAMPLE_DATE, SAMPLE_SLOT);

      expect(container.querySelector('.booking-form')).not.toBeNull();
      expect(container.querySelector('.booking-form__title')).not.toBeNull();
      expect(container.querySelector('#booking-form')).not.toBeNull();
    });

    it('should display the selected date and time', () => {
      BookingFormModule.show(SAMPLE_DATE, SAMPLE_SLOT);

      const info = container.querySelector('.booking-form__selected-info');
      expect(info).not.toBeNull();
      expect(info.textContent).toContain('15/12/2024');
      expect(info.textContent).toContain('11:00');
    });

    it('should render all 5 required fields', () => {
      BookingFormModule.show(SAMPLE_DATE, SAMPLE_SLOT);

      expect(doc.getElementById('booking-name')).not.toBeNull();
      expect(doc.getElementById('booking-phone')).not.toBeNull();
      expect(doc.getElementById('booking-email')).not.toBeNull();
      expect(doc.getElementById('booking-bikeModel')).not.toBeNull();
      expect(doc.getElementById('booking-serviceDescription')).not.toBeNull();
    });

    it('should render a submit button', () => {
      BookingFormModule.show(SAMPLE_DATE, SAMPLE_SLOT);

      const btn = container.querySelector('.booking-form__submit');
      expect(btn).not.toBeNull();
      expect(btn.textContent).toContain('Confirmar Reserva');
    });

    it('should render serviceDescription as a textarea', () => {
      BookingFormModule.show(SAMPLE_DATE, SAMPLE_SLOT);

      const el = doc.getElementById('booking-serviceDescription');
      expect(el.tagName.toLowerCase()).toBe('textarea');
    });
  });

  describe('validate()', () => {
    it('should return errors for all empty fields', () => {
      BookingFormModule.show(SAMPLE_DATE, SAMPLE_SLOT);

      const result = BookingFormModule.validate();
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(5);
    });

    it('should return valid when all fields are filled correctly', () => {
      BookingFormModule.show(SAMPLE_DATE, SAMPLE_SLOT);

      doc.getElementById('booking-name').value = 'Juan García';
      doc.getElementById('booking-phone').value = '612345678';
      doc.getElementById('booking-email').value = 'juan@example.com';
      doc.getElementById('booking-bikeModel').value = 'Yamaha MT-07';
      doc.getElementById('booking-serviceDescription').value = 'Cambio de aceite';

      const result = BookingFormModule.validate();
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should return error for invalid email format', () => {
      BookingFormModule.show(SAMPLE_DATE, SAMPLE_SLOT);

      doc.getElementById('booking-name').value = 'Juan';
      doc.getElementById('booking-phone').value = '612345678';
      doc.getElementById('booking-email').value = 'not-an-email';
      doc.getElementById('booking-bikeModel').value = 'Yamaha';
      doc.getElementById('booking-serviceDescription').value = 'Test';

      const result = BookingFormModule.validate();
      expect(result.valid).toBe(false);
      const emailErr = result.errors.find(e => e.field === 'email');
      expect(emailErr).toBeDefined();
      expect(emailErr.message).toContain('email no es válido');
    });

    it('should return error for invalid phone format', () => {
      BookingFormModule.show(SAMPLE_DATE, SAMPLE_SLOT);

      doc.getElementById('booking-name').value = 'Juan';
      doc.getElementById('booking-phone').value = 'abc';
      doc.getElementById('booking-email').value = 'juan@example.com';
      doc.getElementById('booking-bikeModel').value = 'Yamaha';
      doc.getElementById('booking-serviceDescription').value = 'Test';

      const result = BookingFormModule.validate();
      expect(result.valid).toBe(false);
      const phoneErr = result.errors.find(e => e.field === 'phone');
      expect(phoneErr).toBeDefined();
      expect(phoneErr.message).toContain('teléfono no es válido');
    });

    it('should return specific error messages for each empty field', () => {
      BookingFormModule.show(SAMPLE_DATE, SAMPLE_SLOT);

      doc.getElementById('booking-name').value = 'Juan';
      // phone empty
      doc.getElementById('booking-email').value = 'juan@example.com';
      // bikeModel empty
      doc.getElementById('booking-serviceDescription').value = 'Test';

      const result = BookingFormModule.validate();
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(2);
      expect(result.errors.find(e => e.field === 'phone')).toBeDefined();
      expect(result.errors.find(e => e.field === 'bikeModel')).toBeDefined();
    });
  });

  describe('showErrors()', () => {
    it('should add .has-error class to invalid fields', () => {
      BookingFormModule.show(SAMPLE_DATE, SAMPLE_SLOT);

      BookingFormModule.showErrors([
        { field: 'name', message: 'El nombre es obligatorio' },
        { field: 'email', message: 'El email es obligatorio' },
      ]);

      expect(doc.getElementById('booking-name').classList.contains('has-error')).toBe(true);
      expect(doc.getElementById('booking-email').classList.contains('has-error')).toBe(true);
      expect(doc.getElementById('booking-phone').classList.contains('has-error')).toBe(false);
    });

    it('should display error messages next to each field', () => {
      BookingFormModule.show(SAMPLE_DATE, SAMPLE_SLOT);

      BookingFormModule.showErrors([
        { field: 'phone', message: 'El teléfono es obligatorio' },
      ]);

      const errEl = doc.getElementById('error-phone');
      expect(errEl.textContent).toBe('El teléfono es obligatorio');
    });
  });

  describe('showConfirmation()', () => {
    it('should display confirmation with booking details', () => {
      BookingFormModule.show(SAMPLE_DATE, SAMPLE_SLOT);

      BookingFormModule.showConfirmation({
        id: 'booking-abc123',
        date: '2024-12-15',
        time: '11:00',
        name: 'Juan García',
        bikeModel: 'Yamaha MT-07',
        serviceDescription: 'Cambio de aceite',
      });

      expect(container.querySelector('.booking-confirmation')).not.toBeNull();
      expect(container.querySelector('.booking-confirmation__title').textContent).toContain('Confirmada');
      const details = container.querySelector('.booking-confirmation__details').textContent;
      expect(details).toContain('15/12/2024');
      expect(details).toContain('11:00');
      expect(details).toContain('Juan García');
      expect(details).toContain('Yamaha MT-07');
      expect(details).toContain('Cambio de aceite');
    });
  });

  describe('showServerError()', () => {
    it('should display server error message', () => {
      BookingFormModule.show(SAMPLE_DATE, SAMPLE_SLOT);

      BookingFormModule.showServerError();

      expect(container.querySelector('.booking-error')).not.toBeNull();
      expect(container.querySelector('.booking-error__message').textContent).toContain(
        'Error al registrar la reserva'
      );
      expect(container.querySelector('.booking-error__message').textContent).toContain(
        'contacte al taller por teléfono'
      );
    });
  });

  describe('form submission', () => {
    function fillForm() {
      doc.getElementById('booking-name').value = 'Juan García';
      doc.getElementById('booking-phone').value = '612345678';
      doc.getElementById('booking-email').value = 'juan@example.com';
      doc.getElementById('booking-bikeModel').value = 'Yamaha MT-07';
      doc.getElementById('booking-serviceDescription').value = 'Cambio de aceite';
    }

    it('should POST to /api/bookings on valid submit', () => {
      BookingFormModule.show(SAMPLE_DATE, SAMPLE_SLOT);
      fillForm();

      dom.window.fetch = vi.fn(() =>
        Promise.resolve({
          status: 201,
          json: () => Promise.resolve({
            success: true,
            booking: {
              id: 'booking-1',
              date: '2024-12-15',
              time: '11:00',
              name: 'Juan García',
              bikeModel: 'Yamaha MT-07',
              serviceDescription: 'Cambio de aceite',
            },
          }),
        })
      );

      const form = doc.getElementById('booking-form');
      form.dispatchEvent(new dom.window.Event('submit', { cancelable: true }));

      return new Promise(resolve => setTimeout(resolve, 10)).then(() => {
        expect(dom.window.fetch).toHaveBeenCalledWith('/api/bookings', expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }));
      });
    });

    it('should show validation errors when submitting empty form', () => {
      BookingFormModule.show(SAMPLE_DATE, SAMPLE_SLOT);

      const form = doc.getElementById('booking-form');
      form.dispatchEvent(new dom.window.Event('submit', { cancelable: true }));

      const errorEls = container.querySelectorAll('.has-error');
      expect(errorEls.length).toBe(5);
    });

    it('should show confirmation on successful 201 response', () => {
      BookingFormModule.show(SAMPLE_DATE, SAMPLE_SLOT);
      fillForm();

      dom.window.fetch = vi.fn(() =>
        Promise.resolve({
          status: 201,
          json: () => Promise.resolve({
            success: true,
            booking: {
              id: 'booking-1',
              date: '2024-12-15',
              time: '11:00',
              name: 'Juan García',
              bikeModel: 'Yamaha MT-07',
              serviceDescription: 'Cambio de aceite',
            },
          }),
        })
      );

      const form = doc.getElementById('booking-form');
      form.dispatchEvent(new dom.window.Event('submit', { cancelable: true }));

      return new Promise(resolve => setTimeout(resolve, 10)).then(() => {
        expect(container.querySelector('.booking-confirmation')).not.toBeNull();
      });
    });

    it('should show conflict error on 409 response', () => {
      BookingFormModule.show(SAMPLE_DATE, SAMPLE_SLOT);
      fillForm();

      dom.window.fetch = vi.fn(() =>
        Promise.resolve({
          status: 409,
          json: () => Promise.resolve({
            success: false,
            error: 'La franja horaria seleccionada ya no está disponible',
          }),
        })
      );

      const form = doc.getElementById('booking-form');
      form.dispatchEvent(new dom.window.Event('submit', { cancelable: true }));

      return new Promise(resolve => setTimeout(resolve, 10)).then(() => {
        expect(container.querySelector('.booking-error')).not.toBeNull();
        expect(container.querySelector('.booking-error__message').textContent).toContain(
          'ya no está disponible'
        );
      });
    });

    it('should show server error on 500 response', () => {
      BookingFormModule.show(SAMPLE_DATE, SAMPLE_SLOT);
      fillForm();

      dom.window.fetch = vi.fn(() =>
        Promise.resolve({
          status: 500,
          json: () => Promise.resolve({
            success: false,
            error: 'Error interno',
          }),
        })
      );

      const form = doc.getElementById('booking-form');
      form.dispatchEvent(new dom.window.Event('submit', { cancelable: true }));

      return new Promise(resolve => setTimeout(resolve, 10)).then(() => {
        expect(container.querySelector('.booking-error')).not.toBeNull();
        expect(container.querySelector('.booking-error__message').textContent).toContain(
          'Error al registrar la reserva'
        );
      });
    });

    it('should show server error on network failure', () => {
      BookingFormModule.show(SAMPLE_DATE, SAMPLE_SLOT);
      fillForm();

      dom.window.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

      const form = doc.getElementById('booking-form');
      form.dispatchEvent(new dom.window.Event('submit', { cancelable: true }));

      return new Promise(resolve => setTimeout(resolve, 10)).then(() => {
        expect(container.querySelector('.booking-error')).not.toBeNull();
      });
    });
  });
});
