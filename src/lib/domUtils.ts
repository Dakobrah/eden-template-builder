/** Cross-platform DOM helper for querying XML elements. */
export function getChildElement(parent: any, tagName: string): Element | null {
  if (!parent) return null;
  if (typeof parent.querySelector === 'function') return parent.querySelector(tagName);
  const els = parent.getElementsByTagName ? parent.getElementsByTagName(tagName) : null;
  return els && els.length ? els[0] : null;
}

/** Return all child elements matching the tag name. */
export function getChildElements(parent: any, tagName: string): Element[] {
  if (!parent) return [];
  if (typeof parent.querySelectorAll === 'function') return Array.from(parent.querySelectorAll(tagName));
  return parent.getElementsByTagName ? Array.from(parent.getElementsByTagName(tagName)) : [];
}

/** Return the trimmed text content of the first matching child element. */
export function getElementText(parent: any, tagName: string): string | null {
  if (!parent) return null;
  if (typeof parent.querySelector === 'function') {
    const el = parent.querySelector(tagName);
    return el?.textContent?.trim() || null;
  }
  const els = parent.getElementsByTagName ? parent.getElementsByTagName(tagName) : null;
  if (els && els.length > 0) return els[0].textContent?.trim() || null;
  return null;
}
