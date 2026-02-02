import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Item } from '@/types';
import { parseNdjson } from '@/lib/ndjsonParser';
import { useLocalStorage } from './useLocalStorage';

// Cache for parsed NDJSON items (loaded once)
let itemsCache: Item[] | null = null;

async function fetchItems(): Promise<Item[]> {
  if (itemsCache) return itemsCache;
  const response = await fetch('/items/eden_items.ndjson');
  if (!response.ok) return [];
  const text = await response.text();
  itemsCache = text ? parseNdjson(text) : [];
  return itemsCache;
}

/** Hook that manages item database loading, owned items, and the combined items list. */
export function useItems() {
  const [dbItems, setDbItems] = useState<Item[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [ownedItems, setOwnedItems] = useLocalStorage<Item[]>('ownedItems', []);

  useEffect(() => {
    let cancelled = false;
    fetchItems()
      .then(items => {
        if (cancelled) return;
        setDbItems(items);
        setDbLoading(false);
      })
      .catch(() => { if (!cancelled) setDbLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const combinedItems = useMemo(() => {
    const map = new Map<string, Item>();
    [...dbItems, ...ownedItems].forEach(i => map.set(i.id, i));
    return Array.from(map.values());
  }, [dbItems, ownedItems]);

  // Collect all known effect IDs from loaded items for autocomplete
  const allEffectIds = useMemo(() => {
    const ids = new Set<string>();
    dbItems.forEach(item => {
      Object.keys(item.effects || {}).forEach(k => ids.add(k));
    });
    return Array.from(ids).sort();
  }, [dbItems]);

  const toggleOwned = useCallback((item: Item) => {
    setOwnedItems(prev => {
      const exists = prev.some(o => o.id === item.id);
      if (exists) return prev.filter(o => o.id !== item.id);
      return [...prev, item];
    });
  }, [setOwnedItems]);

  return { dbItems, dbLoading, ownedItems, combinedItems, allEffectIds, toggleOwned };
}
