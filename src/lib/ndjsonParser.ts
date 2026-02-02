import type { Item, ItemProc, Realm, XmlPosition, ArmorType, WeaponType, DamageType } from '@/types';

// ---- Realm codes ----
const REALM_MAP: Record<string, Realm | null> = {
  '0': null, '1': 'Albion', '2': 'Midgard', '3': 'Hibernia',
};

// ---- item_type → XmlPosition ----
const ITEM_TYPE_TO_POS: Record<string, XmlPosition | null> = {
  '10': 'WEAPONS', '11': 'WEAPONS', '12': 'WEAPONS', '13': 'WEAPONS',
  '21': 'HELMETS', '22': 'GLOVES', '23': 'SHOES',
  '24': 'JEWEL', '25': 'CHEST', '26': 'CLOAK',
  '27': 'LEGS', '28': 'BRACERS', '29': 'NECKLACE',
  '32': 'BELT', '33': 'BRACELETS', '35': 'RINGS', '37': 'MYTHIRIAN',
};

// ---- damage_type codes ----
const DAMAGE_TYPE_MAP: Record<string, DamageType | undefined> = {
  '0': undefined, '1': 'CRUSH', '2': 'SLASH', '3': 'THRUST',
};

// ---- object_type → ArmorType ----
const ARMOR_TYPE_MAP: Record<string, ArmorType> = {
  '32': 'CLOTH', '33': 'LEATHER', '34': 'STUDDED', '35': 'CHAIN',
  '36': 'PLATE', '37': 'REINFORCED', '38': 'SCALE', // 37=Hib reinforced, 38=Hib scale
};

// ---- object_type → WeaponType (base, before left-hand adjustment) ----
const WEAPON_TYPE_MAP: Record<string, string> = {
  // Albion 1H
  '2': 'CRUSH', '3': 'SLASH', '4': 'THRUST',
  // Albion 2H
  '6': 'TWO_HAND', '7': 'POLEARM',
  // All-realm
  '8': 'STAFF', '24': 'FLEXIBLE',
  // Ranged
  '5': 'SHORTBOW', '9': 'LONGBOW', '10': 'CROSSBOW',
  '15': 'SHORTBOW', '16': 'THROWN', '18': 'SHORTBOW',
  // Midgard 1H
  '11': 'SWORD', '12': 'HAMMER', '13': 'AXE', '17': 'LEFT_AXE',
  // Midgard 2H
  '14': 'SPEAR',
  // Midgard special
  '25': 'CLAWS', '27': 'FIST_WRAPS', '28': 'MAULER_STAFF',
  // Hibernia 1H
  '19': 'BLADES', '20': 'BLUNT', '21': 'PIERCING',
  // Hibernia 2H
  '22': 'LARGE_WEAPON', '23': 'CELTIC_SPEAR', '26': 'SCYTHE',
  // Shield (size determined separately)
  '42': 'SHIELD',
  // Instrument
  '45': 'INSTRUMENT',
};

// Albion 1H types that get _LEFT suffix for offhand (item_type=11)
const ALBION_LEFT_MAP: Record<string, string> = {
  'CRUSH': 'CRUSH_LEFT', 'SLASH': 'SLASH_LEFT', 'THRUST': 'THRUST_LEFT',
};

