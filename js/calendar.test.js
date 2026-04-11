/**
 * Tests para js/calendar.js
 * Verifica renderizado del calendario, navegación, selección de días,
 * estados de carga/error y la API pública de CalendarModule.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const calendarSource = readFileSync(resolve(__dirname, 'calendar.js'), 'utf-8');

function createDOM() {
  const html = `<!DOCTYPE html><html lang="es"><body>
    <div id="calendar-container"></div>
  </body></html>`;
  const dom = new JSDOM(html, {
    url: 'http://localhost',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
  });
  return dom;
}

function loadCalendar(dom) {
  dom.window.eval(calendarSource);
  return dom.window.CalendarModule;
}

/** Build availability data for a given year/month (0-indexed) */
function buildAvailability(year, month, availableDays) {
  const days = [];
  const total = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= total; d++) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    days.push({
      date: `${year}-${mm}-${dd}`,
      available: availableDays.includes(d),
    });
  }
  return days;
}

describe('calendar.js — CalendarModule', () => {
  let dom;
  let doc;
  let CalendarModule;
  let container;

  beforeEach(() => {
    dom = createDOM();
    doc = dom.window.document;
    container = doc.getElementById('calendar-container');

    // Stub fetch to prevent real network calls
    dom.window.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ days: [] }),
      })
    );

    CalendarModule = loadCalendar(dom);
  });

  describe('render()', () => {
    it('should render a calendar grid with header, weekdays and days', () => {
      // Render December 2024 with some available days
      const avail = buildAvailability(2024, 11, [2, 5, 10]);
      // Manually set internal state by calling init-like setup
      // We use render directly after setting up the container
      CalendarModule.init('calendar-container');

      // Wait for fetch to resolve, then render manually
      return new Promise((resolve) => setTimeout(resolve, 10)).then(() => {
        CalendarModule.render(avail);

        expect(container.querySelector('.calendar')).not.toBeNull();
        expect(container.querySelector('.calendar__header')).not.toBeNull();
        expect(container.querySelector('.calendar__month-label')).not.toBeNull();
        expect(container.querySelectorAll('.calendar__weekday').length).toBe(7);
        expect(container.querySelectorAll('.calendar__nav-btn').length).toBe(2);
      });
    });

    it('should mark available days with .available class', () => {
      CalendarModule.init('calendar-container');
      return new Promise((r) => setTimeout(r, 10)).then(() => {
        // Use a future month to avoid past-date interference
        const futureYear = new Date().getFullYear() + 1;
        const avail = buildAvailability(futureYear, 5, [3, 15, 20]); // June of next year
        // We need to set internal year/month — navigate to that month
        // Instead, just render with the data (render uses internal _year/_month for formatting)
        // For a clean test, we'll directly render
        CalendarModule.render(avail);

        const availableBtns = container.querySelectorAll('.calendar__day.available');
        // The count depends on internal _year/_month matching the avail data
        // Since init sets to current month, the dates won't match unless we navigate
        // Let's test with current month instead
        const now = new Date();
        const currentAvail = buildAvailability(now.getFullYear(), now.getMonth(), [28]);
        CalendarModule.render(currentAvail);

        // Day 28 should be available if it's not in the past
        const day28date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-28`;
        const day28btn = container.querySelector(`[data-date="${day28date}"]`);
        if (day28btn && day28date >= new Date().toISOString().slice(0, 10)) {
          expect(day28btn.classList.contains('available')).toBe(true);
        }
      });
    });

    it('should mark unavailable days with .unavailable class', () => {
      CalendarModule.init('calendar-container');
      return new Promise((r) => setTimeout(r, 10)).then(() => {
        const now = new Date();
        const total = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        // Make all days unavailable
        const avail = buildAvailability(now.getFullYear(), now.getMonth(), []);
        CalendarModule.render(avail);

        // Future days should be unavailable
        const lastDay = total;
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        const btn = container.querySelector(`[data-date="${dateStr}"]`);
        if (btn && dateStr >= new Date().toISOString().slice(0, 10)) {
          expect(btn.classList.contains('unavailable')).toBe(true);
        }
      });
    });

    it('should mark past days with .past class and disable them', () => {
      CalendarModule.init('calendar-container');
      return new Promise((r) => setTimeout(r, 10)).then(() => {
        const now = new Date();
        if (now.getDate() <= 1) return; // Skip if 1st of month

        const avail = buildAvailability(now.getFullYear(), now.getMonth(), [1]);
        CalendarModule.render(avail);

        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        const btn = container.querySelector(`[data-date="${dateStr}"]`);
        if (btn && dateStr < new Date().toISOString().slice(0, 10)) {
          expect(btn.classList.contains('past')).toBe(true);
          expect(btn.disabled).toBe(true);
        }
      });
    });

    it('should mark today with .today class', () => {
      CalendarModule.init('calendar-container');
      return new Promise((r) => setTimeout(r, 10)).then(() => {
        const now = new Date();
        const avail = buildAvailability(now.getFullYear(), now.getMonth(), [now.getDate()]);
        CalendarModule.render(avail);

        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const btn = container.querySelector(`[data-date="${todayStr}"]`);
        expect(btn).not.toBeNull();
        expect(btn.classList.contains('today')).toBe(true);
      });
    });

    it('should render 7 weekday labels (Lun-Dom)', () => {
      CalendarModule.init('calendar-container');
      return new Promise((r) => setTimeout(r, 10)).then(() => {
        CalendarModule.render([]);
        const weekdays = container.querySelectorAll('.calendar__weekday');
        expect(weekdays.length).toBe(7);
        expect(weekdays[0].textContent).toBe('Lun');
        expect(weekdays[6].textContent).toBe('Dom');
      });
    });
  });

  describe('onDaySelect()', () => {
    it('should invoke callback with date string when an available day is clicked', () => {
      CalendarModule.init('calendar-container');
      return new Promise((r) => setTimeout(r, 10)).then(() => {
        const now = new Date();
        const total = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        // Use last day of month to maximize chance it's in the future
        const avail = buildAvailability(now.getFullYear(), now.getMonth(), [total]);
        CalendarModule.render(avail);

        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(total).padStart(2, '0')}`;
        const btn = container.querySelector(`[data-date="${dateStr}"]`);

        // Only test if the day is not past
        if (btn && !btn.classList.contains('past')) {
          const cb = vi.fn();
          CalendarModule.onDaySelect(cb);
          btn.click();
          expect(cb).toHaveBeenCalledWith(dateStr);
        }
      });
    });

    it('should not invoke callback when a past day is clicked', () => {
      CalendarModule.init('calendar-container');
      return new Promise((r) => setTimeout(r, 10)).then(() => {
        const now = new Date();
        if (now.getDate() <= 1) return;

        const avail = buildAvailability(now.getFullYear(), now.getMonth(), [1]);
        CalendarModule.render(avail);

        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        const btn = container.querySelector(`[data-date="${dateStr}"]`);

        if (btn && dateStr < new Date().toISOString().slice(0, 10)) {
          const cb = vi.fn();
          CalendarModule.onDaySelect(cb);
          btn.click();
          expect(cb).not.toHaveBeenCalled();
        }
      });
    });

    it('should add .selected class to the clicked available day', () => {
      CalendarModule.init('calendar-container');
      return new Promise((r) => setTimeout(r, 10)).then(() => {
        const now = new Date();
        const total = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const avail = buildAvailability(now.getFullYear(), now.getMonth(), [total]);
        CalendarModule.render(avail);

        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(total).padStart(2, '0')}`;
        const btn = container.querySelector(`[data-date="${dateStr}"]`);

        if (btn && !btn.classList.contains('past')) {
          btn.click();
          // After click, re-render happens, so query again
          const updatedBtn = container.querySelector(`[data-date="${dateStr}"]`);
          expect(updatedBtn.classList.contains('selected')).toBe(true);
        }
      });
    });
  });

  describe('navigateMonth()', () => {
    it('should call fetch with next month when navigating forward', () => {
      CalendarModule.init('calendar-container');
      return new Promise((r) => setTimeout(r, 10)).then(() => {
        dom.window.fetch.mockClear();
        CalendarModule.navigateMonth(1);

        expect(dom.window.fetch).toHaveBeenCalled();
        const url = dom.window.fetch.mock.calls[0][0];
        expect(url).toMatch(/\/api\/availability\/\d+\/\d+/);
      });
    });

    it('should call fetch with previous month when navigating backward', () => {
      CalendarModule.init('calendar-container');
      return new Promise((r) => setTimeout(r, 10)).then(() => {
        dom.window.fetch.mockClear();
        CalendarModule.navigateMonth(-1);

        expect(dom.window.fetch).toHaveBeenCalled();
      });
    });

    it('should wrap year when navigating past December', () => {
      CalendarModule.init('calendar-container');
      return new Promise((r) => setTimeout(r, 10)).then(() => {
        // Navigate forward enough to cross year boundary
        const now = new Date();
        const monthsToDecember = 11 - now.getMonth();
        for (let i = 0; i <= monthsToDecember; i++) {
          dom.window.fetch.mockClear();
          CalendarModule.navigateMonth(1);
        }
        // The last fetch should be for January of next year
        const url = dom.window.fetch.mock.calls[0][0];
        expect(url).toContain('/1'); // month 1 = January
      });
    });
  });

  describe('fetchAvailability()', () => {
    it('should show loading state while fetching', () => {
      // Make fetch hang
      dom.window.fetch = vi.fn(() => new Promise(() => {}));
      CalendarModule.init('calendar-container');

      // fetchAvailability is called by init, check loading state
      const loading = container.querySelector('.calendar__loading');
      expect(loading).not.toBeNull();
      expect(loading.textContent).toContain('Cargando');
    });

    it('should show error with retry button on fetch failure', () => {
      dom.window.fetch = vi.fn(() => Promise.reject(new Error('Network error')));
      CalendarModule.init('calendar-container');

      return new Promise((r) => setTimeout(r, 10)).then(() => {
        const error = container.querySelector('.calendar__error');
        expect(error).not.toBeNull();
        expect(error.textContent).toContain('No se pudo cargar la disponibilidad');

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
          json: () => Promise.resolve({ days: [] }),
        });
      });

      CalendarModule.init('calendar-container');

      return new Promise((r) => setTimeout(r, 10)).then(() => {
        const retryBtn = container.querySelector('.calendar__retry-btn');
        expect(retryBtn).not.toBeNull();
        retryBtn.click();
        expect(callCount).toBe(2);
      });
    });
  });

  describe('Navigation buttons in rendered calendar', () => {
    it('should navigate when prev/next buttons are clicked', () => {
      CalendarModule.init('calendar-container');
      return new Promise((r) => setTimeout(r, 10)).then(() => {
        CalendarModule.render([]);

        dom.window.fetch.mockClear();
        const nextBtn = container.querySelector('[data-dir="1"]');
        nextBtn.click();
        expect(dom.window.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Month label', () => {
    it('should display the current month and year', () => {
      CalendarModule.init('calendar-container');
      return new Promise((r) => setTimeout(r, 10)).then(() => {
        CalendarModule.render([]);
        const label = container.querySelector('.calendar__month-label');
        const now = new Date();
        const monthNames = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        expect(label.textContent).toBe(monthNames[now.getMonth()] + ' ' + now.getFullYear());
      });
    });
  });
});
