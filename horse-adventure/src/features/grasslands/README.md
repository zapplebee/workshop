# grasslands

This feature directory owns the playable world logic for `/grasslands`.

## Responsibilities

- world composition
- player movement
- camera behavior
- nearby interaction detection
- world pickup placement
- grasslands-specific constants and terrain shaping

## Key Files

- `GrasslandsWorld.tsx`
  - main scene composition for the playable world
  - wires creatures, pickups, terrain fixtures, interaction indicator, and camera override state
- `worldData.ts`
  - placement data and core world tuning values
  - includes plants, hills, clouds, creature positions, pickup positions, and canyon constants
- `terrain.ts`
  - terrain height sampling based on hill data
- `InteractionController.tsx`
  - nearest-target detection
  - keyboard/mobile interaction triggering
  - cooldown handling to avoid immediate retriggers
- `CameraRig.tsx`
  - player camera behavior
  - cinematic dialogue override framing
- `HorseController.tsx`
  - player horse movement wrapper and animation selection
- `useMovementKeys.ts`
  - keyboard-driven movement state
- `useCameraMode.ts`
  - cycles player camera mode

## Current Camera Behavior

Player camera modes:

- `overview`
- `follow`
- `firstPerson`

Conversation camera behavior:

- active dialogue with a creature temporarily overrides the player camera with a cinematic framing
- the cinematic view should keep both speakers visible above the bottom dialogue bar
- when dialogue ends, the camera returns to the previously selected player mode

Recorded user decisions:

- `C` cycles camera modes
- first person should hide the player horse mesh
- cinematic dialogue framing should bias from the horse side, but keep subjects readable above the dialogue UI

## Current Interaction Behavior

- interaction targets are selected by proximity
- the current nearby target is shown with a pulsing ground ring rather than pink highlight glow on the target itself
- the ring should not be shown while dialogue is active
- grass is no longer an interactable target
- carrots and cowboy hat are pickup targets
- creatures trigger dialogue when interacted with

Recorded user decisions:

- interaction feedback should feel readable in first person
- route switching should not use arrow-key listeners anymore because dialogue uses arrow keys

## Current Controls

Desktop:

- `W/A/S/D`: move
- `Space`: interact
- `C`: cycle camera mode
- `I`: toggle inventory
- during dialogue:
  - `ArrowLeft` / `ArrowUp`: previous option
  - `ArrowRight` / `ArrowDown`: next option
  - `Enter` / `Space`: confirm option

Mobile:

- onscreen movement buttons
- onscreen interact button
- onscreen camera button

## Notes For Future Changes

- keep world placements and tuning in `worldData.ts` instead of scattering them through scene code
- prefer extending the existing pickup and interaction model rather than inventing actor-specific one-off input paths
- when changing dialogue framing, test against the bottom black dialogue bar, especially on mobile viewport sizes
