/**
 * Validation module for booking data.
 * Validates required fields, formats, and sanitizes inputs.
 */

const REQUIRED_FIELDS = [
  { key: 'date', label: 'fecha' },
  { key: 'slotId', label: 'franja horaria' },
  { key: 'name', label: 'nombre' },
  { key: 'phone', label: 'teléfono' },
  { key: 'email', label: 'correo electrónico' },
  { key: 'bikeModel', label: 'modelo de moto' },
  { key: 'serviceDescription', label: 'descripción del servicio' },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?\d[\d\s\-]{5,}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Strip HTML tags from a string to prevent injection.
 */
function stripHtml(str) {
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize a string value: trim whitespace and strip HTML tags.
 */
function sanitize(value) {
  if (typeof value !== 'string') return '';
  return stripHtml(value).trim();
}

/**
 * Validate booking data.
 * @param {object} data - The booking form data.
 * @returns {{ valid: boolean, errors: Array<{field: string, message: string}>, sanitized: object }}
 */
function validateBookingData(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'general', message: 'Los datos de reserva son inválidos' }],
    };
  }

  // Sanitize all string fields
  const sanitized = {};
  for (const { key } of REQUIRED_FIELDS) {
    sanitized[key] = sanitize(data[key] != null ? String(data[key]) : '');
  }

  // Check required fields are not empty
  for (const { key, label } of REQUIRED_FIELDS) {
    if (!sanitized[key]) {
      errors.push({ field: key, message: `El campo ${label} es obligatorio` });
    }
  }

  // Format validations (only if the field is present)
  if (sanitized.email && !EMAIL_REGEX.test(sanitized.email)) {
    errors.push({ field: 'email', message: 'El formato del email no es válido' });
  }

  if (sanitized.phone && !PHONE_REGEX.test(sanitized.phone)) {
    errors.push({ field: 'phone', message: 'El formato del teléfono no es válido' });
  }

  if (sanitized.date && !DATE_REGEX.test(sanitized.date)) {
    errors.push({ field: 'date', message: 'El formato de la fecha debe ser YYYY-MM-DD' });
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized,
  };
}

module.exports = { validateBookingData, sanitize, stripHtml };
