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

export type HorseAction = "walk" | "stand" | "eat" | "jiggle_ears";

type HorseElementProps = {
  showSkeleton?: boolean;
  wireframe?: boolean;
  action?: HorseAction;
};

const HORSE_COLOR = "#c58b62";
const RABBIT_BODY_HEIGHT = 0.6;
const RABBIT_EAR_TOP = 1.1;
const HORSE_LIFT = 0.18;
const TORSO_HEIGHT = RABBIT_BODY_HEIGHT;
const TORSO_LENGTH = TORSO_HEIGHT * 2.5;
const TORSO_DEPTH = TORSO_HEIGHT;
const TORSO_CENTER_Y = RABBIT_EAR_TOP + TORSO_HEIGHT * 0.5 + HORSE_LIFT;

const HORSE_PARTS: BlockPart[] = [
  { id: "torso", position: [0, TORSO_CENTER_Y, 0], size: [TORSO_LENGTH, TORSO_HEIGHT, TORSO_DEPTH] },
  { id: "rearHaunch", parent: "torso", position: [-0.75, 0.06, 0], size: [0.72, 0.72, 0.72] },
  { id: "frontHaunch", parent: "torso", position: [0.82, 0.01, 0], size: [0.5, 0.62, 0.5] },
  { id: "tail", parent: "rearHaunch", position: [-0.49, -0.24, 0], size: [0.14, 0.72, 0.14], rotation: [0, 0, -0.34] },
  { id: "neck", parent: "torso", position: [1.14, 0.26, 0], size: [0.34, 1.02, 0.34], rotation: [0, 0, -0.52] },
  { id: "head", parent: "neck", position: [0.46, 0.44, 0], size: [0.72, 0.34, 0.34], rotation: [0, 0, -0.22] },
  { id: "earLeft", parent: "head", position: [-0.15, 0.24, -0.1], size: [0.12, 0.34, 0.12], rotation: [0, 0, -0.12] },
  { id: "earRight", parent: "head", position: [-0.15, 0.24, 0.1], size: [0.12, 0.34, 0.12], rotation: [0, 0, -0.12] },
  { id: "eyeLeft", parent: "head", position: [-0.08, 0.02, -0.2], size: [0.08, 0.08, 0.08], color: "#111111" },
  { id: "eyeRight", parent: "head", position: [-0.08, 0.02, 0.2], size: [0.08, 0.08, 0.08], color: "#111111" },
  { id: "rearFemurLeft", parent: "rearHaunch", position: [-0.17, -0.16, -0.2], size: [0.3, 0.74, 0.3], rotation: [0, 0, 0.24] },
  { id: "rearFemurRight", parent: "rearHaunch", position: [-0.17, -0.16, 0.2], size: [0.3, 0.74, 0.3], rotation: [0, 0, 0.24] },
  { id: "rearTibiaLeft", parent: "rearFemurLeft", position: [-0.06, -0.54, 0], size: [0.24, 0.82, 0.24], rotation: [0, 0, -0.22] },
  { id: "rearTibiaRight", parent: "rearFemurRight", position: [-0.06, -0.54, 0], size: [0.24, 0.82, 0.24], rotation: [0, 0, -0.22] },
  { id: "rearMetatarsalLeft", parent: "rearTibiaLeft", position: [0.04, -0.76, 0], size: [0.2, 1.02, 0.2], rotation: [0, 0, 0.08] },
  { id: "rearMetatarsalRight", parent: "rearTibiaRight", position: [0.04, -0.76, 0], size: [0.2, 1.02, 0.2], rotation: [0, 0, 0.08] },
  { id: "frontRadiusLeft", parent: "frontHaunch", position: [0.1, -0.29, -0.15], size: [0.22, 0.74, 0.22], rotation: [0, 0, 0.04] },
  { id: "frontRadiusRight", parent: "frontHaunch", position: [0.1, -0.29, 0.15], size: [0.22, 0.74, 0.22], rotation: [0, 0, 0.04] },
  { id: "frontMetacarpalLeft", parent: "frontRadiusLeft", position: [0.02, -0.82, 0], size: [0.18, 1.04, 0.18], rotation: [0, 0, -0.02] },
  { id: "frontMetacarpalRight", parent: "frontRadiusRight", position: [0.02, -0.82, 0], size: [0.18, 1.04, 0.18], rotation: [0, 0, -0.02] },
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

export function Horse({ showSkeleton = true, wireframe = true, action = "stand" }: HorseElementProps) {
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
    const time = clock.getElapsedTime() * 2.6;
    for (const part of HORSE_PARTS) {
      const node = partRefs.current.get(part.id);
      if (!node) continue;
      const baseRotation = part.rotation ?? [0, 0, 0];
      let rotationOffsetZ = 0;
      let positionOffsetY = 0;
      if (action === "walk") {
        switch (part.id) {
          case "torso": positionOffsetY = Math.sin(time * 2) * 0.035; break;
          case "neck": rotationOffsetZ = Math.sin(time) * 0.08; break;
          case "head": rotationOffsetZ = Math.sin(time + 0.2) * 0.06; break;
          case "tail": rotationOffsetZ = Math.sin(time + Math.PI) * 0.18; break;
          case "rearFemurLeft":
          case "frontRadiusRight": rotationOffsetZ = Math.sin(time) * 0.32; break;
          case "rearFemurRight":
          case "frontRadiusLeft": rotationOffsetZ = Math.sin(time + Math.PI) * 0.32; break;
          case "rearTibiaLeft":
          case "frontMetacarpalRight": rotationOffsetZ = Math.sin(time + Math.PI * 0.35) * 0.2; break;
          case "rearTibiaRight":
          case "frontMetacarpalLeft": rotationOffsetZ = Math.sin(time + Math.PI * 1.35) * 0.2; break;
          case "rearMetatarsalLeft":
          case "rearMetatarsalRight": rotationOffsetZ = Math.sin(time + Math.PI * 0.7) * 0.08; break;
        }
      } else if (action === "eat") {
        switch (part.id) {
          case "torso": positionOffsetY = Math.sin(time * 1.4) * 0.012; break;
          case "neck": rotationOffsetZ = -0.82 + Math.sin(time * 1.2) * 0.05; break;
          case "head": rotationOffsetZ = -0.62 + Math.sin(time * 1.3 + 0.4) * 0.07; break;
          case "tail": rotationOffsetZ = Math.sin(time * 0.8) * 0.12; break;
          case "frontRadiusLeft":
          case "frontRadiusRight": rotationOffsetZ = -0.08 + Math.sin(time * 1.1) * 0.04; break;
          case "frontMetacarpalLeft":
          case "frontMetacarpalRight": rotationOffsetZ = 0.12 + Math.sin(time * 1.1 + 0.2) * 0.04; break;
        }
      } else if (action === "jiggle_ears") {
        switch (part.id) {
          case "earLeft": rotationOffsetZ = Math.sin(time * 5) * 0.24; break;
          case "earRight": rotationOffsetZ = Math.sin(time * 5 + Math.PI * 0.4) * 0.24; break;
          case "head": rotationOffsetZ = Math.sin(time * 2) * 0.03; break;
          case "tail": rotationOffsetZ = Math.sin(time * 1.5) * 0.08; break;
        }
      } else if (action === "stand") {
        switch (part.id) {
          case "tail": rotationOffsetZ = Math.sin(time * 0.9) * 0.04; break;
          case "neck": rotationOffsetZ = Math.sin(time * 0.7) * 0.02; break;
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
