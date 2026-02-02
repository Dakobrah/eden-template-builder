import type { SlotDefinition, ArmorType, SlotId } from '@/types';

export const REALMS = ['Albion', 'Hibernia', 'Midgard'] as const;

export const CLASSES_BY_REALM: Record<string, string[]> = {
  Albion: [
    'Armsman', 'Cabalist', 'Cleric', 'Friar', 'Heretic',
    'Infiltrator', 'Mercenary', 'Minstrel', 'Necromancer',
    'Paladin', 'Reaver', 'Scout', 'Sorcerer', 'Theurgist', 'Wizard'
  ],
  Hibernia: [
    'Animist', 'Bainshee', 'Bard', 'Blademaster', 'Champion',
    'Druid', 'Eldritch', 'Enchanter', 'Hero', 'Mentalist',
    'Nightshade', 'Ranger', 'Valewalker', 'Warden'
  ],
  Midgard: [
    'Berserker', 'Bonedancer', 'Healer', 'Hunter', 'Runemaster',
    'Savage', 'Shadowblade', 'Shaman', 'Skald', 'Spiritmaster',
    'Thane', 'Valkyrie', 'Warlock', 'Warrior'
  ]
};

// Reverse mapping: class name -> realm
export const CLASS_TO_REALM: Record<string, string> = Object.entries(CLASSES_BY_REALM)
  .reduce((acc, [realm, classes]) => {
    classes.forEach(c => { acc[c] = realm; });
    return acc;
  }, {} as Record<string, string>);

export const BASE_STAT_CAPS: Record<string, number> = {
  strength: 75,
  constitution: 75,
  dexterity: 75,
  quickness: 75,
  intelligence: 75,
  piety: 75,
  empathy: 75,
  charisma: 75,
  acuity: 75,
  hitpoints: 200,
  power: 26,
};

// Maximum cap increase from items (CAP_STRENGTH, CAP_HITPOINTS, etc.)
export const MAX_CAP_BONUS: Record<string, number> = {
  strength: 26,
  constitution: 26,
  dexterity: 26,
  quickness: 26,
  intelligence: 26,
  piety: 26,
  empathy: 26,
  charisma: 26,
  acuity: 26,
  hitpoints: 200,
  power: 50,
};

// Maximum total stat (base + cap bonus)
export const MAX_STAT_CAPS: Record<string, number> = {
  strength: 101,     // 75 + 26
  constitution: 101,
  dexterity: 101,
  quickness: 101,
  intelligence: 101,
  piety: 101,
  empathy: 101,
  charisma: 101,
  acuity: 101,
  hitpoints: 400,    // 200 + 200
  power: 76,         // 26 + 50
};

export const RESIST_CAP = 26;
export const SKILL_CAP = 11;
export const AF_CAP = 50;
export const FATIGUE_CAP = 25;

// Bonus caps by tier
// 25% cap: Power pool, Debuff effectiveness, Buff effectiveness, Healing effectiveness, Spell duration
// 10% cap: Casting speed, Spell Range, Spell Damage, Style Damage, Melee Damage, Melee Combat Speed, Resist Pierce
export const BONUS_CAPS: Record<string, number> = {
  POWER_PERCENTAGE_BONUS: 25,
  REDUCE_MAGIC_RESISTS: 25,    // Debuff effectiveness
  HEALING_BONUS: 25,
  SPELL_DURATION_BONUS: 25,
  BUFF_EFFECTIVENESS: 25,
  CASTING_SPEED_BONUS: 10,
  SPELL_RANGE_BONUS: 10,
  SPELL_DAMAGE_BONUS: 10,
  STYLE_DAMAGE_BONUS: 10,
  MELEE_DAMAGE_BONUS: 10,
  MELEE_SPEED_BONUS: 10,
  RESIST_PIERCE: 10,
  AF_BONUS: 50,
  FATIGUE: 25,
  ALL_MELEE_BONUS: 11,        // Treated as skill-like
  ALL_MAGIC_BONUS: 11,
  ALL_ARCHERY_BONUS: 11,
  ALL_DUAL_WIELD_BONUS: 11,
  ALL_MAGIC_FOCUS: 50,
  ARCANE_SIPHON: 25,
};

