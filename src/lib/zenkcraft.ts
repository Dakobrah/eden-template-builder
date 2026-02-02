import type { Template, Item, XmlPosition, Realm, CalculatedStats } from '@/types';
import { calculateItemUtility } from './statsCalculator';
import {
  ALL_SLOTS,
  ZENKCRAFT_SLOT_NAMES,
  ZENKCRAFT_NAME_TO_SLOT,
  EFFECT_FULL_NAMES,
  FULL_NAME_TO_EFFECT,
  ZENKCRAFT_ALIASES,
} from './constants';

// ---- SlotId to XmlPosition lookup ----

const SLOT_XMLPOS: Record<string, XmlPosition> = {};
ALL_SLOTS.forEach(s => { SLOT_XMLPOS[s.id] = s.xmlPos; });

// ---- Combined name-to-ID map (canonical names + aliases) ----

const NAME_TO_EFFECT_ID: Record<string, string> = {
  ...FULL_NAME_TO_EFFECT,
  ...ZENKCRAFT_ALIASES,
};

// ---- Effect Resolution ----

function resolveEffectId(type: string, name: string): string | null {
  const n = name.trim();
  switch (type) {
    case 'Stat':
      return NAME_TO_EFFECT_ID[n] || n.toUpperCase();
    case 'H.P.':
      return 'HITPOINTS';
    case 'Power':
      return 'POWER';
    case 'Resist':
      return NAME_TO_EFFECT_ID[n] || `RES_${n.toUpperCase()}`;
    case 'Skill':
      return n.toUpperCase().replace(/\s+/g, '_');
    case 'Bonus':
      return NAME_TO_EFFECT_ID[n] || n.toUpperCase().replace(/\s+/g, '_');
    case 'Stat Cap':
    case 'H.P. Cap':
    case 'Power Cap': {
      const statName = n.replace(/^Cap\s+/i, '');
      const statId = NAME_TO_EFFECT_ID[statName] || statName.toUpperCase().replace(/\s+/g, '_');
      return `CAP_${statId}`;
    }
    default:
      return n.toUpperCase().replace(/\s+/g, '_');
  }
}

function effectToZenkraft(effectId: string): { type: string; name: string; suffix: string } {
  const displayName = EFFECT_FULL_NAMES[effectId];

  // Stats
  if (effectId === 'HITPOINTS') return { type: 'H.P.', name: 'Hit Points', suffix: '' };
  if (effectId === 'POWER') return { type: 'Stat', name: 'Power', suffix: '' };
  if (displayName && ['STRENGTH', 'CONSTITUTION', 'DEXTERITY', 'QUICKNESS', 'INTELLIGENCE', 'PIETY', 'EMPATHY', 'CHARISMA', 'ACUITY'].includes(effectId)) {
    return { type: 'Stat', name: displayName, suffix: '' };
  }

  // Resists
  if (effectId.startsWith('RES_') && displayName) {
    return { type: 'Resist', name: displayName, suffix: '%' };
  }

  // Caps
  if (effectId.startsWith('CAP_')) {
    const baseId = effectId.slice(4);
    if (baseId === 'HITPOINTS') return { type: 'H.P. Cap', name: 'Cap Hit Points', suffix: '' };
    if (baseId === 'POWER') return { type: 'Power Cap', name: 'Cap Power', suffix: '' };
    const baseName = EFFECT_FULL_NAMES[baseId] || baseId;
    return { type: 'Stat Cap', name: `Cap ${baseName}`, suffix: '' };
  }

  // Bonuses
  if (displayName) {
    return { type: 'Bonus', name: displayName, suffix: '' };
  }

  // Skills / fallback
  const fallbackName = effectId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return { type: 'Skill', name: fallbackName, suffix: '' };
}

// ---- Import (Parse) ----

export interface ZenkraftParseResult {
  name: string;
  characterClass: string;
  realm: string;
  level: number;
  items: Record<string, Item | null>;
}

export function parseZenkraftTemplate(text: string): ZenkraftParseResult | null {
  const lines = text.split(/\r?\n/);

  let name = 'Imported';
  let characterClass = 'Armsman';
  let realm = 'Albion';
  let level = 50;

  for (const line of lines) {
    const charMatch = line.match(/Character Summary for (.+?)\s*-\s*(.+)/);
    if (charMatch) {
      name = charMatch[1].trim();
      characterClass = charMatch[2].trim();
    }
    const levelMatch = line.match(/Level:\s*(\d+)\s+Realm:\s*(.+)/);
    if (levelMatch) {
      level = parseInt(levelMatch[1], 10);
      realm = levelMatch[2].trim();
    }
  }

  const items: Record<string, Item | null> = {};
  let foundSlots = false;

  for (let i = 0; i < lines.length; i++) {
    const slotMatch = lines[i].match(/^Slot\s+\d+:\s*(.+)$/);
    if (!slotMatch) continue;

    const zcSlotName = slotMatch[1].trim();
    const slotId = ZENKCRAFT_NAME_TO_SLOT[zcSlotName];
    if (!slotId) continue;
    foundSlots = true;

    let itemName = '';
    let itemLevel = 51;
    let itemQuality = 100;
    const effects: Record<string, number> = {};

    for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
      const line = lines[j].trim();
      if (line.match(/^Slot\s+\d+:/)) break;

      const nameMatch = line.match(/^Name:\s*(.*)/);
      if (nameMatch) {
        itemName = nameMatch[1].trim();
        continue;
      }

      const lvlMatch = line.match(/Level:\s*(\d+)\s+Quality:\s*(\d+)/);
      if (lvlMatch) {
        itemLevel = parseInt(lvlMatch[1], 10);
        itemQuality = parseInt(lvlMatch[2], 10);
        continue;
      }

      const effectMatch = line.match(/^\d+\)\s*\(([^)]+)\)\s*([^:]+):\s*\+(\d+)/);
      if (effectMatch) {
        const effectId = resolveEffectId(effectMatch[1].trim(), effectMatch[2].trim());
        const effectValue = parseInt(effectMatch[3], 10);
        if (effectId && effectValue > 0) {
          effects[effectId] = (effects[effectId] || 0) + effectValue;
        }
      }
    }

    if (!itemName) {
      items[slotId] = null;
      continue;
    }

    const xmlPos = SLOT_XMLPOS[slotId] || 'CHEST';
    const id = `${realm.toLowerCase()}_${xmlPos.toLowerCase()}_${itemName.replace(/\s+/g, '_').toLowerCase()}`;

    items[slotId] = {
      id,
      name: itemName,
      position: xmlPos as XmlPosition,
      realm: realm as Realm,
      level: itemLevel,
      quality: itemQuality,
      effects,
      classRestrictions: [],
    };
  }

  if (!foundSlots) return null;
  return { name, characterClass, realm, level, items };
}

