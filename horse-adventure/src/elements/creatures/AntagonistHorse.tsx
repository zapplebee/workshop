import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type ReactNode } from "react";
import { Group, Quaternion, Vector3 } from "three";

type BlockPart = {
  id: string;
  parent?: string;
  position: [number, number, number];
  size: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
};

export type AntagonistHorseAction = "walk" | "stand" | "eat" | "jiggle_ears" | "strut" | "snort" | "stomp";

type AntagonistHorseProps = {
  showSkeleton?: boolean;
  wireframe?: boolean;
  action?: AntagonistHorseAction;
};

const HORSE_COLOR = "#f2f1ee";
const MANE_COLOR = "#d5d1c8";
const MUZZLE_COLOR = "#f7f3ea";
const HORSE_BODY_HEIGHT = 0.68;
const RABBIT_EAR_TOP = 1.1;
const HORSE_LIFT = 0.22;
const TORSO_HEIGHT = HORSE_BODY_HEIGHT;
const TORSO_LENGTH = TORSO_HEIGHT * 2.65;
const TORSO_DEPTH = TORSO_HEIGHT * 1.02;
const TORSO_CENTER_Y = RABBIT_EAR_TOP + TORSO_HEIGHT * 0.5 + HORSE_LIFT;

const HORSE_PARTS: BlockPart[] = [
  { id: "torso", position: [0, TORSO_CENTER_Y, 0], size: [TORSO_LENGTH, TORSO_HEIGHT, TORSO_DEPTH] },
  { id: "rearHaunch", parent: "torso", position: [-0.84, 0.08, 0], size: [0.84, 0.82, 0.82] },
  { id: "frontHaunch", parent: "torso", position: [0.9, 0.02, 0], size: [0.58, 0.7, 0.58] },
  { id: "tail", parent: "rearHaunch", position: [-0.56, -0.24, 0], size: [0.16, 0.82, 0.16], rotation: [0, 0, -0.34], color: MANE_COLOR },
  { id: "neck", parent: "torso", position: [1.22, 0.3, 0], size: [0.38, 1.12, 0.38], rotation: [0, 0, -0.5] },
  { id: "maneTop", parent: "neck", position: [-0.02, 0.2, 0], size: [0.16, 0.32, 0.42], color: MANE_COLOR },
  { id: "maneMid", parent: "neck", position: [-0.02, -0.12, 0], size: [0.14, 0.3, 0.4], color: MANE_COLOR },
  { id: "head", parent: "neck", position: [0.54, 0.48, 0], size: [0.8, 0.38, 0.38], rotation: [0, 0, -0.2] },
  { id: "muzzle", parent: "head", position: [0.34, -0.02, 0], size: [0.3, 0.22, 0.24], color: MUZZLE_COLOR },
  { id: "earLeft", parent: "head", position: [-0.14, 0.27, -0.12], size: [0.12, 0.4, 0.12], rotation: [0, 0, -0.08] },
  { id: "earRight", parent: "head", position: [-0.14, 0.27, 0.12], size: [0.12, 0.4, 0.12], rotation: [0, 0, -0.08] },
  { id: "eyeLeft", parent: "head", position: [-0.02, 0.04, -0.22], size: [0.08, 0.08, 0.08], color: "#111111" },
  { id: "eyeRight", parent: "head", position: [-0.02, 0.04, 0.22], size: [0.08, 0.08, 0.08], color: "#111111" },
  { id: "rearFemurLeft", parent: "rearHaunch", position: [-0.2, -0.2, -0.22], size: [0.32, 0.82, 0.32], rotation: [0, 0, 0.24] },
  { id: "rearFemurRight", parent: "rearHaunch", position: [-0.2, -0.2, 0.22], size: [0.32, 0.82, 0.32], rotation: [0, 0, 0.24] },
  { id: "rearTibiaLeft", parent: "rearFemurLeft", position: [-0.08, -0.58, 0], size: [0.26, 0.9, 0.26], rotation: [0, 0, -0.22] },
  { id: "rearTibiaRight", parent: "rearFemurRight", position: [-0.08, -0.58, 0], size: [0.26, 0.9, 0.26], rotation: [0, 0, -0.22] },
  { id: "rearMetatarsalLeft", parent: "rearTibiaLeft", position: [0.04, -0.82, 0], size: [0.2, 1.1, 0.2], rotation: [0, 0, 0.08] },
  { id: "rearMetatarsalRight", parent: "rearTibiaRight", position: [0.04, -0.82, 0], size: [0.2, 1.1, 0.2], rotation: [0, 0, 0.08] },
  { id: "frontRadiusLeft", parent: "frontHaunch", position: [0.12, -0.32, -0.16], size: [0.24, 0.8, 0.24], rotation: [0, 0, 0.04] },
  { id: "frontRadiusRight", parent: "frontHaunch", position: [0.12, -0.32, 0.16], size: [0.24, 0.8, 0.24], rotation: [0, 0, 0.04] },
  { id: "frontMetacarpalLeft", parent: "frontRadiusLeft", position: [0.02, -0.88, 0], size: [0.18, 1.12, 0.18], rotation: [0, 0, -0.02] },
  { id: "frontMetacarpalRight", parent: "frontRadiusRight", position: [0.02, -0.88, 0], size: [0.18, 1.12, 0.18], rotation: [0, 0, -0.02] },
];

