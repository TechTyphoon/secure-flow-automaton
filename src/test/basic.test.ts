import { describe, it, expect } from 'vitest';

describe('Application', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true);
  });

  it('should have correct environment', () => {
    expect(typeof window).toBe('object');
  });
});
