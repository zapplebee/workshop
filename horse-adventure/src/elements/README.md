# elements

This directory contains reusable renderable pieces of the game world.

## Subdirectories

- `creatures/`: animals and animateable living actors
- `fixtures/`: environmental or structural scene pieces
- `items/`: pickups, props, or interactable inventory-like objects

## Manifest

`manifest.tsx` is the cleanroom registry.

It is the most important file in this directory for asset discovery.

The manifest controls:

- which elements appear in the cleanroom browser
- each element's category label
- each element's cleanroom title/help text
- which actions are available in the cleanroom
- the default action for preview
- whether wireframe controls are shown
- how the element is rendered in the cleanroom

## Adding a New Element

1. Add the component under the right category directory.
2. Keep the component reusable and independent of route logic.
3. Register it in `manifest.tsx` if it should be previewable in the cleanroom.
4. If the element has animations, define a narrow action union type and wire the cleanroom controls through the manifest.

For new creatures, start from:

- `creatures/_template.tsx`

## Rule of Thumb

- If the object is something you would place into a scene, it belongs in `elements/`.
- If the object is only page/route UI chrome, it belongs in `scenes/` or elsewhere, not here.
