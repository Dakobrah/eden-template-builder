import type { Template, CalculatedStats } from '@/types';
import {
  STAT_EFFECTS, RESIST_EFFECTS, BONUS_EFFECTS, CAP_EFFECTS, SKILL_EFFECTS,
  RESIST_CAP, SKILL_CAP, BONUS_CAPS, MAX_CAP_BONUS, BASE_STAT_CAPS
} from './constants';

export type EffectCategory = 'stat' | 'resist' | 'bonus' | 'cap' | 'skill' | 'other';

export function getEffectCategory(effectId: string): EffectCategory {
  if (STAT_EFFECTS.includes(effectId as any)) return 'stat';
  if (RESIST_EFFECTS.includes(effectId as any)) return 'resist';
  if (BONUS_EFFECTS.includes(effectId as any)) return 'bonus';
  if (CAP_EFFECTS.includes(effectId as any)) return 'cap';
  if (SKILL_EFFECTS.includes(effectId as any)) return 'skill';
  return 'other';
}

export function calculateStats(template: Template | null): CalculatedStats {
  const totals = {
    stats: {} as Record<string, number>,
    resists: {} as Record<string, number>,
    bonuses: {} as Record<string, number>,
    caps: {} as Record<string, number>,
    skills: {} as Record<string, number>,
  };

  STAT_EFFECTS.forEach(s => totals.stats[s] = 0);
  RESIST_EFFECTS.forEach(r => totals.resists[r] = 0);
  BONUS_EFFECTS.forEach(b => totals.bonuses[b] = 0);
  CAP_EFFECTS.forEach(c => totals.caps[c] = 0);
  SKILL_EFFECTS.forEach(s => totals.skills[s] = 0);

  if (template?.slots) {
    Object.values(template.slots).forEach(item => {
      if (!item?.effects) return;
      Object.entries(item.effects).forEach(([effectId, value]) => {
        const cat = getEffectCategory(effectId);
        switch (cat) {
          case 'stat': totals.stats[effectId] = (totals.stats[effectId] || 0) + value; break;
          case 'resist': totals.resists[effectId] = (totals.resists[effectId] || 0) + value; break;
          case 'bonus': totals.bonuses[effectId] = (totals.bonuses[effectId] || 0) + value; break;
          case 'cap': totals.caps[effectId] = (totals.caps[effectId] || 0) + value; break;
          case 'skill': totals.skills[effectId] = (totals.skills[effectId] || 0) + value; break;
          default: break;
        }
      });
    });
  }

  const results: CalculatedStats = {
    stats: {},
    resists: {},
    bonuses: { ...totals.bonuses },
    caps: { ...totals.caps },
    skills: { ...totals.skills },
    utility: 0,
  };

  let utility = 0;

  Object.entries(totals.stats).forEach(([statId, rawValue]) => {
    const statKey = statId.toLowerCase();
    const baseCap = BASE_STAT_CAPS[statKey] || 75;
    const capBonusKey = `CAP_${statId}`;
    const capBonusRaw = totals.caps[capBonusKey] || 0;
    const maxCapBonus = MAX_CAP_BONUS[statKey] || 26;
    const capBonus = Math.min(capBonusRaw, maxCapBonus);
    const totalCap = baseCap + capBonus;
    const effectiveValue = Math.min(rawValue, totalCap);
    const overcap = Math.max(0, rawValue - totalCap);
    results.stats[statId] = {
      value: effectiveValue,
      cap: totalCap,
      baseCap,
      capBonus,
      raw: rawValue,
      overcap,
    };
    const utilityMultiplier = statId === 'HITPOINTS' ? 0.25 : 1;
    utility += effectiveValue * utilityMultiplier;
  });

  Object.entries(totals.resists).forEach(([resistId, rawValue]) => {
    const effectiveValue = Math.min(rawValue, RESIST_CAP);
    const overcap = Math.max(0, rawValue - RESIST_CAP);
    results.resists[resistId] = {
      value: effectiveValue,
      cap: RESIST_CAP,
      raw: rawValue,
      overcap,
    };
    utility += effectiveValue * 2;
  });

  // Apply bonus caps
  Object.entries(totals.bonuses).forEach(([bonusId, rawValue]) => {
    const cap = BONUS_CAPS[bonusId];
    if (cap !== undefined) {
      results.bonuses[bonusId] = Math.min(rawValue, cap);
    }
    utility += (results.bonuses[bonusId] ?? rawValue) * 3;
  });

  // Apply skill cap
  Object.entries(totals.skills).forEach(([skillId, rawValue]) => {
    results.skills[skillId] = Math.min(rawValue, SKILL_CAP);
    utility += results.skills[skillId] * 5;
  });

  results.utility = Math.round(utility * 10) / 10;
  return results;
}