export const ARMOR_SLOTS: SlotDefinition[] = [
  { id: 'head', name: 'Head', xmlPos: 'HELMETS' },
  { id: 'chest', name: 'Chest', xmlPos: 'CHEST' },
  { id: 'arms', name: 'Arms', xmlPos: 'BRACERS' },
  { id: 'hands', name: 'Hands', xmlPos: 'GLOVES' },
  { id: 'legs', name: 'Legs', xmlPos: 'LEGS' },
  { id: 'feet', name: 'Feet', xmlPos: 'SHOES' },
];

export const JEWELRY_SLOTS: SlotDefinition[] = [
  { id: 'necklace', name: 'Neck', xmlPos: 'NECKLACE' },
  { id: 'cloak', name: 'Cloak', xmlPos: 'CLOAK' },
  { id: 'belt', name: 'Belt', xmlPos: 'BELT' },
  { id: 'ring1', name: 'Ring L', xmlPos: 'RINGS' },
  { id: 'ring2', name: 'Ring R', xmlPos: 'RINGS' },
  { id: 'bracer1', name: 'Wrist L', xmlPos: 'BRACELETS' },
  { id: 'bracer2', name: 'Wrist R', xmlPos: 'BRACELETS' },
  { id: 'gem', name: 'Jewel', xmlPos: 'JEWEL' },
  { id: 'mythirian', name: 'Mythirian', xmlPos: 'MYTHIRIAN' },
];

export const WEAPON_SLOTS: SlotDefinition[] = [
  { id: 'mainHand', name: 'Right Hand', xmlPos: 'WEAPONS' },
  { id: 'offHand', name: 'Left Hand', xmlPos: 'WEAPONS' },
  { id: 'twoHand', name: 'Two-Handed', xmlPos: 'WEAPONS' },
  { id: 'ranged', name: 'Ranged', xmlPos: 'WEAPONS' },
];

export const ALL_SLOTS: SlotDefinition[] = [
  ...ARMOR_SLOTS,
  ...JEWELRY_SLOTS,
  ...WEAPON_SLOTS,
];

export const STAT_EFFECTS = [
  'STRENGTH', 'CONSTITUTION', 'DEXTERITY', 'QUICKNESS',
  'INTELLIGENCE', 'PIETY', 'EMPATHY', 'CHARISMA',
  'ACUITY', 'HITPOINTS', 'POWER'
] as const;

export const RESIST_EFFECTS = [
  'RES_CRUSH', 'RES_SLASH', 'RES_THRUST',
  'RES_HEAT', 'RES_COLD', 'RES_SPIRIT',
  'RES_BODY', 'RES_MATTER', 'RES_ENERGY'
] as const;

export const BONUS_EFFECTS = [
  'ALL_MELEE_BONUS', 'ALL_MAGIC_BONUS', 'ALL_ARCHERY_BONUS',
  'ALL_DUAL_WIELD_BONUS', 'MELEE_DAMAGE_BONUS', 'SPELL_DAMAGE_BONUS',
  'STYLE_DAMAGE_BONUS', 'MELEE_SPEED_BONUS', 'CASTING_SPEED_BONUS',
  'SPELL_RANGE_BONUS', 'HEALING_BONUS', 'POWER_PERCENTAGE_BONUS',
  'AF_BONUS', 'FATIGUE', 'SPELL_DURATION_BONUS',
  'REDUCE_MAGIC_RESISTS', 'ARCANE_SIPHON', 'ALL_MAGIC_FOCUS'
] as const;

export const CAP_EFFECTS = [
  'CAP_STRENGTH', 'CAP_DEXTERITY', 'CAP_CONSTITUTION',
  'CAP_QUICKNESS', 'CAP_HITPOINTS', 'CAP_ACUITY',
  'CAP_POWER', 'CAP_PIETY', 'CAP_INTELLIGENCE',
  'CAP_EMPATHY', 'CAP_CHARISMA'
] as const;

export const SKILL_EFFECTS = [
  'PARRY', 'SHIELD', 'STEALTH', 'ENVENOM',
  'CRITICAL_STRIKE', 'DUAL_WIELD', 'STAFF'
] as const;

