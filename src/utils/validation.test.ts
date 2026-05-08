import { describe, it, expect, vi } from 'vitest';
import {
  validateEmail,
  validatePhone,
  validatePostalCode,
  validateCoordinates,
  validateRepairerData,
  validateSearchFilters,
  sanitizeString,
  validateWithRules,
} from './validation';

vi.mock('./logger', () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

describe('validateEmail', () => {
  it('accepts a standard email', () => {
    expect(validateEmail('user@example.com').isValid).toBe(true);
  });

  it('accepts emails with subdomains and plus aliases', () => {
    expect(validateEmail('first.last+tag@mail.example.co.uk').isValid).toBe(true);
  });

  it('rejects an empty email', () => {
    const r = validateEmail('');
    expect(r.isValid).toBe(false);
    expect(r.errors).toContain("L'email est requis");
  });

  it('rejects an email without @', () => {
    expect(validateEmail('userexample.com').isValid).toBe(false);
  });

  it('rejects an email with spaces', () => {
    expect(validateEmail('user @example.com').isValid).toBe(false);
  });

  it('rejects an email without a TLD', () => {
    expect(validateEmail('user@example').isValid).toBe(false);
  });
});

describe('validatePhone', () => {
  it.each([
    '0612345678',
    '+33612345678',
    '06 12 34 56 78',
    '+33 6 12 34 56 78',
  ])('accepts French mobile %s', (phone) => {
    expect(validatePhone(phone).isValid).toBe(true);
  });

  it.each([
    '0123456789',  // Paris landline
    '+33123456789',
  ])('accepts French landline %s', (phone) => {
    expect(validatePhone(phone).isValid).toBe(true);
  });

  it('rejects an empty phone', () => {
    expect(validatePhone('').isValid).toBe(false);
  });

  it('rejects a phone starting with 0 0', () => {
    expect(validatePhone('0012345678').isValid).toBe(false);
  });

  it('rejects too many digits', () => {
    expect(validatePhone('06123456789').isValid).toBe(false);
  });

  it('rejects too few digits', () => {
    expect(validatePhone('061234567').isValid).toBe(false);
  });

  it('rejects an international non-FR number', () => {
    expect(validatePhone('+15551234567').isValid).toBe(false);
  });
});

describe('validatePostalCode', () => {
  it('accepts a valid 5-digit postal code', () => {
    expect(validatePostalCode('75001').isValid).toBe(true);
  });

  it('rejects an empty postal code', () => {
    expect(validatePostalCode('').isValid).toBe(false);
  });

  it('rejects a postal code with letters', () => {
    expect(validatePostalCode('7500A').isValid).toBe(false);
  });

  it('rejects a 4-digit postal code', () => {
    expect(validatePostalCode('7500').isValid).toBe(false);
  });

  it('rejects a 6-digit postal code', () => {
    expect(validatePostalCode('750010').isValid).toBe(false);
  });
});

describe('validateCoordinates', () => {
  it('accepts coords inside the global bounds', () => {
    expect(validateCoordinates(48.8566, 2.3522).isValid).toBe(true);
  });

  it('rejects undefined coords', () => {
    expect(validateCoordinates(undefined, undefined).isValid).toBe(false);
  });

  it('rejects latitude > 90', () => {
    const r = validateCoordinates(91, 0);
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/Latitude/);
  });

  it('rejects latitude < -90', () => {
    expect(validateCoordinates(-91, 0).isValid).toBe(false);
  });

  it('rejects longitude > 180', () => {
    const r = validateCoordinates(0, 181);
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/Longitude/);
  });

  it('rejects longitude < -180', () => {
    expect(validateCoordinates(0, -181).isValid).toBe(false);
  });

  it('reports both errors when both are invalid', () => {
    const r = validateCoordinates(91, 181);
    expect(r.isValid).toBe(false);
    expect(r.errors).toHaveLength(2);
  });
});

