# fixtures

This directory contains environmental assets and non-creature world pieces.

Examples:

- `Cloud`
- `Hill`
- `GrassClump`
- `CanyonRing`

## Conventions

- Fixtures should be easy to place from scene code.
- Prefer simple props for placement, scale, and tint.
- If a fixture is useful in the cleanroom, register it in `../manifest.tsx`.

## Cleanroom Usage

Most fixtures do not need action controls.

For those entries in the manifest:

- omit `controls` entirely if no actions are needed
- provide a simple `render` preview with sensible scale/placement

## Keep Here

- visual environment pieces
- scene dressing assets
- reusable ground/sky/structural pieces
