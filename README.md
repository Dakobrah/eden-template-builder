# DAoC Template Builder (Eden)

Template builder for Dark Age of Camelot on the Eden freeshard. Built with React + Vite + TypeScript + Tailwind CSS.

## Features

- **Bundled item database** -- NDJSON item database compiled from Moras XML exports, auto-loaded at runtime.
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
- **Zenkcraft format** -- Import and export templates in Zenkcraft template builder format.

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

## Docker

Build and run with Docker Compose:

```bash
docker compose up -d
```

The app will be available at http://localhost:8080.

Or build and run manually:

```bash
docker build -t daoc-template-builder .
docker run -p 8080:80 daoc-template-builder
```

The Docker image uses a multi-stage build (Node.js for build, nginx for serving) and includes gzip compression and SPA routing.

## Architecture

The codebase follows a layered architecture:

- **Services** (OOP) -- Business logic classes with static methods for equipment management, item filtering, template CRUD, and stats calculation.
- **Hooks** -- Custom React hooks that compose services with React state management. Each hook owns a specific domain (template, items, filters).
- **Components** -- Focused UI components that receive data and callbacks via props. No business logic in components.
- **Lib** -- Pure utility libraries for parsing, constants, and data transformation.

## Project layout

- `src/App.tsx` -- Root component, composes panels and hooks
- `src/components/` -- UI components organized by panel
  - `Header.tsx` -- App header with search and actions
  - `ItemsPanel.tsx` -- Item browser with filtering, sorting, pagination
  - `EquipmentPanel.tsx` -- Equipment slot grid
  - `StatsPanel.tsx` -- Stats, resists, bonuses, skills, procs display
  - `TemplatePanel.tsx` -- Template CRUD, import/export, sharing
- `src/hooks/` -- Custom React hooks
  - `useTemplate.ts` -- Template state and operations
  - `useItems.ts` -- Item database loading and owned items
  - `useFilters.ts` -- Filter, sort, pagination state
  - `useLocalStorage.ts` -- Generic localStorage persistence hook
- `src/services/` -- Business logic service classes (OOP)
  - `EquipmentManager.ts` -- Slot assignment, weapon conflict rules
  - `ItemFilterService.ts` -- Multi-criteria item filtering
  - `TemplateManager.ts` -- Template CRUD, persistence, sharing
- `src/lib/` -- Pure utility libraries
  - `constants.ts` -- Game data, caps, mappings (single source of truth)
  - `statsCalculator.ts` -- Stat aggregation and utility calculation
  - `ndjsonParser.ts` -- NDJSON item database parser
  - `itemParser.ts` -- XML item parser (Moras format)
  - `zenkcraft.ts` -- Zenkcraft template import/export
  - `domUtils.ts` -- Cross-platform DOM helper functions
- `src/types/index.ts` -- TypeScript type definitions
- `public/items/` -- NDJSON item database
- `public/moras_db/` -- Original Moras XML database files

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
- **Export ZC / Import ZC** -- Export or import templates in Zenkcraft format.

## Tests

Tests are in `src/lib/__tests__/` using Vitest:

- `statsCalculator.test.ts` -- Effect categorization, stat/resist/bonus/skill cap enforcement, utility calculation, report generation
- `itemParser.test.ts` -- XML parsing for weapons, armor, jewelry, class restrictions, edge cases

Run with `npm run test`.

## Notes

- Templates and owned items are persisted in `localStorage`.
- The item database is served statically from `public/items/` and fetched at runtime.
