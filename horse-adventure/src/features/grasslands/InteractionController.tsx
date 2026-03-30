import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import type { Group } from "three";
import type { InteractionTarget, MovementKeys } from "./types";
import { INTERACTION_CELL_SIZE, INTERACTION_CHECK_INTERVAL, INTERACTION_RANGE } from "./worldData";

export function InteractionController({
  horseRef,
  keysRef,
  interactables,
  enabled,
  onInteract,
  onNearestChange,
}: {
  horseRef: RefObject<Group | null>;
  keysRef: RefObject<MovementKeys>;
  interactables: InteractionTarget[];
  enabled: boolean;
  onInteract: (target: InteractionTarget) => void;
  onNearestChange: (id: string | null) => void;
}) {
  const nearestIdRef = useRef<string | null>(null);
  const checkTimerRef = useRef(0);

  const interactableGrid = useMemo(() => {
    const grid = new Map<string, InteractionTarget[]>();

    for (const item of interactables) {
      const cellX = Math.floor(item.position[0] / INTERACTION_CELL_SIZE);
      const cellZ = Math.floor(item.position[2] / INTERACTION_CELL_SIZE);
      const key = `${cellX}:${cellZ}`;
      const cellItems = grid.get(key);

      if (cellItems) {
        cellItems.push(item);
      } else {
        grid.set(key, [item]);
      }
    }

    return grid;
  }, [interactables]);

  useFrame((_, delta) => {
    checkTimerRef.current += delta;

    if (checkTimerRef.current < INTERACTION_CHECK_INTERVAL) {
      return;
    }

    checkTimerRef.current = 0;

    if (!enabled) {
      if (nearestIdRef.current !== null) {
        nearestIdRef.current = null;
        onNearestChange(null);
      }
      return;
    }

    const horse = horseRef.current;
    const movementKeys = keysRef.current;

    if (movementKeys.forward || movementKeys.backward || movementKeys.left || movementKeys.right) {
      if (nearestIdRef.current !== null) {
        nearestIdRef.current = null;
        onNearestChange(null);
      }
      return;
    }

    if (!horse) {
      if (nearestIdRef.current !== null) {
        nearestIdRef.current = null;
        onNearestChange(null);
      }
      return;
    }

    let nextNearestId: string | null = null;
    let nearestDistance = Infinity;

    const horseCellX = Math.floor(horse.position.x / INTERACTION_CELL_SIZE);
    const horseCellZ = Math.floor(horse.position.z / INTERACTION_CELL_SIZE);

    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      for (let offsetZ = -1; offsetZ <= 1; offsetZ += 1) {
        const cellItems = interactableGrid.get(`${horseCellX + offsetX}:${horseCellZ + offsetZ}`);

        if (!cellItems) {
          continue;
        }

        for (const item of cellItems) {
          const dx = item.position[0] - horse.position.x;
          const dz = item.position[2] - horse.position.z;
          const distance = Math.hypot(dx, dz);
          const range = item.range ?? INTERACTION_RANGE;

          if (distance < range && distance < nearestDistance) {
            nearestDistance = distance;
            nextNearestId = item.id;
          }
        }
      }
    }

    if (nearestIdRef.current !== nextNearestId) {
      nearestIdRef.current = nextNearestId;
      onNearestChange(nextNearestId);
    }
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat || nearestIdRef.current === null) {
        return;
      }

      event.preventDefault();
      const target = interactables.find((item) => item.id === nearestIdRef.current);

      if (target) {
        onInteract(target);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [interactables, onInteract]);

  return null;
}
