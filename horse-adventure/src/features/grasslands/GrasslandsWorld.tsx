import { useEffect, useMemo, useRef, useState } from "react";
import { Group } from "three";
import { Cardinal, type CardinalAction } from "../../elements/creatures/Cardinal";
import { Mouse, type MouseAction } from "../../elements/creatures/Mouse";
import { Rabbit } from "../../elements/creatures/Rabbit";
import { Robin, type RobinAction } from "../../elements/creatures/Robin";
import { Snake, type SnakeAction } from "../../elements/creatures/Snake";
import { CanyonRing } from "../../elements/fixtures/CanyonRing";
import { Cloud } from "../../elements/fixtures/Cloud";
import { GrassClump } from "../../elements/fixtures/GrassClump";
import { Hill } from "../../elements/fixtures/Hill";
import { Carrot } from "../../elements/items/Carrot";
import type { HorseAction } from "../../elements/creatures/Horse";
import type { ConversationActor } from "../conversations/types";
import type { InventoryItemId } from "../inventory/types";
import { CameraRig } from "./CameraRig";
import { HorseController } from "./HorseController";
import { InteractionController } from "./InteractionController";
import { accentPlantInstances, arenaGrassInstances, plantInstances } from "./grass";
import { getTerrainHeight } from "./terrain";
import type { CameraOverride, GrassInstance, InteractionTarget, WorldPickup } from "./types";
import { useCameraMode } from "./useCameraMode";
import { useMovementKeys } from "./useMovementKeys";
import {
  carrotPositions,
  cardinalPosition,
  CANYON_SEGMENTS,
  CANYON_WALL_HEIGHT,
  CANYON_WALL_THICKNESS,
  clouds,
  hills,
  horses,
  mousePosition,
  PLAY_AREA_RADIUS,
  rabbitPosition,
  robinPosition,
  snakePosition,
} from "./worldData";

type RabbitProps = {
  id: string;
  position: [number, number, number];
  highlighted?: boolean;
  wireframe?: boolean;
};