describe('validateRepairerData', () => {
  const validData = {
    name: 'Repair Express',
    email: 'contact@repair.fr',
    phone: '0612345678',
    city: 'Paris',
    postal_code: '75001',
    address: '1 rue de Rivoli',
  };

  it('accepts a fully valid record', () => {
    expect(validateRepairerData(validData).isValid).toBe(true);
  });

  it('aggregates errors from each invalid field', () => {
    const r = validateRepairerData({
      name: 'A',
      email: 'bad',
      phone: 'bad',
      city: '',
      postal_code: '',
      address: '',
    });
    expect(r.isValid).toBe(false);
    expect(r.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('nom'),
        expect.stringContaining('email'),
        expect.stringContaining('téléphone'),
        expect.stringContaining('ville'),
        expect.stringContaining('code postal'),
        expect.stringContaining('adresse'),
      ]),
    );
  });

  it('rejects names shorter than 2 chars', () => {
    const r = validateRepairerData({ ...validData, name: 'A' });
    expect(r.isValid).toBe(false);
    expect(r.errors.some((e) => e.includes('au moins 2'))).toBe(true);
  });

  it('validates coordinates when both are provided', () => {
    const r = validateRepairerData({ ...validData, latitude: 200, longitude: 0 });
    expect(r.isValid).toBe(false);
    expect(r.errors.some((e) => e.includes('Latitude'))).toBe(true);
  });

  it('reports missing partner coordinate when only one is provided', () => {
    const r = validateRepairerData({ ...validData, latitude: 48 });
    expect(r.isValid).toBe(false);
    expect(r.errors.some((e) => e.includes('coordonnées'))).toBe(true);
  });

  it('skips coordinate validation when both are undefined', () => {
    const r = validateRepairerData(validData);
    expect(r.isValid).toBe(true);
  });
});

describe('validateSearchFilters', () => {
  it('accepts an empty filter object', () => {
    expect(validateSearchFilters({}).isValid).toBe(true);
  });

  it('rejects negative prices', () => {
    const r = validateSearchFilters({ priceRange: [-1, 100] });
    expect(r.isValid).toBe(false);
  });

  it('rejects min > max', () => {
    const r = validateSearchFilters({ priceRange: [200, 100] });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/minimum/);
  });

  it('rejects out-of-range distance', () => {
    expect(validateSearchFilters({ distance: 150 }).isValid).toBe(false);
    expect(validateSearchFilters({ distance: -1 }).isValid).toBe(false);
  });

  it('rejects out-of-range minRating', () => {
    expect(validateSearchFilters({ minRating: 6 }).isValid).toBe(false);
    expect(validateSearchFilters({ minRating: -0.1 }).isValid).toBe(false);
  });

  it('passes when all filter values are inside their bounds', () => {
    const r = validateSearchFilters({
      priceRange: [10, 500],
      distance: 25,
      minRating: 4,
      postalCode: '75001',
    });
    expect(r.isValid).toBe(true);
  });
});

describe('sanitizeString', () => {
  it('returns an empty string for null/empty input', () => {
    expect(sanitizeString('')).toBe('');
  });

  it('strips angle brackets to defeat trivial HTML injection', () => {
    expect(sanitizeString('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
  });

  it('collapses whitespace', () => {
    expect(sanitizeString('  hello   world  ')).toBe('hello world');
  });
});

describe('validateWithRules', () => {
  type T = { name?: string; age?: number };
  const rules = [
    { field: 'name' as const, required: true, validate: (v: unknown) => (typeof v === 'string' && v.length >= 2 ? null : 'name must be 2+ chars') },
    { field: 'age' as const, required: false, validate: (v: unknown) => (typeof v === 'number' && v >= 0 ? null : 'age must be positive') },
  ];

  it('returns valid when all rules pass', () => {
    const r = validateWithRules<T>({ name: 'Bob', age: 30 }, rules);
    expect(r.isValid).toBe(true);
  });

  it('reports missing required field', () => {
    const r = validateWithRules<T>({ age: 30 }, rules);
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/name est requis/);
  });

  it('skips optional rule when value is undefined', () => {
    const r = validateWithRules<T>({ name: 'Bob' }, rules);
    expect(r.isValid).toBe(true);
  });

  it('reports rule violations on present optional fields', () => {
    const r = validateWithRules<T>({ name: 'Bob', age: -5 }, rules);
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/age must be positive/);
  });
});
