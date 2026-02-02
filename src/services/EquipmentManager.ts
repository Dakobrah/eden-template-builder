import type { Template, Item, SlotId } from '@/types';
import { XML_POS_TO_SLOTS, TWO_HANDED_WEAPON_TYPES, SHIELD_WEAPON_TYPES, RANGED_WEAPON_TYPES } from '@/lib/constants';

/** Manages equipment slot logic: weapon categorization, slot assignment, and equip/unequip rules. */
export class EquipmentManager {
  /** Determine weapon category from an item's weapon type. */
  static getWeaponCategory(item: Item): 'twoHand' | 'shield' | 'ranged' | 'oneHand' {
    const wt = item.weaponType || '';
    if ((TWO_HANDED_WEAPON_TYPES as readonly string[]).includes(wt)) return 'twoHand';
    if ((SHIELD_WEAPON_TYPES as readonly string[]).includes(wt)) return 'shield';
    if ((RANGED_WEAPON_TYPES as readonly string[]).includes(wt)) return 'ranged';
    return 'oneHand';
  }

  /** Find the best compatible slot for an item given the current template state. */
  static findCompatibleSlot(item: Item, template: Template): SlotId | null {
    const slots = XML_POS_TO_SLOTS[item.position];
    if (!slots) return null;
    if (typeof slots === 'string') return slots as SlotId;

    // Smart weapon slot assignment
    if (item.position === 'WEAPONS') {
      const cat = EquipmentManager.getWeaponCategory(item);
      if (cat === 'twoHand') return 'twoHand' as SlotId;
      if (cat === 'ranged') return 'ranged' as SlotId;
      if (cat === 'shield') return 'offHand' as SlotId;
      if (!template.slots['mainHand']) return 'mainHand' as SlotId;
      return 'offHand' as SlotId;
    }

    const emptySlot = (slots as string[]).find(s => !template.slots[s as SlotId]);
    return (emptySlot || slots[0]) as SlotId;
  }

  /**
   * Equip an item to a slot, returning a new template with weapon conflict rules applied.
   * Returns a new Template object (immutable pattern).
   */
  static equipItem(template: Template, slotId: SlotId, item: Item | null): Template {
    const next = { ...template, slots: { ...template.slots } };
    next.slots[slotId] = item || null;

    // Weapon combination rules
    if (item && item.position === 'WEAPONS') {
      if (slotId === 'twoHand') {
        next.slots['mainHand'] = null;
        next.slots['offHand'] = null;
      } else if (slotId === 'mainHand' || slotId === 'offHand') {
        next.slots['twoHand'] = null;
      }
    }

    next.updatedAt = new Date().toISOString();
    return next;
  }

  /** Unequip a slot, returning a new template. */
  static unequipSlot(template: Template, slotId: SlotId): Template {
    return EquipmentManager.equipItem(template, slotId, null);
  }

  /** Create a fresh empty template. */
  static createEmptyTemplate(): Template {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    return {
      id,
      name: 'New Template',
      realm: 'Albion',
      characterClass: 'Armsman',
      level: 50,
      slots: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
