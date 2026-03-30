# creatures

This directory contains living actors and animal assets.

## Start From Template

Use `src/elements/creatures/_template.tsx` when creating a new creature.

It gives you the expected starter shape for:

- action prop wiring
- wireframe support
- skeleton toggle support
- highlighted preview support
- basic `useFrame` animation structure

## Conventions

- Export a component with a plain asset name like `Horse`, `Snake`, `Mouse`, `Rabbit`.
- Export the action type if the creature is animated, for example `HorseAction`.
- Keep animation state driven by props where possible.
- Keep cleanroom concerns outside the component except for generic props like:
  - `action`
  - `wireframe`
  - `showSkeleton`
  - `highlighted`

## Typical Creature Responsibilities

- geometry
- skeleton visualization (if supported)
- preview animation logic
- highlight rendering

## Typical Creature Non-Responsibilities

- route selection
- conversation loading
- cleanroom browser UI
- gameplay input handling unless explicitly wrapped elsewhere

## Workflow

Prototype from user directions, then stabilize into a reusable component and register it in `../manifest.tsx`.
