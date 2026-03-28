import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, memo, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  DoubleSide,
  Group,
  Quaternion,
  Vector3,
} from "three";
import { OrbitControls as ThreeOrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "./index.css";
import { WORKSHOP_RABBIT_POSITION, WorkshopHorse, type WorkshopHorseAction } from "./workshopHorse";
import { WorkshopSnake, type WorkshopSnakeAction } from "./workshopSnake";

type PlantProps = {
  position: [number, number, number];
  scale?: number;
  lean?: number;
  tint?: string;
};

type HillProps = {
  position: [number, number, number];
  scale: [number, number, number];
  tint: string;
};

type CloudProps = {
  position: [number, number, number];
  scale: number;
  drift?: number;
};

type HorseProps = {
  position: [number, number, number];
  scale: number;
  rotationY?: number;
  horseRef?: RefObject<Group | null>;
  keysRef: RefObject<MovementKeys>;
  controlsLocked?: boolean;
  actionOverride?: WorkshopHorseAction | null;
};

type MovementKeys = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
};

type CameraMode = "overview" | "follow";

type InteractionKind = "grass" | "rabbit" | "snake";
type ConversationActor = "rabbit" | "snake";

type InteractionTarget = {
  id: string;
  kind: InteractionKind;
  position: [number, number, number];
  range?: number;
};

type RabbitProps = {
  id: string;
  position: [number, number, number];
  highlighted?: boolean;
  wireframe?: boolean;
};

type HorseConfig = Omit<HorseProps, "horseRef" | "keysRef" | "controlsLocked">;

type ConversationOption = {
  label: string;
  next?: string;
  end?: string;
};

type ConversationNode = {
  text: string;
  animation?: string;
  options?: ConversationOption[];
};

type ConversationTree = {
  actor: ConversationActor;
  name: string;
  start: string;
  nodes: Record<string, ConversationNode>;
};

type ConversationStore = Partial<Record<ConversationActor, ConversationTree>>;

type SceneMode = "grasslands" | "workshop";

type GrassInstance = PlantProps & {
  id: string;
};

const plants: PlantProps[] = [
  { position: [-5.3, 0, 1.8], scale: 1, lean: -0.2, tint: "#85b668" },
  { position: [-3.6, 0, 0.7], scale: 0.82, lean: 0.12, tint: "#7ea95f" },
  { position: [-1.9, 0, 2.1], scale: 1.08, lean: -0.05, tint: "#8abb6b" },
  { position: [0.15, 0, 0.85], scale: 0.92, lean: 0.18, tint: "#7ca35c" },
  { position: [2.1, 0, 1.8], scale: 1.06, lean: -0.14, tint: "#90c071" },
  { position: [4.1, 0, 0.8], scale: 0.88, lean: 0.1, tint: "#7aa359" },
  { position: [5.9, 0, 2.3], scale: 0.98, lean: -0.12, tint: "#8bbc69" },
  { position: [-4.5, 0, -1.7], scale: 0.78, lean: 0.16, tint: "#7ea55f" },
  { position: [-2.1, 0, -2.2], scale: 0.88, lean: -0.08, tint: "#8bb96c" },
  { position: [1.3, 0, -1.8], scale: 0.84, lean: 0.06, tint: "#84b364" },
  { position: [3.8, 0, -2.4], scale: 1, lean: -0.14, tint: "#7ca65a" },
  { position: [6.1, 0, -1.4], scale: 0.8, lean: 0.12, tint: "#88b86a" },
];

const accentPlants: PlantProps[] = [
  { position: [-4.2, 0, 2.8], scale: 0.45, lean: -0.08, tint: "#93c977" },
  { position: [-2.7, 0, 1.5], scale: 0.38, lean: 0.16, tint: "#86b95f" },
  { position: [-0.7, 0, 2.7], scale: 0.4, lean: -0.04, tint: "#9acd75" },
  { position: [0.9, 0, 1.6], scale: 0.42, lean: 0.08, tint: "#8abf66" },
  { position: [2.9, 0, 2.9], scale: 0.35, lean: -0.12, tint: "#90c270" },
  { position: [4.8, 0, 1.5], scale: 0.4, lean: 0.06, tint: "#7fab5c" },
  { position: [-3.4, 0, -1.1], scale: 0.36, lean: 0.1, tint: "#8ebf68" },
  { position: [1.9, 0, -2.8], scale: 0.38, lean: -0.08, tint: "#7ea95f" },
];

