import { useState } from 'react';
import type { Item, Template, SlotId } from '@/types';
import type { StatFilter } from '@/services';
import { calculateItemUtility } from '@/lib/statsCalculator';
import { getRealmColors } from '@/lib/constants';
import { CLASSES_BY_REALM, CLASS_TO_REALM, WEAPON_TYPE_GROUPS } from '@/lib/constants';
import { EquipmentManager } from '@/services';
import { AVAILABLE_COLUMNS } from '@/hooks/useFilters';

interface ItemsPanelProps {
  dbLoading: boolean;
  filteredItems: Item[];
  paginatedItems: Item[];
  totalPages: number;
  effectivePage: number;
  ownedItems: Item[];
  template: Template;
  // Filters
  filterRealm: string;
  setFilterRealm: (v: string) => void;
  filterSlot: string;
  setFilterSlot: (v: string) => void;
  filterClass: string;
  setFilterClass: (v: string) => void;
  ownedOnly: boolean;
  setOwnedOnly: (v: boolean) => void;
  statFilters: StatFilter[];
  setStatFilters: (v: StatFilter[] | ((prev: StatFilter[]) => StatFilter[])) => void;
  statInput: string;
  setStatInput: (v: string) => void;
  showStatSuggestions: boolean;
  setShowStatSuggestions: (v: boolean) => void;
  statInputRef: React.RefObject<HTMLInputElement | null>;
  allEffectIds: string[];
  allClasses: string[];
  // Sorting
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  handleSort: (colId: string) => void;
  // Pagination
  setCurrentPage: (v: number | ((prev: number) => number)) => void;
  // Filters reset
  clearFilters: () => void;
  // Actions
  onEquip: (slotId: SlotId, item: Item) => void;
  onToggleOwned: (item: Item) => void;
  onSetTemplate: (t: Template | ((prev: Template) => Template)) => void;
  onSetFilterRealm: (v: string) => void;
}

export function ItemsPanel({
  dbLoading, filteredItems, paginatedItems,
  totalPages, effectivePage,
  ownedItems, template,
  filterRealm, setFilterRealm,
  filterSlot, setFilterSlot,
  filterClass, setFilterClass,
  ownedOnly, setOwnedOnly,
  statFilters, setStatFilters,
  statInput, setStatInput,
  showStatSuggestions, setShowStatSuggestions,
  statInputRef,
  allEffectIds, allClasses,
  sortColumn, sortDirection, handleSort,
  setCurrentPage,
  clearFilters,
  onEquip, onToggleOwned, onSetTemplate,
}: ItemsPanelProps) {
  const [hoverItem, setHoverItem] = useState<{ item: Item; x: number; y: number } | null>(null);

  return (
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
                onSetTemplate(t => ({
                  ...t,
                  characterClass: cls as Template['characterClass'],
                  realm: (realm as Template['realm']) || t.realm,
                  updatedAt: new Date().toISOString(),
                }));
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
          <button className="px-2 py-1 bg-red-600 rounded text-xs" onClick={clearFilters}>Clear Filters</button>
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
                onClick={() => handleSort(col.id)}
              >{col.label}{arrow}</div>
            );
          })}
          <div className="text-center">Equip</div>
        </div>

        {/* Table Rows */}
        {paginatedItems.map(it => {
          const itemUtility = calculateItemUtility(it);
          const compatibleSlot = EquipmentManager.findCompatibleSlot(it, template);
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
                  onClick={() => onToggleOwned(it)}
                  title={ownedItems.some(o => o.id === it.id) ? 'Remove from owned' : 'Mark as owned'}
                >*</button>
                <button
                  className="px-2 py-1 bg-indigo-600 rounded text-xs hover:bg-indigo-700"
                  onClick={() => {
                    if (compatibleSlot) onEquip(compatibleSlot, it);
                  }}
                >Equip</button>
              </div>
            </div>
          );
        })}

        {/* Hover Card */}
        {hoverItem && (() => {
          const hrc = getRealmColors(hoverItem.item.realm);
          return (
            <div
              className={`hover-card ${hrc ? `border-l-[3px] ${hrc.border}` : ''}`}
              style={{ left: hoverItem.x + 12, top: hoverItem.y + 12 }}
            >
              <div className="text-sm font-semibold">{hoverItem.item.name}</div>
              <div className={`text-xs ${hrc ? hrc.text : 'text-gray-400'}`}>{hoverItem.item.position} - {hoverItem.item.realm || 'Any'}</div>
              <div className="mt-2 text-xs text-gray-200">
                {Object.entries(hoverItem.item.effects || {}).length === 0 ? (
                  <div className="text-gray-400">No effects</div>
                ) : (
                  <div className="space-y-1">
                    {Object.entries(hoverItem.item.effects).map(([k, v]) => (
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
  );
}
