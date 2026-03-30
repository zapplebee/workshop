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
  - inventory and world-flag orchestration
  - grasslands composition
  - cleanroom selection state and shared UI wiring

## Gameplay State

The app now has two important app-level progression systems:

- inventory
  - physical, possessable things
  - stackables like carrots and future physical key items
  - intentionally in-memory only for now so iteration stays fast
- world flags
  - non-physical truth/state
  - clues, learned facts, and conversation/world progression beats
  - also intentionally in-memory only for now

Design rule recorded from the user:

- if it can be carried, it is inventory
- if it is just true now, it is a world flag

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

User decision recorded:

- all newly added world elements should also be added to the cleanroom so they can be refined there

## Current Routing Notes

- cleanroom routes are route-addressable and bookmarkable, for example:
  - `/cleanroom/horse`
  - `/cleanroom/mouse`
  - `/cleanroom/snake`
  - `/cleanroom/carrot`
  - `/cleanroom/cloud`
- arrow keys switch between `/grasslands` and the cleanroom route set

## For Future Agents

Read these first:

1. `create-animal-manual.md`
2. `src/elements/README.md`
3. `src/scenes/README.md`
4. `src/conversations/README.md`
5. `src/features/README.md`

## Architectural Direction

- reusable world pieces belong in `src/elements/`
- route/page shells belong in `src/scenes/`
- `App.tsx` should remain orchestration glue, not a dumping ground for new geometry
- inventory and world flags should stay in dedicated feature modules rather than leaking bespoke state into scene files
- avoid `workshop*` naming for canonical asset components; use plain names like `Horse`, `Mouse`, `Snake`