export const EFFECT_DISPLAY_NAMES: Record<string, string> = {
  STRENGTH: 'Str', CONSTITUTION: 'Con', DEXTERITY: 'Dex', QUICKNESS: 'Qui',
  INTELLIGENCE: 'Int', PIETY: 'Pie', EMPATHY: 'Emp', CHARISMA: 'Cha',
  ACUITY: 'Acu', HITPOINTS: 'HP', POWER: 'Pow',
  RES_CRUSH: 'Crush', RES_SLASH: 'Slash', RES_THRUST: 'Thrust',
  RES_HEAT: 'Heat', RES_COLD: 'Cold', RES_SPIRIT: 'Spirit',
  RES_BODY: 'Body', RES_MATTER: 'Matter', RES_ENERGY: 'Energy',
  ALL_MELEE_BONUS: 'Melee', ALL_MAGIC_BONUS: 'Magic', ALL_ARCHERY_BONUS: 'Archery',
  ALL_DUAL_WIELD_BONUS: 'Dual Wield', MELEE_DAMAGE_BONUS: 'Melee Dmg',
  SPELL_DAMAGE_BONUS: 'Spell Dmg', STYLE_DAMAGE_BONUS: 'Style Dmg',
  MELEE_SPEED_BONUS: 'Melee Spd', CASTING_SPEED_BONUS: 'Cast Spd',
  SPELL_RANGE_BONUS: 'Spell Rng', HEALING_BONUS: 'Heal',
  POWER_PERCENTAGE_BONUS: 'Power%', AF_BONUS: 'AF', FATIGUE: 'End',
  SPELL_DURATION_BONUS: 'Duration', REDUCE_MAGIC_RESISTS: 'Debuff',
  ARCANE_SIPHON: 'Arc Siph', ALL_MAGIC_FOCUS: 'Focus',
  CAP_STRENGTH: 'Str Cap', CAP_DEXTERITY: 'Dex Cap', CAP_CONSTITUTION: 'Con Cap',
  CAP_QUICKNESS: 'Qui Cap', CAP_HITPOINTS: 'HP Cap', CAP_ACUITY: 'Acu Cap',
  CAP_POWER: 'Pow Cap', CAP_PIETY: 'Pie Cap', CAP_INTELLIGENCE: 'Int Cap',
  CAP_EMPATHY: 'Emp Cap', CAP_CHARISMA: 'Cha Cap',
  PARRY: 'Parry', SHIELD: 'Shield', STEALTH: 'Stealth', ENVENOM: 'Envenom',
  CRITICAL_STRIKE: 'Crit', DUAL_WIELD: 'DW', STAFF: 'Staff',
};

export const ARMOR_TYPES: ArmorType[] = [
  'CLOTH', 'LEATHER', 'STUDDED', 'REINFORCED',
  'CHAIN', 'SCALE', 'PLATE', 'MAGICAL'
];

// Weapon type classifications (includes all realm-specific names)
// Albion: TWO_HAND, POLEARM, STAFF | Hibernia: LARGE_WEAPON, SCYTHE, STAFF | Midgard: SWORD_2H, AXE_2H, HAMMER_2H, STAFF
export const TWO_HANDED_WEAPON_TYPES = [
  'TWO_HAND', 'POLEARM', 'STAFF', 'LARGE_WEAPONRY',
  'LARGE_WEAPON', 'SCYTHE',
  'SWORD_2H', 'AXE_2H', 'HAMMER_2H',
] as const;
export const SHIELD_WEAPON_TYPES = ['SHIELD_SMALL', 'SHIELD_MEDIUM', 'SHIELD_LARGE'] as const;
export const RANGED_WEAPON_TYPES = ['LONGBOW', 'CROSSBOW', 'SHORTBOW'] as const;
// Everything else in WEAPONS that isn't 2H, shield, or ranged is considered 1H

