import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn (className helper)', () => {
  it('joins multiple class strings', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('drops falsy values', () => {
    expect(cn('a', false, null, undefined, 0, '', 'b')).toBe('a b');
  });

  it('honours conditional object syntax', () => {
    expect(cn('a', { active: true, disabled: false })).toBe('a active');
  });

  it('flattens nested arrays', () => {
    expect(cn(['a', ['b', 'c']], 'd')).toBe('a b c d');
  });

  it('lets later tailwind classes win on the same property (twMerge)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('keeps unrelated tailwind classes', () => {
    expect(cn('px-2', 'py-1', 'text-red-500')).toBe('px-2 py-1 text-red-500');
  });

  it('returns an empty string when given no input', () => {
    expect(cn()).toBe('');
  });
});
