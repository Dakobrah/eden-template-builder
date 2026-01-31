import type { Item, Realm, XmlPosition, ArmorType, WeaponType, DamageType } from '@/types';
import { DOMParser as XmldomParser } from '@xmldom/xmldom';

// interface ParsedEffect {
//   id: string;
//   value: number;
// }

// interface ParsedItem {
//   name: string;
//   position: XmlPosition;
//   realm: Realm | null;
//   level: number;
//   quality: number;
//   armorType: ArmorType | null;
//   armorAF: number | null;
//   weaponType: WeaponType | null;
//   damageType: DamageType | null;
//   effects: ParsedEffect[];
//   classRestrictions: string[];
//   origin: string;
//   onlineUrl: string;
// }

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

  (rawItems as Element[]).forEach((itemEl: Element, index: number) => {
    try {
      const item = parseItemElement(itemEl, index);
      if (item) items.push(item);
    } catch (error) {
      console.warn(`Failed to parse item at index ${index}:`, error);
    }
  });
  return items;
}

function parseItemElement(itemEl: any, index: number): Item | null {
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
  return {
    id: `item_${index}_${Date.now()}`,
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

export async function loadItemsFromUrl(url: string): Promise<Item[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
    const xmlText = await response.text();
    return parseItemsXml(xmlText);
  } catch (error) {
    console.error(`Error loading items from ${url}:`, error);
    return [];
  }
}

export async function loadAllItems(urls: string[]): Promise<Item[]> {
  const allItems: Item[] = [];
  for (const url of urls) {
    const items = await loadItemsFromUrl(url);
    allItems.push(...items);
  }
  const seen = new Set<string>();
  return allItems.filter(item => {
    const key = `${item.name}_${item.position}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const DEFAULT_XML_PATHS = [
  '/data/items_alb.xml',
  '/data/items_hib.xml',
  '/data/items_mid.xml',
];