function HorseBlock({ part, wireframe = true }: { part: BlockPart; wireframe?: boolean }) {
  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={part.size} />
      <meshStandardMaterial color={part.color ?? HORSE_COLOR} roughness={1} flatShading wireframe={wireframe} />
    </mesh>
  );
}

function SkeletonConnector({ to }: { to: [number, number, number] }) {
  const direction = useMemo(() => new Vector3(to[0], to[1], to[2]), [to]);
  const length = direction.length();
  const midpoint = useMemo(() => direction.clone().multiplyScalar(0.5), [direction]);
  const quaternion = useMemo(() => {
    if (length === 0) return new Quaternion();
    return new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize());
  }, [direction, length]);
  if (length === 0) return null;
  return (
    <mesh position={midpoint} quaternion={quaternion}>
      <boxGeometry args={[0.04, length, 0.04]} />
      <meshBasicMaterial color="#ff8fd1" transparent opacity={0.65} />
    </mesh>
  );
}

export function AntagonistHorse({ showSkeleton = true, wireframe = true, action = "stand" }: AntagonistHorseProps) {
  const partRefs = useRef(new Map<string, Group>());
  const childrenByParent = useMemo(() => {
    const entries = new Map<string | undefined, BlockPart[]>();
    for (const part of HORSE_PARTS) {
      const siblings = entries.get(part.parent);
      if (siblings) siblings.push(part);
      else entries.set(part.parent, [part]);
    }
    return entries;
  }, []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime() * 2.5;
    for (const part of HORSE_PARTS) {
      const node = partRefs.current.get(part.id);
      if (!node) continue;
      const baseRotation = part.rotation ?? [0, 0, 0];
      let rotationOffsetZ = 0;
      let positionOffsetY = 0;
      if (action === "walk") {
        switch (part.id) {
          case "torso": positionOffsetY = Math.sin(time * 2) * 0.03; break;
          case "neck": rotationOffsetZ = Math.sin(time) * 0.07; break;
          case "head": rotationOffsetZ = Math.sin(time + 0.2) * 0.05; break;
          case "tail": rotationOffsetZ = Math.sin(time + Math.PI) * 0.16; break;
          case "maneTop": rotationOffsetZ = Math.sin(time + 0.3) * 0.06; break;
          case "maneMid": rotationOffsetZ = Math.sin(time + 0.1) * 0.05; break;
          case "rearFemurLeft":
          case "frontRadiusRight": rotationOffsetZ = Math.sin(time) * 0.32; break;
          case "rearFemurRight":
          case "frontRadiusLeft": rotationOffsetZ = Math.sin(time + Math.PI) * 0.32; break;
          case "rearTibiaLeft":
          case "frontMetacarpalRight": rotationOffsetZ = Math.sin(time + Math.PI * 0.35) * 0.2; break;
          case "rearTibiaRight":
          case "frontMetacarpalLeft": rotationOffsetZ = Math.sin(time + Math.PI * 1.35) * 0.2; break;
        }
      } else if (action === "strut") {
        switch (part.id) {
          case "torso": positionOffsetY = Math.abs(Math.sin(time * 1.8)) * 0.045; break;
          case "neck": rotationOffsetZ = 0.12 + Math.sin(time * 1.8) * 0.03; break;
          case "head": rotationOffsetZ = 0.14 + Math.sin(time * 1.8 + 0.3) * 0.04; break;
          case "tail": rotationOffsetZ = 0.18 + Math.sin(time * 2.1) * 0.12; break;
          case "maneTop": rotationOffsetZ = 0.1 + Math.sin(time * 2) * 0.08; break;
          case "maneMid": rotationOffsetZ = 0.08 + Math.sin(time * 1.9 + 0.2) * 0.06; break;
          case "rearFemurLeft":
          case "frontRadiusRight": rotationOffsetZ = Math.sin(time) * 0.26 + 0.08; break;
          case "rearFemurRight":
          case "frontRadiusLeft": rotationOffsetZ = Math.sin(time + Math.PI) * 0.26 - 0.08; break;
          case "earLeft": rotationOffsetZ = -0.1 + Math.sin(time * 1.4) * 0.04; break;
          case "earRight": rotationOffsetZ = -0.06 + Math.sin(time * 1.4 + 0.3) * 0.04; break;
        }
      } else if (action === "snort") {
        switch (part.id) {
          case "torso": positionOffsetY = Math.sin(time * 3.4) * 0.018; break;
          case "neck": rotationOffsetZ = -0.16 + Math.sin(time * 3.4) * 0.05; break;
          case "head": rotationOffsetZ = -0.3 + Math.sin(time * 6.8) * 0.09; break;
          case "muzzle": positionOffsetY = Math.abs(Math.sin(time * 6.8)) * 0.025; break;
          case "tail": rotationOffsetZ = Math.sin(time * 1.8) * 0.16; break;
          case "maneTop": rotationOffsetZ = -0.08 + Math.sin(time * 3.2 + 0.1) * 0.05; break;
          case "maneMid": rotationOffsetZ = -0.05 + Math.sin(time * 3.2 + 0.3) * 0.05; break;
          case "earLeft": rotationOffsetZ = -0.2 + Math.sin(time * 5.4) * 0.08; break;
          case "earRight": rotationOffsetZ = -0.16 + Math.sin(time * 5.4 + 0.4) * 0.08; break;
        }
      } else if (action === "stomp") {
        const stompCycle = Math.max(0, Math.sin(time * 2.8));
        switch (part.id) {
          case "torso": positionOffsetY = -stompCycle * 0.04; break;
          case "neck": rotationOffsetZ = 0.05 - stompCycle * 0.05; break;
          case "head": rotationOffsetZ = 0.1 - stompCycle * 0.08; break;
          case "tail": rotationOffsetZ = 0.1 + stompCycle * 0.12; break;
          case "frontRadiusLeft": rotationOffsetZ = -stompCycle * 0.55; break;
          case "frontMetacarpalLeft": rotationOffsetZ = stompCycle * 0.35; break;
          case "frontRadiusRight": rotationOffsetZ = Math.sin(time * 2.8 + Math.PI) * 0.08; break;
          case "frontMetacarpalRight": rotationOffsetZ = Math.sin(time * 2.8 + Math.PI * 0.8) * 0.06; break;
          case "earLeft": rotationOffsetZ = -0.12 + stompCycle * 0.04; break;
          case "earRight": rotationOffsetZ = -0.12 + stompCycle * 0.04; break;
        }
      } else if (action === "eat") {
        switch (part.id) {
          case "torso": positionOffsetY = Math.sin(time * 1.4) * 0.012; break;
          case "neck": rotationOffsetZ = -0.8 + Math.sin(time * 1.2) * 0.05; break;
          case "head": rotationOffsetZ = -0.6 + Math.sin(time * 1.3 + 0.4) * 0.07; break;
          case "tail": rotationOffsetZ = Math.sin(time * 0.8) * 0.1; break;
          case "maneTop": rotationOffsetZ = -0.06 + Math.sin(time * 1.1) * 0.03; break;
          case "maneMid": rotationOffsetZ = -0.04 + Math.sin(time * 1.1 + 0.2) * 0.03; break;
        }
      } else if (action === "jiggle_ears") {
        switch (part.id) {
          case "earLeft": rotationOffsetZ = Math.sin(time * 5) * 0.24; break;
          case "earRight": rotationOffsetZ = Math.sin(time * 5 + Math.PI * 0.4) * 0.24; break;
          case "head": rotationOffsetZ = Math.sin(time * 2) * 0.03; break;
          case "tail": rotationOffsetZ = Math.sin(time * 1.5) * 0.08; break;
          case "maneTop": rotationOffsetZ = Math.sin(time * 3.2) * 0.05; break;
        }
      } else if (action === "stand") {
        switch (part.id) {
          case "tail": rotationOffsetZ = Math.sin(time * 0.9) * 0.04; break;
          case "neck": rotationOffsetZ = Math.sin(time * 0.7) * 0.02; break;
          case "maneTop": rotationOffsetZ = Math.sin(time * 1.1) * 0.03; break;
          case "maneMid": rotationOffsetZ = Math.sin(time * 1) * 0.025; break;
        }
      }
      node.position.set(part.position[0], part.position[1] + positionOffsetY, part.position[2]);
      node.rotation.set(baseRotation[0], baseRotation[1], baseRotation[2] + rotationOffsetZ);
    }
  });

  const renderNode = (part: BlockPart): ReactNode => {
    const children = childrenByParent.get(part.id) ?? [];
    const baseRotation = part.rotation ?? [0, 0, 0];
    return (
      <group
        key={part.id}
        position={part.position}
        rotation={baseRotation}
        ref={(node) => {
          if (node) partRefs.current.set(part.id, node);
          else partRefs.current.delete(part.id);
        }}
      >
        <HorseBlock part={part} wireframe={wireframe} />
        {showSkeleton ? <mesh><boxGeometry args={[0.1, 0.1, 0.1]} /><meshBasicMaterial color="#ff8fd1" /></mesh> : null}
        {showSkeleton ? children.map((child) => <SkeletonConnector key={`connector-${child.id}`} to={child.position} />) : null}
        {children.map((child) => renderNode(child))}
      </group>
    );
  };

  return <group>{(childrenByParent.get(undefined) ?? []).map((part) => renderNode(part))}</group>;
}
