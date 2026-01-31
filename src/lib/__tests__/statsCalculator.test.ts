import { describe, it, expect } from 'vitest';
import { calculateStats } from '../statsCalculator';

import type { Template, Item } from '@/types';

describe('calculateStats', () => {
  it('aggregates stats, resists, bonuses and utility', () => {
    const helmet: Item = {
      id: 'i1', name: 'Test Helm', position: 'HELMETS', realm: 'Albion', level: 50, quality: 100,
      effects: { STRENGTH: 10, HITPOINTS: 20, RES_SLASH: 5 }, classRestrictions: []
    } as Item;

    const ring: Item = {
      id: 'i2', name: 'Test Ring', position: 'RINGS', realm: null, level: 50, quality: 100,
      effects: { ALL_MELEE_BONUS: 2, PARRY: 1 }, classRestrictions: []
    } as Item;

    const tpl: Template = {
      id: 't1', name: 'T1', realm: 'Albion', characterClass: 'Armsman', level: 50,
      slots: { head: helmet, ring1: ring }, createdAt: '', updatedAt: ''
    } as Template;

    const res = calculateStats(tpl);
    expect(res.stats.STRENGTH.raw).toBe(10);
    expect(res.stats.HITPOINTS.raw).toBe(20);
    expect(res.resists.RES_SLASH.raw).toBe(5);
    expect(res.bonuses.ALL_MELEE_BONUS).toBe(2);
    expect(res.skills.PARRY).toBe(1);
    // Utility > 0
    expect(res.utility).toBeGreaterThan(0);
  });
});