const hills: HillProps[] = [
  { position: [-8.3, -0.2, -15], scale: [8.2, 2.6, 6.8], tint: "#8fb26f" },
  { position: [8.2, -0.28, -16], scale: [7.2, 2.3, 6.1], tint: "#85a95f" },
  { position: [0.5, -0.55, -22], scale: [15.5, 3.5, 10.6], tint: "#7f9f56" },
  { position: [0, -0.82, -9], scale: [11.2, 1.45, 4.6], tint: "#9cbc7b" },
];

const clouds: CloudProps[] = [
  { position: [-8.2, 18, -8], scale: 4.5, drift: -0.28 },
  { position: [-1.8, 19.5, -9], scale: 3.8, drift: 0.08 },
  { position: [4.6, 18.6, -8], scale: 4.1, drift: 0.22 },
  { position: [9.2, 17.8, -7], scale: 4.2, drift: -0.16 },
  { position: [1.5, 20.4, -10], scale: 2.8, drift: 0.05 },
];

const snakePosition: [number, number, number] = [-3.6, 0, -4.8];

const horses: HorseConfig[] = [
  { position: [1.2, 0.02, -2.8], scale: 0.92, rotationY: -0.18 },
];

const PLAY_AREA_RADIUS = 200;
const CANYON_WALL_THICKNESS = 24;
const CANYON_WALL_HEIGHT = 36;
const CANYON_SEGMENTS = 24;
const HORSE_MOVE_SPEED = 8;
const HORSE_TURN_SPEED = 2.4;
const HORSE_BOUNDARY_PADDING = 8;
const HORSE_GROUND_OFFSET = 0.02;
const INTERACTION_RANGE = 2.75;
const INTERACTION_CELL_SIZE = 12;
const INTERACTION_CHECK_INTERVAL = 0.25;
const RABBIT_POSITION: [number, number, number] = [6.8, 0, -5.4];

function createGrassInstances(source: PlantProps[], prefix: string) {
  return source.map((plant, index) => ({
    ...plant,
    id: `${prefix}-${index}`,
  }));
}

function getTerrainHeight(x: number, z: number) {
  let height = 0;

  for (const hill of hills) {
    const [centerX, centerY, centerZ] = hill.position;
    const [radiusX, radiusY, radiusZ] = hill.scale;
    const normalizedX = (x - centerX) / radiusX;
    const normalizedZ = (z - centerZ) / radiusZ;
    const distanceSquared = normalizedX * normalizedX + normalizedZ * normalizedZ;

    if (distanceSquared > 1) {
      continue;
    }

    const hillHeight = centerY + radiusY * Math.sqrt(1 - distanceSquared);
    height = Math.max(height, hillHeight);
  }

  return height;
}

function useMovementKeys() {
  const keysRef = useRef<MovementKeys>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    const setKey = (code: string, pressed: boolean) => {
      if (code === "KeyW") {
        keysRef.current.forward = pressed;
      }
      if (code === "KeyS") {
        keysRef.current.backward = pressed;
      }
      if (code === "KeyA") {
        keysRef.current.left = pressed;
      }
      if (code === "KeyD") {
        keysRef.current.right = pressed;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      setKey(event.code, true);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      setKey(event.code, false);
    };

    const clearKeys = () => {
      keysRef.current.forward = false;
      keysRef.current.backward = false;
      keysRef.current.left = false;
      keysRef.current.right = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", clearKeys);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", clearKeys);
    };
  }, []);

  return keysRef;
}

function useCameraMode() {
  const [mode, setMode] = useState<CameraMode>("overview");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "KeyC" || event.repeat) {
        return;
      }

      setMode((currentMode) => (currentMode === "overview" ? "follow" : "overview"));
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return mode;
}