// ---- bonus_type → effect ID ----
const BONUS_TYPE_MAP: Record<number, string> = {
  // Stats
  1: 'STRENGTH', 2: 'DEXTERITY', 3: 'CONSTITUTION', 4: 'QUICKNESS',
  5: 'INTELLIGENCE', 6: 'PIETY', 7: 'EMPATHY', 8: 'CHARISMA',
  10: 'HITPOINTS', 156: 'ACUITY',

  // Resists
  11: 'RES_BODY', 12: 'RES_COLD', 13: 'RES_CRUSH', 14: 'RES_ENERGY',
  15: 'RES_HEAT', 16: 'RES_MATTER', 17: 'RES_SLASH', 18: 'RES_SPIRIT',
  19: 'RES_THRUST',

  // Skills - Albion
  20: 'TWO_HANDED', 21: 'BODY_MAGIC', 23: 'CRITICAL_STRIKE',
  24: 'CROSSBOWS', 25: 'CRUSH', 26: 'DEATH_SERVANT',
  27: 'DEATHSIGHT', 28: 'DUAL_WIELD', 29: 'EARTH_MAGIC',
  30: 'ENHANCEMENT', 31: 'ENVENOM', 32: 'FIRE_MAGIC',
  33: 'FLEXIBLE', 34: 'COLD_MAGIC', 35: 'INSTRUMENTS',
  37: 'MATTER_MAGIC', 38: 'MIND_MAGIC', 39: 'PAINWORKING',
  40: 'PARRY', 41: 'POLEARMS', 42: 'REJUVENATION',
  43: 'SHIELD', 44: 'SLASH', 45: 'SMITE',
  46: 'SOULRENDING', 47: 'SPIRIT_MAGIC', 48: 'STAFF',
  49: 'STEALTH', 50: 'THRUST', 51: 'WIND_MAGIC',

  // Skills - Midgard
  52: 'SWORD', 53: 'HAMMER', 54: 'AXE', 55: 'LEFT_AXE',
  56: 'SPEAR', 57: 'MENDING', 58: 'AUGMENTATION',
  60: 'DARKNESS', 61: 'SUPPRESSION', 62: 'RUNECARVING',
  63: 'STORMCALLING', 64: 'BEASTCRAFT',
  69: 'BATTLESONGS',
  91: 'THROWN_WEAPONS', 92: 'HAND2HAND',
  109: 'MAULER_STAFF', 110: 'FIST_WRAPS', 111: 'POWER_STRIKES',

  // Skills - Hibernia
  65: 'LIGHT', 66: 'VOID', 67: 'MANA',
  70: 'ENCHANTMENTS', 72: 'BLADES', 73: 'BLUNT',
  74: 'PIERCING', 75: 'LARGE_WEAPONRY', 76: 'MENTALISM',
  77: 'REGROWTH', 78: 'NURTURE', 79: 'NATURE',
  80: 'MUSIC', 81: 'CELTIC_DUAL', 82: 'CELTIC_SPEAR',
  84: 'VALOR', 85: 'SUBTERRANEAN', 86: 'BONE_ARMY',
  87: 'VERDANT_PATH', 88: 'CREEPING_PATH', 89: 'ARBOREAL_PATH',
  90: 'SCYTHE', 94: 'PACIFICATION',
  98: 'SUMMONING', 99: 'DEMENTIA',
  100: 'SHADOW_MASTERY', 101: 'VAMPIIRIC_EMBRACE',
  102: 'ETHEREAL_SHRIEK', 103: 'PHANTASMAL_WAIL',
  106: 'CURSING', 107: 'HEXING',
  113: 'AURA_MANIPULATION', 114: 'SPECTRAL_GUARD',
  115: 'ALL_ARCHERY_BONUS',

  // Focus skills
  120: 'DARKNESS_FOCUS', 121: 'SUPPRESSION_FOCUS', 122: 'RUNECARVING_FOCUS',
  123: 'SPIRIT_FOCUS', 124: 'FIRE_FOCUS', 125: 'AIR_FOCUS',
  126: 'COLD_FOCUS', 127: 'EARTH_FOCUS', 128: 'LIGHT_FOCUS',
  129: 'BODY_FOCUS', 130: 'MATTER_FOCUS', 132: 'MIND_FOCUS',
  133: 'VOID_FOCUS', 134: 'MANA_FOCUS', 135: 'ENCHANTMENT_FOCUS',
  136: 'MENTALISM_FOCUS', 137: 'SUMMONING_FOCUS',
  138: 'BONE_ARMY_FOCUS', 139: 'PAINWORKING_FOCUS',
  140: 'DEATHSIGHT_FOCUS', 141: 'DEATH_SERVANT_FOCUS',
  142: 'VERDANT_PATH_FOCUS', 143: 'CREEPING_PATH_FOCUS',
  144: 'ARBOREAL_FOCUS',
  157: 'ETHEREAL_SHRIEK_FOCUS', 158: 'PHANTASMAL_WAIL_FOCUS',
  159: 'SPECTRAL_GUARD_FOCUS', 160: 'CURSING_FOCUS',
  161: 'HEXING_FOCUS', 162: 'WITCHCRAFT_FOCUS',

  // Special / ToA bonuses
  146: 'ILLNESS_REDUCTION', 147: 'MAX_CONCENTRATION',
  148: 'AF_BONUS', 150: 'HEALTH_REGEN', 151: 'POWER_REGEN',
  152: 'ENDURANCE_REGEN', 153: 'SPELL_RANGE_BONUS',
  155: 'MELEE_SPEED_BONUS',
  163: 'ALL_MAGIC_BONUS', 164: 'ALL_MELEE_BONUS',
  165: 'ALL_MAGIC_FOCUS', 167: 'ALL_DUAL_WIELD_BONUS',
  168: 'ALL_ARCHERY_BONUS',
  169: 'EVADE_BONUS', 170: 'BLOCK_BONUS', 171: 'PARRY_BONUS',
  173: 'MELEE_DAMAGE_BONUS',
  176: 'MESMERIZE_DURATION_REDUCTION', 177: 'STUN_DURATION_REDUCTION',
  178: 'SPEED_DECREASE_DURATION_REDUCTION',
  180: 'DEFENSIVE_BONUS', 182: 'NEGATIVE_REDUCTION',
  183: 'PIERCE_ABLATIVE', 184: 'REACTIONARY_STYLE_DAMAGE_BONUS',
  185: 'SPELL_POWER_COST_REDUCTION', 186: 'STYLE_COST_REDUCTION',
  187: 'TO_HIT_BONUS', 188: 'ARCHERY_CASTING_SPEED_BONUS',
  190: 'BUFF_BONUS', 191: 'CASTING_SPEED_BONUS',
  193: 'DEBUFF_BONUS', 194: 'FATIGUE', 195: 'HEALING_BONUS',
  196: 'POWER_PERCENTAGE_BONUS', 197: 'REDUCE_MAGIC_RESISTS',
  198: 'SPELL_DAMAGE_BONUS', 199: 'SPELL_DURATION_BONUS',
  200: 'STYLE_DAMAGE_BONUS',

  // Stat caps
  201: 'CAP_STRENGTH', 202: 'CAP_DEXTERITY', 203: 'CAP_CONSTITUTION',
  204: 'CAP_QUICKNESS', 205: 'CAP_INTELLIGENCE', 206: 'CAP_PIETY',
  207: 'CAP_EMPATHY', 208: 'CAP_CHARISMA', 209: 'CAP_ACUITY',
  210: 'CAP_HITPOINTS', 211: 'CAP_POWER',

  // Mythical / special
  218: 'SPELL_LEVEL_INCREASE',
  221: 'OVERCAP_RES_BODY', 222: 'OVERCAP_RES_COLD',
  223: 'OVERCAP_RES_CRUSH', 224: 'OVERCAP_RES_ENERGY',
  225: 'OVERCAP_RES_HEAT', 226: 'OVERCAP_RES_MATTER',
  227: 'OVERCAP_RES_SLASH', 228: 'OVERCAP_RES_SPIRIT',
  229: 'OVERCAP_RES_THRUST',
  230: 'DPS', 233: 'SAFE_FALL',
  234: 'MYTHICAL_DISCUMBERING', 235: 'MYTHICAL_COIN',
  248: 'XP_BONUS', 251: 'CONVERSION',
  253: 'REALM_POINT_BONUS', 254: 'ARCANE_SIPHON',
};

