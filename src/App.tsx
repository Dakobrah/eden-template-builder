import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import type { Template, Item, SlotId } from '@/types';
import { calculateStats, generateTemplateReport, calculateItemUtility } from './lib/statsCalculator';
import { parseNdjson } from './lib/ndjsonParser';
import { parseZenkraftTemplate, exportZenkraftTemplate } from './lib/zenkcraft';
import { XML_POS_TO_SLOTS, TWO_HANDED_WEAPON_TYPES, SHIELD_WEAPON_TYPES, RANGED_WEAPON_TYPES, CLASS_ARMOR_TYPES, CLASS_WEAPON_TYPES, CLASSES_BY_REALM, CLASS_TO_REALM, BONUS_CAPS, SKILL_CAP, WEAPON_TYPE_GROUPS, getSlotDisplay, EQUIP_TOP_ROW, EQUIP_LEFT_COL, EQUIP_RIGHT_COL, EQUIP_WEAPONS } from './lib/constants';

// Realm color tinting utilities
const REALM_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  Albion:   { border: 'border-l-red-500/60',   bg: 'bg-red-950/20',   text: 'text-red-400' },
  Hibernia: { border: 'border-l-green-500/60', bg: 'bg-green-950/20', text: 'text-green-400' },
  Midgard:  { border: 'border-l-blue-500/60',  bg: 'bg-blue-950/20',  text: 'text-blue-400' },
};
const getRealmColors = (realm: string | null | undefined) => realm && REALM_COLORS[realm] ? REALM_COLORS[realm] : null;

const generateId = () => `${Date.now()}_${Math.random().toString(36).slice(2,9)}`;

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

interface StatFilter {
  stat: string;
  minValue: number;
}

// Column definitions for item table
interface ColumnDef {
  id: string;
  label: string;
  width: string;
  getValue: (item: Item, utility: number) => string | number;
  getSortValue: (item: Item, utility: number) => string | number;
  align?: 'left' | 'center' | 'right';
}

const AVAILABLE_COLUMNS: ColumnDef[] = [
  { id: 'name', label: 'Name', width: '1fr', align: 'left',
    getValue: (it) => it.name, getSortValue: (it) => it.name.toLowerCase() },
  { id: 'slot', label: 'Slot', width: '90px', align: 'center',
    getValue: (it) => getSlotDisplay(it), getSortValue: (it) => getSlotDisplay(it) },
  { id: 'level', label: 'Lvl', width: '40px', align: 'center',
    getValue: (it) => it.level || 50, getSortValue: (it) => it.level || 50 },
  { id: 'utility', label: 'Util', width: '50px', align: 'center',
    getValue: (_, u) => u, getSortValue: (_, u) => u },
];

