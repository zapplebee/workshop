import type { RefObject } from "react";
import type { Group } from "three";
import type { InventoryItemId } from "../inventory/types";
import type { ConversationActor } from "../conversations/types";

export type PlantProps = {
  position: [number, number, number];
  scale?: number;
  lean?: number;
  tint?: string;
};

export type GrassInstance = PlantProps & {
  id: string;
};

export type MovementKeys = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
};

export type CameraMode = "overview" | "follow" | "firstPerson";

export type CameraOverride = {
  kind: "cinematic";
  actor: ConversationActor;
  targetPosition: [number, number, number];
};

export type InteractionKind = "grass" | "rabbit" | "snake" | "mouse" | "robin" | "cardinal" | "donkey" | "antagonist-horse" | "owl" | "pickup";

export type InteractionTarget = {
  id: string;
  kind: InteractionKind;
  position: [number, number, number];
  range?: number;
  itemId?: InventoryItemId;
};

export type WorldPickup = {
  id: string;
  itemId: InventoryItemId;
  position: [number, number, number];
};

export type HorseControllerProps = {
  position: [number, number, number];
  scale: number;
  rotationY?: number;
  horseRef?: RefObject<Group | null>;
  keysRef: RefObject<MovementKeys>;
  controlsLocked?: boolean;
  actionOverride?: import("../../elements/creatures/Horse").HorseAction | null;
  visible?: boolean;
  terrainHeightAt: (x: number, z: number) => number;
};
