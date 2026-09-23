import { describe, it, expect } from 'vitest';
import { parseDirection } from '@/app/utils/direction';

describe('parseDirection', () => {
  it('reads French compass words, ignoring arrow glyphs', () => {
    expect(parseDirection('↗ Nord Ouest')).toEqual({
      code: 'NO',
      bearing: 315,
      label: 'Nord-Ouest',
    });
    expect(parseDirection('← Ouest')?.code).toBe('O');
    expect(parseDirection('↘ Sud Est')?.bearing).toBe(135);
    expect(parseDirection('Sud-Ouest')?.label).toBe('Sud-Ouest');
  });

  it('reads English compass words from imported routes', () => {
    expect(parseDirection('North')?.code).toBe('N');
    expect(parseDirection('south east')?.code).toBe('SE');
  });

  it('returns null for missing or unknown directions', () => {
    expect(parseDirection(undefined)).toBeNull();
    expect(parseDirection('')).toBeNull();
    expect(parseDirection('boucle')).toBeNull();
  });
});
