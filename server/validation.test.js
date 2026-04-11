import { describe, it, expect } from 'vitest';
const { validateBookingData, sanitize, stripHtml } = require('./validation');

describe('validateBookingData', () => {
  const validData = {
    date: '2024-12-02',
    slotId: 'slot-2024-12-02-0900',
    name: 'Juan García',
    phone: '612345678',
    email: 'juan@example.com',
    bikeModel: 'Yamaha MT-07',
    serviceDescription: 'Revisión general y cambio de aceite',
  };

  it('returns valid for complete and correct data', () => {
    const result = validateBookingData(validData);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns errors for null/undefined input', () => {
    const result = validateBookingData(null);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('returns an error for each missing required field', () => {
    const result = validateBookingData({});
    expect(result.valid).toBe(false);
    const fields = result.errors.map((e) => e.field);
    expect(fields).toContain('date');
    expect(fields).toContain('slotId');
    expect(fields).toContain('name');
    expect(fields).toContain('phone');
    expect(fields).toContain('email');
    expect(fields).toContain('bikeModel');
    expect(fields).toContain('serviceDescription');
  });

  it('returns error for invalid email format', () => {
    const result = validateBookingData({ ...validData, email: 'not-an-email' });
    expect(result.valid).toBe(false);
    const emailErrors = result.errors.filter((e) => e.field === 'email');
    expect(emailErrors.length).toBeGreaterThan(0);
    expect(emailErrors[0].message).toContain('email');
  });

  it('returns error for invalid phone format', () => {
    const result = validateBookingData({ ...validData, phone: 'abc' });
    expect(result.valid).toBe(false);
    const phoneErrors = result.errors.filter((e) => e.field === 'phone');
    expect(phoneErrors.length).toBeGreaterThan(0);
    expect(phoneErrors[0].message).toContain('teléfono');
  });

  it('returns error for invalid date format', () => {
    const result = validateBookingData({ ...validData, date: '02-12-2024' });
    expect(result.valid).toBe(false);
    const dateErrors = result.errors.filter((e) => e.field === 'date');
    expect(dateErrors.length).toBeGreaterThan(0);
    expect(dateErrors[0].message).toContain('fecha');
  });

  it('accepts valid phone with country code', () => {
    const result = validateBookingData({ ...validData, phone: '+34 612 345 678' });
    expect(result.valid).toBe(true);
  });

  it('sanitizes HTML tags from inputs', () => {
    const result = validateBookingData({
      ...validData,
      name: '<script>alert("xss")</script>Juan',
    });
    expect(result.sanitized.name).toBe('alert("xss")Juan');
    expect(result.sanitized.name).not.toContain('<script>');
  });

  it('trims whitespace from inputs', () => {
    const result = validateBookingData({
      ...validData,
      name: '  Juan García  ',
    });
    expect(result.sanitized.name).toBe('Juan García');
  });

  it('returns error for empty string fields (whitespace only)', () => {
    const result = validateBookingData({ ...validData, name: '   ' });
    expect(result.valid).toBe(false);
    const nameErrors = result.errors.filter((e) => e.field === 'name');
    expect(nameErrors.length).toBeGreaterThan(0);
  });
});

describe('stripHtml', () => {
  it('removes HTML tags', () => {
    expect(stripHtml('<b>bold</b>')).toBe('bold');
    expect(stripHtml('<script>alert(1)</script>')).toBe('alert(1)');
    expect(stripHtml('no tags')).toBe('no tags');
  });
});

describe('sanitize', () => {
  it('trims and strips HTML', () => {
    expect(sanitize('  <b>hello</b>  ')).toBe('hello');
  });

  it('returns empty string for non-string input', () => {
    expect(sanitize(123)).toBe('');
    expect(sanitize(null)).toBe('');
    expect(sanitize(undefined)).toBe('');
  });
});
