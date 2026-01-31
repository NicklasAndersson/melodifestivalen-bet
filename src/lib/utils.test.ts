import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn (className merge utility)', () => {
  it('should merge single class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'conditional')).toBe('base conditional');
    expect(cn('base', false && 'conditional')).toBe('base');
  });

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('should handle undefined and null values', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar');
    expect(cn('foo', null, 'bar')).toBe('foo bar');
  });

  it('should handle arrays of class names', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('should handle object syntax', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('should handle empty inputs', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
  });

  it('should deduplicate conflicting tailwind utilities', () => {
    // tailwind-merge should keep the last value for conflicting utilities
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(cn('bg-white', 'bg-black')).toBe('bg-black');
  });

  it('should handle complex combinations', () => {
    const result = cn(
      'base-class',
      true && 'conditional-true',
      false && 'conditional-false',
      { 'object-true': true, 'object-false': false },
      ['array-class'],
      undefined,
      'final-class'
    );
    expect(result).toBe('base-class conditional-true object-true array-class final-class');
  });

  it('should handle responsive and state variants', () => {
    expect(cn('hover:bg-blue-500', 'hover:bg-red-500')).toBe('hover:bg-red-500');
    expect(cn('md:text-lg', 'md:text-xl')).toBe('md:text-xl');
  });
});
