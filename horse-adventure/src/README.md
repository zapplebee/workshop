# src

This directory contains the runtime app code.

## Start Here

If you are a future agent ramping into the project, read these first:

1. `../README.md`
2. `../create-animal-manual.md`
3. `elements/README.md`
4. `scenes/README.md`
5. `conversations/README.md`
6. `features/README.md`
7. `features/grasslands/README.md`

Most important architecture file:

- `elements/manifest.tsx`

That manifest controls which assets are browsable in the cleanroom, how they are categorized, and which controls/actions they expose there.

## Directory Guide

- `elements/`: reusable renderable world pieces and creatures
- `features/`: gameplay and app subsystems like grasslands, conversations, inventory, cleanroom state, navigation, and world flags
- `scenes/`: route-level scene shells and UI wrappers
- `conversations/`: YAML dialogue definitions
- `App.tsx`: app-level routing, inventory/world-flag orchestration, conversation state, cleanroom selection, and main grasslands composition
- `frontend.tsx`: browser entry point
- `index.ts`: Bun server entry point

## Architectural Rule

Keep reusable world objects in `elements/`, not in `App.tsx`.

`App.tsx` should increasingly act as orchestration glue:

- route selection
- inventory and world-flag ownership
- conversation loading/state
- scene assembly
- high-level gameplay state

## Cleanroom Rule

The cleanroom is a manifest-driven debug/crafting browser. New previewable assets should be added to `src/elements/manifest.tsx`.

Recorded user decision:

- new world elements should be added to the cleanroom by default so they can be refined there before or while being used in gameplay

## Viewport Notes

Current scene/UI expectations:

- grasslands uses a docked left-side HUD for scene navigation and inventory access
- dialogue appears in a bottom black bar rather than floating over the middle of the scene
- cinematic conversation camera tuning should preserve visibility of both speakers above the dialogue bar
- route switching should come from UI buttons, not global arrow-key listeners
