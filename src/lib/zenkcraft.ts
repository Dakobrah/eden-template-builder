import type { Template, Item, SlotId, XmlPosition, Realm, CalculatedStats } from '@/types';
import { calculateItemUtility } from './statsCalculator';
import { ALL_SLOTS } from './constants';

// ---- Slot Mappings ----

const ZENKCRAFT_SLOT_MAP: Record<string, SlotId> = {
  'Helmet': 'head',
  'Hands': 'hands',
  'Torso': 'chest',
  'Arms': 'arms',
  'Feet': 'feet',
  'Legs': 'legs',
  'Right Hand': 'mainHand',
  'Left Hand': 'offHand',
  'Two Handed': 'twoHand',
  'Ranged': 'ranged',
  'Neck': 'necklace',
  'Cloak': 'cloak',
  'Jewelry': 'gem',
  'Waist': 'belt',
  'L. Ring': 'ring1',
  'R. Ring': 'ring2',
  'L. Wrist': 'bracer1',
  'R. Wrist': 'bracer2',
  'Mythical': 'mythirian',
};

const EXPORT_SLOT_ORDER: { slotId: SlotId; zcName: string }[] = [
  { slotId: 'head', zcName: 'Helmet' },
  { slotId: 'hands', zcName: 'Hands' },
  { slotId: 'chest', zcName: 'Torso' },
  { slotId: 'arms', zcName: 'Arms' },
  { slotId: 'feet', zcName: 'Feet' },
  { slotId: 'legs', zcName: 'Legs' },
  { slotId: 'mainHand', zcName: 'Right Hand' },
  { slotId: 'offHand', zcName: 'Left Hand' },
  { slotId: 'twoHand', zcName: 'Two Handed' },
  { slotId: 'ranged', zcName: 'Ranged' },
  { slotId: 'necklace', zcName: 'Neck' },
  { slotId: 'cloak', zcName: 'Cloak' },
  { slotId: 'gem', zcName: 'Jewelry' },
  { slotId: 'belt', zcName: 'Waist' },
  { slotId: 'ring1', zcName: 'L. Ring' },
  { slotId: 'ring2', zcName: 'R. Ring' },
  { slotId: 'bracer1', zcName: 'L. Wrist' },
  { slotId: 'bracer2', zcName: 'R. Wrist' },
  { slotId: 'mythirian', zcName: 'Mythical' },
];

// ---- Stat/Effect Name Mappings ----

const STAT_NAME_TO_ID: Record<string, string> = {
  'Strength': 'STRENGTH',
  'Constitution': 'CONSTITUTION',
  'Dexterity': 'DEXTERITY',
  'Quickness': 'QUICKNESS',
  'Intelligence': 'INTELLIGENCE',
  'Piety': 'PIETY',
  'Empathy': 'EMPATHY',
  'Charisma': 'CHARISMA',
  'Acuity': 'ACUITY',
  'Hit Points': 'HITPOINTS',
  'Power': 'POWER',
};

const STAT_ID_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(STAT_NAME_TO_ID).map(([k, v]) => [v, k])
);

const RESIST_NAME_TO_ID: Record<string, string> = {
  'Crush': 'RES_CRUSH',
  'Slash': 'RES_SLASH',
  'Thrust': 'RES_THRUST',
  'Heat': 'RES_HEAT',
  'Cold': 'RES_COLD',
  'Spirit': 'RES_SPIRIT',
  'Body': 'RES_BODY',
  'Matter': 'RES_MATTER',
  'Energy': 'RES_ENERGY',
};

const RESIST_ID_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(RESIST_NAME_TO_ID).map(([k, v]) => [v, k])
);

const BONUS_NAME_TO_ID: Record<string, string> = {
  'Melee Damage': 'MELEE_DAMAGE_BONUS',
  'Spell Damage': 'SPELL_DAMAGE_BONUS',
  'Style Damage': 'STYLE_DAMAGE_BONUS',
  'Melee Speed': 'MELEE_SPEED_BONUS',
  'Casting Speed': 'CASTING_SPEED_BONUS',
  'Spell Range': 'SPELL_RANGE_BONUS',
  'Healing Effectiveness': 'HEALING_BONUS',
  'Healing': 'HEALING_BONUS',
  'Power Pool': 'POWER_PERCENTAGE_BONUS',
  'Power Percentage': 'POWER_PERCENTAGE_BONUS',
  'Armor Factor': 'AF_BONUS',
  'AF': 'AF_BONUS',
  'Fatigue': 'FATIGUE',
  'Endurance': 'FATIGUE',
  'Spell Duration': 'SPELL_DURATION_BONUS',
  'Debuff Effectiveness': 'REDUCE_MAGIC_RESISTS',
  'Resist Pierce': 'REDUCE_MAGIC_RESISTS',
  'Arcane Siphon': 'ARCANE_SIPHON',
  'All Focus': 'ALL_MAGIC_FOCUS',
  'Magic Focus': 'ALL_MAGIC_FOCUS',
  'All Melee': 'ALL_MELEE_BONUS',
  'All Magic': 'ALL_MAGIC_BONUS',
  'All Archery': 'ALL_ARCHERY_BONUS',
  'All Dual Wield': 'ALL_DUAL_WIELD_BONUS',
};

