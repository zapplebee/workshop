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

export type DonkeyAction = "walk" | "stand" | "eat" | "jiggle_ears" | "blush";

type DonkeyProps = {
  showSkeleton?: boolean;
  wireframe?: boolean;
  action?: DonkeyAction;
  highlighted?: boolean;
};

const DONKEY_COLOR = "#8f928e";
const DONKEY_DARK_COLOR = "#4e4f52";
const DONKEY_MUZZLE_COLOR = "#d8d3c8";
const DONKEY_BLUSH_COLOR = "#f4a0b8";
const DONKEY_BODY_HEIGHT = 0.62;
const DONKEY_EAR_TOP = 1.08;
const DONKEY_LIFT = 0.16;
const TORSO_HEIGHT = DONKEY_BODY_HEIGHT;
const TORSO_LENGTH = TORSO_HEIGHT * 2.28;
const TORSO_DEPTH = TORSO_HEIGHT * 0.94;
const TORSO_CENTER_Y = DONKEY_EAR_TOP + TORSO_HEIGHT * 0.5 + DONKEY_LIFT;

const DONKEY_PARTS: BlockPart[] = [
  { id: "torso", position: [0, TORSO_CENTER_Y, 0], size: [TORSO_LENGTH, TORSO_HEIGHT, TORSO_DEPTH] },
  { id: "rearHaunch", parent: "torso", position: [-0.66, 0.04, 0], size: [0.76, 0.76, 0.74] },
  { id: "frontHaunch", parent: "torso", position: [0.7, 0.02, 0], size: [0.54, 0.64, 0.54] },
  { id: "tailBase", parent: "rearHaunch", position: [-0.48, -0.18, 0], size: [0.13, 0.5, 0.13], rotation: [0, 0, -0.28], color: DONKEY_DARK_COLOR },
  { id: "tailTuft", parent: "tailBase", position: [-0.03, -0.34, 0], size: [0.18, 0.3, 0.18], color: DONKEY_DARK_COLOR },
  { id: "neck", parent: "torso", position: [0.98, 0.24, 0], size: [0.34, 0.88, 0.34], rotation: [0, 0, -0.42] },
  { id: "head", parent: "neck", position: [0.5, 0.38, 0], size: [0.82, 0.4, 0.38], rotation: [0, 0, -0.16] },
  { id: "muzzle", parent: "head", position: [0.42, -0.02, 0], size: [0.34, 0.24, 0.28], color: DONKEY_MUZZLE_COLOR },
  { id: "mane", parent: "neck", position: [-0.02, 0.42, 0], size: [0.14, 0.4, 0.4], color: DONKEY_DARK_COLOR },
  { id: "earLeft", parent: "head", position: [-0.17, 0.36, -0.11], size: [0.12, 0.5, 0.12], rotation: [0, 0, -0.04], color: DONKEY_DARK_COLOR },
  { id: "earRight", parent: "head", position: [-0.17, 0.36, 0.11], size: [0.12, 0.5, 0.12], rotation: [0, 0, -0.04], color: DONKEY_DARK_COLOR },
  { id: "eyeLeft", parent: "head", position: [0.04, 0.04, -0.22], size: [0.08, 0.08, 0.08], color: "#111111" },
  { id: "eyeRight", parent: "head", position: [0.04, 0.04, 0.22], size: [0.08, 0.08, 0.08], color: "#111111" },
  { id: "blushLeft", parent: "head", position: [0.2, -0.04, -0.2], size: [0.13, 0.08, 0.08], color: DONKEY_BLUSH_COLOR },
  { id: "blushRight", parent: "head", position: [0.2, -0.04, 0.2], size: [0.13, 0.08, 0.08], color: DONKEY_BLUSH_COLOR },
  { id: "rearFemurLeft", parent: "rearHaunch", position: [-0.18, -0.16, -0.2], size: [0.3, 0.74, 0.3], rotation: [0, 0, 0.2] },
  { id: "rearFemurRight", parent: "rearHaunch", position: [-0.18, -0.16, 0.2], size: [0.3, 0.74, 0.3], rotation: [0, 0, 0.2] },
  { id: "rearTibiaLeft", parent: "rearFemurLeft", position: [-0.05, -0.54, 0], size: [0.24, 0.84, 0.24], rotation: [0, 0, -0.2] },
  { id: "rearTibiaRight", parent: "rearFemurRight", position: [-0.05, -0.54, 0], size: [0.24, 0.84, 0.24], rotation: [0, 0, -0.2] },
  { id: "rearMetatarsalLeft", parent: "rearTibiaLeft", position: [0.03, -0.78, 0], size: [0.2, 1.02, 0.2], rotation: [0, 0, 0.06] },
  { id: "rearMetatarsalRight", parent: "rearTibiaRight", position: [0.03, -0.78, 0], size: [0.2, 1.02, 0.2], rotation: [0, 0, 0.06] },
  { id: "frontRadiusLeft", parent: "frontHaunch", position: [0.09, -0.3, -0.16], size: [0.22, 0.76, 0.22], rotation: [0, 0, 0.02] },
  { id: "frontRadiusRight", parent: "frontHaunch", position: [0.09, -0.3, 0.16], size: [0.22, 0.76, 0.22], rotation: [0, 0, 0.02] },
  { id: "frontMetacarpalLeft", parent: "frontRadiusLeft", position: [0.02, -0.84, 0], size: [0.18, 1.04, 0.18], rotation: [0, 0, -0.01] },
  { id: "frontMetacarpalRight", parent: "frontRadiusRight", position: [0.02, -0.84, 0], size: [0.18, 1.04, 0.18], rotation: [0, 0, -0.01] },
];