// ---- Export ----

export function exportZenkraftTemplate(template: Template, calculated: CalculatedStats): string {
  const lines: string[] = [];

  lines.push('*****  Zenkraft DAoC Template Builder  *****');
  lines.push('DAoC Version: 01.132');
  lines.push(`Total Utility: ${calculated.utility.toFixed(1)}`);
  lines.push('Total Imbue Points: 0.0/32.0');
  lines.push('');
  lines.push(`Character Summary for ${template.name} - ${template.characterClass}`);
  lines.push(`Level: ${template.level}  Realm: ${template.realm}`);
  lines.push('');

  // Stats
  lines.push('============ Stats ============');
  lines.push('raw / cap');
  const statOrder = [
    'STRENGTH', 'CONSTITUTION', 'DEXTERITY', 'QUICKNESS',
    'INTELLIGENCE', 'EMPATHY', 'PIETY', 'CHARISMA', 'ACUITY',
    'HITPOINTS', 'POWER',
  ];
  for (const statId of statOrder) {
    const data = calculated.stats[statId];
    const name = EFFECT_FULL_NAMES[statId] || statId;
    lines.push(data ? `${data.value} / ${data.cap} ${name}` : `0 / 75 ${name}`);
  }
  lines.push('');

  // Bonuses
  const activeBonuses = Object.entries(calculated.bonuses).filter(([, v]) => v > 0);
  if (activeBonuses.length > 0) {
    lines.push('============ Bonuses ============');
    for (const [bonusId, value] of activeBonuses) {
      lines.push(`${value} ${EFFECT_FULL_NAMES[bonusId] || bonusId.replace(/_/g, ' ')}`);
    }
    lines.push('');
  }

  // Resists
  lines.push('============ Resists ============');
  const resistOrder = [
    'RES_CRUSH', 'RES_SLASH', 'RES_THRUST', 'RES_HEAT',
    'RES_COLD', 'RES_SPIRIT', 'RES_BODY', 'RES_MATTER', 'RES_ENERGY',
  ];
  for (const resistId of resistOrder) {
    const data = calculated.resists[resistId];
    const name = EFFECT_FULL_NAMES[resistId] || resistId.replace('RES_', '');
    lines.push(data ? `${data.value} / ${data.cap} ${name}` : `0 / 26 ${name}`);
  }
  lines.push('');

  // Skills
  const activeSkills = Object.entries(calculated.skills).filter(([, v]) => v > 0);
  if (activeSkills.length > 0) {
    lines.push('============ Skills ============');
    for (const [skillId, value] of activeSkills) {
      const name = skillId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      lines.push(`${value} / 11 ${name}`);
    }
    lines.push('');
  }

  // Item slots
  ZENKCRAFT_SLOT_NAMES.forEach((slot, index) => {
    const item = template.slots[slot.slotId];
    lines.push(`Slot ${index + 1}: ${slot.zcName}`);
    lines.push(`Name: ${item?.name || ''}`);
    lines.push(`Level: ${item?.level || 51}  Quality: ${item?.quality || 100}`);
    const util = item ? calculateItemUtility(item) : 0;
    lines.push(`Utility: ${util.toFixed(1)}`);
    lines.push(' Source Type: Drop');
    lines.push('Imbue Points: 0');

    const effectEntries = item ? Object.entries(item.effects).filter(([, v]) => v > 0) : [];
    for (let n = 1; n <= 10; n++) {
      if (n <= effectEntries.length) {
        const [effectId, value] = effectEntries[n - 1];
        const zc = effectToZenkraft(effectId);
        lines.push(`${n}) (${zc.type}) ${zc.name}: +${value}${zc.suffix}`);
      } else {
        lines.push(`${n})`);
      }
    }
  });

  // Empty Bonuses slot (slot 20)
  lines.push('Slot 20: Bonuses');
  lines.push('Name: ');
  lines.push('Level: 51  Quality: 100');
  lines.push('Utility: 0.0');
  lines.push(' Source Type: Drop');
  lines.push('Imbue Points: 0');
  for (let n = 1; n <= 10; n++) lines.push(`${n})`);

  return lines.join('\n');
}