// ---- Proc JSON shape from NDJSON ----
interface ProcJson {
  Name: string;
  Attributes: [string, string][];
}

const PROC_FIELDS: { key: string; source: ItemProc['source'] }[] = [
  { key: 'proc1_json', source: 'proc' },
  { key: 'proc2_json', source: 'proc' },
  { key: 'react1_json', source: 'reactive' },
  { key: 'react2_json', source: 'reactive' },
  { key: 'use1_json', source: 'use' },
  { key: 'use2_json', source: 'use' },
  { key: 'passive_json', source: 'passive' },
];

function parseProcs(raw: Record<string, string | null>): ItemProc[] {
  const procs: ItemProc[] = [];
  for (const { key, source } of PROC_FIELDS) {
    const json = raw[key];
    if (!json) continue;
    try {
      const p: ProcJson = JSON.parse(json);
      const attributes: Record<string, string> = {};
      for (const [k, v] of p.Attributes || []) attributes[k] = v;
      procs.push({ name: p.Name, type: attributes['Type'] || '', attributes, source });
    } catch { /* skip malformed */ }
  }
  return procs;
}

// ---- NDJSON raw shape ----
interface NdjsonRaw {
  id: string;
  name: string;
  object_type: string;
  item_type: string;
  level: string;
  quality: string;
  weapon_hand: string;
  weapon_speed: string;
  damage_type: string;
  realm: string;
  required_level: number;
  shield_size: string;
  bonus_types: string | null;
  bonus_values: string | null;
  allowed_classes: string;
  proc1_json: string | null;
  proc2_json: string | null;
  react1_json: string | null;
  react2_json: string | null;
  use1_json: string | null;
  use2_json: string | null;
  passive_json: string | null;
}

