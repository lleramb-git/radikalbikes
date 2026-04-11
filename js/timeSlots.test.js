/**
 * Tests para js/timeSlots.js
 * Verifica renderizado de franjas horarias, selección, estados de carga/error
 * y la API pública de TimeSlotsModule.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const timeSlotsSource = readFileSync(resolve(__dirname, 'timeSlots.js'), 'utf-8');

function createDOM() {
  const html = `<!DOCTYPE html><html lang="es"><body>
    <div id="slots-container"></div>
  </body></html>`;
  return new JSDOM(html, {
    url: 'http://localhost',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
  });
}

function loadModule(dom) {
  dom.window.eval(timeSlotsSource);
  return dom.window.TimeSlotsModule;
}

function buildSlots(times, unavailableIndices) {
  unavailableIndices = unavailableIndices || [];
  return times.map(function (time, i) {
    return {
      id: 'slot-' + (i + 1),
      time: time,
      available: unavailableIndices.indexOf(i) === -1,
    };
  });
}

describe('timeSlots.js — TimeSlotsModule', () => {
  let dom;
  let doc;
  let TimeSlotsModule;
  let container;

  beforeEach(() => {
    dom = createDOM();
    doc = dom.window.document;
    container = doc.getElementById('slots-container');

    dom.window.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ slots: [] }),
      })
    );

    TimeSlotsModule = loadModule(dom);
    TimeSlotsModule.init('slots-container');
  });

  describe('render()', () => {
    it('should render slot buttons inside .slots container', () => {
      const slots = buildSlots(['09:00', '10:00', '11:00']);
      TimeSlotsModule.render(slots);

      expect(container.querySelector('.slots')).not.toBeNull();
      expect(container.querySelector('.slots__title')).not.toBeNull();
      expect(container.querySelector('.slots__list')).not.toBeNull();
      expect(container.querySelectorAll('.slot-btn').length).toBe(3);
    });

    it('should display the time text on each button', () => {
      const slots = buildSlots(['09:00', '14:00']);
      TimeSlotsModule.render(slots);

      const btns = container.querySelectorAll('.slot-btn');
      expect(btns[0].textContent).toBe('09:00');
      expect(btns[1].textContent).toBe('14:00');
    });

    it('should mark unavailable slots with .unavailable and disabled', () => {
      const slots = buildSlots(['09:00', '10:00', '11:00'], [1]);
      TimeSlotsModule.render(slots);

      const btns = container.querySelectorAll('.slot-btn');
      expect(btns[1].classList.contains('unavailable')).toBe(true);
      expect(btns[1].disabled).toBe(true);
    });

    it('should call renderNoAvailability when slots array is empty', () => {
      TimeSlotsModule.render([]);

      expect(container.querySelector('.slots__empty')).not.toBeNull();
      expect(container.querySelector('.slots__empty').textContent).toContain(
        'No hay disponibilidad para esta fecha'
      );
    });
  });

  describe('renderNoAvailability()', () => {
    it('should show no-availability message', () => {
      TimeSlotsModule.renderNoAvailability();

      const msg = container.querySelector('.slots__empty');
      expect(msg).not.toBeNull();
      expect(msg.textContent).toBe('No hay disponibilidad para esta fecha');
    });
  });

  describe('onSlotSelect()', () => {
    it('should invoke callback with slot object when an available slot is clicked', () => {
      const slots = buildSlots(['09:00', '10:00']);
      TimeSlotsModule.render(slots);

      const cb = vi.fn();
      TimeSlotsModule.onSlotSelect(cb);

      const btn = container.querySelector('[data-slot-id="slot-1"]');
      btn.click();

      expect(cb).toHaveBeenCalledWith({
        id: 'slot-1',
        time: '09:00',
        available: true,
      });
    });

    it('should not invoke callback when an unavailable slot is clicked', () => {
      const slots = buildSlots(['09:00', '10:00'], [0]);
      TimeSlotsModule.render(slots);

      const cb = vi.fn();
      TimeSlotsModule.onSlotSelect(cb);

      const btn = container.querySelector('[data-slot-id="slot-1"]');
      btn.click();

      expect(cb).not.toHaveBeenCalled();
    });

    it('should add .selected class to the clicked slot', () => {
      const slots = buildSlots(['09:00', '10:00', '11:00']);
      TimeSlotsModule.render(slots);

      const cb = vi.fn();
      TimeSlotsModule.onSlotSelect(cb);

      const btn = container.querySelector('[data-slot-id="slot-2"]');
      btn.click();

      // After click, re-render happens
      const updatedBtn = container.querySelector('[data-slot-id="slot-2"]');
      expect(updatedBtn.classList.contains('selected')).toBe(true);
    });

    it('should deselect previous slot when a new one is clicked', () => {
      const slots = buildSlots(['09:00', '10:00', '11:00']);
      TimeSlotsModule.render(slots);

      const cb = vi.fn();
      TimeSlotsModule.onSlotSelect(cb);

      // Click first slot
      container.querySelector('[data-slot-id="slot-1"]').click();
      // Click second slot
      container.querySelector('[data-slot-id="slot-2"]').click();

      const btn1 = container.querySelector('[data-slot-id="slot-1"]');
      const btn2 = container.querySelector('[data-slot-id="slot-2"]');
      expect(btn1.classList.contains('selected')).toBe(false);
      expect(btn2.classList.contains('selected')).toBe(true);
    });
  });

  describe('fetchSlots()', () => {
    it('should show loading state while fetching', () => {
      dom.window.fetch = vi.fn(() => new Promise(() => {}));
      TimeSlotsModule.fetchSlots('2024-12-02');

      const loading = container.querySelector('.calendar__loading');
      expect(loading).not.toBeNull();
      expect(loading.textContent).toContain('Cargando');
    });

    it('should render slots after successful fetch', () => {
      dom.window.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              slots: [
                { id: 'slot-1', time: '09:00', available: true },
                { id: 'slot-2', time: '10:00', available: false },
              ],
            }),
        })
      );

      return TimeSlotsModule.fetchSlots('2024-12-02').then(() => {
        const btns = container.querySelectorAll('.slot-btn');
        expect(btns.length).toBe(2);
        expect(btns[0].textContent).toBe('09:00');
        expect(btns[1].classList.contains('unavailable')).toBe(true);
      });
    });

    it('should call the correct API endpoint', () => {
      TimeSlotsModule.fetchSlots('2024-12-15');

      expect(dom.window.fetch).toHaveBeenCalledWith('/api/slots/2024-12-15');
    });

    it('should show error with retry button on fetch failure', () => {
      dom.window.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

      return TimeSlotsModule.fetchSlots('2024-12-02').then(() => {
        const error = container.querySelector('.calendar__error');
        expect(error).not.toBeNull();
        expect(error.textContent).toContain('No se pudieron cargar las franjas horarias');

        const retryBtn = container.querySelector('.calendar__retry-btn');
        expect(retryBtn).not.toBeNull();
      });
    });

    it('should retry fetch when retry button is clicked', () => {
      let callCount = 0;
      dom.window.fetch = vi.fn(() => {
        callCount++;
        if (callCount === 1) return Promise.reject(new Error('fail'));
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ slots: [] }),
        });
      });

      return TimeSlotsModule.fetchSlots('2024-12-02').then(() => {
        const retryBtn = container.querySelector('.calendar__retry-btn');
        expect(retryBtn).not.toBeNull();
        retryBtn.click();
        expect(callCount).toBe(2);
      });
    });

    it('should show no-availability when fetch returns empty slots', () => {
      dom.window.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ slots: [] }),
        })
      );

      return TimeSlotsModule.fetchSlots('2024-12-02').then(() => {
        const empty = container.querySelector('.slots__empty');
        expect(empty).not.toBeNull();
      });
    });
  });
});
