import type { Item } from '@/types';

export const SAMPLE_ITEMS: Item[] = [
  {
    id: 'sample_1',
    name: 'Albion Trainer Helm',
    position: 'HELMETS',
    realm: 'Albion',
    level: 50,
    quality: 100,
    armorType: 'PLATE',
    armorAF: 10,
    effects: { STRENGTH: 10, RES_SLASH: 4 },
    classRestrictions: [],
    origin: 'Crafted',
  },
  {
    id: 'sample_2',
    name: 'Hibernia Cloak of Warding',
    position: 'CLOAK',
    realm: 'Hibernia',
    level: 50,
    quality: 100,
    armorType: 'MAGICAL',
    armorAF: 5,
    effects: { RES_HEAT: 6, INTELLIGENCE: 4 },
    classRestrictions: [],
    origin: 'Quest',
  }
];