function resolveWeaponType(raw: NdjsonRaw): WeaponType | undefined {
  const ot = raw.object_type;
  const base = WEAPON_TYPE_MAP[ot];
  if (!base) return undefined;

  // Shield size
  if (base === 'SHIELD') {
    const sz = raw.shield_size;
    if (sz === '3') return 'SHIELD_LARGE' as WeaponType;
    if (sz === '2') return 'SHIELD_MEDIUM' as WeaponType;
    return 'SHIELD_SMALL' as WeaponType;
  }

  // Left-hand Albion weapons get _LEFT suffix
  if (raw.item_type === '11' && ALBION_LEFT_MAP[base]) {
    return ALBION_LEFT_MAP[base] as WeaponType;
  }

  return base as WeaponType;
}

function parseEffects(bonusTypes: string | null, bonusValues: string | null): Record<string, number> {
  if (!bonusTypes || !bonusValues) return {};
  const types = bonusTypes.split(',');
  const values = bonusValues.split(',');
  const effects: Record<string, number> = {};
  for (let i = 0; i < types.length; i++) {
    const code = parseInt(types[i], 10);
    const val = parseInt(values[i], 10);
    if (!val) continue;
    const effectId = BONUS_TYPE_MAP[code] || `UNKNOWN_${code}`;
    effects[effectId] = (effects[effectId] || 0) + val;
  }
  return effects;
}

function parseClassRestrictions(allowed: string): string[] {
  if (!allowed || allowed === ';;') return [];
  return allowed.split(';;').filter(c => c.length > 0).map(c => c.trim());
}

function parseNdjsonItem(raw: NdjsonRaw): Item | null {
  const position = ITEM_TYPE_TO_POS[raw.item_type];
  if (!position) return null; // Skip misc items
  if (!raw.name) return null;

  const realm = REALM_MAP[raw.realm] ?? null;
  const level = parseInt(raw.level, 10) || 51;
  const quality = parseInt(raw.quality, 10) || 100;
  const effects = parseEffects(raw.bonus_types, raw.bonus_values);

  // Armor type (only for armor positions)
  const armorType = ARMOR_TYPE_MAP[raw.object_type] as ArmorType | undefined;

  // Weapon type (only for weapon positions)
  const weaponType = position === 'WEAPONS' ? resolveWeaponType(raw) : undefined;
  const damageType = position === 'WEAPONS' ? DAMAGE_TYPE_MAP[raw.damage_type] : undefined;

  const procs = parseProcs(raw as unknown as Record<string, string | null>);

  const realmStr = (realm || 'any').toLowerCase();
  const id = `${realmStr}_${position.toLowerCase()}_${raw.name.replace(/\s+/g, '_').toLowerCase()}`;

  return {
    id,
    name: raw.name,
    position,
    realm,
    level,
    quality,
    armorType: armorType || null,
    weaponType,
    damageType,
    effects,
    classRestrictions: parseClassRestrictions(raw.allowed_classes),
    procs: procs.length > 0 ? procs : undefined,
  };
}

export function parseNdjson(text: string): Item[] {
  const lines = text.trim().split('\n');
  const items: Item[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    try {
      const raw: NdjsonRaw = JSON.parse(line);
      const item = parseNdjsonItem(raw);
      if (item && !seen.has(item.id)) {
        seen.add(item.id);
        items.push(item);
      }
    } catch { /* skip malformed lines */ }
  }

  return items;
}
