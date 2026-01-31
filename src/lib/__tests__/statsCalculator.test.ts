import { describe, it, expect } from 'vitest';
import { calculateStats, calculateItemUtility, getEffectCategory, generateTemplateReport } from '../statsCalculator';
import type { Template, Item } from '@/types';

const makeItem = (overrides: Partial<Item> & { effects: Record<string, number> }): Item => ({
  id: 'test', name: 'Test Item', position: 'HELMETS', realm: 'Albion', level: 50, quality: 100,
  classRestrictions: [], ...overrides,
} as Item);

const makeTemplate = (slots: Record<string, Item | null>): Template => ({
  id: 't1', name: 'Test', realm: 'Albion', characterClass: 'Armsman', level: 50,
  slots, createdAt: '', updatedAt: '',
});

describe('getEffectCategory', () => {
  it('categorizes stat effects', () => {
    expect(getEffectCategory('STRENGTH')).toBe('stat');
    expect(getEffectCategory('HITPOINTS')).toBe('stat');
    expect(getEffectCategory('POWER')).toBe('stat');
  });

  it('categorizes resist effects', () => {
    expect(getEffectCategory('RES_SLASH')).toBe('resist');
    expect(getEffectCategory('RES_HEAT')).toBe('resist');
  });

  it('categorizes bonus effects', () => {
    expect(getEffectCategory('ALL_MELEE_BONUS')).toBe('bonus');
    expect(getEffectCategory('MELEE_DAMAGE_BONUS')).toBe('bonus');
    expect(getEffectCategory('CASTING_SPEED_BONUS')).toBe('bonus');
  });

  it('categorizes cap effects', () => {
    expect(getEffectCategory('CAP_STRENGTH')).toBe('cap');
    expect(getEffectCategory('CAP_HITPOINTS')).toBe('cap');
  });

  it('categorizes skill effects', () => {
    expect(getEffectCategory('PARRY')).toBe('skill');
    expect(getEffectCategory('SHIELD')).toBe('skill');
    expect(getEffectCategory('STEALTH')).toBe('skill');
  });

  it('returns other for unknown effects', () => {
    expect(getEffectCategory('UNKNOWN_THING')).toBe('other');
  });
});