function useSceneMode() {
  const [sceneMode, setSceneMode] = useState<SceneMode>("grasslands");

  useEffect(() => {
    const modes: SceneMode[] = ["grasslands", "workshop"];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "ArrowLeft" && event.code !== "ArrowRight") {
        return;
      }

      event.preventDefault();
      setSceneMode((currentMode) => {
        const currentIndex = modes.indexOf(currentMode);
        const direction = event.code === "ArrowRight" ? 1 : -1;
        const nextIndex = (currentIndex + direction + modes.length) % modes.length;
        return modes[nextIndex];
      });
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return sceneMode;
}

function WorkshopGizmoScene({ quaternion }: { quaternion: [number, number, number, number] }) {
  return (
    <>
      <color attach="background" args={["#12233d"]} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <group quaternion={new Quaternion(...quaternion)}>
        <mesh>
          <boxGeometry args={[0.9, 0.9, 0.9]} />
          <meshStandardMaterial color="#d7e4f5" roughness={0.9} flatShading wireframe />
        </mesh>
        <mesh position={[0.95, 0, 0]}>
          <boxGeometry args={[1, 0.08, 0.08]} />
          <meshStandardMaterial color="#ff7a7a" roughness={1} flatShading />
        </mesh>
        <mesh position={[0, 0.95, 0]}>
          <boxGeometry args={[0.08, 1, 0.08]} />
          <meshStandardMaterial color="#7dff9a" roughness={1} flatShading />
        </mesh>
        <mesh position={[0, 0, 0.95]}>
          <boxGeometry args={[0.08, 0.08, 1]} />
          <meshStandardMaterial color="#82b7ff" roughness={1} flatShading />
        </mesh>
      </group>
    </>
  );
}

function WorkshopControls({ onCameraQuaternionChange }: { onCameraQuaternionChange?: (quaternion: [number, number, number, number]) => void }) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<ThreeOrbitControls | null>(null);
  const lastQuaternionRef = useRef("");

  useEffect(() => {
    camera.position.set(0, 2.8, 8);
    const controls = new ThreeOrbitControls(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0.6, 0);
    controls.enablePan = true;
    controls.minDistance = 2;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.update();
    controlsRef.current = controls;

    return () => {
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl]);

  useFrame(() => {
    controlsRef.current?.update();

    if (!onCameraQuaternionChange) {
      return;
    }

    const next: [number, number, number, number] = [camera.quaternion.x, camera.quaternion.y, camera.quaternion.z, camera.quaternion.w];
    const key = next.join(":");

    if (key !== lastQuaternionRef.current) {
      lastQuaternionRef.current = key;
      onCameraQuaternionChange(next);
    }
  });

  return null;
}

function createArenaGrass(): GrassInstance[] {
  const tufts: GrassInstance[] = [];
  const tuftCount = 2600;
  const maxRadius = PLAY_AREA_RADIUS - 10;

  const hash = (value: number) => {
    const x = Math.sin(value * 127.1) * 43758.5453123;
    return x - Math.floor(x);
  };

  for (let index = 0; index < tuftCount; index += 1) {
    const angle = hash(index + 1) * Math.PI * 2;
    const radius = Math.sqrt(hash(index + 101)) * maxRadius;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    if (Math.hypot(x, z) < 14) {
      continue;
    }

    const variant = index % 7;
    const patch = Math.sin(x * 0.045) + Math.cos(z * 0.04);

    tufts.push({
      id: `arena-${index}`,
      position: [x, 0, z],
      scale: 0.5 + hash(index + 203) * 0.45,
      lean: (hash(index + 307) - 0.5) * 0.28,
      tint: patch > 0.55 ? "#8cbc68" : patch < -0.45 ? "#74a654" : variant > 4 ? "#88ba64" : "#7fb15d",
    });
  }

  return tufts;
}

const arenaGrassInstances = createArenaGrass();
const plantInstances = createGrassInstances(plants, "plant");
const accentPlantInstances = createGrassInstances(accentPlants, "accent");

const GrassTuft = memo(function GrassTuft({
  position,
  scale = 1,
  lean = 0,
  tint = "#7aa05c",
  highlighted = false,
}: PlantProps & { highlighted?: boolean }) {
  const prisms = [
    { offset: [-0.08, 0.42, 0], scale: [0.08, 0.84, 0.08], rotation: -0.22, color: tint },
    { offset: [0, 0.54, 0.02], scale: [0.09, 1.08, 0.09], rotation: 0.04, color: "#93c977" },
    { offset: [0.08, 0.48, -0.01], scale: [0.08, 0.96, 0.08], rotation: 0.24, color: tint },
  ] as const;

  return (
    <group position={position} scale={scale} rotation={[0, lean, 0]}>
      {prisms.map((prism, index) => (
        <group key={index} position={prism.offset} rotation={[0, prism.rotation, 0]} scale={prism.scale}>
          {highlighted ? (
            <mesh scale={[1.35, 1.08, 1.35]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="#ff59bf" transparent opacity={0.45} side={DoubleSide} />
            </mesh>
          ) : null}

          <mesh castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={prism.color} roughness={1} flatShading side={DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
});

const Rabbit = memo(function Rabbit({ position, highlighted = false, wireframe = false }: RabbitProps) {
  return (
    <group position={[position[0], getTerrainHeight(position[0], position[2]) + 0.2, position[2]]}>
      {highlighted ? (
        <group>
          <mesh position={[0, 0.34, 0]} scale={[0.96, 0.72, 0.72]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#ff59bf" transparent opacity={0.35} side={DoubleSide} />
          </mesh>
          <mesh position={[-0.12, 0.82, 0]} scale={[0.2, 0.68, 0.2]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#ff59bf" transparent opacity={0.35} side={DoubleSide} />
          </mesh>
          <mesh position={[0.12, 0.82, 0]} scale={[0.2, 0.68, 0.2]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#ff59bf" transparent opacity={0.35} side={DoubleSide} />
          </mesh>
        </group>
      ) : null}

      <mesh castShadow position={[0, 0.34, 0]} scale={[0.84, 0.6, 0.6]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#efe8de" roughness={1} flatShading wireframe={wireframe} />
      </mesh>
      <mesh castShadow position={[-0.12, 0.82, 0]} scale={[0.16, 0.56, 0.16]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#efe8de" roughness={1} flatShading wireframe={wireframe} />
      </mesh>
      <mesh castShadow position={[0.12, 0.82, 0]} scale={[0.16, 0.56, 0.16]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#efe8de" roughness={1} flatShading wireframe={wireframe} />
      </mesh>
      <mesh castShadow position={[0.32, 0.24, -0.08]} scale={[0.22, 0.18, 0.18]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#efe8de" roughness={1} flatShading wireframe={wireframe} />
      </mesh>
    </group>
  );
});

function Hill({ position, scale, tint }: HillProps) {
  return (
    <mesh position={position} scale={scale} receiveShadow>
      <sphereGeometry args={[1, 24, 16]} />
      <meshStandardMaterial color={tint} roughness={1} flatShading />
    </mesh>
  );
}

function Cloud({ position, scale, drift = 0 }: CloudProps) {
  const puffs = [
    [-0.7, 0.02, 0],
    [-0.25, 0.16, 0.06],
    [0.2, 0.04, 0],
    [0.56, 0.13, -0.02],
    [0.95, 0.02, 0.03],
    [0.18, -0.08, 0],
  ] as const;

  return (
    <group position={position} scale={scale} rotation={[0, drift, 0]}>
      <mesh position={[0, -0.18, 0]} scale={[1.9, 0.5, 0.82]}>
        <sphereGeometry args={[1, 20, 14]} />
        <meshBasicMaterial color="#d6e8ff" transparent opacity={0.75} fog={false} />
      </mesh>

      {puffs.map(([x, y, z], index) => (
        <mesh key={index} position={[x, y, z]} scale={[0.95, 0.82, 0.8]}>
          <sphereGeometry args={[0.55 + (index % 2) * 0.08, 18, 14]} />
          <meshBasicMaterial color={index % 2 === 0 ? "#fffefc" : "#eef5ff"} transparent opacity={0.98} fog={false} />
        </mesh>
      ))}
    </group>
  );
}

function Horse({ position, scale, rotationY = 0, horseRef, keysRef, controlsLocked = false, actionOverride = null }: HorseProps) {
  const localGroupRef = useRef<Group>(null);
  const groupRef = horseRef ?? localGroupRef;
  const [action, setAction] = useState<WorkshopHorseAction>(actionOverride ?? "stand");

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

    group.position.y = getTerrainHeight(group.position.x, group.position.z) + HORSE_GROUND_OFFSET;
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

    group.position.y = getTerrainHeight(group.position.x, group.position.z) + HORSE_GROUND_OFFSET;
  }, [groupRef]);

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <WorkshopHorse action={action} showSkeleton={false} wireframe={false} />
    </group>
  );
}

function CameraRig({ horseRef, mode }: { horseRef: RefObject<Group | null>; mode: CameraMode }) {
  const { camera } = useThree();
  const overviewPosition = useMemo(() => new Vector3(0, 14, 42), []);
  const overviewTarget = useMemo(() => new Vector3(0, 0, 0), []);
  const cameraPosition = useMemo(() => new Vector3(), []);
  const lookTarget = useMemo(() => new Vector3(), []);
  const riderEyeHeight = 2.4;
  const riderBackOffset = 1.7;
  const riderLookDistance = 12;

  useFrame((_, delta) => {
    const smoothing = 1 - Math.exp(-delta * 5);

    if (mode === "follow" && horseRef.current) {
      const horse = horseRef.current;
      const heading = horse.rotation.y;
      const forwardX = Math.cos(heading);
      const forwardZ = -Math.sin(heading);

      cameraPosition.set(
        horse.position.x - forwardX * riderBackOffset,
        horse.position.y + riderEyeHeight,
        horse.position.z - forwardZ * riderBackOffset,
      );
      lookTarget.set(
        horse.position.x + forwardX * riderLookDistance,
        horse.position.y + 1.4,
        horse.position.z + forwardZ * riderLookDistance,
      );
      camera.fov += (54 - camera.fov) * smoothing;
    } else {
      cameraPosition.copy(overviewPosition);
      lookTarget.copy(overviewTarget);
      camera.fov += (42 - camera.fov) * smoothing;
    }

    camera.position.lerp(cameraPosition, smoothing);
    camera.updateProjectionMatrix();
    camera.lookAt(lookTarget);
  });

  return null;
}

function InteractionController({
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

function CanyonRing() {
  const innerRadius = PLAY_AREA_RADIUS;
  const outerRadius = PLAY_AREA_RADIUS + CANYON_WALL_THICKNESS;
  const ringY = CANYON_WALL_HEIGHT * 0.5;

  return (
    <group position={[0, ringY, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[outerRadius, outerRadius, CANYON_WALL_HEIGHT, CANYON_SEGMENTS, 1, true]} />
        <meshStandardMaterial color="#b4663f" roughness={1} flatShading side={DoubleSide} />
      </mesh>

      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[innerRadius, innerRadius, CANYON_WALL_HEIGHT - 2, CANYON_SEGMENTS, 1, true]} />
        <meshStandardMaterial color="#c57f50" roughness={1} flatShading side={DoubleSide} />
      </mesh>

      <mesh position={[0, CANYON_WALL_HEIGHT * 0.5 - 1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[outerRadius, outerRadius, 2.4, CANYON_SEGMENTS, 1, true]} />
        <meshStandardMaterial color="#dda06c" roughness={1} flatShading side={DoubleSide} />
      </mesh>

      <mesh position={[0, -CANYON_WALL_HEIGHT * 0.5 + 1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[outerRadius, outerRadius, 2.4, CANYON_SEGMENTS, 1, true]} />
        <meshStandardMaterial color="#9e5534" roughness={1} flatShading side={DoubleSide} />
      </mesh>
    </group>
  );
}

function WorkshopScene({
  onCameraQuaternionChange,
  snakeAction,
  wireframe,
}: {
  onCameraQuaternionChange?: (quaternion: [number, number, number, number]) => void;
  snakeAction: WorkshopSnakeAction;
  wireframe: boolean;
}) {
  return (
    <>
      <WorkshopControls onCameraQuaternionChange={onCameraQuaternionChange} />

      <color attach="background" args={["#2f78d8"]} />
      <fog attach="fog" args={["#2f78d8", 40, 120]} />

      <ambientLight intensity={1.2} color="#dfeeff" />
      <hemisphereLight intensity={1} skyColor="#9fd2ff" groundColor="#8ea2b8" />
      <directionalLight position={[8, 14, 10]} intensity={2.2} color="#fff0c2" castShadow />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#50555d" roughness={1} flatShading />
      </mesh>

      <mesh position={[0, 0.3315, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.51, 0.51, 0.51]} />
        <meshStandardMaterial color="#7b6a5b" roughness={1} flatShading />
      </mesh>

      <mesh position={[-0.2, 0.0765, -0.22]} castShadow receiveShadow>
        <boxGeometry args={[0.153, 0.153, 0.153]} />
        <meshStandardMaterial color="#7b6a5b" roughness={1} flatShading />
      </mesh>

      <mesh position={[-0.2, 0.0765, 0.22]} castShadow receiveShadow>
        <boxGeometry args={[0.153, 0.153, 0.153]} />
        <meshStandardMaterial color="#7b6a5b" roughness={1} flatShading />
      </mesh>

      <mesh position={[0.2, 0.0765, -0.22]} castShadow receiveShadow>
        <boxGeometry args={[0.153, 0.153, 0.153]} />
        <meshStandardMaterial color="#7b6a5b" roughness={1} flatShading />
      </mesh>

      <mesh position={[0.2, 0.0765, 0.22]} castShadow receiveShadow>
        <boxGeometry args={[0.153, 0.153, 0.153]} />
        <meshStandardMaterial color="#7b6a5b" roughness={1} flatShading />
      </mesh>

      <mesh position={[0.33, 0.46, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.33, 0.33, 0.33]} />
        <meshStandardMaterial color="#7b6a5b" roughness={1} flatShading />
      </mesh>

      <mesh position={[0.28, 0.67, -0.16]} castShadow receiveShadow>
        <boxGeometry args={[0.04, 0.24, 0.18]} />
        <meshStandardMaterial color="#8a7867" roughness={1} flatShading />
      </mesh>

      <mesh position={[0.28, 0.67, 0.16]} castShadow receiveShadow>
        <boxGeometry args={[0.04, 0.24, 0.18]} />
        <meshStandardMaterial color="#8a7867" roughness={1} flatShading />
      </mesh>

      <mesh position={[0.39, 0.49, -0.18]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshStandardMaterial color="#111111" roughness={1} flatShading />
      </mesh>

      <mesh position={[0.39, 0.49, 0.18]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshStandardMaterial color="#111111" roughness={1} flatShading />
      </mesh>

      <mesh position={[0.515, 0.39, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshStandardMaterial color="#111111" roughness={1} flatShading />
      </mesh>

      {[
        [0.49, 0.45, -0.22],
        [0.49, 0.39, -0.24],
        [0.49, 0.33, -0.22],
      ].map((position, index) => (
        <mesh key={`mouse-whisker-left-${index}`} position={position as [number, number, number]} castShadow receiveShadow>
          <boxGeometry args={[0.015, 0.015, 0.16]} />
          <meshStandardMaterial color="#e7e0d8" roughness={1} flatShading />
        </mesh>
      ))}

      {[
        [0.49, 0.45, 0.22],
        [0.49, 0.39, 0.24],
        [0.49, 0.33, 0.22],
      ].map((position, index) => (
        <mesh key={`mouse-whisker-right-${index}`} position={position as [number, number, number]} castShadow receiveShadow>
          <boxGeometry args={[0.015, 0.015, 0.16]} />
          <meshStandardMaterial color="#e7e0d8" roughness={1} flatShading />
        </mesh>
      ))}

      <mesh position={[-0.3, 0.24, 0]} rotation={[0, 0, -0.14]} castShadow receiveShadow>
        <boxGeometry args={[0.34, 0.05, 0.05]} />
        <meshStandardMaterial color="#b89d8c" roughness={1} flatShading />
      </mesh>

      <mesh position={[-0.46, 0.205, 0]} rotation={[0, 0, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.045, 0.045]} />
        <meshStandardMaterial color="#b89d8c" roughness={1} flatShading />
      </mesh>

      <Rabbit id="workshop-rabbit" position={WORKSHOP_RABBIT_POSITION} wireframe />
    </>
  );
}

function Scene({
  controlsLocked = false,
  conversationActive = false,
  conversationActor = null,
  conversationNodeAnimation,
  onConversationStart,
}: {
  controlsLocked?: boolean;
  conversationActive?: boolean;
  conversationActor?: ConversationActor | null;
  conversationNodeAnimation?: string;
  onConversationStart: (actor: ConversationActor) => void;
}) {
  const horseRef = useRef<Group>(null);
  const cameraMode = useCameraMode();
  const keysRef = useMovementKeys();
  const eatTimeoutRef = useRef<number | null>(null);
  const [grassItems, setGrassItems] = useState<GrassInstance[]>(() => [
    ...accentPlantInstances,
    ...arenaGrassInstances,
    ...plantInstances,
  ]);
  const [nearestInteractionId, setNearestInteractionId] = useState<string | null>(null);
  const [horseActionOverride, setHorseActionOverride] = useState<WorkshopHorseAction | null>(null);
  const rabbit: RabbitProps = { id: "rabbit-0", position: RABBIT_POSITION };
  const interactables = useMemo<InteractionTarget[]>(
    () => [
      ...grassItems.map((item) => ({ id: item.id, kind: "grass" as const, position: item.position })),
      { id: rabbit.id, kind: "rabbit" as const, position: rabbit.position, range: 3.5 },
      { id: "snake-0", kind: "snake" as const, position: snakePosition, range: 4 },
    ],
    [grassItems],
  );

  const handleInteract = (target: InteractionTarget) => {
    if (target.kind === "grass") {
      if (eatTimeoutRef.current !== null) {
        window.clearTimeout(eatTimeoutRef.current);
      }

      setHorseActionOverride("eat");
      eatTimeoutRef.current = window.setTimeout(() => {
        setHorseActionOverride(null);
        eatTimeoutRef.current = null;
      }, 1200);
      setGrassItems((currentItems) => currentItems.filter((item) => item.id !== target.id));
      setNearestInteractionId((currentId) => (currentId === target.id ? null : currentId));
      return;
    }

    if (target.kind === "rabbit") {
      setNearestInteractionId(target.id);
      onConversationStart("rabbit");
      return;
    }

    if (target.kind === "snake") {
      setNearestInteractionId(target.id);
      onConversationStart("snake");
    }
  };

  useEffect(() => {
    if (conversationActive) {
      if (eatTimeoutRef.current !== null) {
        window.clearTimeout(eatTimeoutRef.current);
        eatTimeoutRef.current = null;
      }

      setHorseActionOverride(null);
    }
  }, [conversationActive]);

  const snakeAction: WorkshopSnakeAction = conversationActor === "snake"
    ? ((conversationNodeAnimation as WorkshopSnakeAction | undefined) ?? "idle")
    : "idle";

  const horseConversationAction: WorkshopHorseAction | null = conversationActor === "rabbit"
    ? ((conversationNodeAnimation as WorkshopHorseAction | undefined) ?? "jiggle_ears")
    : null;

  useEffect(() => {
    return () => {
      if (eatTimeoutRef.current !== null) {
        window.clearTimeout(eatTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <CameraRig horseRef={horseRef} mode={cameraMode} />
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
      <hemisphereLight intensity={0.78} skyColor="#bde0ff" groundColor="#a8c88b" />
      <directionalLight position={[9, 12, 6]} intensity={2.05} color="#ffe39a" castShadow />

      <mesh position={[170, 96, -220]}>
        <sphereGeometry args={[1.7, 32, 32]} />
        <meshBasicMaterial color="#ffe4a1" />
      </mesh>

      {clouds.map((cloud, index) => (
        <Cloud key={`cloud-${index}`} {...cloud} />
      ))}

      <CanyonRing />

      {horses.map((horse, index) => (
        <Horse
          key={`horse-${index}`}
          {...horse}
          actionOverride={horseConversationAction ?? horseActionOverride}
          controlsLocked={controlsLocked}
          keysRef={keysRef}
          horseRef={index === 0 ? horseRef : undefined}
        />
      ))}

      <group position={[snakePosition[0], getTerrainHeight(snakePosition[0], snakePosition[2]) + 0.02, snakePosition[2]]} rotation={[0, 0.22, 0]}>
        <WorkshopSnake action={snakeAction} highlighted={nearestInteractionId === "snake-0"} showSkeleton={false} wireframe={false} />
      </group>

      <Rabbit {...rabbit} highlighted={rabbit.id === nearestInteractionId} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[700, 700]} />
        <meshStandardMaterial color="#a9ca8a" roughness={1} flatShading />
      </mesh>

      {hills.map((hill, index) => (
        <Hill key={`hill-${index}`} {...hill} />
      ))}

      {grassItems.map((plant) => (
        <GrassTuft key={plant.id} {...plant} highlighted={plant.id === nearestInteractionId} />
      ))}
    </>
  );
}

export function App() {
  const [workshopCameraQuaternion, setWorkshopCameraQuaternion] = useState<[number, number, number, number]>([0, 0, 0, 1]);
  const [workshopSnakeAction, setWorkshopSnakeAction] = useState<WorkshopSnakeAction>("slither");
  const [workshopSnakeWireframe, setWorkshopSnakeWireframe] = useState(true);
  const sceneMode = useSceneMode();
  const [conversations, setConversations] = useState<ConversationStore>({});
  const [activeConversationActor, setActiveConversationActor] = useState<ConversationActor | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const activeConversation = activeConversationActor ? conversations[activeConversationActor] ?? null : null;
  const activeNode = currentNodeId && activeConversation ? activeConversation.nodes[currentNodeId] : null;

  useEffect(() => {
    let cancelled = false;

    const loadConversation = async () => {
      const [rabbitResponse, snakeResponse] = await Promise.all([
        fetch("/api/conversations/rabbit"),
        fetch("/api/conversations/snake"),
      ]);
      const rabbit = (await rabbitResponse.json()) as ConversationTree;
      const snake = (await snakeResponse.json()) as ConversationTree;

      if (!cancelled) {
        setConversations({ rabbit, snake });
      }
    };

    loadConversation().catch(() => {
      if (!cancelled) {
        setConversations({});
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleConversationStart = (actor: ConversationActor) => {
    if (sceneMode !== "grasslands") {
      return;
    }

    const conversation = conversations[actor];

    if (!conversation) {
      return;
    }

    setActiveConversationActor(actor);
    setCurrentNodeId(conversation.start);
  };

  const closeConversation = () => {
    setActiveConversationActor(null);
    setCurrentNodeId(null);
  };

  useEffect(() => {
    setCurrentNodeId(null);
  }, [sceneMode]);

  const handleConversationOption = (option: ConversationOption) => {
    if (option.next) {
      setCurrentNodeId(option.next);
      return;
    }

    closeConversation();
  };

  return (
    <div className="scene-shell">
      <Canvas
        shadows
        className="scene-canvas"
        dpr={[1, 1.5]}
        camera={
          sceneMode === "grasslands"
            ? { position: [0, 14, 42], fov: 42, near: 0.1, far: 700 }
            : { position: [0, 6, 14], fov: 46, near: 0.1, far: 200 }
        }
      >
        <Suspense fallback={null}>
          {sceneMode === "grasslands" ? (
            <Scene
              conversationActive={activeNode !== null}
              conversationActor={activeConversationActor}
              conversationNodeAnimation={activeNode?.animation}
              controlsLocked={activeNode !== null}
              onConversationStart={handleConversationStart}
            />
          ) : (
            <WorkshopScene
              snakeAction={workshopSnakeAction}
              wireframe={workshopSnakeWireframe}
              onCameraQuaternionChange={setWorkshopCameraQuaternion}
            />
          )}
        </Suspense>
      </Canvas>

      {activeNode && sceneMode === "grasslands" ? (
        <div className="dialog-shell">
          <div className="dialog-card">
            <div className="dialog-name">{activeConversation?.name ?? "Conversation"}</div>
            <p className="dialog-text">{activeNode.text}</p>
            <div className="dialog-options">
              {activeNode.options?.map((option, index) => (
                <button key={index} className="dialog-option" type="button" onClick={() => handleConversationOption(option)}>
                  {option.label}
                </button>
              ))}
              {!activeNode.options?.length ? (
                <button className="dialog-option" type="button" onClick={closeConversation}>
                  Continue
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {sceneMode === "workshop" ? (
        <>
          <div className="workshop-hud">
            <div className="workshop-title">Workshop Camera</div>
            <p className="workshop-help">Drag to orbit, scroll to zoom, right-drag to pan, arrow keys to switch scenes.</p>
            <div className="workshop-controls">
              {(["slither", "idle", "coil", "spring"] as WorkshopSnakeAction[]).map((action) => (
                <button
                  key={action}
                  className={`workshop-control${workshopSnakeAction === action ? " is-active" : ""}`}
                  type="button"
                  onClick={() => setWorkshopSnakeAction(action)}
                >
                  {action}
                </button>
              ))}
            </div>
            <label className="workshop-toggle">
              <input
                checked={workshopSnakeWireframe}
                type="checkbox"
                onChange={(event) => setWorkshopSnakeWireframe(event.target.checked)}
              />
              <span>Wireframe snake</span>
            </label>
          </div>
          <div className="workshop-gizmo">
            <Canvas className="workshop-gizmo-canvas" camera={{ position: [0, 0, 4], fov: 32, near: 0.1, far: 20 }}>
              <WorkshopGizmoScene quaternion={workshopCameraQuaternion} />
            </Canvas>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default App;
