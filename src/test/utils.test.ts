import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('cn (className merger)', () => {
    it('should merge simple class names', () => {
      const result = cn('flex', 'items-center', 'justify-between');
      expect(result).toContain('flex');
      expect(result).toContain('items-center');
      expect(result).toContain('justify-between');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toContain('base-class');
      expect(result).toContain('active-class');
    });

    it('should handle false conditionals', () => {
      const isActive = false;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toContain('base-class');
      expect(result).not.toContain('active-class');
    });

    it('should merge conflicting Tailwind classes', () => {
      const result = cn('p-4', 'p-6'); // Should keep p-6
      expect(result).toContain('p-6');
      expect(result).not.toContain('p-4');
    });

    it('should handle undefined and null values', () => {
      const result = cn('flex', undefined, null, 'items-center');
      expect(result).toContain('flex');
      expect(result).toContain('items-center');
    });

    it('should handle arrays of classes', () => {
      const classes = ['flex', 'items-center'];
      const result = cn(classes, 'justify-between');
      expect(result).toContain('flex');
      expect(result).toContain('items-center');
      expect(result).toContain('justify-between');
    });
  });
});
