import { useState } from 'react';
import { Header } from './components/Header';
import { ItemsPanel } from './components/ItemsPanel';
import { EquipmentPanel } from './components/EquipmentPanel';
import { ProcsDisplay } from './components/ProcsDisplay';
import { StatsPanel } from './components/StatsPanel';
import { TemplatePanel } from './components/TemplatePanel';
import { useTemplate } from './hooks/useTemplate';
import { useItems } from './hooks/useItems';
import { useFilters } from './hooks/useFilters';

export default function App() {
  const {
    template, setTemplate,
    templates,
    calculated,
    equipItem, unequipSlot, newTemplate, copyReport,
    saveCurrentTemplate, deleteTemplate,
    exportTemplatesJson, importTemplatesJson,
    copyShareCode, importFromShareCodePrompt,
    importZenkraftFile, exportZenkraftFile,
  } = useTemplate();

  const { dbLoading, ownedItems, combinedItems, allEffectIds, toggleOwned } = useItems();

  const filters = useFilters(combinedItems, ownedItems);

  const [hoveredEffect, setHoveredEffect] = useState<string | null>(null);
  const [hoveredSlotEffects, setHoveredSlotEffects] = useState<Record<string, number> | null>(null);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <Header
          onNewTemplate={newTemplate}
          onCopyReport={copyReport}
          searchTerm={filters.searchTerm}
          onSearchChange={filters.setSearchTerm}
        />

        <ItemsPanel
          dbLoading={dbLoading}
          filteredItems={filters.filteredItems}
          paginatedItems={filters.paginatedItems}
          totalPages={filters.totalPages}
          effectivePage={filters.effectivePage}
          ownedItems={ownedItems}
          template={template}
          filterRealm={filters.filterRealm}
          setFilterRealm={filters.setFilterRealm}
          filterSlot={filters.filterSlot}
          setFilterSlot={filters.setFilterSlot}
          filterClass={filters.filterClass}
          setFilterClass={filters.setFilterClass}
          ownedOnly={filters.ownedOnly}
          setOwnedOnly={filters.setOwnedOnly}
          statFilters={filters.statFilters}
          setStatFilters={filters.setStatFilters}
          statInput={filters.statInput}
          setStatInput={filters.setStatInput}
          showStatSuggestions={filters.showStatSuggestions}
          setShowStatSuggestions={filters.setShowStatSuggestions}
          statInputRef={filters.statInputRef}
          allEffectIds={allEffectIds}
          allClasses={filters.allClasses}
          sortColumn={filters.sortColumn}
          sortDirection={filters.sortDirection}
          handleSort={filters.handleSort}
          setCurrentPage={filters.setCurrentPage}
          clearFilters={filters.clearFilters}
          onEquip={equipItem}
          onToggleOwned={toggleOwned}
          onSetTemplate={setTemplate}
          onSetFilterRealm={filters.setFilterRealm}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <EquipmentPanel
              template={template}
              onUnequip={unequipSlot}
              onClearHover={() => {}}
              hoveredEffect={hoveredEffect}
              onHoverSlotEffects={setHoveredSlotEffects}
            />
            <ProcsDisplay template={template} />
          </div>

          <div className="p-4 bg-gray-800 rounded">
            <h2 className="font-semibold mb-3">Stats Calculator</h2>
            <StatsPanel calculated={calculated} onHoverEffect={setHoveredEffect} hoveredSlotEffects={hoveredSlotEffects} />

            <hr className="my-3" />

            <TemplatePanel
              template={template}
              templates={templates}
              onSave={saveCurrentTemplate}
              onDelete={deleteTemplate}
              onLoad={setTemplate}
              onExportJson={exportTemplatesJson}
              onImportJson={importTemplatesJson}
              onShareCode={importFromShareCodePrompt}
              onCopyShareCode={copyShareCode}
              onExportZenkraft={exportZenkraftFile}
              onImportZenkraft={importZenkraftFile}
              onSetTemplate={setTemplate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