const BONUS_ID_TO_NAME: Record<string, string> = {
  'MELEE_DAMAGE_BONUS': 'Melee Damage',
  'SPELL_DAMAGE_BONUS': 'Spell Damage',
  'STYLE_DAMAGE_BONUS': 'Style Damage',
  'MELEE_SPEED_BONUS': 'Melee Speed',
  'CASTING_SPEED_BONUS': 'Casting Speed',
  'SPELL_RANGE_BONUS': 'Spell Range',
  'HEALING_BONUS': 'Healing Effectiveness',
  'POWER_PERCENTAGE_BONUS': 'Power Pool',
  'AF_BONUS': 'Armor Factor',
  'FATIGUE': 'Fatigue',
  'SPELL_DURATION_BONUS': 'Spell Duration',
  'REDUCE_MAGIC_RESISTS': 'Resist Pierce',
  'ARCANE_SIPHON': 'Arcane Siphon',
  'ALL_MAGIC_FOCUS': 'All Focus',
  'ALL_MELEE_BONUS': 'All Melee',
  'ALL_MAGIC_BONUS': 'All Magic',
  'ALL_ARCHERY_BONUS': 'All Archery',
  'ALL_DUAL_WIELD_BONUS': 'All Dual Wield',
};

// ---- SlotId to XmlPosition lookup ----

const SLOT_XMLPOS: Record<string, XmlPosition> = {};
ALL_SLOTS.forEach(s => { SLOT_XMLPOS[s.id] = s.xmlPos; });

// ---- Effect Resolution ----

function resolveEffectId(type: string, name: string): string | null {
  const n = name.trim();
  switch (type) {
    case 'Stat':
      return STAT_NAME_TO_ID[n] || n.toUpperCase();
    case 'H.P.':
      return 'HITPOINTS';
    case 'Power':
      return 'POWER';
    case 'Resist':
      return RESIST_NAME_TO_ID[n] || `RES_${n.toUpperCase()}`;
    case 'Skill':
      return n.toUpperCase().replace(/\s+/g, '_');
    case 'Bonus':
      return BONUS_NAME_TO_ID[n] || n.toUpperCase().replace(/\s+/g, '_');
    case 'Stat Cap':
    case 'H.P. Cap':
    case 'Power Cap': {
      const statName = n.replace(/^Cap\s+/i, '');
      const statId = STAT_NAME_TO_ID[statName] || statName.toUpperCase().replace(/\s+/g, '_');
      return `CAP_${statId}`;
    }
    default:
      return n.toUpperCase().replace(/\s+/g, '_');
  }
}

function effectToZenkraft(effectId: string): { type: string; name: string; suffix: string } {
  if (STAT_ID_TO_NAME[effectId]) {
    if (effectId === 'HITPOINTS') return { type: 'H.P.', name: 'Hit Points', suffix: '' };
    return { type: 'Stat', name: STAT_ID_TO_NAME[effectId], suffix: '' };
  }
  if (RESIST_ID_TO_NAME[effectId]) {
    return { type: 'Resist', name: RESIST_ID_TO_NAME[effectId], suffix: '%' };
  }
  if (effectId.startsWith('CAP_')) {
    const statId = effectId.slice(4);
    if (statId === 'HITPOINTS') return { type: 'H.P. Cap', name: 'Cap Hit Points', suffix: '' };
    if (statId === 'POWER') return { type: 'Power Cap', name: 'Cap Power', suffix: '' };
    const statName = STAT_ID_TO_NAME[statId] || statId;
    return { type: 'Stat Cap', name: `Cap ${statName}`, suffix: '' };
  }
  if (BONUS_ID_TO_NAME[effectId]) {
    return { type: 'Bonus', name: BONUS_ID_TO_NAME[effectId], suffix: '' };
  }
  const displayName = effectId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return { type: 'Skill', name: displayName, suffix: '' };
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
    const slotId = ZENKCRAFT_SLOT_MAP[zcSlotName];
    if (!slotId) continue; // Skip unknown slots like "Bonuses"
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
    const displayName = STAT_ID_TO_NAME[statId] || statId;
    lines.push(data ? `${data.value} / ${data.cap} ${displayName}` : `0 / 75 ${displayName}`);
  }
  lines.push('');

  // Bonuses
  const activeBonuses = Object.entries(calculated.bonuses).filter(([, v]) => v > 0);
  if (activeBonuses.length > 0) {
    lines.push('============ Bonuses ============');
    for (const [bonusId, value] of activeBonuses) {
      lines.push(`${value} ${BONUS_ID_TO_NAME[bonusId] || bonusId.replace(/_/g, ' ')}`);
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
    const displayName = RESIST_ID_TO_NAME[resistId] || resistId.replace('RES_', '');
    lines.push(data ? `${data.value} / ${data.cap} ${displayName}` : `0 / 26 ${displayName}`);
  }
  lines.push('');

  // Skills
  const activeSkills = Object.entries(calculated.skills).filter(([, v]) => v > 0);
  if (activeSkills.length > 0) {
    lines.push('============ Skills ============');
    for (const [skillId, value] of activeSkills) {
      const displayName = skillId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      lines.push(`${value} / 11 ${displayName}`);
    }
    lines.push('');
  }

  // Item slots
  EXPORT_SLOT_ORDER.forEach((slot, index) => {
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