// Which armor types each class can wear (includes all lower tiers)
// Albion hierarchy: CLOTH < LEATHER < STUDDED < CHAIN < PLATE
// Hibernia hierarchy: CLOTH < LEATHER < REINFORCED < SCALE
// Midgard hierarchy: CLOTH < LEATHER < STUDDED < CHAIN
export const CLASS_ARMOR_TYPES: Record<string, ArmorType[]> = {
  // Albion
  Armsman:      ['CLOTH', 'LEATHER', 'STUDDED', 'CHAIN', 'PLATE'],
  Paladin:      ['CLOTH', 'LEATHER', 'STUDDED', 'CHAIN', 'PLATE'],
  Cleric:       ['CLOTH', 'LEATHER', 'STUDDED', 'CHAIN'],
  Reaver:       ['CLOTH', 'LEATHER', 'STUDDED', 'CHAIN'],
  Mercenary:    ['CLOTH', 'LEATHER', 'STUDDED', 'CHAIN'],
  Minstrel:     ['CLOTH', 'LEATHER', 'STUDDED', 'CHAIN'],
  Scout:        ['CLOTH', 'LEATHER', 'STUDDED'],
  Friar:        ['CLOTH', 'LEATHER'],
  Infiltrator:  ['CLOTH', 'LEATHER'],
  Heretic:      ['CLOTH', 'LEATHER'],
  Cabalist:     ['CLOTH'],
  Necromancer:  ['CLOTH'],
  Sorcerer:     ['CLOTH'],
  Theurgist:    ['CLOTH'],
  Wizard:       ['CLOTH'],
  // Hibernia
  Hero:         ['CLOTH', 'LEATHER', 'REINFORCED', 'SCALE'],
  Champion:     ['CLOTH', 'LEATHER', 'REINFORCED', 'SCALE'],
  Warden:       ['CLOTH', 'LEATHER', 'REINFORCED', 'SCALE'],
  Druid:        ['CLOTH', 'LEATHER', 'REINFORCED', 'SCALE'],
  Blademaster:  ['CLOTH', 'LEATHER', 'REINFORCED'],
  Bard:         ['CLOTH', 'LEATHER', 'REINFORCED'],
  Ranger:       ['CLOTH', 'LEATHER', 'REINFORCED'],
  Nightshade:   ['CLOTH', 'LEATHER'],
  Animist:      ['CLOTH'],
  Bainshee:     ['CLOTH'],
  Eldritch:     ['CLOTH'],
  Enchanter:    ['CLOTH'],
  Mentalist:    ['CLOTH'],
  Valewalker:   ['CLOTH'],
  // Midgard
  Warrior:      ['CLOTH', 'LEATHER', 'STUDDED', 'CHAIN'],
  Thane:        ['CLOTH', 'LEATHER', 'STUDDED', 'CHAIN'],
  Skald:        ['CLOTH', 'LEATHER', 'STUDDED', 'CHAIN'],
  Valkyrie:     ['CLOTH', 'LEATHER', 'STUDDED', 'CHAIN'],
  Healer:       ['CLOTH', 'LEATHER', 'STUDDED', 'CHAIN'],
  Shaman:       ['CLOTH', 'LEATHER', 'STUDDED', 'CHAIN'],
  Berserker:    ['CLOTH', 'LEATHER', 'STUDDED'],
  Savage:       ['CLOTH', 'LEATHER', 'STUDDED'],
  Hunter:       ['CLOTH', 'LEATHER', 'STUDDED'],
  Shadowblade:  ['CLOTH', 'LEATHER'],
  Bonedancer:   ['CLOTH'],
  Runemaster:   ['CLOTH'],
  Spiritmaster: ['CLOTH'],
  Warlock:      ['CLOTH'],
};

