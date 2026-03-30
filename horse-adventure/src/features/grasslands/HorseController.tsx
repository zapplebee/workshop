import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Group } from "three";
import { Horse, type HorseAction } from "../../elements/creatures/Horse";
import type { HorseControllerProps } from "./types";
import { HORSE_BOUNDARY_PADDING, HORSE_GROUND_OFFSET, HORSE_MOVE_SPEED, HORSE_TURN_SPEED, PLAY_AREA_RADIUS } from "./worldData";

export function HorseController({ position, scale, rotationY = 0, horseRef, keysRef, controlsLocked = false, actionOverride = null, visible = true, terrainHeightAt }: HorseControllerProps) {
  const localGroupRef = useRef<Group>(null);
  const groupRef = horseRef ?? localGroupRef;
  const [action, setAction] = useState<HorseAction>(actionOverride ?? "stand");

  useFrame((_, delta) => {
    const group = groupRef.current;

    if (!group) {
      return;
    }

    const turn = (keysRef.current.right ? 1 : 0) - (keysRef.current.left ? 1 : 0);
    const move = (keysRef.current.forward ? 1 : 0) - (keysRef.current.backward ? 1 : 0);

    if (controlsLocked || (turn === 0 && move === 0)) {
      return;
    }

    group.rotation.y -= turn * HORSE_TURN_SPEED * delta;

    const forwardX = Math.cos(group.rotation.y);
    const forwardZ = -Math.sin(group.rotation.y);
    const stepX = forwardX * move * HORSE_MOVE_SPEED * delta;
    const stepZ = forwardZ * move * HORSE_MOVE_SPEED * delta;
    const nextX = group.position.x + stepX;
    const nextZ = group.position.z + stepZ;
    const boundaryRadius = PLAY_AREA_RADIUS - HORSE_BOUNDARY_PADDING;
    const distanceFromCenter = Math.hypot(nextX, nextZ);

    if (distanceFromCenter > boundaryRadius) {
      const clampRatio = boundaryRadius / distanceFromCenter;
      group.position.x = nextX * clampRatio;
      group.position.z = nextZ * clampRatio;
    } else {
      group.position.x = nextX;
      group.position.z = nextZ;
    }

    group.position.y = terrainHeightAt(group.position.x, group.position.z) + HORSE_GROUND_OFFSET;
  });

  useFrame(() => {
    const moving = keysRef.current.forward || keysRef.current.backward || keysRef.current.left || keysRef.current.right;
    const nextAction = actionOverride ?? (moving && !controlsLocked ? "walk" : "stand");

    setAction((currentAction) => (currentAction === nextAction ? currentAction : nextAction));
  });

  useEffect(() => {
    const group = groupRef.current;

    if (!group) {
      return;
    }

    group.position.y = terrainHeightAt(group.position.x, group.position.z) + HORSE_GROUND_OFFSET;
  }, [groupRef, terrainHeightAt]);

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {visible ? <Horse action={action} showSkeleton={false} wireframe={false} /> : null}
    </group>
  );
}
