import { useState } from 'react';
import type { Template, Item, SlotId } from '@/types';
import { getRealmColors, EQUIP_TOP_ROW, EQUIP_LEFT_COL, EQUIP_RIGHT_COL, EQUIP_WEAPONS } from '@/lib/constants';

interface EquipmentPanelProps {
  template: Template;
  onUnequip: (slotId: SlotId) => void;
  onClearHover: () => void;
  hoveredEffect?: string | null;
  onHoverSlotEffects?: (effects: Record<string, number> | null) => void;
}

export function EquipmentPanel({ template, onUnequip, onClearHover, hoveredEffect, onHoverSlotEffects }: EquipmentPanelProps) {
  const [hoverSlot, setHoverSlot] = useState<{ slotId: string; item: Item; x: number; y: number } | null>(null);

  const renderSlot = (slotId: string, slotName: string, dimmed = false) => {
    const equipped = template.slots[slotId as SlotId];
    const erc = equipped ? getRealmColors(equipped.realm) : null;
    const procs = equipped?.procs?.filter(p => p.source === 'proc' || p.source === 'reactive' || p.source === 'passive') || [];
    const uses = equipped?.procs?.filter(p => p.source === 'use') || [];
    const hasProcs = procs.length > 0 || uses.length > 0;

    // Highlight if this slot's item contributes to the hovered effect
    const effectValue = hoveredEffect ? equipped?.effects?.[hoveredEffect] : undefined;
    const contributesToEffect = effectValue !== undefined && effectValue !== 0;
    const highlightClass = contributesToEffect ? 'ring-2 ring-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]' : '';

    return (
      <div
        key={slotId}
        className={`relative border rounded p-2.5 group min-h-[52px] transition-shadow ${dimmed ? 'opacity-40' : ''} ${highlightClass} ${erc ? `${erc.bg} ${erc.border} border-l-[3px]` : 'bg-gray-800 border-gray-700'}`}
        onMouseEnter={(e) => { if (equipped) { setHoverSlot({ slotId, item: equipped, x: e.clientX, y: e.clientY }); onHoverSlotEffects?.(equipped.effects || null); } }}
        onMouseMove={(e) => { setHoverSlot(prev => prev && prev.slotId === slotId ? { ...prev, x: e.clientX, y: e.clientY } : prev); }}
        onMouseLeave={() => { setHoverSlot(null); onHoverSlotEffects?.(null); }}
      >
        <div className="text-[10px] font-bold text-gray-400 mb-1.5 leading-tight">{slotName}</div>
        <div className="text-xs text-gray-300 line-clamp-2 leading-tight pr-5" title={equipped?.name}>{equipped?.name || 'Empty'}</div>
        {contributesToEffect && (
          <span className="absolute bottom-1.5 right-1.5 text-[11px] font-bold text-blue-300 bg-blue-900/70 px-1.5 py-0.5 rounded">
            +{effectValue}
          </span>
        )}
        {hasProcs && (
          <div className="flex flex-wrap gap-1 mt-1">
            {procs.map((p, i) => (
              <span key={`p-${i}`} className="text-[9px] font-semibold text-yellow-400 bg-yellow-900/40 px-1 rounded" title={p.name}>
                {p.name}
              </span>
            ))}
            {uses.map((p, i) => (
              <span key={`u-${i}`} className="text-[9px] font-semibold text-emerald-400 bg-emerald-900/40 px-1 rounded" title={p.name}>
                {p.name}
              </span>
            ))}
          </div>
        )}
        {equipped && (
          <button
            className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-600 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-red-700"
            onClick={(e) => { e.stopPropagation(); onUnequip(slotId as SlotId); }}
            title="Unequip"
          >x</button>
        )}
      </div>
    );
  };

  const has2H = !!template.slots['twoHand'];
  const has1H = !!template.slots['mainHand'] || !!template.slots['offHand'];

  return (
    <div className="p-4 bg-gray-800 rounded">
      <h2 className="font-semibold mb-2">Equipment</h2>
      <div className="mb-2 text-sm">Name: {template.name}</div>
      <div className="mb-3 text-sm">Class: {template.characterClass} ({template.realm})</div>

      <div className="relative bg-gray-900 p-4 rounded-lg space-y-3" onMouseEnter={onClearHover}>
        {/* Top Row */}
        <div className="grid grid-cols-3 gap-3">
          {EQUIP_TOP_ROW.map(s => renderSlot(s.id, s.name))}
        </div>

        {/* Middle - Left and Right armor columns */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2.5">
            {EQUIP_LEFT_COL.map(s => renderSlot(s.id, s.name))}
          </div>
          <div className="flex flex-col gap-2.5">
            {EQUIP_RIGHT_COL.map(s => renderSlot(s.id, s.name))}
          </div>
        </div>

        {/* Bottom Row - Weapons */}
        <div className="grid grid-cols-4 gap-3">
          {EQUIP_WEAPONS.map(s => {
            const dimmed = (has2H && (s.id === 'mainHand' || s.id === 'offHand'))
              || (has1H && s.id === 'twoHand');
            return renderSlot(s.id, s.name, dimmed);
          })}
        </div>
      </div>

      {/* Hover Card for equipped item */}
      {hoverSlot && (() => {
        const item = hoverSlot.item;
        const hrc = getRealmColors(item.realm);
        const effects = Object.entries(item.effects || {});
        const itemProcs = item.procs || [];
        return (
          <div
            className={`hover-card ${hrc ? `border-l-[3px] ${hrc.border}` : ''}`}
            style={{ left: hoverSlot.x + 12, top: hoverSlot.y + 12 }}
          >
            <div className="text-sm font-semibold">{item.name}</div>
            <div className={`text-xs ${hrc ? hrc.text : 'text-gray-400'}`}>
              {item.position} - {item.realm || 'Any'} {item.level ? `(Lv ${item.level})` : ''}
            </div>
            {effects.length > 0 && (
              <div className="mt-2 space-y-0.5">
                {effects.map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-gray-300">{k.replace(/_/g, ' ')}</span>
                    <span className="text-blue-400 ml-3">{v as number}</span>
                  </div>
                ))}
              </div>
            )}
            {effects.length === 0 && <div className="mt-2 text-xs text-gray-500">No effects</div>}
            {itemProcs.length > 0 && (
              <div className="mt-2 border-t border-gray-700 pt-2 space-y-1.5">
                {itemProcs.map((proc, i) => {
                  const isWeapon = ['mainHand', 'offHand', 'twoHand', 'ranged'].includes(hoverSlot.slotId);
                  const tag = isWeapon ? 'W' : 'A';
                  const tagColor = isWeapon ? 'text-orange-400' : 'text-cyan-400';
                  const sourceLabel = proc.source === 'reactive' ? 'React' : proc.source === 'passive' ? 'Passive' : proc.source === 'use' ? 'Use' : 'Proc';
                  const attrs = Object.entries(proc.attributes)
                    .filter(([k]) => k !== 'Type' && k !== 'Target')
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(', ');
                  return (
                    <div key={i}>
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-bold ${tagColor}`}>[{tag}]</span>
                        <span className="text-xs font-medium text-gray-200">{proc.name}</span>
                        <span className="text-[10px] text-gray-500">({sourceLabel})</span>
                      </div>
                      {proc.type && <div className="text-[10px] text-gray-400">{proc.type}{attrs ? ` - ${attrs}` : ''}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