export function calculateItemUtility(item: { effects: Record<string, number> }): number {
  let utility = 0;
  Object.entries(item.effects).forEach(([effectId, value]) => {
    const category = getEffectCategory(effectId);
    switch (category) {
      case 'stat': utility += (effectId === 'HITPOINTS' ? 0.25 : 1) * value; break;
      case 'resist': utility += 2 * value; break;
      case 'bonus': utility += 3 * value; break;
      case 'skill': utility += 5 * value; break;
      case 'cap': utility += 1 * value; break;
      default: utility += 0; break;
    }
  });
  return Math.round(utility * 10) / 10;
}

export function generateTemplateReport(template: Template, calculated: CalculatedStats): string {
  const lines: string[] = [];
  lines.push('=== DAOC TEMPLATE REPORT ===');
  lines.push(`Name: ${template.name}`);
  lines.push(`Class: ${template.characterClass} (${template.realm})`);
  lines.push(`Level: ${template.level}`);
  lines.push('');
  lines.push('--- EQUIPMENT ---');
  const slotOrder = [
    'head', 'chest', 'arms', 'hands', 'legs', 'feet',
    'necklace', 'cloak', 'belt', 'ring1', 'ring2',
    'bracer1', 'bracer2', 'gem', 'mythirian',
    'mainHand', 'offHand', 'twoHand', 'ranged'
  ];
  slotOrder.forEach(slotId => {
    const item = template.slots[slotId];
    const slotName = slotId.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase());
    lines.push(`${slotName}: ${item?.name || 'Empty'}`);
  });
  lines.push('');
  lines.push('--- STATS ---');
  Object.entries(calculated.stats)
    .filter(([, data]) => data.raw > 0)
    .forEach(([stat, data]) => {
      let line = `${stat}: ${data.value}/${data.cap}`;
      if (data.capBonus > 0) line += ` (+${data.capBonus} cap)`;
      if (data.overcap > 0) line += ` (+${data.overcap} over)`;
      lines.push(line);
    });
  lines.push('');
  lines.push('--- RESISTS ---');
  Object.entries(calculated.resists)
    .filter(([, data]) => data.raw > 0)
    .forEach(([resist, data]) => {
      let line = `${resist.replace('RES_', '')}: ${data.value}/${data.cap}`;
      if (data.overcap > 0) line += ` (+${data.overcap} over)`;
      lines.push(line);
    });
  lines.push('');
  const activeBonuses = Object.entries(calculated.bonuses).filter(([, v]) => v > 0);
  if (activeBonuses.length > 0) {
    lines.push('--- BONUSES ---');
    activeBonuses.forEach(([bonus, value]) => {
      const cap = BONUS_CAPS[bonus];
      lines.push(cap !== undefined ? `${bonus}: ${value}/${cap}` : `${bonus}: ${value}`);
    });
    lines.push('');
  }
  const activeSkills = Object.entries(calculated.skills).filter(([, v]) => v > 0);
  if (activeSkills.length > 0) {
    lines.push('--- SKILLS ---');
    activeSkills.forEach(([skill, value]) => { lines.push(`${skill}: ${value}/${SKILL_CAP}`); });
    lines.push('');
  }
  lines.push(`--- TOTAL UTILITY: ${calculated.utility} ---`);
  return lines.join('\n');
}
