/**
 * Tests para js/main.js
 * Verifica navegación, menú hamburguesa, año del footer e inicialización de módulos.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const htmlSource = readFileSync(resolve(__dirname, '..', 'index.html'), 'utf-8');
const mainSource = readFileSync(resolve(__dirname, 'main.js'), 'utf-8');

function createDOM() {
  const dom = new JSDOM(htmlSource, {
    url: 'http://localhost',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
  });
  return dom;
}

function runMainScript(dom) {
  dom.window.eval(mainSource);
  // Trigger DOMContentLoaded manually since JSDOM already fired it during construction
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
}

describe('main.js', () => {
  let dom;
  let document;

  beforeEach(() => {
    dom = createDOM();
    document = dom.window.document;
  });

  describe('Footer year', () => {
    it('should set the current year in #footer-year', () => {
      runMainScript(dom);
      const yearEl = document.getElementById('footer-year');
      expect(yearEl.textContent).toBe(String(new Date().getFullYear()));
    });
  });

  describe('Hamburger menu', () => {
    it('should toggle is-active on .navbar__toggle and is-open on .navbar__menu when clicked', () => {
      runMainScript(dom);
      const toggle = document.querySelector('.navbar__toggle');
      const menu = document.querySelector('.navbar__menu');

      // Initially closed
      expect(toggle.classList.contains('is-active')).toBe(false);
      expect(menu.classList.contains('is-open')).toBe(false);
      expect(toggle.getAttribute('aria-expanded')).toBe('false');

      // Open
      toggle.click();
      expect(toggle.classList.contains('is-active')).toBe(true);
      expect(menu.classList.contains('is-open')).toBe(true);
      expect(toggle.getAttribute('aria-expanded')).toBe('true');

      // Close
      toggle.click();
      expect(toggle.classList.contains('is-active')).toBe(false);
      expect(menu.classList.contains('is-open')).toBe(false);
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
    });

    it('should close mobile menu when a nav link is clicked', () => {
      // Stub scrollIntoView since JSDOM doesn't implement it
      dom.window.HTMLElement.prototype.scrollIntoView = vi.fn();

      runMainScript(dom);
      const toggle = document.querySelector('.navbar__toggle');
      const menu = document.querySelector('.navbar__menu');

      // Open menu first
      toggle.click();
      expect(menu.classList.contains('is-open')).toBe(true);

      // Click a nav link
      const link = document.querySelector('.navbar__link');
      link.click();

      expect(toggle.classList.contains('is-active')).toBe(false);
      expect(menu.classList.contains('is-open')).toBe(false);
    });

    it('should update aria-label when toggling', () => {
      runMainScript(dom);
      const toggle = document.querySelector('.navbar__toggle');

      toggle.click();
      expect(toggle.getAttribute('aria-label')).toBe('Cerrar menú de navegación');

      toggle.click();
      expect(toggle.getAttribute('aria-label')).toBe('Abrir menú de navegación');
    });
  });

  describe('Smooth scroll navigation', () => {
    it('should prevent default on nav link click and call scrollIntoView', () => {
      runMainScript(dom);
      const link = document.querySelector('a[href="#servicios"]');
      const target = document.getElementById('servicios');

      const scrollSpy = vi.fn();
      target.scrollIntoView = scrollSpy;

      const event = new dom.window.MouseEvent('click', { bubbles: true, cancelable: true });
      link.dispatchEvent(event);

      expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
  });

  describe('Module initialization', () => {
    it('should call CalendarModule.init if available on window', () => {
      const initSpy = vi.fn();
      dom.window.CalendarModule = { init: initSpy };

      runMainScript(dom);

      expect(initSpy).toHaveBeenCalledWith('calendar-container');
    });

    it('should call TimeSlotsModule.init if available on window', () => {
      const initSpy = vi.fn();
      dom.window.TimeSlotsModule = { init: initSpy };

      runMainScript(dom);

      expect(initSpy).toHaveBeenCalledWith('slots-container');
    });

    it('should call BookingFormModule.init if available on window', () => {
      const initSpy = vi.fn();
      dom.window.BookingFormModule = { init: initSpy };

      runMainScript(dom);

      expect(initSpy).toHaveBeenCalledWith('booking-form-container');
    });

    it('should not throw if modules are not defined on window', () => {
      expect(() => runMainScript(dom)).not.toThrow();
    });

    it('should wire CalendarModule.onDaySelect to TimeSlotsModule.fetchSlots', () => {
      let daySelectCallback = null;
      const fetchSlotsSpy = vi.fn();

      dom.window.CalendarModule = {
        init: vi.fn(),
        onDaySelect: vi.fn((cb) => { daySelectCallback = cb; }),
      };
      dom.window.TimeSlotsModule = {
        init: vi.fn(),
        fetchSlots: fetchSlotsSpy,
        onSlotSelect: vi.fn(),
      };
      dom.window.BookingFormModule = {
        init: vi.fn(),
      };

      runMainScript(dom);

      expect(dom.window.CalendarModule.onDaySelect).toHaveBeenCalled();

      // Simulate selecting a day
      daySelectCallback('2025-03-15');
      expect(fetchSlotsSpy).toHaveBeenCalledWith('2025-03-15');
    });

    it('should wire TimeSlotsModule.onSlotSelect to BookingFormModule.show with selected date', () => {
      let daySelectCallback = null;
      let slotSelectCallback = null;
      const showSpy = vi.fn();

      dom.window.CalendarModule = {
        init: vi.fn(),
        onDaySelect: vi.fn((cb) => { daySelectCallback = cb; }),
      };
      dom.window.TimeSlotsModule = {
        init: vi.fn(),
        fetchSlots: vi.fn(),
        onSlotSelect: vi.fn((cb) => { slotSelectCallback = cb; }),
      };
      dom.window.BookingFormModule = {
        init: vi.fn(),
        show: showSpy,
      };

      runMainScript(dom);

      // First select a day so _selectedDate is set
      daySelectCallback('2025-03-15');

      // Then select a slot
      const slot = { id: 'slot-1', time: '09:00', available: true };
      slotSelectCallback(slot);

      expect(showSpy).toHaveBeenCalledWith('2025-03-15', slot);
    });

    it('should not call BookingFormModule.show if no date was selected', () => {
      let slotSelectCallback = null;
      const showSpy = vi.fn();

      dom.window.CalendarModule = {
        init: vi.fn(),
        onDaySelect: vi.fn(),
      };
      dom.window.TimeSlotsModule = {
        init: vi.fn(),
        fetchSlots: vi.fn(),
        onSlotSelect: vi.fn((cb) => { slotSelectCallback = cb; }),
      };
      dom.window.BookingFormModule = {
        init: vi.fn(),
        show: showSpy,
      };

      runMainScript(dom);

      // Select a slot without selecting a day first
      const slot = { id: 'slot-1', time: '09:00', available: true };
      slotSelectCallback(slot);

      expect(showSpy).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard navigation', () => {
    it('should toggle menu with Enter key on the toggle button', () => {
      runMainScript(dom);
      const toggle = document.querySelector('.navbar__toggle');
      const menu = document.querySelector('.navbar__menu');

      const enterEvent = new dom.window.KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      });
      toggle.dispatchEvent(enterEvent);

      expect(toggle.classList.contains('is-active')).toBe(true);
      expect(menu.classList.contains('is-open')).toBe(true);
    });

    it('should toggle menu with Space key on the toggle button', () => {
      runMainScript(dom);
      const toggle = document.querySelector('.navbar__toggle');
      const menu = document.querySelector('.navbar__menu');

      const spaceEvent = new dom.window.KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      });
      toggle.dispatchEvent(spaceEvent);

      expect(toggle.classList.contains('is-active')).toBe(true);
      expect(menu.classList.contains('is-open')).toBe(true);
    });
  });
});
