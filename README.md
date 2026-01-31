# DAoC Template Builder (Eden)

Template builder for Dark Age of Camelot on the Eden freeshard. Built with React + Vite + TypeScript + Tailwind CSS.

## Features

- **Bundled item database** -- Moras XML exports for all three realms are included under `public/moras_db/` and auto-loaded based on the selected realm filter.
- **Realm color tinting** -- Items and UI elements are tinted by realm: red for Albion, green for Hibernia, blue for Midgard.
- **Class-aware filtering** -- Selecting a class automatically filters items to compatible armor and weapon types. Classes are grouped by realm in the dropdown.
- **Slot filtering** -- Filter by slot grouped into Armor, Jewelry, and Weapons. Weapon sub-filters include Slash, Crush, Thrust, Two-Handed, Flexible, Shield, and Ranged.
- **Stat filtering** -- Stackable stat filters with min-value sliders (e.g. show only items with STRENGTH >= 10).
- **Owned items** -- Mark items as owned with the star button. Toggle "Owned Only" to filter to your collection. Owned items persist in localStorage.
- **Stats calculator** -- Aggregates stats, resists, bonuses, skills, and cap increases from equipped items. Shows value/cap with color coding (green = capped, yellow = room to grow).
- **Eden-specific caps** -- Stats: 75 base + 26 cap = 101. HP: 200 + 200 = 400. Power: 26 + 50 = 76. Resists: 26. Skills: 11. Bonuses: 10% or 25% depending on type.
- **Utility scoring** -- Items and templates are scored using DAoC utility formula (stats 1x, HP 0.25x, resists 2x, bonuses 3x, skills 5x, caps 1x).
- **Sortable item table** -- Click column headers to sort by Name, Level, or Utility.
- **Weapon slot rules** -- Equipping a two-handed weapon clears main/off-hand and vice versa. Ranged is independent.
- **Template management** -- Save, load, export/import templates as JSON. Share templates via compact Base64 share codes.

## Quick start

Requirements: Node.js 18+, npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

Run the test suite:

```bash
npm run test
```

Build for production:

```bash
npm run build
npm run preview
```

## Project layout

- `src/App.tsx` -- Main UI component with all state management, filtering, and rendering
- `src/lib/constants.ts` -- Game data: caps, slot definitions, effect lists, class/armor/weapon mappings, weapon type groups
- `src/lib/statsCalculator.ts` -- Stat aggregation, cap enforcement, utility calculation, report generation
- `src/lib/itemParser.ts` -- XML parser for Moras item database exports
- `src/types/index.ts` -- TypeScript type definitions for all game entities
- `public/moras_db/` -- Bundled Moras XML database files (one per realm)

## Using the app

1. **Select a realm** from the dropdown to load that realm's item database. Selecting a class auto-sets the realm.
2. **Browse and filter items** using the slot dropdown (Armor / Jewelry / Weapons), class filter, stat filters, and search box.
3. **Equip items** by clicking the Equip button on any item row. Items are automatically placed in the correct slot.
4. **Mark items as owned** by clicking the star button on item rows. Check "Owned Only" to see only your items.
5. **Review your template** in the Equipment panel and Stats Calculator on the lower half of the page.
6. **Save and share** templates using the template management panel.

## Templates

- **Save Current** -- Save the active template with a name.
- **Export / Import** -- Export all saved templates as JSON, or import from a JSON file.
- **Share Code** -- Copy a compact Base64-encoded share code for any template. Paste a share code to import.

## Tests

Tests are in `src/lib/__tests__/` using Vitest:

- `statsCalculator.test.ts` -- Effect categorization, stat/resist/bonus/skill cap enforcement, utility calculation, report generation
- `itemParser.test.ts` -- XML parsing for weapons, armor, jewelry, class restrictions, edge cases

Run with `npm run test`.

## Notes

- Templates and owned items are persisted in `localStorage`.
- The item database is served statically from `public/moras_db/` and fetched at runtime.
