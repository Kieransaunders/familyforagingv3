import { cn } from '../src/utils/cn';

describe('cn utility', () => {
  it('merges and deduplicates Tailwind classes', () => {
    const result = cn('px-2 py-2', 'px-4', false && 'hidden', undefined, 'py-2');
    // tailwind-merge should keep the last px-* and dedupe py-2
    expect(result).toContain('px-4');
    expect(result).toContain('py-2');
    expect(result.includes('px-2')).toBe(false);
  });
});