export function GrasslandsWorld({
  controlsLocked = false,
  conversationActive = false,
  conversationActor = null,
  conversationNodeAnimation,
  onConversationStart,
  onCollectItem,
}: {
  controlsLocked?: boolean;
  conversationActive?: boolean;
  conversationActor?: ConversationActor | null;
  conversationNodeAnimation?: string;
  onConversationStart: (actor: ConversationActor) => void;
  onCollectItem: (itemId: InventoryItemId) => boolean;
}) {
  const horseRef = useRef<Group>(null);
  const cameraMode = useCameraMode();
  const keysRef = useMovementKeys();
  const grassItems = useMemo<GrassInstance[]>(() => [
    ...accentPlantInstances,
    ...arenaGrassInstances,
    ...plantInstances,
  ], []);
  const [pickupItems, setPickupItems] = useState<WorldPickup[]>(() => carrotPositions.map((position, index) => ({
    id: `carrot-${index}`,
    itemId: "carrot",
    position,
  })));
  const [nearestInteractionId, setNearestInteractionId] = useState<string | null>(null);
  const rabbit: RabbitProps = { id: "rabbit-0", position: rabbitPosition };
  const cameraOverride = useMemo<CameraOverride | null>(() => {
    if (!conversationActive || !conversationActor) {
      return null;
    }

    const targetPosition = conversationActor === "rabbit"
      ? rabbitPosition
      : conversationActor === "snake"
        ? snakePosition
        : conversationActor === "mouse"
          ? mousePosition
          : conversationActor === "robin"
            ? robinPosition
            : cardinalPosition;

    return {
      kind: "cinematic",
      actor: conversationActor,
      targetPosition,
    };
  }, [conversationActive, conversationActor]);

  const interactables = useMemo<InteractionTarget[]>(
    () => [
      ...pickupItems.map((item) => ({ id: item.id, kind: "pickup" as const, position: item.position, itemId: item.itemId, range: 4.2 })),
      { id: rabbit.id, kind: "rabbit" as const, position: rabbit.position, range: 5 },
      { id: "snake-0", kind: "snake" as const, position: snakePosition, range: 5.2 },
      { id: "mouse-0", kind: "mouse" as const, position: mousePosition, range: 5 },
      { id: "robin-0", kind: "robin" as const, position: robinPosition, range: 5 },
      { id: "cardinal-0", kind: "cardinal" as const, position: cardinalPosition, range: 5 },
    ],
    [pickupItems, rabbit.id, rabbit.position],
  );

  const handleInteract = (target: InteractionTarget) => {
    if (target.kind === "rabbit") {
      setNearestInteractionId(target.id);
      onConversationStart("rabbit");
      return;
    }

    if (target.kind === "pickup" && target.itemId) {
      const collected = onCollectItem(target.itemId);

      if (collected) {
        setPickupItems((currentItems) => currentItems.filter((item) => item.id !== target.id));
        setNearestInteractionId((currentId) => (currentId === target.id ? null : currentId));
      }
      return;
    }

    if (target.kind === "snake") {
      setNearestInteractionId(target.id);
      onConversationStart("snake");
      return;
    }

    if (target.kind === "mouse") {
      setNearestInteractionId(target.id);
      onConversationStart("mouse");
      return;
    }

    if (target.kind === "robin") {
      setNearestInteractionId(target.id);
      onConversationStart("robin");
      return;
    }

    if (target.kind === "cardinal") {
      setNearestInteractionId(target.id);
      onConversationStart("cardinal");
    }
  };

  useEffect(() => {
    if (conversationActive) {
    }
  }, [conversationActive]);

  const snakeAction: SnakeAction = conversationActor === "snake" ? ((conversationNodeAnimation as SnakeAction | undefined) ?? "idle") : "idle";
  const mouseAction: MouseAction = conversationActor === "mouse" ? ((conversationNodeAnimation as MouseAction | undefined) ?? "idle") : "idle";
  const robinAction: RobinAction = conversationActor === "robin" ? ((conversationNodeAnimation as RobinAction | undefined) ?? "idle") : "idle";
  const cardinalAction: CardinalAction = conversationActor === "cardinal" ? ((conversationNodeAnimation as CardinalAction | undefined) ?? "idle") : "idle";
  const horseConversationAction: HorseAction | null = conversationActor === "rabbit"
    ? ((conversationNodeAnimation as HorseAction | undefined) ?? "jiggle_ears")
    : null;

  return (
    <>
      <CameraRig horseRef={horseRef} mode={cameraMode} override={cameraOverride} />
      <InteractionController
        horseRef={horseRef}
        keysRef={keysRef}
        interactables={interactables}
        enabled={!controlsLocked}
        onInteract={handleInteract}
        onNearestChange={setNearestInteractionId}
      />

      <color attach="background" args={["#9fcdf5"]} />
      <fog attach="fog" args={["#9fcdf5", 180, 380]} />

      <ambientLight intensity={1.06} color="#e8f3ff" />
      <hemisphereLight intensity={0.78} color="#bde0ff" groundColor="#a8c88b" />
      <directionalLight position={[9, 12, 6]} intensity={2.05} color="#ffe39a" castShadow />

      <mesh position={[170, 96, -220]}>
        <sphereGeometry args={[1.7, 32, 32]} />
        <meshBasicMaterial color="#ffe4a1" />
      </mesh>

      {clouds.map((cloud, index) => (
        <Cloud key={`cloud-${index}`} {...cloud} />
      ))}

      <CanyonRing innerRadius={PLAY_AREA_RADIUS} wallThickness={CANYON_WALL_THICKNESS} wallHeight={CANYON_WALL_HEIGHT} segments={CANYON_SEGMENTS} />

      {horses.map((horse, index) => (
        <HorseController
          key={`horse-${index}`}
          {...horse}
          actionOverride={horseConversationAction}
          controlsLocked={controlsLocked}
          keysRef={keysRef}
          horseRef={index === 0 ? horseRef : undefined}
          visible={index !== 0 || cameraMode !== "firstPerson" || conversationActive}
        />
      ))}

      <group position={[snakePosition[0], getTerrainHeight(snakePosition[0], snakePosition[2]) + 0.02, snakePosition[2]]} rotation={[0, 0.22, 0]}>
        <Snake action={snakeAction} highlighted={nearestInteractionId === "snake-0"} showSkeleton={false} wireframe={false} />
      </group>

      <group position={[mousePosition[0], getTerrainHeight(mousePosition[0], mousePosition[2]) + 0.02, mousePosition[2]]} rotation={[0, -0.18, 0]} scale={0.62}>
        <Mouse action={mouseAction} highlighted={nearestInteractionId === "mouse-0"} showSkeleton={false} wireframe={false} />
      </group>

      <group position={[robinPosition[0], getTerrainHeight(robinPosition[0], robinPosition[2]) + 0.02, robinPosition[2]]} rotation={[0, 0.4, 0]} scale={0.72}>
        <Robin action={robinAction} highlighted={nearestInteractionId === "robin-0"} showSkeleton={false} wireframe={false} />
      </group>

      <group position={[cardinalPosition[0], getTerrainHeight(cardinalPosition[0], cardinalPosition[2]) + 0.02, cardinalPosition[2]]} rotation={[0, -2.5, 0]} scale={0.74}>
        <Cardinal action={cardinalAction} highlighted={nearestInteractionId === "cardinal-0"} showSkeleton={false} wireframe={false} />
      </group>

      <Rabbit {...rabbit} highlighted={rabbit.id === nearestInteractionId} terrainHeightAt={getTerrainHeight} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[700, 700]} />
        <meshStandardMaterial color="#a9ca8a" roughness={1} flatShading />
      </mesh>

      {hills.map((hill, index) => (
        <Hill key={`hill-${index}`} {...hill} />
      ))}

      {grassItems.map((plant) => (
        <GrassClump key={plant.id} {...plant} highlighted={plant.id === nearestInteractionId} />
      ))}

      {pickupItems.map((item) => (
        <Carrot
          key={item.id}
          position={[item.position[0], getTerrainHeight(item.position[0], item.position[2]) + 0.02, item.position[2]]}
          highlighted={item.id === nearestInteractionId}
        />
      ))}
    </>
  );
}
