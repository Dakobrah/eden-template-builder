// Types for DAoC Template Builder

export type Realm = 'Albion' | 'Hibernia' | 'Midgard';

export type AlbionClass = 
  | 'Armsman' | 'Cabalist' | 'Cleric' | 'Friar' | 'Heretic' 
  | 'Infiltrator' | 'Mercenary' | 'Minstrel' | 'Necromancer' 
  | 'Paladin' | 'Reaver' | 'Scout' | 'Sorcerer' | 'Theurgist' | 'Wizard';

export type HiberniaClass = 
  | 'Animist' | 'Bainshee' | 'Bard' | 'Blademaster' | 'Champion' 
  | 'Druid' | 'Eldritch' | 'Enchanter' | 'Hero' | 'Mentalist' 
  | 'Nightshade' | 'Ranger' | 'Valewalker' | 'Warden';

export type MidgardClass = 
  | 'Berserker' | 'Bonedancer' | 'Healer' | 'Hunter' | 'Runemaster' 
  | 'Savage' | 'Shadowblade' | 'Shaman' | 'Skald' | 'Spiritmaster' 
  | 'Thane' | 'Valkyrie' | 'Warlock' | 'Warrior';

export type CharacterClass = AlbionClass | HiberniaClass | MidgardClass;

export type ArmorSlot = 'head' | 'chest' | 'arms' | 'hands' | 'legs' | 'feet';

export type JewelrySlot = 
  | 'necklace' | 'cloak' | 'belt' 
  | 'ring1' | 'ring2' 
  | 'bracer1' | 'bracer2' 
  | 'gem' | 'mythirian';

export type WeaponSlot = 'mainHand' | 'offHand' | 'twoHand' | 'ranged';

export type SlotId = ArmorSlot | JewelrySlot | WeaponSlot;

export type XmlPosition = 
  | 'CHEST' | 'LEGS' | 'HELMETS' | 'GLOVES' | 'SHOES' | 'BRACERS'
  | 'CLOAK' | 'BELT' | 'NECKLACE' | 'JEWEL' | 'RINGS' | 'BRACELETS'
  | 'WEAPONS' | 'MYTHIRIAN';

export type ArmorType = 
  | 'CLOTH' | 'LEATHER' | 'STUDDED' | 'REINFORCED' 
  | 'CHAIN' | 'SCALE' | 'PLATE' | 'MAGICAL';

export type WeaponType = 
  | 'SLASH' | 'SLASH_LEFT' | 'THRUST' | 'THRUST_LEFT' 
  | 'CRUSH' | 'CRUSH_LEFT' | 'TWO_HAND' | 'POLEARM' 
  | 'STAFF' | 'FLEXIBLE' | 'LONGBOW' | 'CROSSBOW' | 'SHORTBOW'
  | 'SHIELD_SMALL' | 'SHIELD_MEDIUM' | 'SHIELD_LARGE';

export type DamageType = 'SLASH' | 'CRUSH' | 'THRUST' | 'TRUST';

export type StatEffect = 
  | 'STRENGTH' | 'CONSTITUTION' | 'DEXTERITY' | 'QUICKNESS'
  | 'INTELLIGENCE' | 'PIETY' | 'EMPATHY' | 'CHARISMA'
  | 'ACUITY' | 'HITPOINTS' | 'POWER';

export type ResistEffect = 
  | 'RES_CRUSH' | 'RES_SLASH' | 'RES_THRUST'
  | 'RES_HEAT' | 'RES_COLD' | 'RES_SPIRIT'
  | 'RES_BODY' | 'RES_MATTER' | 'RES_ENERGY';

export type BonusEffect = 
  | 'ALL_MELEE_BONUS' | 'ALL_MAGIC_BONUS' | 'ALL_ARCHERY_BONUS'
  | 'ALL_DUAL_WIELD_BONUS' | 'MELEE_DAMAGE_BONUS' | 'SPELL_DAMAGE_BONUS'
  | 'STYLE_DAMAGE_BONUS' | 'MELEE_SPEED_BONUS' | 'CASTING_SPEED_BONUS'
  | 'SPELL_RANGE_BONUS' | 'HEALING_BONUS' | 'POWER_PERCENTAGE_BONUS'
  | 'AF_BONUS' | 'FATIGUE' | 'SPELL_DURATION_BONUS'
  | 'REDUCE_MAGIC_RESISTS' | 'ARCANE_SIPHON' | 'ALL_MAGIC_FOCUS';

export type CapEffect = 
  | 'CAP_STRENGTH' | 'CAP_DEXTERITY' | 'CAP_CONSTITUTION'
  | 'CAP_QUICKNESS' | 'CAP_HITPOINTS' | 'CAP_ACUITY'
  | 'CAP_POWER' | 'CAP_PIETY' | 'CAP_INTELLIGENCE'
  | 'CAP_EMPATHY' | 'CAP_CHARISMA';

export type SkillEffect = 
  | 'PARRY' | 'SHIELD' | 'STEALTH' | 'ENVENOM'
  | 'CRITICAL_STRIKE' | 'DUAL_WIELD' | 'STAFF'
  | string;

export type EffectId = StatEffect | ResistEffect | BonusEffect | CapEffect | SkillEffect;

export type EffectCategory = 'stat' | 'resist' | 'bonus' | 'cap' | 'skill' | 'other';

export interface ItemEffects {
  [key: string]: number;
}

export interface ItemProc {
  name: string;
  type: string;
  attributes: Record<string, string>;
  source: 'proc' | 'use' | 'reactive' | 'passive';
}

export interface Item {
  id: string;
  name: string;
  position: XmlPosition;
  realm: Realm | null;
  level: number;
  quality: number;
  armorType?: ArmorType | null;
  armorAF?: number | null;
  weaponType?: WeaponType;
  damageType?: DamageType;
  effects: ItemEffects;
  classRestrictions: string[];
  procs?: ItemProc[];
  origin?: string;
  onlineUrl?: string;
}

export interface TemplateSlots {
  [key: string]: Item | null;
}

export interface Template {
  id: string;
  name: string;
  realm: Realm;
  characterClass: CharacterClass;
  level: number;
  slots: TemplateSlots;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface StatValue {
  value: number;
  cap: number;
  baseCap: number;
  capBonus: number;
  raw: number;
  overcap: number;
}

export interface ResistValue {
  value: number;
  cap: number;
  raw: number;
  overcap: number;
}

export interface CalculatedStats {
  stats: Record<string, StatValue>;
  resists: Record<string, ResistValue>;
  bonuses: Record<string, number>;
  caps: Record<string, number>;
  skills: Record<string, number>;
  utility: number;
}

export interface SlotDefinition {
  id: SlotId;
  name: string;
  xmlPos: XmlPosition;
}

export interface SlotCategory {
  title: string;
  slots: SlotDefinition[];
  icon: string;
}

export interface AppState {
  templates: Template[];
  items: Item[];
  currentTemplate: Template | null;
  loading: boolean;
}

export interface ItemFilters {
  search: string;
  armorType: ArmorType | '';
  classRestriction: string;
  realm: Realm | '';
  slot: SlotId | '';
}