// Which weapon types each class can use (includes realm-specific XML names)
export const CLASS_WEAPON_TYPES: Record<string, string[]> = {
  // Albion
  Armsman:      ['SLASH', 'CRUSH', 'THRUST', 'TWO_HAND', 'POLEARM', 'CROSSBOW', 'SHIELD_SMALL', 'SHIELD_MEDIUM', 'SHIELD_LARGE'],
  Paladin:      ['SLASH', 'CRUSH', 'THRUST', 'TWO_HAND', 'SHIELD_SMALL', 'SHIELD_MEDIUM', 'SHIELD_LARGE'],
  Cleric:       ['CRUSH', 'STAFF', 'SHIELD_SMALL', 'SHIELD_MEDIUM'],
  Reaver:       ['SLASH', 'CRUSH', 'THRUST', 'FLEXIBLE', 'SHIELD_SMALL', 'SHIELD_MEDIUM'],
  Mercenary:    ['SLASH', 'CRUSH', 'THRUST', 'SLASH_LEFT', 'CRUSH_LEFT', 'THRUST_LEFT', 'SHIELD_SMALL'],
  Minstrel:     ['SLASH', 'THRUST', 'SHIELD_SMALL'],
  Scout:        ['SLASH', 'THRUST', 'LONGBOW', 'SHIELD_SMALL'],
  Friar:        ['CRUSH', 'STAFF'],
  Infiltrator:  ['SLASH', 'THRUST', 'SLASH_LEFT', 'THRUST_LEFT', 'CROSSBOW'],
  Heretic:      ['CRUSH', 'FLEXIBLE', 'SHIELD_SMALL'],
  Cabalist:     ['STAFF'],
  Necromancer:  ['STAFF'],
  Sorcerer:     ['STAFF'],
  Theurgist:    ['STAFF'],
  Wizard:       ['STAFF'],
  // Hibernia (BLADES=slash, BLUNT=crush, PIERCE=thrust, LARGE_WEAPON=2H)
  Hero:         ['BLADES', 'BLUNT', 'PIERCE', 'LARGE_WEAPON', 'SHORTBOW', 'SHIELD_SMALL', 'SHIELD_MEDIUM', 'SHIELD_LARGE'],
  Champion:     ['BLADES', 'BLUNT', 'PIERCE', 'LARGE_WEAPON', 'SHIELD_SMALL', 'SHIELD_MEDIUM'],
  Warden:       ['BLADES', 'BLUNT', 'SHIELD_SMALL', 'SHIELD_MEDIUM'],
  Druid:        ['BLADES', 'BLUNT', 'SHIELD_SMALL', 'SHIELD_MEDIUM'],
  Blademaster:  ['BLADES', 'BLUNT', 'PIERCE', 'SHIELD_SMALL'],
  Bard:         ['BLADES', 'BLUNT', 'SHIELD_SMALL'],
  Ranger:       ['BLADES', 'PIERCE', 'SHORTBOW', 'SHIELD_SMALL'],
  Nightshade:   ['BLADES', 'PIERCE'],
  Animist:      ['STAFF'],
  Bainshee:     ['STAFF'],
  Eldritch:     ['STAFF'],
  Enchanter:    ['STAFF'],
  Mentalist:    ['STAFF'],
  Valewalker:   ['SCYTHE', 'STAFF'],
  // Midgard (SWORD=slash, HAMMER=crush, AXE=slash, CLAWS=thrust)
  Warrior:      ['SWORD', 'AXE', 'HAMMER', 'SWORD_2H', 'AXE_2H', 'HAMMER_2H', 'SHIELD_SMALL', 'SHIELD_MEDIUM', 'SHIELD_LARGE'],
  Thane:        ['SWORD', 'AXE', 'HAMMER', 'SWORD_2H', 'AXE_2H', 'HAMMER_2H', 'SHIELD_SMALL', 'SHIELD_MEDIUM'],
  Skald:        ['SWORD', 'AXE', 'HAMMER', 'SWORD_2H', 'AXE_2H', 'HAMMER_2H'],
  Valkyrie:     ['SWORD', 'AXE', 'HAMMER', 'SWORD_2H', 'SHIELD_SMALL', 'SHIELD_MEDIUM'],
  Healer:       ['HAMMER', 'SWORD', 'SHIELD_SMALL', 'SHIELD_MEDIUM'],
  Shaman:       ['HAMMER', 'STAFF', 'SHIELD_SMALL'],
  Berserker:    ['SWORD', 'AXE', 'HAMMER', 'CLAWS', 'SWORD_2H', 'AXE_2H', 'HAMMER_2H'],
  Savage:       ['SWORD', 'AXE', 'HAMMER', 'CLAWS'],
  Hunter:       ['SWORD', 'CLAWS', 'SHORTBOW', 'SHIELD_SMALL'],
  Shadowblade:  ['SWORD', 'AXE', 'CLAWS'],
  Bonedancer:   ['STAFF'],
  Runemaster:   ['STAFF'],
  Spiritmaster: ['STAFF'],
  Warlock:      ['STAFF'],
};

// Weapon type groups for the slot filter dropdown
// matchBy: 'damage' checks item.damageType, 'weapon' checks item.weaponType
export interface WeaponTypeGroup {
  label: string;
  types: string[];
  matchBy: 'damage' | 'weapon';
}

export const WEAPON_TYPE_GROUPS: WeaponTypeGroup[] = [
  { label: 'Slash', types: ['SLASH'], matchBy: 'damage' },
  { label: 'Crush', types: ['CRUSH'], matchBy: 'damage' },
  { label: 'Thrust', types: ['THRUST', 'TRUST'], matchBy: 'damage' },
  { label: 'Two-Handed', types: [
    'TWO_HAND', 'POLEARM', 'STAFF', 'LARGE_WEAPONRY',
    'LARGE_WEAPON', 'SCYTHE',
    'SWORD_2H', 'AXE_2H', 'HAMMER_2H',
  ], matchBy: 'weapon' },
  { label: 'Flexible', types: ['FLEXIBLE'], matchBy: 'weapon' },
  { label: 'Shield', types: ['SHIELD_SMALL', 'SHIELD_MEDIUM', 'SHIELD_LARGE'], matchBy: 'weapon' },
  { label: 'Ranged', types: ['LONGBOW', 'CROSSBOW', 'SHORTBOW'], matchBy: 'weapon' },
];

