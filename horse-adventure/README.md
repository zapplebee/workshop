# Horse Adventure

This project is a Bun-served React app for iterating on blocky creatures, fixtures, interactions, and dialogue.

The app currently has two route-level scenes:

- `/grasslands`: the playable world scene
- `/cleanroom/:elementId`: the asset debug/crafting scene

## Runtime Layout

- `src/index.ts`
  - Bun server entry point
  - serves `index.html`
  - serves YAML conversations from `src/conversations/`
- `src/frontend.tsx`
  - browser React entry point
- `src/App.tsx`
  - route orchestration
  - conversation loading/state
  - grasslands composition
  - cleanroom selection state and shared UI wiring

## Important Directories

- `src/elements/`
  - reusable game-world objects
  - organized into `creatures/`, `fixtures/`, and `items/`
- `src/scenes/`
  - route-level canvas/UI shells
- `src/conversations/`
  - YAML dialogue trees

## Cleanroom Manifest

`src/elements/manifest.tsx` is the cleanroom registry.

This is the most important file for asset browsing and future debug/crafting work. It controls:

- which elements are visible in the cleanroom browser
- how they are grouped by category
- which animation/actions they expose in the cleanroom
- their default preview action
- whether they expose wireframe controls
- how they render in the cleanroom preview pane

If a future agent adds a new creature, fixture, or item and wants it previewable in the cleanroom, it should be registered in `src/elements/manifest.tsx`.

## Current Routing Notes

- cleanroom routes are route-addressable and bookmarkable, for example:
  - `/cleanroom/horse`
  - `/cleanroom/mouse`
  - `/cleanroom/snake`
  - `/cleanroom/cloud`
- arrow keys switch between `/grasslands` and the cleanroom route set

## For Future Agents

Read these first:

1. `create-animal-manual.md`
2. `src/elements/README.md`
3. `src/scenes/README.md`
4. `src/conversations/README.md`

## Architectural Direction

- reusable world pieces belong in `src/elements/`
- route/page shells belong in `src/scenes/`
- `App.tsx` should remain orchestration glue, not a dumping ground for new geometry
- avoid `workshop*` naming for canonical asset components; use plain names like `Horse`, `Mouse`, `Snake`
