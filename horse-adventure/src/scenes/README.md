# scenes

This directory contains route-level scene wrappers.

## Current Files

- `GrasslandsScene.tsx`: wraps the playable grasslands route canvas and dialogue shell
- `CleanroomScene.tsx`: wraps the cleanroom canvas, browser HUD, action controls, wireframe toggle, and gizmo canvas

## Purpose

These files are responsible for scene-level layout and UI, not asset definitions.

They should coordinate:

- canvas setup
- route-level HUD chrome
- dialogue shells
- cleanroom browser controls

They should not contain detailed creature geometry.

## Cleanroom Philosophy

Think of the cleanroom as a debug/crafting pane for assets.

It should remain:

- manifest-driven
- route-addressable
- easy to browse by asset category
- easy to extend with new controls per selected element