const createEmptyTemplate = (): Template => ({
  id: generateId(),
  name: 'New Template',
  realm: 'Albion',
  characterClass: 'Armsman',
  level: 50,
  slots: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export default function App() {
  const [dbItems, setDbItems] = useState<Item[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [ownedItems, setOwnedItems] = useState<Item[]>(() => {
    try {
      const raw = localStorage.getItem('ownedItems');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [template, setTemplate] = useState<Template>(() => {
    try {
      const raw = localStorage.getItem('currentTemplate');
      if (raw) return JSON.parse(raw) as Template;
    } catch { /* ignored */ }
    return createEmptyTemplate();
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [templates, setTemplates] = useState<Template[]>(() => {
    try { const raw = localStorage.getItem('templates'); return raw ? JSON.parse(raw) : []; } catch { return []; }
  });

  // hover card state
  const [hoverItem, setHoverItem] = useState<{ item: Item; x: number; y: number } | null>(null);

  // Filter and pagination state
  const [filterRealm, setFilterRealm] = useState<string>('');
  const [filterSlot, setFilterSlot] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('');
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [statFilters, setStatFilters] = useState<StatFilter[]>([]);
  const [statInput, setStatInput] = useState('');
  const [showStatSuggestions, setShowStatSuggestions] = useState(false);
  const statInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Sorting
  const [sortColumn, setSortColumn] = useState<string>('utility');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Load item database once on mount
  useEffect(() => {
    let cancelled = false;
    setDbLoading(true);
    fetchItems()
      .then(items => {
        if (cancelled) return;
        setDbItems(items);
        setDbLoading(false);
      })
      .catch(() => { if (!cancelled) setDbLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Collect all known effect IDs from loaded items for autocomplete
  const allEffectIds = useMemo(() => {
    const ids = new Set<string>();
    dbItems.forEach(item => {
      Object.keys(item.effects || {}).forEach(k => ids.add(k));
    });
    return Array.from(ids).sort();
  }, [dbItems]);

  // Get classes for dropdown grouped by realm order (Alb, Hib, Mid), alphabetical within each
  const allClasses = useMemo(() => {
    const realmOrder = ['Albion', 'Hibernia', 'Midgard'];
    if (filterRealm && filterRealm !== 'Any' && CLASSES_BY_REALM[filterRealm]) {
      return [...CLASSES_BY_REALM[filterRealm]].sort();
    }
    // All realms: grouped by realm order, sorted alphabetically within each
    return realmOrder.flatMap(r => [...(CLASSES_BY_REALM[r] || [])].sort());
  }, [filterRealm]);

  // Determine weapon category from item
  const getWeaponCategory = useCallback((item: Item): 'twoHand' | 'shield' | 'ranged' | 'oneHand' => {
    const wt = item.weaponType || '';
    if ((TWO_HANDED_WEAPON_TYPES as readonly string[]).includes(wt)) return 'twoHand';
    if ((SHIELD_WEAPON_TYPES as readonly string[]).includes(wt)) return 'shield';
    if ((RANGED_WEAPON_TYPES as readonly string[]).includes(wt)) return 'ranged';
    return 'oneHand';
  }, []);

  const equipToSlot = useCallback((slotId: SlotId, item: Item | null) => {
    const next = { ...template, slots: { ...template.slots } };
    next.slots[slotId] = item || null;

    // Weapon combination rules
    if (item && item.position === 'WEAPONS') {
      if (slotId === 'twoHand') {
        // 2H clears mainHand and offHand
        next.slots['mainHand'] = null;
        next.slots['offHand'] = null;
      } else if (slotId === 'mainHand' || slotId === 'offHand') {
        // 1H or shield clears twoHand
        next.slots['twoHand'] = null;
      }
      // Ranged is independent, no conflicts
    }

    next.updatedAt = new Date().toISOString();
    setTemplate(next);
  }, [template]);

  const unequip = useCallback((slotId: SlotId) => {
    equipToSlot(slotId, null);
  }, [equipToSlot]);

  const calculated = useMemo(() => calculateStats(template), [template]);

  // Persist template and owned items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('currentTemplate', JSON.stringify(template));
    } catch { /* ignored */ }
  }, [template]);

  useEffect(() => {
    try {
      localStorage.setItem('ownedItems', JSON.stringify(ownedItems));
    } catch { /* ignored */ }
  }, [ownedItems]);


  const combinedItems = useMemo(() => {
    const map = new Map<string, Item>();
    [...dbItems, ...ownedItems].forEach(i => map.set(i.id, i));
    return Array.from(map.values());
  }, [dbItems, ownedItems]);

  const filteredItems = useMemo(() => {
    let result = combinedItems;

    // Realm filtering
    if (filterRealm === 'Any') {
      result = result.filter(it => !it.realm);
    } else if (filterRealm) {
      result = result.filter(it => it.realm === filterRealm || !it.realm);
    }

    // Filter by slot/position (supports WT_ prefix for weapon type filtering)
    if (filterSlot) {
      if (filterSlot.startsWith('WT_')) {
        const wtKey = filterSlot.slice(3);
        const group = WEAPON_TYPE_GROUPS.find(g => g.types[0] === wtKey);
        if (group) {
          result = result.filter(it => {
            if (it.position !== 'WEAPONS') return false;
            const field = group.matchBy === 'damage' ? (it.damageType || '') : (it.weaponType || '');
            return group.types.includes(field);
          });
        }
      } else {
        result = result.filter(it => it.position === filterSlot);
      }
    }

    // Filter by class restriction + armor/weapon type compatibility
    if (filterClass) {
      const allowedArmor = CLASS_ARMOR_TYPES[filterClass];
      const allowedWeapons = CLASS_WEAPON_TYPES[filterClass];
      result = result.filter(it => {
        // Check explicit class restrictions first
        if (it.classRestrictions && it.classRestrictions.length > 0) {
          if (!it.classRestrictions.includes(filterClass)) return false;
        }
        // Filter armor items by wearable armor types
        if (it.armorType && allowedArmor) {
          if (!allowedArmor.includes(it.armorType)) return false;
        }
        // Filter weapon items by usable weapon types
        if (it.weaponType && allowedWeapons) {
          if (!allowedWeapons.includes(it.weaponType)) return false;
        }
        return true;
      });
    }

    // Filter by stat filters (stacking)
    for (const sf of statFilters) {
      result = result.filter(it => {
        const val = (it.effects || {})[sf.stat];
        return val !== undefined && val >= sf.minValue;
      });
    }

    // Filter by search term
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(it => it.name.toLowerCase().includes(q));
    }

    // Filter to owned items only
    if (ownedOnly) {
      const ownedIds = new Set(ownedItems.map(o => o.id));
      result = result.filter(it => ownedIds.has(it.id));
    }

    return result;
  }, [combinedItems, searchTerm, filterRealm, filterSlot, filterClass, statFilters, ownedOnly, ownedItems]);

  // Sort filtered items
  const sortedItems = useMemo(() => {
    const colDef = AVAILABLE_COLUMNS.find(c => c.id === sortColumn);
    if (!colDef) return filteredItems;
    const sorted = [...filteredItems].sort((a, b) => {
      const aUtil = calculateItemUtility(a);
      const bUtil = calculateItemUtility(b);
      const aVal = colDef.getSortValue(a, aUtil);
      const bVal = colDef.getSortValue(b, bUtil);
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
    return sorted;
  }, [filteredItems, sortColumn, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / itemsPerPage));

  // Clamp currentPage when filtered results shrink below the current page
  const effectivePage = Math.min(currentPage, totalPages);

  // Paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (effectivePage - 1) * itemsPerPage;
    return sortedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedItems, effectivePage, itemsPerPage]);


  // Toggle owned status for an item
  const toggleOwned = useCallback((item: Item) => {
    setOwnedItems(prev => {
      const exists = prev.some(o => o.id === item.id);
      if (exists) return prev.filter(o => o.id !== item.id);
      return [...prev, item];
    });
  }, []);

  // Template persistence and management
  useEffect(() => { try { localStorage.setItem('templates', JSON.stringify(templates)); } catch { /* ignored */ } }, [templates]);

  const saveCurrentTemplate = (name?: string) => {
    const tpl = { ...template };
    if (name) tpl.name = name;
    setTemplates(prev => {
      const idx = prev.findIndex(p => p.id === tpl.id);
      if (idx >= 0) {
        const copy = [...prev]; copy[idx] = tpl; return copy;
      }
      return [...prev, tpl];
    });
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(p => p.id !== id));
  };

  const exportTemplatesJson = () => {
    const blob = new Blob([JSON.stringify(templates, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'templates.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  const importTemplatesJson = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    try {
      const text = await files[0].text();
      const parsed = JSON.parse(text) as Template[];
      setTemplates(prev => {
        const map = new Map(prev.map(t => [t.id, t]));
        parsed.forEach(p => map.set(p.id || `tpl_${Math.random().toString(36).slice(2,8)}`, p));
        return Array.from(map.values());
      });
    } catch (e) { console.error('Failed importing templates', e); }
  };

  // Share code: encode/decode template to URL-safe base64
  const encodeTemplateToShare = (tpl: Template) => {
    try {
      const json = JSON.stringify(tpl);
      const utf = encodeURIComponent(json);
      const b64 = btoa(utf);
      return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch { return ''; }
  };

  const decodeShareToTemplate = (code: string): Template | null => {
    try {
      const pad = code.length % 4 ? '='.repeat(4 - (code.length % 4)) : '';
      const b64 = code.replace(/-/g, '+').replace(/_/g, '/') + pad;
      const utf = atob(b64);
      const json = decodeURIComponent(utf);
      return JSON.parse(json) as Template;
    } catch { return null; }
  };

  const importFromShareCodePrompt = async () => {
    const code = window.prompt('Paste share code:');
    if (!code) return;
    const tpl = decodeShareToTemplate(code.trim());
    if (tpl) setTemplate(tpl);
    else alert('Invalid share code');
  };

  const importZenkraftFile = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    try {
      const text = await files[0].text();
      const result = parseZenkraftTemplate(text);
      if (!result) {
        alert('Failed to parse Zenkraft template');
        return;
      }
      setTemplate(prev => ({
        ...prev,
        name: result.name,
        characterClass: result.characterClass as Template['characterClass'],
        realm: result.realm as Template['realm'],
        level: result.level,
        slots: { ...result.items },
        updatedAt: new Date().toISOString(),
      }));
    } catch (e) {
      console.error('Failed importing Zenkraft template', e);
      alert('Failed to parse Zenkraft template file');
    }
  };

  const exportZenkraftFile = () => {
    const text = exportZenkraftTemplate(template, calculated);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '_')}_zenkraft.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const copyShareCode = async (tpl: Template) => {
    const code = encodeTemplateToShare(tpl);
    if (!code) return;
    await navigator.clipboard.writeText(code);
    alert('Share code copied to clipboard');
  };

  const renderSlot = (slotId: string, slotName: string, dimmed = false) => {
    const equipped = template.slots[slotId as SlotId];
    const erc = equipped ? getRealmColors(equipped.realm) : null;
    return (
      <div key={slotId} className={`relative border rounded p-2.5 group min-h-[52px] ${dimmed ? 'opacity-40' : ''} ${erc ? `${erc.bg} ${erc.border} border-l-[3px]` : 'bg-gray-800 border-gray-700'}`}>
        <div className="text-[10px] font-bold text-gray-400 mb-1.5 leading-tight">{slotName}</div>
        <div className="text-xs text-gray-300 line-clamp-2 leading-tight pr-5" title={equipped?.name}>{equipped?.name || 'Empty'}</div>
        {equipped && (
          <button
            className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-600 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-red-700"
            onClick={(e) => { e.stopPropagation(); unequip(slotId as SlotId); }}
            title="Unequip"
          >x</button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">DAoC Template Builder (Prototype)</h1>
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => setTemplate(createEmptyTemplate())}
            className="px-3 py-1 bg-blue-600 rounded"
          >New Template</button>
          <button
            onClick={() => navigator.clipboard.writeText(generateTemplateReport(template, calculated))}
            className="px-3 py-1 bg-green-600 rounded"
          >Copy Report</button>

          <input
            className="ml-auto px-2 py-1 bg-gray-800 border rounded w-64"
            placeholder="Search items..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Items List - Full Width */}
        <div className="p-4 bg-gray-800 rounded mb-4">
          <h2 className="font-semibold mb-3">Items ({dbLoading ? 'Loading...' : `${filteredItems.length} total`})</h2>

            {/* Filters */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Realm</label>
                <select
                  className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm"
                  value={filterRealm}
                  onChange={(e) => {
                    const newRealm = e.target.value;
                    setFilterRealm(newRealm);
                    // Clear class filter if it doesn't belong to the new realm
                    if (filterClass && newRealm && newRealm !== 'Any' && CLASS_TO_REALM[filterClass] !== newRealm) {
                      setFilterClass('');
                    }
                  }}
                >
                  <option value="">All Realms</option>
                  <option value="Albion" style={{ color: '#f87171' }}>Albion</option>
                  <option value="Hibernia" style={{ color: '#4ade80' }}>Hibernia</option>
                  <option value="Midgard" style={{ color: '#60a5fa' }}>Midgard</option>
                  <option value="Any">Any/Neutral</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Slot</label>
                <select
                  className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm"
                  value={filterSlot}
                  onChange={(e) => setFilterSlot(e.target.value)}
                >
                  <option value="">All Slots</option>
                  <optgroup label="Armor">
                    <option value="HELMETS">Head</option>
                    <option value="CHEST">Chest</option>
                    <option value="BRACERS">Arms</option>
                    <option value="GLOVES">Hands</option>
                    <option value="LEGS">Legs</option>
                    <option value="SHOES">Feet</option>
                  </optgroup>
                  <optgroup label="Jewelry">
                    <option value="NECKLACE">Neck</option>
                    <option value="CLOAK">Cloak</option>
                    <option value="BELT">Belt</option>
                    <option value="RINGS">Rings</option>
                    <option value="BRACELETS">Wrist</option>
                    <option value="JEWEL">Jewel</option>
                    <option value="MYTHIRIAN">Mythirian</option>
                  </optgroup>
                  <optgroup label="Weapons">
                    <option value="WEAPONS">All Weapons</option>
                    {WEAPON_TYPE_GROUPS.map(g => (
                      <option key={g.label} value={`WT_${g.types[0]}`}>{g.label}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Class</label>
                <select
                  className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm"
                  value={filterClass}
                  onChange={(e) => {
                    const cls = e.target.value;
                    setFilterClass(cls);
                    if (cls) {
                      const realm = CLASS_TO_REALM[cls];
                      setTemplate(t => ({
                        ...t,
                        characterClass: cls as Template['characterClass'],
                        realm: (realm as Template['realm']) || t.realm,
                        updatedAt: new Date().toISOString(),
                      }));
                      // Also set realm filter to match
                      if (CLASS_TO_REALM[cls] && filterRealm !== CLASS_TO_REALM[cls]) {
                        setFilterRealm(CLASS_TO_REALM[cls]);
                      }
                    }
                  }}
                >
                  <option value="">All Classes</option>
                  {(!filterRealm || filterRealm === 'Any') ? (
                    ['Albion', 'Hibernia', 'Midgard'].map(realm => {
                      const color = realm === 'Albion' ? '#f87171' : realm === 'Hibernia' ? '#4ade80' : '#60a5fa';
                      return (
                        <optgroup key={realm} label={realm} style={{ color }}>
                          {(CLASSES_BY_REALM[realm] || []).slice().sort().map(cls => (
                            <option key={cls} value={cls} style={{ color }}>{cls}</option>
                          ))}
                        </optgroup>
                      );
                    })
                  ) : (
                    allClasses.map(cls => {
                      const clsRealm = CLASS_TO_REALM[cls];
                      const color = clsRealm === 'Albion' ? '#f87171' : clsRealm === 'Hibernia' ? '#4ade80' : clsRealm === 'Midgard' ? '#60a5fa' : undefined;
                      return (
                        <option key={cls} value={cls} style={color ? { color } : undefined}>{cls}</option>
                      );
                    })
                  )}
                </select>
              </div>
            </div>

            {/* Stat Filter Builder */}
            <div className="mb-3">
              <label className="text-xs text-gray-400 block mb-1">Stat Filters</label>
              <div className="relative">
                <input
                  ref={statInputRef}
                  type="text"
                  className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm"
                  placeholder="Type a stat name to filter (e.g. STRENGTH, RES_CRUSH)..."
                  value={statInput}
                  onChange={(e) => { setStatInput(e.target.value); setShowStatSuggestions(true); }}
                  onFocus={() => setShowStatSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowStatSuggestions(false), 200)}
                />
                {showStatSuggestions && statInput.length > 0 && (() => {
                  const query = statInput.toUpperCase();
                  const matches = allEffectIds.filter(id =>
                    id.toUpperCase().includes(query) &&
                    !statFilters.some(sf => sf.stat === id)
                  ).slice(0, 10);
                  if (matches.length === 0) return null;
                  return (
                    <div className="absolute z-50 top-full left-0 right-0 bg-gray-900 border border-gray-600 rounded mt-1 max-h-48 overflow-auto">
                      {matches.map(id => (
                        <button
                          key={id}
                          className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-700 text-gray-200"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setStatFilters(prev => [...prev, { stat: id, minValue: 1 }]);
                            setStatInput('');
                            setShowStatSuggestions(false);
                          }}
                        >{id.replace(/_/g, ' ')}</button>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Active stat filters */}
              {statFilters.length > 0 && (
                <div className="mt-2 space-y-2">
                  {statFilters.map((sf, idx) => (
                    <div key={sf.stat} className="flex items-center gap-2 bg-gray-900 p-2 rounded">
                      <span className="text-xs text-gray-300 min-w-[120px]">{sf.stat.replace(/_/g, ' ')}</span>
                      <span className="text-xs text-gray-500">min:</span>
                      <input
                        type="range"
                        min={1}
                        max={100}
                        value={sf.minValue}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setStatFilters(prev => prev.map((f, i) => i === idx ? { ...f, minValue: val } : f));
                        }}
                        className="flex-1 h-2 accent-blue-500"
                      />
                      <span className="text-xs text-blue-400 min-w-[24px] text-right">{sf.minValue}</span>
                      <button
                        className="w-5 h-5 bg-red-600 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-700"
                        onClick={() => setStatFilters(prev => prev.filter((_, i) => i !== idx))}
                        title="Remove filter"
                      >x</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Owned Only + Clear Filters */}
            <div className="flex items-center gap-3 mb-2">
              <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={ownedOnly}
                  onChange={(e) => setOwnedOnly(e.target.checked)}
                  className="accent-yellow-500"
                />
                Owned Only ({ownedItems.length})
              </label>
              {(filterRealm || filterSlot || filterClass || statFilters.length > 0) && (
                <button
                  className="px-2 py-1 bg-red-600 rounded text-xs"
                  onClick={() => {
                    setFilterRealm('');
                    setFilterSlot('');
                    setFilterClass('');
                    setStatFilters([]);
                  }}
                >Clear Filters</button>
              )}
            </div>

            <div className="max-h-96 overflow-auto">
              {/* Table Header */}
              <div
                className="grid gap-2 p-2 bg-gray-700 sticky top-0 z-10 text-xs font-semibold"
                style={{ gridTemplateColumns: AVAILABLE_COLUMNS.map(c => c.width).join(' ') + ' 80px' }}
              >
                {AVAILABLE_COLUMNS.map(col => {
                  const isSorted = sortColumn === col.id;
                  const arrow = isSorted ? (sortDirection === 'asc' ? ' ^' : ' v') : '';
                  return (
                    <div
                      key={col.id}
                      className={`cursor-pointer select-none hover:text-blue-300 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''} ${isSorted ? 'text-blue-400' : ''}`}
                      onClick={() => {
                        if (sortColumn === col.id) {
                          setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortColumn(col.id);
                          setSortDirection(col.id === 'name' ? 'asc' : 'desc');
                        }
                      }}
                    >{col.label}{arrow}</div>
                  );
                })}
                <div className="text-center">Equip</div>
              </div>

              {/* Table Rows */}
              {paginatedItems.map(it => {
                const itemUtility = calculateItemUtility(it);
                // Find a compatible slot for this item
                const compatibleSlot = (() => {
                  const slots = XML_POS_TO_SLOTS[it.position];
                  if (!slots) return null;
                  if (typeof slots === 'string') return slots as SlotId;

                  // Smart weapon slot assignment
                  if (it.position === 'WEAPONS') {
                    const cat = getWeaponCategory(it);
                    if (cat === 'twoHand') return 'twoHand' as SlotId;
                    if (cat === 'ranged') return 'ranged' as SlotId;
                    if (cat === 'shield') return 'offHand' as SlotId;
                    if (!template.slots['mainHand']) return 'mainHand' as SlotId;
                    return 'offHand' as SlotId;
                  }

                  const emptySlot = (slots as string[]).find(s => !template.slots[s as SlotId]);
                  return (emptySlot || slots[0]) as SlotId;
                })();

                const rc = getRealmColors(it.realm);
                return (
                  <div
                    key={it.id}
                    className={`grid gap-2 p-2 rounded my-1 items-center hover:brightness-110 border-l-[3px] ${rc ? `${rc.bg} ${rc.border}` : 'bg-gray-900 border-l-gray-700'}`}
                    style={{ gridTemplateColumns: AVAILABLE_COLUMNS.map(c => c.width).join(' ') + ' 80px' }}
                    onMouseEnter={(e) => setHoverItem({ item: it, x: e.clientX, y: e.clientY })}
                    onMouseMove={(e) => setHoverItem(prev => prev && prev.item.id === it.id ? { ...prev, x: e.clientX, y: e.clientY } : prev)}
                    onMouseLeave={() => setHoverItem(null)}
                  >
                    {AVAILABLE_COLUMNS.map(col => {
                      const val = col.getValue(it, itemUtility);
                      if (col.id === 'name') {
                        return (
                          <div key={col.id} className="min-w-0">
                            <div className="font-medium text-sm truncate">{it.name}</div>
                          </div>
                        );
                      }
                      if (col.id === 'utility') {
                        return <div key={col.id} className="text-center text-sm text-blue-400">{val}</div>;
                      }
                      return (
                        <div key={col.id} className={`text-sm ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''}`}>{val}</div>
                      );
                    })}
                    <div className="flex justify-center gap-1">
                      <button
                        className={`w-6 h-6 rounded text-xs flex items-center justify-center ${ownedItems.some(o => o.id === it.id) ? 'text-yellow-400 bg-yellow-900/40' : 'text-gray-500 bg-gray-700 hover:text-yellow-300'}`}
                        onClick={() => toggleOwned(it)}
                        title={ownedItems.some(o => o.id === it.id) ? 'Remove from owned' : 'Mark as owned'}
                      >*</button>
                      <button
                        className="px-2 py-1 bg-indigo-600 rounded text-xs hover:bg-indigo-700"
                        onClick={() => {
                          if (compatibleSlot) {
                            equipToSlot(compatibleSlot, it);
                          }
                        }}
                      >Equip</button>
                    </div>
                  </div>
                );
              })}

              {/* Hover Card - Rendered outside the grid */}
              {hoverItem && (() => {
                const hrc = getRealmColors(hoverItem.item.realm);
                return (
                <div
                  className={`hover-card ${hrc ? `border-l-[3px] ${hrc.border}` : ''}`}
                  style={{ left: hoverItem.x + 12, top: hoverItem.y + 12 }}
                >
                  <div className="text-sm font-semibold">{hoverItem.item.name}</div>
                  <div className={`text-xs ${hrc ? hrc.text : 'text-gray-400'}`}>{hoverItem.item.position} • {hoverItem.item.realm || 'Any'}</div>
                  <div className="mt-2 text-xs text-gray-200">
                    {Object.entries(hoverItem.item.effects || {}).length === 0 ? (
                      <div className="text-gray-400">No effects</div>
                    ) : (
                      <div className="space-y-1">
                        {Object.entries(hoverItem.item.effects).map(([k,v]) => (
                          <div key={k} className="flex justify-between text-xs">
                            <div>{k}</div>
                            <div className="text-right">{v as number}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                );
              })()}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-3 flex items-center justify-between">
                <button
                  className="px-3 py-1 bg-gray-700 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={effectivePage === 1}
                >Previous</button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    const showPage = page === 1 || page === totalPages ||
                                    (page >= effectivePage - 1 && page <= effectivePage + 1);
                    const showEllipsis = (page === effectivePage - 2 && effectivePage > 3) ||
                                        (page === effectivePage + 2 && effectivePage < totalPages - 2);

                    if (showEllipsis) return <span key={page} className="px-2">...</span>;
                    if (!showPage) return null;

                    return (
                      <button
                        key={page}
                        className={`px-2 py-1 rounded text-sm ${
                          page === effectivePage
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >{page}</button>
                    );
                  })}
                </div>

                <button
                  className="px-3 py-1 bg-gray-700 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={effectivePage === totalPages}
                >Next</button>
              </div>
            )}
          </div>

        {/* Template Management & Equipment - Bottom Section */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Left: Equipment Layout */}
          <div className="p-4 bg-gray-800 rounded">
            <h2 className="font-semibold mb-2">Equipment</h2>
            <div className="mb-2 text-sm">Name: {template.name}</div>
            <div className="mb-3 text-sm">Class: {template.characterClass} ({template.realm})</div>

            {/* Equipment Grid */}
            <div className="relative bg-gray-900 p-4 rounded-lg space-y-3" onMouseEnter={() => setHoverItem(null)}>
              {/* Top Row - Mythirian, Neck, Cloak */}
              <div className="grid grid-cols-3 gap-3">
                {EQUIP_TOP_ROW.map(s => renderSlot(s.id, s.name))}
              </div>

              {/* Middle - Left and Right armor columns */}
              <div className="grid grid-cols-2 gap-3">
                {/* Left Column */}
                <div className="flex flex-col gap-2.5">
                  {EQUIP_LEFT_COL.map(s => renderSlot(s.id, s.name))}
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-2.5">
                  {EQUIP_RIGHT_COL.map(s => renderSlot(s.id, s.name))}
                </div>
              </div>

              {/* Bottom Row - Weapons */}
              <div className="grid grid-cols-4 gap-3">
                {(() => {
                  const has2H = !!template.slots['twoHand'];
                  const has1H = !!template.slots['mainHand'] || !!template.slots['offHand'];
                  return EQUIP_WEAPONS.map(s => {
                    const dimmed = (has2H && (s.id === 'mainHand' || s.id === 'offHand'))
                      || (has1H && s.id === 'twoHand');
                    return renderSlot(s.id, s.name, dimmed);
                  });
                })()}
              </div>
            </div>
          </div>

          {/* Right: Stats Calculator & Template Management */}
          <div className="p-4 bg-gray-800 rounded">
            <h2 className="font-semibold mb-3">Stats Calculator</h2>

            {/* Total Utility */}
            <div className="mb-4 p-3 bg-blue-900 rounded">
              <div className="text-lg font-bold text-blue-200">Total Utility: {calculated.utility}</div>
            </div>

            {/* Stats & Resists side by side */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Stats Column */}
              <div>
                <h3 className="text-sm font-semibold mb-2 text-gray-300">Stats</h3>
                <div className="space-y-1.5">
                  {(['STRENGTH', 'CONSTITUTION', 'DEXTERITY', 'QUICKNESS', 'INTELLIGENCE', 'EMPATHY', 'PIETY', 'CHARISMA', 'ACUITY', 'HITPOINTS', 'POWER'] as const).map(stat => {
                    const data = calculated.stats[stat];
                    if (!data) return null;
                    const label = { STRENGTH: 'STR', CONSTITUTION: 'CON', DEXTERITY: 'DEX', QUICKNESS: 'QUI', INTELLIGENCE: 'INT', EMPATHY: 'EMP', PIETY: 'PIE', CHARISMA: 'CHA', ACUITY: 'ACU', HITPOINTS: 'HP', POWER: 'POW' }[stat];
                    return (
                      <div key={stat} className="bg-gray-900 p-1.5 rounded text-xs flex justify-between items-center">
                        <span className="font-semibold text-gray-400">{label}</span>
                        <span className={data.value >= data.cap ? 'text-green-400' : 'text-yellow-400'}>
                          {data.value}/{data.cap}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resists Column */}
              <div>
                <h3 className="text-sm font-semibold mb-2 text-gray-300">Resists</h3>
                <div className="space-y-1.5">
                  {(['RES_THRUST', 'RES_CRUSH', 'RES_SLASH', 'RES_HEAT', 'RES_COLD', 'RES_MATTER', 'RES_ENERGY', 'RES_SPIRIT', 'RES_BODY'] as const).map(resist => {
                    const data = calculated.resists[resist];
                    if (!data) return null;
                    const label = resist.replace('RES_', '');
                    return (
                      <div key={resist} className="bg-gray-900 p-1.5 rounded text-xs flex justify-between items-center">
                        <span className="font-semibold text-gray-400">{label}</span>
                        <span className={data.value >= data.cap ? 'text-green-400' : 'text-yellow-400'}>
                          {data.value}/{data.cap}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bonuses */}
            {Object.entries(calculated.bonuses).some(([, val]) => (val as number) > 0) && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2 text-gray-300">Bonuses</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(calculated.bonuses).filter(([, val]) => (val as number) > 0).map(([bonus, val]) => {
                    const cap = BONUS_CAPS[bonus];
                    const v = val as number;
                    return (
                      <div key={bonus} className="bg-gray-900 p-1.5 rounded text-xs flex justify-between items-center">
                        <span className="font-semibold text-gray-400">{bonus.replace(/_/g, ' ')}</span>
                        {cap !== undefined ? (
                          <span className={v >= cap ? 'text-green-400' : 'text-yellow-400'}>
                            {v}/{cap}
                          </span>
                        ) : (
                          <span className="text-blue-400">{v}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Skills */}
            {Object.entries(calculated.skills).some(([, val]) => (val as number) > 0) && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2 text-gray-300">Skills</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(calculated.skills).filter(([, val]) => (val as number) > 0).map(([skill, val]) => {
                    const v = val as number;
                    return (
                      <div key={skill} className="bg-gray-900 p-1.5 rounded text-xs flex justify-between items-center">
                        <span className="font-semibold text-gray-400">{skill.replace(/_/g, ' ')}</span>
                        <span className={v >= SKILL_CAP ? 'text-green-400' : 'text-purple-400'}>
                          {v}/{SKILL_CAP}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <hr className="my-3" />

            {/* Template Management */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Saved Templates</h3>
              <div className="flex gap-2 mb-2 flex-wrap">
                <button className="px-2 py-1 bg-blue-600 rounded text-xs" onClick={() => {
                  const name = window.prompt('Template name', template.name) || template.name;
                  setTemplate((t: Template) => ({ ...t, name }));
                  saveCurrentTemplate(name);
                }}>Save Current</button>
                <button className="px-2 py-1 bg-yellow-600 rounded text-xs" onClick={exportTemplatesJson}>Export</button>
                <label className="text-xs text-gray-300 px-2 py-1 rounded bg-gray-700 cursor-pointer">
                  Import
                  <input type="file" accept="application/json" onChange={e => importTemplatesJson(e.target.files)} className="hidden" />
                </label>
                <button className="px-2 py-1 bg-indigo-600 rounded text-xs" onClick={importFromShareCodePrompt}>Share Code</button>
                <button className="px-2 py-1 bg-purple-600 rounded text-xs" onClick={exportZenkraftFile}>Export ZC</button>
                <label className="text-xs text-gray-300 px-2 py-1 rounded bg-purple-700 cursor-pointer">
                  Import ZC
                  <input type="file" accept=".txt,text/plain" onChange={e => importZenkraftFile(e.target.files)} className="hidden" />
                </label>
              </div>
              <div className="max-h-40 overflow-auto">
                {templates.length === 0 && <div className="text-xs text-gray-400">No templates saved</div>}
                {templates.map(t => (
                  <div key={t.id} className="p-2 bg-gray-900 rounded my-1 flex items-center justify-between">
                    <div className="text-xs truncate flex-1">{t.name}</div>
                    <div className="flex gap-1">
                      <button className="px-2 py-0.5 bg-green-600 text-xs rounded" onClick={() => setTemplate(t)}>Load</button>
                      <button className="px-2 py-0.5 bg-indigo-600 text-xs rounded" onClick={() => copyShareCode(t)}>Share</button>
                      <button className="px-2 py-0.5 bg-red-600 text-xs rounded" onClick={() => deleteTemplate(t.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