export const XML_POS_TO_SLOTS: Record<string, string | string[]> = {
  CHEST: 'chest',
  LEGS: 'legs',
  HELMETS: 'head',
  GLOVES: 'hands',
  SHOES: 'feet',
  BRACERS: 'arms',
  CLOAK: 'cloak',
  BELT: 'belt',
  NECKLACE: 'necklace',
  JEWEL: 'gem',
  RINGS: ['ring1', 'ring2'],
  BRACELETS: ['bracer1', 'bracer2'],
  WEAPONS: ['mainHand', 'offHand', 'twoHand', 'ranged'],
  MYTHIRIAN: 'mythirian',
};

// Display name mappings for slot categories
export const ARMOR_SLOT_DISPLAY: Record<string, string> = {
  HELMETS: 'Head', CHEST: 'Chest', BRACERS: 'Arms', GLOVES: 'Hands',
  LEGS: 'Legs', SHOES: 'Feet',
};

export const WEAPON_TYPE_DISPLAY: Record<string, string> = {
  // Albion 1H
  SLASH: 'Slash', SLASH_LEFT: 'Slash', CRUSH: 'Crush', CRUSH_LEFT: 'Crush',
  THRUST: 'Thrust', THRUST_LEFT: 'Thrust',
  // Hibernia 1H
  BLADES: 'Blades', BLUNT: 'Blunt', PIERCE: 'Pierce',
  // Midgard 1H
  SWORD: 'Sword', AXE: 'Axe', HAMMER: 'Hammer', CLAWS: 'Claws',
  // 2H (all realms)
  TWO_HAND: '2H', POLEARM: 'Polearm', LARGE_WEAPONRY: 'Large',
  LARGE_WEAPON: 'Large', SCYTHE: 'Scythe',
  SWORD_2H: 'Sword 2H', AXE_2H: 'Axe 2H', HAMMER_2H: 'Hammer 2H',
  STAFF: 'Staff', FLEXIBLE: 'Flex',
  // Shield
  SHIELD_SMALL: 'Shield S', SHIELD_MEDIUM: 'Shield M', SHIELD_LARGE: 'Shield L',
  // Ranged
  LONGBOW: 'Longbow', CROSSBOW: 'Xbow', SHORTBOW: 'Shortbow',
};

export const JEWELRY_DISPLAY: Record<string, string> = {
  NECKLACE: 'Neck', CLOAK: 'Cloak', BELT: 'Belt', RINGS: 'Ring',
  BRACELETS: 'Wrist', JEWEL: 'Jewel', MYTHIRIAN: 'Myth',
};

export function getSlotDisplay(item: { position: string; weaponType?: string }): string {
  if (ARMOR_SLOT_DISPLAY[item.position]) {
    return `A - ${ARMOR_SLOT_DISPLAY[item.position]}`;
  }
  if (item.position === 'WEAPONS') {
    const wt = item.weaponType ? WEAPON_TYPE_DISPLAY[item.weaponType] || item.weaponType : '?';
    return `W - ${wt}`;
  }
  if (JEWELRY_DISPLAY[item.position]) {
    return `J - ${JEWELRY_DISPLAY[item.position]}`;
  }
  return item.position;
}

// Equipment grid layout definitions
export const EQUIP_TOP_ROW = [
  { id: 'mythirian', name: 'MYTHICAL' },
  { id: 'necklace', name: 'NECK' },
  { id: 'cloak', name: 'CLOAK' },
] as const;

export const EQUIP_LEFT_COL = [
  { id: 'chest', name: 'BODY' },
  { id: 'arms', name: 'ARMS' },
  { id: 'gem', name: 'JEWEL' },
  { id: 'ring1', name: 'L RING' },
  { id: 'bracer1', name: 'L WRIST' },
  { id: 'legs', name: 'LEGS' },
] as const;

