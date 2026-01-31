import { describe, it, expect } from 'vitest';
import { parseItemsXml } from '../itemParser';

describe('parseItemsXml', () => {
  it('parses a simple weapon item', () => {
    const xml = `<?xml version="1.0"?>
      <items>
        <item>
          <name>Simple Sword</name>
          <position>WEAPONS</position>
          <realm>Albion</realm>
          <level>50</level>
          <quality>100</quality>
          <weapon damage="SLASH">SLASH</weapon>
          <effect id="MELEE_DAMAGE_BONUS">5</effect>
          <class_restriction>Armsman</class_restriction>
        </item>
      </items>`;

    const items = parseItemsXml(xml);
    expect(items.length).toBe(1);
    const item = items[0];
    expect(item.name).toBe('Simple Sword');
    expect(item.position).toBe('WEAPONS');
    expect(item.realm).toBe('Albion');
    expect(item.level).toBe(50);
    expect(item.weaponType).toBe('SLASH');
    expect(item.damageType).toBe('SLASH');
    expect(item.effects.MELEE_DAMAGE_BONUS).toBe(5);
    expect(item.classRestrictions).toContain('Armsman');
  });

  it('parses an armor item', () => {
    const xml = `<?xml version="1.0"?>
      <items>
        <item>
          <name>Chain Helm</name>
          <position>HELMETS</position>
          <realm>Albion</realm>
          <level>50</level>
          <quality>100</quality>
          <armor af="50">CHAIN</armor>
          <effect id="STRENGTH">15</effect>
          <effect id="CONSTITUTION">10</effect>
        </item>
      </items>`;

    const items = parseItemsXml(xml);
    expect(items.length).toBe(1);
    const item = items[0];
    expect(item.name).toBe('Chain Helm');
    expect(item.position).toBe('HELMETS');
    expect(item.armorType).toBe('CHAIN');
    expect(item.armorAF).toBe(50);
    expect(item.effects.STRENGTH).toBe(15);
    expect(item.effects.CONSTITUTION).toBe(10);
  });

  it('parses multiple items', () => {
    const xml = `<?xml version="1.0"?>
      <items>
        <item>
          <name>Item A</name>
          <position>CHEST</position>
          <level>50</level>
          <effect id="STRENGTH">10</effect>
        </item>
        <item>
          <name>Item B</name>
          <position>LEGS</position>
          <level>50</level>
          <effect id="DEXTERITY">5</effect>
        </item>
      </items>`;

    const items = parseItemsXml(xml);
    expect(items.length).toBe(2);
    expect(items[0].name).toBe('Item A');
    expect(items[1].name).toBe('Item B');
  });

  it('parses jewelry with multiple effects', () => {
    const xml = `<?xml version="1.0"?>
      <items>
        <item>
          <name>Ring of Power</name>
          <position>RINGS</position>
          <level>50</level>
          <quality>100</quality>
          <effect id="HITPOINTS">40</effect>
          <effect id="POWER">6</effect>
          <effect id="RES_HEAT">5</effect>
          <effect id="ALL_MELEE_BONUS">3</effect>
        </item>
      </items>`;

    const items = parseItemsXml(xml);
    expect(items.length).toBe(1);
    const item = items[0];
    expect(item.position).toBe('RINGS');
    expect(item.effects.HITPOINTS).toBe(40);
    expect(item.effects.POWER).toBe(6);
    expect(item.effects.RES_HEAT).toBe(5);
    expect(item.effects.ALL_MELEE_BONUS).toBe(3);
  });

  it('handles items with multiple class restrictions', () => {
    const xml = `<?xml version="1.0"?>
      <items>
        <item>
          <name>Shared Cloak</name>
          <position>CLOAK</position>
          <level>50</level>
          <class_restriction>Armsman</class_restriction>
          <class_restriction>Paladin</class_restriction>
          <class_restriction>Mercenary</class_restriction>
          <effect id="CONSTITUTION">10</effect>
        </item>
      </items>`;

    const items = parseItemsXml(xml);
    expect(items.length).toBe(1);
    expect(items[0].classRestrictions).toEqual(['Armsman', 'Paladin', 'Mercenary']);
  });

  it('skips items without a name', () => {
    const xml = `<?xml version="1.0"?>
      <items>
        <item>
          <position>CHEST</position>
          <level>50</level>
        </item>
        <item>
          <name>Valid Item</name>
          <position>CHEST</position>
          <level>50</level>
        </item>
      </items>`;

    const items = parseItemsXml(xml);
    expect(items.length).toBe(1);
    expect(items[0].name).toBe('Valid Item');
  });

  it('skips items without a position', () => {
    const xml = `<?xml version="1.0"?>
      <items>
        <item>
          <name>No Position</name>
          <level>50</level>
        </item>
      </items>`;

    const items = parseItemsXml(xml);
    expect(items.length).toBe(0);
  });

  it('returns empty array for invalid XML', () => {
    const items = parseItemsXml('not xml at all');
    expect(items).toEqual([]);
  });

  it('returns empty array for XML with no items', () => {
    const xml = `<?xml version="1.0"?><items></items>`;
    const items = parseItemsXml(xml);
    expect(items).toEqual([]);
  });

  it('defaults level to 51 when not specified', () => {
    const xml = `<?xml version="1.0"?>
      <items>
        <item>
          <name>No Level</name>
          <position>CHEST</position>
        </item>
      </items>`;

    const items = parseItemsXml(xml);
    expect(items[0].level).toBe(51);
  });

  it('ignores effects with zero value', () => {
    const xml = `<?xml version="1.0"?>
      <items>
        <item>
          <name>Zero Effect</name>
          <position>CHEST</position>
          <level>50</level>
          <effect id="STRENGTH">0</effect>
          <effect id="DEXTERITY">10</effect>
        </item>
      </items>`;

    const items = parseItemsXml(xml);
    expect(items[0].effects.STRENGTH).toBeUndefined();
    expect(items[0].effects.DEXTERITY).toBe(10);
  });
});
