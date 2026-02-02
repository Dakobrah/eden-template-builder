import { useState, useMemo, useRef } from 'react';
import type { Item } from '@/types';
import { ItemFilterService, type StatFilter } from '@/services';
import { calculateItemUtility } from '@/lib/statsCalculator';
import { CLASSES_BY_REALM, getSlotDisplay } from '@/lib/constants';

// Column definitions for item table
export interface ColumnDef {
  id: string;
  label: string;
  width: string;
  getValue: (item: Item, utility: number) => string | number;
  getSortValue: (item: Item, utility: number) => string | number;
  align?: 'left' | 'center' | 'right';
}

export const AVAILABLE_COLUMNS: ColumnDef[] = [
  { id: 'name', label: 'Name', width: '1fr', align: 'left',
    getValue: (it) => it.name, getSortValue: (it) => it.name.toLowerCase() },
  { id: 'slot', label: 'Slot', width: '90px', align: 'center',
    getValue: (it) => getSlotDisplay(it), getSortValue: (it) => getSlotDisplay(it) },
  { id: 'level', label: 'Lvl', width: '40px', align: 'center',
    getValue: (it) => it.level || 50, getSortValue: (it) => it.level || 50 },
  { id: 'utility', label: 'Util', width: '50px', align: 'center',
    getValue: (_, u) => u, getSortValue: (_, u) => u },
];

/** Hook that manages filter state, sorting, and pagination for the items panel. */
export function useFilters(combinedItems: Item[], ownedItems: Item[]) {
  const [filterRealm, setFilterRealm] = useState<string>('');
  const [filterSlot, setFilterSlot] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('');
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [statFilters, setStatFilters] = useState<StatFilter[]>([]);
  const [statInput, setStatInput] = useState('');
  const [showStatSuggestions, setShowStatSuggestions] = useState(false);
  const statInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [sortColumn, setSortColumn] = useState<string>('utility');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const allClasses = useMemo(() => {
    return ItemFilterService.getClassesForRealm(filterRealm, CLASSES_BY_REALM);
  }, [filterRealm]);

  const filteredItems = useMemo(() => {
    const ownedIds = new Set(ownedItems.map(o => o.id));
    return ItemFilterService.filter(combinedItems, {
      realm: filterRealm,
      slot: filterSlot,
      characterClass: filterClass,
      searchTerm,
      ownedOnly,
      ownedIds,
      statFilters,
    });
  }, [combinedItems, filterRealm, filterSlot, filterClass, searchTerm, ownedOnly, ownedItems, statFilters]);

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
  const effectivePage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const startIndex = (effectivePage - 1) * itemsPerPage;
    return sortedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedItems, effectivePage, itemsPerPage]);

  const clearFilters = () => {
    setFilterRealm('');
    setFilterSlot('');
    setFilterClass('');
    setStatFilters([]);
  };

  const handleSort = (colId: string) => {
    if (sortColumn === colId) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(colId);
      setSortDirection(colId === 'name' ? 'asc' : 'desc');
    }
  };

  return {
    filterRealm, setFilterRealm,
    filterSlot, setFilterSlot,
    filterClass, setFilterClass,
    ownedOnly, setOwnedOnly,
    statFilters, setStatFilters,
    statInput, setStatInput,
    showStatSuggestions, setShowStatSuggestions,
    statInputRef,
    searchTerm, setSearchTerm,
    currentPage, setCurrentPage,
    sortColumn, sortDirection,
    allClasses,
    filteredItems, sortedItems, paginatedItems,
    totalPages, effectivePage,
    clearFilters, handleSort,
  };
}