export const EQUIP_RIGHT_COL = [
  { id: 'head', name: 'HEAD' },
  { id: 'hands', name: 'HANDS' },
  { id: 'belt', name: 'WAIST' },
  { id: 'ring2', name: 'R RING' },
  { id: 'bracer2', name: 'R WRIST' },
  { id: 'feet', name: 'FEET' },
] as const;

export const EQUIP_WEAPONS = [
  { id: 'mainHand', name: 'R HAND' },
  { id: 'offHand', name: 'L HAND' },
  { id: 'twoHand', name: '2 HAND' },
  { id: 'ranged', name: 'RANGED' },
] as const;

// ---- Realm Colors ----

export const REALM_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  Albion:   { border: 'border-l-red-500/60',   bg: 'bg-red-950/20',   text: 'text-red-400' },
  Hibernia: { border: 'border-l-green-500/60', bg: 'bg-green-950/20', text: 'text-green-400' },
  Midgard:  { border: 'border-l-blue-500/60',  bg: 'bg-blue-950/20',  text: 'text-blue-400' },
};

export function getRealmColors(realm: string | null | undefined) {
  return realm && REALM_COLORS[realm] ? REALM_COLORS[realm] : null;
}

// ---- Zenkcraft Slot Mappings (single source of truth) ----

export const ZENKCRAFT_SLOT_NAMES: { slotId: SlotId; zcName: string }[] = [
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

export const ZENKCRAFT_NAME_TO_SLOT: Record<string, SlotId> = Object.fromEntries(
  ZENKCRAFT_SLOT_NAMES.map(s => [s.zcName, s.slotId])
) as Record<string, SlotId>;

// ---- Effect Full Names (ID <-> display name, single source of truth) ----

export const EFFECT_FULL_NAMES: Record<string, string> = {
  // Stats
  STRENGTH: 'Strength', CONSTITUTION: 'Constitution', DEXTERITY: 'Dexterity',
  QUICKNESS: 'Quickness', INTELLIGENCE: 'Intelligence', PIETY: 'Piety',
  EMPATHY: 'Empathy', CHARISMA: 'Charisma', ACUITY: 'Acuity',
  HITPOINTS: 'Hit Points', POWER: 'Power',
  // Resists
  RES_CRUSH: 'Crush', RES_SLASH: 'Slash', RES_THRUST: 'Thrust',
  RES_HEAT: 'Heat', RES_COLD: 'Cold', RES_SPIRIT: 'Spirit',
  RES_BODY: 'Body', RES_MATTER: 'Matter', RES_ENERGY: 'Energy',
  // Bonuses
  MELEE_DAMAGE_BONUS: 'Melee Damage', SPELL_DAMAGE_BONUS: 'Spell Damage',
  STYLE_DAMAGE_BONUS: 'Style Damage', MELEE_SPEED_BONUS: 'Melee Speed',
  CASTING_SPEED_BONUS: 'Casting Speed', SPELL_RANGE_BONUS: 'Spell Range',
  HEALING_BONUS: 'Healing Effectiveness', POWER_PERCENTAGE_BONUS: 'Power Pool',
  AF_BONUS: 'Armor Factor', FATIGUE: 'Fatigue',
  SPELL_DURATION_BONUS: 'Spell Duration', REDUCE_MAGIC_RESISTS: 'Resist Pierce',
  ARCANE_SIPHON: 'Arcane Siphon', ALL_MAGIC_FOCUS: 'All Focus',
  ALL_MELEE_BONUS: 'All Melee', ALL_MAGIC_BONUS: 'All Magic',
  ALL_ARCHERY_BONUS: 'All Archery', ALL_DUAL_WIELD_BONUS: 'All Dual Wield',
  BUFF_EFFECTIVENESS: 'Buff Effectiveness',
};

export const FULL_NAME_TO_EFFECT: Record<string, string> = Object.fromEntries(
  Object.entries(EFFECT_FULL_NAMES).map(([id, name]) => [name, id])
);

// Zenkcraft-specific aliases (multiple display names mapping to the same ID)
export const ZENKCRAFT_ALIASES: Record<string, string> = {
  'Healing': 'HEALING_BONUS',
  'Power Percentage': 'POWER_PERCENTAGE_BONUS',
  'AF': 'AF_BONUS',
  'Endurance': 'FATIGUE',
  'Debuff Effectiveness': 'REDUCE_MAGIC_RESISTS',
  'Magic Focus': 'ALL_MAGIC_FOCUS',
};
