# Create Animal Manual

This file explains how future agents should add a new animal asset in the current manifest-driven architecture.

## Goal

Use the cleanroom to design a new low-poly/block animal from explicit user instructions, then add a skeleton, simple animations, and finally register it in the element manifest so it is browsable in the debug/crafting pane.

## Core Rules

- Keep the gameplay scene stable while designing new animals.
- Build new animals in the cleanroom first.
- Follow the user's block-by-block instructions exactly.
- Do not "improve" proportions unless the user asks.
- After the shape is approved, add skeleton and animation support.
- Once stable, move the animal into `src/elements/creatures/` and register it in `src/elements/manifest.tsx`.

## Clean Room Workflow

1. Select the animal in the cleanroom workflow.
   - The cleanroom is no longer hardcoded to a single animal.
   - Previewable assets are selected through the manifest and the route `/cleanroom/:elementId`.
   - Keep the floor, camera controls, gizmo, and browser HUD unless the user asks otherwise.

2. Build the animal in the cleanroom.
   - Start from `src/elements/creatures/_template.tsx` when creating a new creature component.
   - You can still begin with direct meshes while the shape is being discovered.
   - Add one block per user instruction.
   - Keep symmetry around the spine when the user requests it.
   - Prefer named constants for repeated sizes/positions instead of magic numbers.

3. Iterate from user feedback.
   - Make only the requested adjustment.
   - Do not keep rechecking the whole scene if the user says they will guide by feedback.

4. Add a skeleton.
   - Introduce named joint positions and connector bones.
   - Skeleton should visually explain the articulation.
   - If wireframe is toggled off, skeleton should also be hidden.

5. Add animations.
   - Add a small action union type for workshop preview controls.
   - Keep actions simple and readable at first.
   - Prefer body-wide motion patterns over detached part motion.
   - If one segment moves, neighboring segments should usually follow.

6. Extract to its own component.
   - Move the finished animal into `src/elements/creatures/<AnimalName>.tsx`.
   - Export the action type if the animal is animated.
   - Register it in `src/elements/manifest.tsx` so it appears in the cleanroom browser.
   - Keep `App.tsx` as the scene orchestrator, not the asset definition file.

## Recommended Build Order

For most animals:

1. body / torso
2. major masses (haunches, shoulders, mid-body segments)
3. upper limbs or body continuation
4. lower limbs / tail / neck
5. head
6. ears / eyes / small details
7. skeleton
8. animation states
9. extraction to dedicated component

## Cleanroom Conventions

- Cleanroom uses one shared route shell and route selection with React Router.
- Cleanroom should keep orbit controls and the view gizmo active.
- The cleanroom browser is manifest-driven and grouped by category.
- The center of the room should stay available for the selected asset under construction.
- The current scale reference is a simple `1x1x1` offset cube, not the old rabbit reference.

## Block Construction Guidelines

- Use `<mesh>` with `<boxGeometry>` for new block animals unless the user asks for a different primitive.
- Use `flatShading` for the material.
- Use wireframe while shaping if helpful, but support turning it off.
- Keep values explicit and understandable.
- If the user is still exploring forms, direct JSX meshes are fine.
- Once proportions settle, convert to structured data and move the component into `src/elements/creatures/`.

## When To Convert To Data

Convert the animal to a data-driven component when:

- there are enough parts that JSX is getting noisy
- the user wants a skeleton / rigging
- the user wants named animation actions
- the animal is likely to move into the gameplay scene
- the animal should appear in the cleanroom browser

Recommended structure:

```ts
type BlockPart = {
  id: string;
  parent?: string;
  position: [number, number, number];
  size: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
};
```

Then render recursively from the hierarchy.

## Skeleton Guidelines

- Add one visible joint per major articulation point.
- Connect joints with simple pink boxes/lines.
- Keep skeleton positions derived from the same source data when possible.
- The skeleton is a debug/authoring aid, not final art.

For snakes or segmented bodies:

- Use a chain of joints through the body center.
- Tail and head should anchor to neighboring segments.
- Avoid animations where the head or tail detaches from the chain.

For quadrupeds:

- Root at torso.
- Attach haunches / shoulders to torso.
- Limb chains should flow top to bottom.
- Neck and head should form a clear forward chain.

## Animation Guidelines

- Start with a small union type, for example:

```ts
type WorkshopAnimalAction = "idle" | "walk" | "eat";
```

- Add cleanroom control metadata in the manifest so the user can preview actions.
- Keep animation speed separate from gameplay movement speed.
- Use `useFrame` for simple loops.
- Base motion on the hierarchy, not on disconnected world transforms.

Examples:

- Quadruped
  - `walk`
  - `stand`
  - `eat`
  - `jiggle_ears`

- Snake
  - `idle`
  - `slither`
  - `coil`
  - `spring`

## Moving To Gameplay

Only replace the gameplay animal after the workshop version is approved.

When swapping into gameplay:

- keep movement logic separate from the animal render component
- map gameplay state to animation state
- examples:
  - moving -> `walk`
  - idle -> `stand`
  - interact -> `eat`
  - conversation -> `jiggle_ears`

## File Organization

Suggested pattern:

- `src/App.tsx`
  - route orchestration
  - gameplay orchestration
- `src/elements/creatures/<AnimalName>.tsx`
  - animal geometry
  - animation actions
  - skeleton/highlight support if needed
- `src/elements/manifest.tsx`
  - cleanroom registration
  - action metadata
  - category/browser visibility

Do not introduce new canonical asset files under a `workshop*` namespace.

## Practical Checklist

When creating a new animal, do this in order:

- build or update the animal component under `src/elements/creatures/`
- register it in `src/elements/manifest.tsx`
- place new reference blocks in center if needed
- follow user instructions block by block
- keep numbers named once the form stabilizes
- add small details last
- add skeleton overlay
- add action controls
- make wireframe toggle hide the skeleton too
- ensure the cleanroom browser can navigate to it
- only then consider swapping it into gameplay

## Common Pitfalls

- Do not bake everything into one merged geometry before rigging.
- Do not detach head/tail from the animated chain.
- Do not hardcode lots of unexplained numbers once the form is stable.
- Do not modify the gameplay animal while the user is still iterating in cleanroom unless explicitly asked.
- Do not leave asset geometry embedded in `App.tsx` once it becomes substantial.
- Do not add previewable assets without updating the manifest.

## Current Project Notes

- The cleanroom already supports:
  - orbit camera controls
  - manifest-driven asset browser
  - action buttons per selected element
  - wireframe toggle
  - top-right gizmo
- route-addressable asset previews via `/cleanroom/:elementId`
- A simple `1x1x1` offset cube is used as a scale reference.
- Grasslands creatures can use finished cleanroom assets once approved.
- User decision: new world elements should be added to the cleanroom by default so they can be refined there before or during gameplay use.
