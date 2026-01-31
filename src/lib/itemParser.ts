import type { Item, Realm, XmlPosition, ArmorType, WeaponType, DamageType } from '@/types';
import { DOMParser as XmldomParser } from '@xmldom/xmldom';

export function parseItemsXml(xmlString: string): Item[] {
  const items: Item[] = [];
  const ParserCtor: any = (typeof DOMParser !== 'undefined') ? DOMParser : XmldomParser;
  const parser = new ParserCtor();
  const doc: any = parser.parseFromString(xmlString, 'text/xml');
  const parseError = typeof doc.querySelector === 'function'
    ? doc.querySelector('parsererror')
    : (doc.getElementsByTagName ? doc.getElementsByTagName('parsererror')[0] : null);
  if (parseError) {
    console.error('XML Parse Error:', parseError.textContent);
    return [];
  }
  const rawItems = typeof doc.querySelectorAll === 'function'
    ? Array.from(doc.querySelectorAll('item'))
    : Array.from(doc.getElementsByTagName ? doc.getElementsByTagName('item') : []);

  (rawItems as Element[]).forEach((itemEl: Element) => {
    try {
      const item = parseItemElement(itemEl);
      if (item) items.push(item);
    } catch (error) {
      console.warn('Failed to parse item:', error);
    }
  });
  return items;
}

function parseItemElement(itemEl: any): Item | null {
  const name = getElementText(itemEl, 'name');
  if (!name) return null;
  const position = getElementText(itemEl, 'position') as XmlPosition;
  if (!position) return null;
  const realm = getElementText(itemEl, 'realm') as Realm | null;
  const level = parseInt(getElementText(itemEl, 'level') || '51', 10);
  const quality = parseInt(getElementText(itemEl, 'quality') || '100', 10);
  const armorEl = getChildElement(itemEl, 'armor');
  const armorType = armorEl?.textContent?.trim() as ArmorType | null;
  const armorAF = armorEl ? parseInt(armorEl.getAttribute('af') || '0', 10) : null;
  const weaponEl = getChildElement(itemEl, 'weapon');
  const weaponType = weaponEl?.textContent?.trim() as WeaponType | null;
  const damageType = weaponEl?.getAttribute('damage') as DamageType | null;
  const effects: Record<string, number> = {};
  getChildElements(itemEl, 'effect').forEach((effectEl: any) => {
    const id = effectEl.getAttribute('id');
    const value = parseInt(effectEl.textContent || '0', 10);
    if (id && value) {
      effects[id] = value;
    }
  });
  const classRestrictions: string[] = [];
  getChildElements(itemEl, 'class_restriction').forEach((classEl: any) => {
    const className = classEl.textContent?.trim();
    if (className && !className.match(/^\d+$/)) {
      classRestrictions.push(className);
    }
  });
  const origin = getElementText(itemEl, 'origin') || '';
  const onlineUrl = getElementText(itemEl, 'online_url') || '';
  // Deterministic ID based on item properties for stable references across re-parses
  const id = `${(realm || 'any').toLowerCase()}_${position.toLowerCase()}_${name.replace(/\s+/g, '_').toLowerCase()}`;
  return {
    id,
    name,
    position,
    realm,
    level,
    quality,
    armorType,
    armorAF,
    weaponType: weaponType || undefined,
    damageType: damageType || undefined,
    effects,
    classRestrictions,
    origin: cleanOrigin(origin),
    onlineUrl,
  };
}

function getChildElement(parent: any, tagName: string): Element | null {
  if (!parent) return null;
  if (typeof parent.querySelector === 'function') return parent.querySelector(tagName);
  const els = parent.getElementsByTagName ? parent.getElementsByTagName(tagName) : null;
  return els && els.length ? els[0] : null;
}

function getChildElements(parent: any, tagName: string): Element[] {
  if (!parent) return [];
  if (typeof parent.querySelectorAll === 'function') return Array.from(parent.querySelectorAll(tagName));
  return parent.getElementsByTagName ? Array.from(parent.getElementsByTagName(tagName)) : [];
}

function getElementText(parent: any, tagName: string): string | null {
  if (!parent) return null;
  if (typeof parent.querySelector === 'function') {
    const el = parent.querySelector(tagName);
    return el?.textContent?.trim() || null;
  }
  const els = parent.getElementsByTagName ? parent.getElementsByTagName(tagName) : null;
  if (els && els.length > 0) return els[0].textContent?.trim() || null;
  return null;
}

function cleanOrigin(origin: string): string {
  return origin
    .replace(/Merchants:\s*/gi, '')
    .replace(/Mobs:\s*;[\d;]+/gi, '')
    .replace(/Quest:\s*;[\d;]+/gi, 'Quest')
    .replace(/\s+/g, ' ')
    .trim();
}

