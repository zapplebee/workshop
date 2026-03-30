# src

This directory contains the runtime app code.

## Start Here

If you are a future agent ramping into the project, read these first:

1. `../README.md`
2. `../create-animal-manual.md`
3. `elements/README.md`
4. `scenes/README.md`
5. `conversations/README.md`

Most important architecture file:

- `elements/manifest.tsx`

That manifest controls which assets are browsable in the cleanroom, how they are categorized, and which controls/actions they expose there.

## Directory Guide

- `elements/`: reusable renderable world pieces and creatures
- `scenes/`: route-level scene shells and UI wrappers
- `conversations/`: YAML dialogue definitions
- `App.tsx`: app-level routing, conversation state, cleanroom selection, and main grasslands composition
- `frontend.tsx`: browser entry point
- `index.ts`: Bun server entry point

## Architectural Rule

Keep reusable world objects in `elements/`, not in `App.tsx`.

`App.tsx` should increasingly act as orchestration glue:

- route selection
- conversation loading/state
- scene assembly
- high-level gameplay state

## Cleanroom Rule

The cleanroom is a manifest-driven debug/crafting browser. New previewable assets should be added to `src/elements/manifest.tsx`.
