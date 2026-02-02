import type { Template, Item, ItemProc } from '@/types';
import { ALL_SLOTS } from '@/lib/constants';

interface ProcsDisplayProps {
  template: Template;
}

export function ProcsDisplay({ template }: ProcsDisplayProps) {
  const slotNameMap = Object.fromEntries(ALL_SLOTS.map(s => [s.id, s.name]));
  const weaponSlots = ['mainHand', 'offHand', 'twoHand', 'ranged'];
  const entries: { slotId: string; slotName: string; item: Item; proc: ItemProc }[] = [];

  for (const [slotId, item] of Object.entries(template.slots)) {
    if (!item?.procs) continue;
    const slotName = slotNameMap[slotId] || slotId;
    for (const proc of item.procs) {
      entries.push({ slotId, slotName, item, proc });
    }
  }

  if (entries.length === 0) return null;

  const procs = entries.filter(e => e.proc.source === 'proc' || e.proc.source === 'reactive' || e.proc.source === 'passive');
  const uses = entries.filter(e => e.proc.source === 'use');

  const renderEntry = (e: typeof entries[0], idx: number) => {
    const isWeapon = weaponSlots.includes(e.slotId);
    const tag = isWeapon ? 'W' : 'A';
    const tagColor = isWeapon ? 'text-orange-400' : 'text-cyan-400';
    const sourceLabel = e.proc.source === 'reactive' ? 'React' : e.proc.source === 'passive' ? 'Passive' : '';
    const attrs = Object.entries(e.proc.attributes)
      .filter(([k]) => k !== 'Type' && k !== 'Target')
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    return (
      <div key={`${e.slotId}-${e.proc.source}-${idx}`} className="bg-gray-900 p-2 rounded">
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-bold ${tagColor}`}>[{tag}]</span>
          <span className="text-xs font-medium text-gray-200 truncate">{e.proc.name}</span>
          {sourceLabel && <span className="text-[10px] text-gray-500">({sourceLabel})</span>}
        </div>
        <div className="text-[10px] text-gray-500 mt-0.5">{e.slotName}: {e.item.name}</div>
        {e.proc.type && <div className="text-[10px] text-gray-400 mt-0.5">{e.proc.type}{attrs ? ` - ${attrs}` : ''}</div>}
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-800 rounded">
      {procs.length > 0 && (
        <div className="mb-4 last:mb-0">
          <h3 className="text-sm font-semibold mb-2 text-gray-300">Procs</h3>
          <div className="space-y-1.5">{procs.map((e, i) => renderEntry(e, i))}</div>
        </div>
      )}
      {uses.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2 text-gray-300">On-Use</h3>
          <div className="space-y-1.5">{uses.map((e, i) => renderEntry(e, i))}</div>
        </div>
      )}
    </div>
  );
}