describe('calculateStats', () => {
  it('returns zeroed stats for null template', () => {
    const res = calculateStats(null);
    expect(res.stats.STRENGTH.raw).toBe(0);
    expect(res.stats.STRENGTH.value).toBe(0);
    expect(res.utility).toBe(0);
  });

  it('returns zeroed stats for empty template', () => {
    const res = calculateStats(makeTemplate({}));
    expect(res.stats.STRENGTH.raw).toBe(0);
    expect(res.resists.RES_SLASH.raw).toBe(0);
    expect(res.utility).toBe(0);
  });

  it('aggregates stats from multiple items', () => {
    const helm = makeItem({ id: 'h1', effects: { STRENGTH: 15, CONSTITUTION: 10 } });
    const ring = makeItem({ id: 'r1', position: 'RINGS', effects: { STRENGTH: 10, DEXTERITY: 5 } });
    const res = calculateStats(makeTemplate({ head: helm, ring1: ring }));
    expect(res.stats.STRENGTH.raw).toBe(25);
    expect(res.stats.CONSTITUTION.raw).toBe(10);
    expect(res.stats.DEXTERITY.raw).toBe(5);
  });

  it('caps stats at base cap (75) when no cap bonus', () => {
    const item = makeItem({ effects: { STRENGTH: 100 } });
    const res = calculateStats(makeTemplate({ head: item }));
    expect(res.stats.STRENGTH.value).toBe(75);
    expect(res.stats.STRENGTH.cap).toBe(75);
    expect(res.stats.STRENGTH.overcap).toBe(25);
    expect(res.stats.STRENGTH.raw).toBe(100);
  });

  it('applies cap bonus to raise stat cap', () => {
    const item = makeItem({ effects: { STRENGTH: 100, CAP_STRENGTH: 20 } });
    const res = calculateStats(makeTemplate({ head: item }));
    // Cap should be 75 + 20 = 95
    expect(res.stats.STRENGTH.cap).toBe(95);
    expect(res.stats.STRENGTH.value).toBe(95);
    expect(res.stats.STRENGTH.capBonus).toBe(20);
    expect(res.stats.STRENGTH.overcap).toBe(5);
  });

  it('limits cap bonus to MAX_CAP_BONUS (26 for stats)', () => {
    const item = makeItem({ effects: { STRENGTH: 150, CAP_STRENGTH: 50 } });
    const res = calculateStats(makeTemplate({ head: item }));
    // Cap bonus capped at 26: 75 + 26 = 101
    expect(res.stats.STRENGTH.capBonus).toBe(26);
    expect(res.stats.STRENGTH.cap).toBe(101);
    expect(res.stats.STRENGTH.value).toBe(101);
  });

  it('handles hitpoints with 200 base cap and 200 max cap bonus', () => {
    const item = makeItem({ effects: { HITPOINTS: 500, CAP_HITPOINTS: 300 } });
    const res = calculateStats(makeTemplate({ head: item }));
    // HP base=200, max cap bonus=200, so total cap=400
    expect(res.stats.HITPOINTS.baseCap).toBe(200);
    expect(res.stats.HITPOINTS.capBonus).toBe(200);
    expect(res.stats.HITPOINTS.cap).toBe(400);
    expect(res.stats.HITPOINTS.value).toBe(400);
    expect(res.stats.HITPOINTS.overcap).toBe(100);
  });

  it('handles power with 26 base cap and 50 max cap bonus', () => {
    const item = makeItem({ effects: { POWER: 100, CAP_POWER: 60 } });
    const res = calculateStats(makeTemplate({ head: item }));
    // Power base=26, max cap bonus=50, so total cap=76
    expect(res.stats.POWER.baseCap).toBe(26);
    expect(res.stats.POWER.capBonus).toBe(50);
    expect(res.stats.POWER.cap).toBe(76);
    expect(res.stats.POWER.value).toBe(76);
  });

  it('caps resists at 26', () => {
    const item = makeItem({ effects: { RES_SLASH: 30 } });
    const res = calculateStats(makeTemplate({ head: item }));
    expect(res.resists.RES_SLASH.value).toBe(26);
    expect(res.resists.RES_SLASH.cap).toBe(26);
    expect(res.resists.RES_SLASH.overcap).toBe(4);
  });

  it('caps skills at 11', () => {
    const item = makeItem({ effects: { PARRY: 15 } });
    const res = calculateStats(makeTemplate({ head: item }));
    expect(res.skills.PARRY).toBe(11);
  });

  it('caps bonuses per BONUS_CAPS', () => {
    const item = makeItem({ effects: { MELEE_DAMAGE_BONUS: 20 } });
    const res = calculateStats(makeTemplate({ head: item }));
    // MELEE_DAMAGE_BONUS cap is 10
    expect(res.bonuses.MELEE_DAMAGE_BONUS).toBe(10);
  });

  it('caps 25% tier bonuses at 25', () => {
    const item = makeItem({ effects: { HEALING_BONUS: 30 } });
    const res = calculateStats(makeTemplate({ head: item }));
    expect(res.bonuses.HEALING_BONUS).toBe(25);
  });

  it('calculates utility correctly', () => {
    // stat=1x (HP=0.25x), resist=2x, bonus=3x, skill=5x
    const item = makeItem({ effects: { STRENGTH: 10, RES_SLASH: 5, ALL_MELEE_BONUS: 2, PARRY: 1 } });
    const res = calculateStats(makeTemplate({ head: item }));
    // STR: 10*1=10, RES_SLASH: 5*2=10, ALL_MELEE: 2*3=6, PARRY: 1*5=5 = 31
    expect(res.utility).toBe(31);
  });

  it('uses 0.25x multiplier for hitpoints utility', () => {
    const item = makeItem({ effects: { HITPOINTS: 40 } });
    const res = calculateStats(makeTemplate({ head: item }));
    // 40 * 0.25 = 10
    expect(res.utility).toBe(10);
  });

  it('skips null slots', () => {
    const item = makeItem({ effects: { STRENGTH: 10 } });
    const res = calculateStats(makeTemplate({ head: item, chest: null }));
    expect(res.stats.STRENGTH.raw).toBe(10);
  });
});

