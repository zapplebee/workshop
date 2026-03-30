# features

This directory contains gameplay and app-level subsystems that are larger than a single scene shell or element component.

## Current Subsystems

- `cleanroom/`
  - cleanroom selection state
  - workshop camera helpers and controls
- `conversations/`
  - shared conversation types
  - actor registry
  - conversation loading/runtime helpers
- `grasslands/`
  - world data
  - movement/camera/interaction logic
  - grasslands world composition
- `inventory/`
  - physical, possessable things
  - stackables and physical key items
  - intentionally in-memory for now
- `navigation/`
  - cross-route scene switching helpers
- `world-flags/`
  - non-physical truth/state
  - clues, learned facts, and progression flags
  - intentionally in-memory for now

## Design Rule

Use `features/` for systems that coordinate state or behavior across multiple components.

Examples:

- inventory rules
- conversation runtime rules
- world flags
- grasslands interaction/camera logic

Do not put reusable world geometry here unless it is tightly coupled to subsystem logic. Pure renderable pieces should stay in `src/elements/`.

## Recorded User Decisions

- if it can be carried, it is inventory
- if it is just true now, it is a world flag
- both inventory and world flags should stay in memory for now to keep iteration easy
- new gameplay elements should also be added to the cleanroom so they can be refined there
- world flags should stay flat and human-readable, for example `rabbit.carrots_given`

## Practical Rule Of Thumb

- `elements/` = things placed into scenes
- `scenes/` = route-level shells and HUD/UI wrappers
- `features/` = systems and orchestration helpers behind those scenes