function DonkeyBlock({ part, wireframe = true }: { part: BlockPart; wireframe?: boolean }) {
  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={part.size} />
      <meshStandardMaterial color={part.color ?? DONKEY_COLOR} roughness={1} flatShading wireframe={wireframe} />
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

export function Donkey({ showSkeleton = true, wireframe = true, action = "stand", highlighted = false }: DonkeyProps) {
  const partRefs = useRef(new Map<string, Group>());
  const childrenByParent = useMemo(() => {
    const entries = new Map<string | undefined, BlockPart[]>();
    for (const part of DONKEY_PARTS) {
      const siblings = entries.get(part.parent);
      if (siblings) siblings.push(part);
      else entries.set(part.parent, [part]);
    }
    return entries;
  }, []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime() * 2.55;
    for (const part of DONKEY_PARTS) {
      const node = partRefs.current.get(part.id);
      if (!node) continue;
      const baseRotation = part.rotation ?? [0, 0, 0];
      let rotationOffsetZ = 0;
      let positionOffsetY = 0;
      if (action === "walk") {
        switch (part.id) {
          case "torso": positionOffsetY = Math.sin(time * 2) * 0.03; break;
          case "neck": rotationOffsetZ = Math.sin(time) * 0.06; break;
          case "head": rotationOffsetZ = Math.sin(time + 0.18) * 0.05; break;
          case "tailBase": rotationOffsetZ = Math.sin(time + Math.PI) * 0.12; break;
          case "tailTuft": rotationOffsetZ = Math.sin(time + Math.PI * 1.15) * 0.22; break;
          case "rearFemurLeft":
          case "frontRadiusRight": rotationOffsetZ = Math.sin(time) * 0.28; break;
          case "rearFemurRight":
          case "frontRadiusLeft": rotationOffsetZ = Math.sin(time + Math.PI) * 0.28; break;
          case "rearTibiaLeft":
          case "frontMetacarpalRight": rotationOffsetZ = Math.sin(time + Math.PI * 0.35) * 0.18; break;
          case "rearTibiaRight":
          case "frontMetacarpalLeft": rotationOffsetZ = Math.sin(time + Math.PI * 1.35) * 0.18; break;
          case "earLeft": rotationOffsetZ = Math.sin(time * 0.9) * 0.05; break;
          case "earRight": rotationOffsetZ = Math.sin(time * 0.9 + 0.2) * 0.05; break;
        }
      } else if (action === "eat") {
        switch (part.id) {
          case "torso": positionOffsetY = Math.sin(time * 1.35) * 0.012; break;
          case "neck": rotationOffsetZ = -0.72 + Math.sin(time * 1.15) * 0.04; break;
          case "head": rotationOffsetZ = -0.54 + Math.sin(time * 1.25 + 0.35) * 0.06; break;
          case "tailTuft": rotationOffsetZ = Math.sin(time * 0.8) * 0.1; break;
          case "frontRadiusLeft":
          case "frontRadiusRight": rotationOffsetZ = -0.05 + Math.sin(time * 1.05) * 0.03; break;
          case "frontMetacarpalLeft":
          case "frontMetacarpalRight": rotationOffsetZ = 0.1 + Math.sin(time * 1.05 + 0.2) * 0.03; break;
        }
      } else if (action === "jiggle_ears") {
        switch (part.id) {
          case "earLeft": rotationOffsetZ = Math.sin(time * 5.2) * 0.34; break;
          case "earRight": rotationOffsetZ = Math.sin(time * 5.2 + Math.PI * 0.4) * 0.34; break;
          case "head": rotationOffsetZ = Math.sin(time * 2) * 0.02; break;
          case "tailTuft": rotationOffsetZ = Math.sin(time * 1.6) * 0.08; break;
        }
      } else if (action === "blush") {
        switch (part.id) {
          case "torso": positionOffsetY = Math.sin(time * 1.8) * 0.02; break;
          case "neck": rotationOffsetZ = -0.08 + Math.sin(time * 1.4) * 0.02; break;
          case "head": rotationOffsetZ = 0.08 + Math.sin(time * 1.8 + 0.3) * 0.03; break;
          case "earLeft": rotationOffsetZ = -0.18 + Math.sin(time * 2.2) * 0.05; break;
          case "earRight": rotationOffsetZ = -0.12 + Math.sin(time * 2.2 + 0.4) * 0.05; break;
          case "tailTuft": rotationOffsetZ = Math.sin(time * 1.2) * 0.12; break;
          case "blushLeft": positionOffsetY = Math.sin(time * 3.2) * 0.01; break;
          case "blushRight": positionOffsetY = Math.sin(time * 3.2 + 0.6) * 0.01; break;
        }
      } else if (action === "stand") {
        switch (part.id) {
          case "tailTuft": rotationOffsetZ = Math.sin(time * 0.9) * 0.05; break;
          case "neck": rotationOffsetZ = Math.sin(time * 0.7) * 0.015; break;
          case "earLeft": rotationOffsetZ = Math.sin(time * 0.8) * 0.03; break;
          case "earRight": rotationOffsetZ = Math.sin(time * 0.8 + 0.2) * 0.03; break;
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
        {highlighted && (part.id === "torso" || part.id === "head" || part.id === "neck") ? (
          <mesh scale={[1.08, 1.08, 1.08]}>
            <boxGeometry args={part.size} />
            <meshBasicMaterial color="#ff59bf" transparent opacity={0.34} />
          </mesh>
        ) : null}
        {part.id.startsWith("blush") && action !== "blush" ? null : <DonkeyBlock part={part} wireframe={wireframe} />}
        {showSkeleton ? <mesh><boxGeometry args={[0.1, 0.1, 0.1]} /><meshBasicMaterial color="#ff8fd1" /></mesh> : null}
        {showSkeleton ? children.map((child) => <SkeletonConnector key={`connector-${child.id}`} to={child.position} />) : null}
        {children.map((child) => renderNode(child))}
      </group>
    );
  };

  return <group>{(childrenByParent.get(undefined) ?? []).map((part) => renderNode(part))}</group>;
}
