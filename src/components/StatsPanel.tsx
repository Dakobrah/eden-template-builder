import type { CalculatedStats } from '@/types';
import { BONUS_CAPS, SKILL_CAP } from '@/lib/constants';

interface StatsPanelProps {
  calculated: CalculatedStats;
  onHoverEffect?: (effectId: string | null) => void;
  hoveredSlotEffects?: Record<string, number> | null;
}

export function StatsPanel({ calculated, onHoverEffect, hoveredSlotEffects }: StatsPanelProps) {
  return (
    <>
      {/* Total Utility */}
      <div className="mb-4 p-3 bg-blue-900 rounded">
        <div className="text-lg font-bold text-blue-200">Total Utility: {calculated.utility}</div>
      </div>

      {/* Stats & Resists side by side */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatsList calculated={calculated} onHoverEffect={onHoverEffect} hoveredSlotEffects={hoveredSlotEffects} />
        <ResistsList calculated={calculated} onHoverEffect={onHoverEffect} hoveredSlotEffects={hoveredSlotEffects} />
      </div>

      <BonusesList calculated={calculated} onHoverEffect={onHoverEffect} hoveredSlotEffects={hoveredSlotEffects} />
      <SkillsList calculated={calculated} onHoverEffect={onHoverEffect} hoveredSlotEffects={hoveredSlotEffects} />
    </>
  );
}

interface SubListProps {
  calculated: CalculatedStats;
  onHoverEffect?: (effectId: string | null) => void;
  hoveredSlotEffects?: Record<string, number> | null;
}

function EffectHighlightBadge({ effectId, hoveredSlotEffects }: { effectId: string; hoveredSlotEffects?: Record<string, number> | null }) {
  const value = hoveredSlotEffects?.[effectId];
  if (value === undefined || value === 0) return null;
  return (
    <span className="text-[10px] font-bold text-blue-300 bg-blue-900/70 px-1 py-0.5 rounded ml-1">
      +{value}
    </span>
  );
}

function getRowHighlight(effectId: string, hoveredSlotEffects?: Record<string, number> | null): string {
  const value = hoveredSlotEffects?.[effectId];
  if (value === undefined || value === 0) return '';
  return 'ring-1 ring-blue-400/60 bg-gray-800';
}

function StatsList({ calculated, onHoverEffect, hoveredSlotEffects }: SubListProps) {
  const statOrder = ['STRENGTH', 'CONSTITUTION', 'DEXTERITY', 'QUICKNESS', 'INTELLIGENCE', 'EMPATHY', 'PIETY', 'CHARISMA', 'ACUITY', 'HITPOINTS', 'POWER'] as const;
  const labels: Record<string, string> = {
    STRENGTH: 'STR', CONSTITUTION: 'CON', DEXTERITY: 'DEX', QUICKNESS: 'QUI',
    INTELLIGENCE: 'INT', EMPATHY: 'EMP', PIETY: 'PIE', CHARISMA: 'CHA',
    ACUITY: 'ACU', HITPOINTS: 'HP', POWER: 'POW',
  };

  return (
    <div>
      <h3 className="text-sm font-semibold mb-2 text-gray-300">Stats</h3>
      <div className="space-y-1.5">
        {statOrder.map(stat => {
          const data = calculated.stats[stat];
          if (!data) return null;
          const highlight = getRowHighlight(stat, hoveredSlotEffects);
          return (
            <div
              key={stat}
              className={`bg-gray-900 p-1.5 rounded text-xs flex justify-between items-center cursor-default hover:bg-gray-800 transition-colors ${highlight}`}
              onMouseEnter={() => onHoverEffect?.(stat)}
              onMouseLeave={() => onHoverEffect?.(null)}
            >
              <span className="font-semibold text-gray-400">{labels[stat]}</span>
              <span className="flex items-center">
                <EffectHighlightBadge effectId={stat} hoveredSlotEffects={hoveredSlotEffects} />
                <span className={`ml-1 ${data.value >= data.cap ? 'text-green-400' : 'text-yellow-400'}`}>
                  {data.value}/{data.cap}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResistsList({ calculated, onHoverEffect, hoveredSlotEffects }: SubListProps) {
  const resistOrder = ['RES_THRUST', 'RES_CRUSH', 'RES_SLASH', 'RES_HEAT', 'RES_COLD', 'RES_MATTER', 'RES_ENERGY', 'RES_SPIRIT', 'RES_BODY'] as const;

  return (
    <div>
      <h3 className="text-sm font-semibold mb-2 text-gray-300">Resists</h3>
      <div className="space-y-1.5">
        {resistOrder.map(resist => {
          const data = calculated.resists[resist];
          if (!data) return null;
          const label = resist.replace('RES_', '');
          const highlight = getRowHighlight(resist, hoveredSlotEffects);
          return (
            <div
              key={resist}
              className={`bg-gray-900 p-1.5 rounded text-xs flex justify-between items-center cursor-default hover:bg-gray-800 transition-colors ${highlight}`}
              onMouseEnter={() => onHoverEffect?.(resist)}
              onMouseLeave={() => onHoverEffect?.(null)}
            >
              <span className="font-semibold text-gray-400">{label}</span>
              <span className="flex items-center">
                <EffectHighlightBadge effectId={resist} hoveredSlotEffects={hoveredSlotEffects} />
                <span className={`ml-1 ${data.value >= data.cap ? 'text-green-400' : 'text-yellow-400'}`}>
                  {data.value}/{data.cap}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BonusesList({ calculated, onHoverEffect, hoveredSlotEffects }: SubListProps) {
  const hasActive = Object.entries(calculated.bonuses).some(([, val]) => (val as number) > 0);
  if (!hasActive) return null;

  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold mb-2 text-gray-300">Bonuses</h3>
      <div className="grid grid-cols-2 gap-1.5">
        {Object.entries(calculated.bonuses).filter(([, val]) => (val as number) > 0).map(([bonus, val]) => {
          const cap = BONUS_CAPS[bonus];
          const v = val as number;
          const highlight = getRowHighlight(bonus, hoveredSlotEffects);
          return (
            <div
              key={bonus}
              className={`bg-gray-900 p-1.5 rounded text-xs flex justify-between items-center cursor-default hover:bg-gray-800 transition-colors ${highlight}`}
              onMouseEnter={() => onHoverEffect?.(bonus)}
              onMouseLeave={() => onHoverEffect?.(null)}
            >
              <span className="font-semibold text-gray-400">{bonus.replace(/_/g, ' ')}</span>
              <span className="flex items-center">
                <EffectHighlightBadge effectId={bonus} hoveredSlotEffects={hoveredSlotEffects} />
                {cap !== undefined ? (
                  <span className={`ml-1 ${v >= cap ? 'text-green-400' : 'text-yellow-400'}`}>{v}/{cap}</span>
                ) : (
                  <span className="ml-1 text-blue-400">{v}</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SkillsList({ calculated, onHoverEffect, hoveredSlotEffects }: SubListProps) {
  const hasActive = Object.entries(calculated.skills).some(([, val]) => (val as number) > 0);
  if (!hasActive) return null;

  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold mb-2 text-gray-300">Skills</h3>
      <div className="grid grid-cols-2 gap-1.5">
        {Object.entries(calculated.skills).filter(([, val]) => (val as number) > 0).map(([skill, val]) => {
          const v = val as number;
          const highlight = getRowHighlight(skill, hoveredSlotEffects);
          return (
            <div
              key={skill}
              className={`bg-gray-900 p-1.5 rounded text-xs flex justify-between items-center cursor-default hover:bg-gray-800 transition-colors ${highlight}`}
              onMouseEnter={() => onHoverEffect?.(skill)}
              onMouseLeave={() => onHoverEffect?.(null)}
            >
              <span className="font-semibold text-gray-400">{skill.replace(/_/g, ' ')}</span>
              <span className="flex items-center">
                <EffectHighlightBadge effectId={skill} hoveredSlotEffects={hoveredSlotEffects} />
                <span className={`ml-1 ${v >= SKILL_CAP ? 'text-green-400' : 'text-purple-400'}`}>{v}/{SKILL_CAP}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
