import { describe, it, expect } from 'vitest';
import { parseItemsXml } from '../itemParser';

describe('parseItemsXml', () => {
  it('parses a simple XML item', () => {
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
    const it = items[0];
    expect(it.name).toBe('Simple Sword');
    expect(it.position).toBe('WEAPONS');
    expect(it.level).toBe(50);
    expect(it.effects.MELEE_DAMAGE_BONUS).toBe(5);
  });
});
