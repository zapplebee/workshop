import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Group } from "three";

// Replace this action union with the smallest set of preview states the creature needs.
// Examples used elsewhere in the app include:
// - horse: walk / stand / eat / jiggle_ears
// - snake: idle / slither / coil / spring
// - mouse: idle / fright / scuddle / jiggle_ears_and_whiskers
//
// Keep this list narrow and meaningful. The cleanroom manifest will expose these values
// as buttons, so every action here should correspond to a real preview behavior.
export type CreatureAction = "idle";

// These are the standard props expected by the cleanroom manifest and scene tooling.
// Future creature components should generally support this same shape so they can plug
// into the cleanroom without custom glue code.
//
// - action: which preview animation/state should currently play
// - wireframe: whether the visible creature geometry should render in wireframe mode
// - showSkeleton: whether debug skeleton markers/connectors should be visible
// - highlighted: whether the creature should render a pink interaction/debug glow shell
type CreatureProps = {
  action: CreatureAction;
  wireframe: boolean;
  showSkeleton: boolean;
  highlighted?: boolean;
};

export function CreatureTemplate({ action, wireframe, showSkeleton, highlighted = false }: CreatureProps) {
  // Use a root group ref so animation logic can move/rotate the whole creature without
  // rebuilding React structure every frame. More complex creatures often keep additional
  // refs for head, tail, limbs, ears, or skeleton joints.
  const rootRef = useRef<Group | null>(null);

  useFrame(({ clock }) => {
    // Always guard refs in frame loops. The component may render before refs are ready,
    // and React can briefly clear refs during remounts.
    if (!rootRef.current) {
      return;
    }

    // This file intentionally uses a tiny idle bob as the default example animation.
    // Replace this block with the creature's real animation logic. Prefer keeping the
    // motion driven by the `action` prop rather than internal ad hoc state so the
    // cleanroom, conversations, and gameplay wrappers can all control the same asset.
    if (action === "idle") {
      rootRef.current.position.y = Math.sin(clock.getElapsedTime() * 1.5) * 0.02;
    }
  });

  return (
    <group ref={rootRef}>
      {/*
        Skeleton/debug marker example.

        The cleanroom uses skeleton overlays as a rigging aid. For simple creatures this
        might just be one joint marker. For articulated creatures, replace this with a
        chain of joints and connector bones. Keep the skeleton hidden when showSkeleton
        is false so wireframe-off previews stay visually clean.
      */}
      {showSkeleton ? (
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshBasicMaterial color="#ff8fd1" />
        </mesh>
      ) : null}

      {/*
        Interaction/debug highlight example.

        The app uses a pink glow shell to indicate that an asset is interactable or
        selected. The usual pattern is to render a slightly larger translucent mesh using
        the same base geometry as the visible creature part.
      */}
      {highlighted ? (
        <mesh position={[0, 0.25, 0]} scale={[1.08, 1.08, 1.08]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshBasicMaterial color="#ff59bf" transparent opacity={0.38} />
        </mesh>
      ) : null}

      {/*
        Visible creature body placeholder.

        Swap this starter cube out for the actual creature geometry. Keep `wireframe`
        threaded through the visible material so the cleanroom checkbox can show either
        the finished shaded shape or the block-construction view.
      */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#9b7f63" roughness={1} flatShading wireframe={wireframe} />
      </mesh>
    </group>
  );
}
