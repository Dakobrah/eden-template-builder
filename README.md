# DAoC Template Builder (Prototype)

Lightweight template builder for Dark Age of Camelot (Eden). This repository is a minimal React + Vite + TypeScript app that:

- Parses Moras XML item exports
- Lets you mark which items you own
- Equip items to a template and calculate stats/utility
- Save, load, export, and share templates via compact codes

## Quick start (local development)

Requirements:
- Node.js 18+ (recommended)
- npm

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser (Vite opens automatically by default).

Run the test suite:

```bash
npm run test
# or watch mode
npm run test:watch
```

Build production assets:

```bash
npm run build
npm run preview
```

## Project layout (important files)

- `src/App.tsx` — main UI and state management
- `src/lib/itemParser.ts` — XML parser for Moras exports
- `src/lib/statsCalculator.ts` — stat aggregation and utility calculations
- `src/lib/constants.ts` — caps, slots, effect categories
- `public/data/` — place Moras XML exports here (e.g. `items_alb.xml`, `items_hib.xml`, `items_mid.xml`)

## Using the app

1. Import the item database (Moras XML export): click **Import XML DB** and select one or more `.xml` files. These are merged into the in-app database.
2. Import your owned items:
	- As a plaintext list: click **Import owned (txt)** and upload a `.txt` file with one item name per line.
	- As JSON: click **Import owned (JSON)** to import a previously exported `owned_items.json`.
	- To export your owned list, click **Export owned (JSON)**.
3. Search the database using the search box. Hover items to see a quick details card.
4. To equip an item: first click **Select** on the slot in the template panel (or click Equip on an item while a slot is selected). Use **Unequip** to remove.

## Templates

- Save current template: use **Save Current** and give it a name.
- Export templates as JSON via **Export**; import via **Import**.
- Share templates with a compact share code: click **Share** next to a saved template to copy the code to clipboard. To import a share code, click **Paste Share Code** and paste the code.

Share codes are URL-safe Base64-encoded JSON of the template. They are compact and can be shared via chat or pasted back into the app.

## Tests

Two basic tests are included under `src/lib/__tests__`:

- `statsCalculator.test.ts` — verifies aggregation and utility
- `itemParser.test.ts` — verifies XML parsing

Run them with `npm run test`.

## Notes & next steps

- Currently the app stores templates and owned items in `localStorage`.
- You can place full Moras DB XMLs under `public/data/` and load them via the import UI.
- Future improvements: richer item detail modal, better duplicate handling on import, CLI/executable packaging.

If you want, I can now:
- Add a clickable item detail modal (pin on click)
- Implement smarter name matching when importing `.txt` owned lists
- Produce a short CONTRIBUTING guide and more developer notes
