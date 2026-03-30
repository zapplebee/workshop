# scenes

This directory contains route-level scene wrappers.

## Current Files

- `GrasslandsScene.tsx`: wraps the playable grasslands route canvas, left-side HUD, mobile controls, and bottom dialogue shell
- `CleanroomScene.tsx`: wraps the cleanroom canvas, docked browser HUD, action controls, wireframe toggle, and gizmo canvas

## Purpose

These files are responsible for scene-level layout and UI, not asset definitions.

They should coordinate:

- canvas setup
- route-level HUD chrome
- dialogue shells
- inventory/debug shell UI
- mobile control overlays
- cleanroom browser controls

They should not contain detailed creature geometry.

Recorded viewport/control decisions:

- dialogue belongs in a black bottom bar, not a floating center card
- scene nav uses visible UI buttons instead of arrow-key route switching
- dialogue option keyboard navigation should work without requiring the player to leave the keyboard

## Cleanroom Philosophy

Think of the cleanroom as a debug/crafting pane for assets.

It should remain:

- manifest-driven
- route-addressable
- easy to browse by asset category
- easy to extend with new controls per selected element
