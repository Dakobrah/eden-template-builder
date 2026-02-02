import type { Item } from '@/types';
import { WEAPON_TYPE_GROUPS, CLASS_ARMOR_TYPES, CLASS_WEAPON_TYPES } from '@/lib/constants';

export interface StatFilter {
  stat: string;
  minValue: number;
}

export interface ItemFilterCriteria {
  realm: string;
  slot: string;
  characterClass: string;
  searchTerm: string;
  ownedOnly: boolean;
  ownedIds: Set<string>;
  statFilters: StatFilter[];
}

/** Filters items based on multi-criteria pipeline: realm, slot, class, stats, search, ownership. */
export class ItemFilterService {
  /** Apply all filters in sequence. */
  static filter(items: Item[], criteria: ItemFilterCriteria): Item[] {
    let result = items;
    result = ItemFilterService.filterByRealm(result, criteria.realm);
    result = ItemFilterService.filterBySlot(result, criteria.slot);
    result = ItemFilterService.filterByClass(result, criteria.characterClass);
    result = ItemFilterService.filterByStats(result, criteria.statFilters);
    result = ItemFilterService.filterBySearch(result, criteria.searchTerm);
    if (criteria.ownedOnly) {
      result = ItemFilterService.filterByOwned(result, criteria.ownedIds);
    }
    return result;
  }

  static filterByRealm(items: Item[], realm: string): Item[] {
    if (!realm) return items;
    if (realm === 'Any') return items.filter(it => !it.realm);
    return items.filter(it => it.realm === realm || !it.realm);
  }

  static filterBySlot(items: Item[], slot: string): Item[] {
    if (!slot) return items;
    if (slot.startsWith('WT_')) {
      const wtKey = slot.slice(3);
      const group = WEAPON_TYPE_GROUPS.find(g => g.types[0] === wtKey);
      if (group) {
        return items.filter(it => {
          if (it.position !== 'WEAPONS') return false;
          const field = group.matchBy === 'damage' ? (it.damageType || '') : (it.weaponType || '');
          return group.types.includes(field);
        });
      }
    }
    return items.filter(it => it.position === slot);
  }

  static filterByClass(items: Item[], characterClass: string): Item[] {
    if (!characterClass) return items;
    const allowedArmor = CLASS_ARMOR_TYPES[characterClass];
    const allowedWeapons = CLASS_WEAPON_TYPES[characterClass];
    return items.filter(it => {
      if (it.classRestrictions && it.classRestrictions.length > 0) {
        if (!it.classRestrictions.includes(characterClass)) return false;
      }
      if (it.armorType && allowedArmor) {
        if (!allowedArmor.includes(it.armorType)) return false;
      }
      if (it.weaponType && allowedWeapons) {
        if (!allowedWeapons.includes(it.weaponType)) return false;
      }
      return true;
    });
  }

  static filterByStats(items: Item[], statFilters: StatFilter[]): Item[] {
    if (statFilters.length === 0) return items;
    let result = items;
    for (const sf of statFilters) {
      result = result.filter(it => {
        const val = (it.effects || {})[sf.stat];
        return val !== undefined && val >= sf.minValue;
      });
    }
    return result;
  }

  static filterBySearch(items: Item[], searchTerm: string): Item[] {
    if (!searchTerm) return items;
    const q = searchTerm.toLowerCase();
    return items.filter(it => it.name.toLowerCase().includes(q));
  }

  static filterByOwned(items: Item[], ownedIds: Set<string>): Item[] {
    return items.filter(it => ownedIds.has(it.id));
  }

  /** Get classes for dropdown grouped by realm, optionally filtered to a single realm. */
  static getClassesForRealm(filterRealm: string, classesByRealm: Record<string, string[]>): string[] {
    const realmOrder = ['Albion', 'Hibernia', 'Midgard'];
    if (filterRealm && filterRealm !== 'Any' && classesByRealm[filterRealm]) {
      return [...classesByRealm[filterRealm]].sort();
    }
    return realmOrder.flatMap(r => [...(classesByRealm[r] || [])].sort());
  }
}