describe('calculateItemUtility', () => {
  it('calculates utility with stat multiplier of 1', () => {
    expect(calculateItemUtility({ effects: { STRENGTH: 10 } })).toBe(10);
  });

  it('uses 0.25 multiplier for hitpoints', () => {
    expect(calculateItemUtility({ effects: { HITPOINTS: 40 } })).toBe(10);
  });

  it('uses 2x multiplier for resists', () => {
    expect(calculateItemUtility({ effects: { RES_SLASH: 5 } })).toBe(10);
  });

  it('uses 3x multiplier for bonuses', () => {
    expect(calculateItemUtility({ effects: { MELEE_DAMAGE_BONUS: 3 } })).toBe(9);
  });

  it('uses 5x multiplier for skills', () => {
    expect(calculateItemUtility({ effects: { PARRY: 2 } })).toBe(10);
  });

  it('uses 1x multiplier for cap effects', () => {
    expect(calculateItemUtility({ effects: { CAP_STRENGTH: 10 } })).toBe(10);
  });

  it('combines all effect types', () => {
    const utility = calculateItemUtility({
      effects: { STRENGTH: 10, RES_CRUSH: 5, HEALING_BONUS: 2, PARRY: 1, CAP_STRENGTH: 5 },
    });
    // 10*1 + 5*2 + 2*3 + 1*5 + 5*1 = 10 + 10 + 6 + 5 + 5 = 36
    expect(utility).toBe(36);
  });
});

describe('generateTemplateReport', () => {
  it('generates a text report with stats and resists', () => {
    const item = makeItem({ effects: { STRENGTH: 50, RES_SLASH: 10 } });
    const tpl = makeTemplate({ head: item });
    const calc = calculateStats(tpl);
    const report = generateTemplateReport(tpl, calc);
    expect(report).toContain('DAOC TEMPLATE REPORT');
    expect(report).toContain('STRENGTH: 50/75');
    expect(report).toContain('SLASH: 10/26');
    expect(report).toContain('TOTAL UTILITY:');
  });

  it('includes equipment slot names', () => {
    const tpl = makeTemplate({});
    const calc = calculateStats(tpl);
    const report = generateTemplateReport(tpl, calc);
    expect(report).toContain('Head: Empty');
    expect(report).toContain('Chest: Empty');
  });

  it('shows equipped item names', () => {
    const item = makeItem({ name: 'Crown of Zahur', effects: { STRENGTH: 10 } });
    const tpl = makeTemplate({ head: item });
    const calc = calculateStats(tpl);
    const report = generateTemplateReport(tpl, calc);
    expect(report).toContain('Head: Crown of Zahur');
  });

  it('includes bonuses with caps', () => {
    const item = makeItem({ effects: { HEALING_BONUS: 10 } });
    const tpl = makeTemplate({ head: item });
    const calc = calculateStats(tpl);
    const report = generateTemplateReport(tpl, calc);
    expect(report).toContain('HEALING_BONUS: 10/25');
  });

  it('includes skills with cap', () => {
    const item = makeItem({ effects: { PARRY: 5 } });
    const tpl = makeTemplate({ head: item });
    const calc = calculateStats(tpl);
    const report = generateTemplateReport(tpl, calc);
    expect(report).toContain('PARRY: 5/11');
  });
});
