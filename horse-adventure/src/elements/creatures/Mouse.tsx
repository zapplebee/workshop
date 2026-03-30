import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group, Quaternion, Vector3 } from "three";

export type MouseAction = "jiggle_ears_and_whiskers" | "fright" | "scuddle" | "idle";

type MouseProps = {
  action: MouseAction;
  wireframe: boolean;
  showSkeleton: boolean;
  highlighted?: boolean;
};

export const MOUSE_BODY_POSITION: [number, number, number] = [0, 0.3315, 0];
export const MOUSE_BODY_SIZE: [number, number, number] = [0.51, 0.51, 0.51];
export const MOUSE_FOOT_SIZE: [number, number, number] = [0.153, 0.153, 0.153];
export const MOUSE_HEAD_POSITION: [number, number, number] = [0.33, 0.46, 0];
export const MOUSE_HEAD_SIZE: [number, number, number] = [0.33, 0.33, 0.33];
export const MOUSE_EAR_SIZE: [number, number, number] = [0.04, 0.24, 0.18];
export const MOUSE_EAR_LEFT_POSITION: [number, number, number] = [0.28, 0.67, -0.16];
export const MOUSE_EAR_RIGHT_POSITION: [number, number, number] = [0.28, 0.67, 0.16];
export const MOUSE_EYE_LEFT_POSITION: [number, number, number] = [0.39, 0.49, -0.18];
export const MOUSE_EYE_RIGHT_POSITION: [number, number, number] = [0.39, 0.49, 0.18];
export const MOUSE_NOSE_POSITION: [number, number, number] = [0.515, 0.39, 0];
export const MOUSE_FEATURE_SIZE: [number, number, number] = [0.05, 0.05, 0.05];
export const MOUSE_TAIL_POSITION: [number, number, number] = [-0.33, 0.235, 0];
export const MOUSE_TAIL_SIZE: [number, number, number] = [0.52, 0.05, 0.05];

const MOUSE_COLOR = "#7b6a5b";
const MOUSE_EAR_COLOR = "#8a7867";
const MOUSE_TAIL_COLOR = "#b89d8c";
const MOUSE_WHISKER_COLOR = "#e7e0d8";
const MOUSE_JOINT_COLOR = "#ff8fd1";
const MOUSE_SKELETON_POINTS: [number, number, number][] = [MOUSE_TAIL_POSITION, MOUSE_BODY_POSITION, MOUSE_HEAD_POSITION, MOUSE_NOSE_POSITION];
const MOUSE_FOOT_POSITIONS: [number, number, number][] = [
  [-0.2, 0.0765, -0.22],
  [-0.2, 0.0765, 0.22],
  [0.2, 0.0765, -0.22],
  [0.2, 0.0765, 0.22],
];
const MOUSE_WHISKER_POSITIONS: [number, number, number][] = [
  [0.49, 0.45, -0.22],
  [0.49, 0.39, -0.24],
  [0.49, 0.33, -0.22],
  [0.49, 0.45, 0.22],
  [0.49, 0.39, 0.24],
  [0.49, 0.33, 0.22],
];

function Bone({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const delta = useMemo(() => new Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]), [from, to]);
  const length = delta.length();
  const midpoint = useMemo(() => new Vector3((from[0] + to[0]) * 0.5, (from[1] + to[1]) * 0.5, (from[2] + to[2]) * 0.5), [from, to]);
  const quaternion = useMemo(() => {
    if (length === 0) return new Quaternion();
    return new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), delta.clone().normalize());
  }, [delta, length]);

  if (length === 0) return null;

  return (
    <mesh position={midpoint} quaternion={quaternion}>
      <boxGeometry args={[0.04, length, 0.04]} />
      <meshBasicMaterial color={MOUSE_JOINT_COLOR} transparent opacity={0.72} />
    </mesh>
  );
}

export function Mouse({ action, wireframe, showSkeleton, highlighted = false }: MouseProps) {
  const bodyRef = useRef<Group | null>(null);
  const headRef = useRef<Group | null>(null);
  const earLeftRef = useRef<Group | null>(null);
  const earRightRef = useRef<Group | null>(null);
  const whiskerRefs = useRef<Group[]>([]);
  const tailRef = useRef<Group | null>(null);
  const footRefs = useRef<Group[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const jiggle = Math.sin(t * 9);
    const bob = Math.sin(t * 5);
    const scuddle = Math.sin(t * 12);

    if (bodyRef.current) {
      let y = MOUSE_BODY_POSITION[1];
      let rotZ = 0;
      if (action === "idle") y += Math.sin(t * 1.8) * 0.01;
      else if (action === "fright") {
        y += 0.035 + Math.abs(bob) * 0.012;
        rotZ = -0.04;
      } else if (action === "scuddle") y += Math.abs(scuddle) * 0.022;
      bodyRef.current.position.set(MOUSE_BODY_POSITION[0], y, MOUSE_BODY_POSITION[2]);
      bodyRef.current.rotation.set(0, 0, rotZ);
    }

    if (headRef.current) {
      let x = MOUSE_HEAD_POSITION[0];
      let y = MOUSE_HEAD_POSITION[1];
      let rotZ = 0;
      if (action === "fright") {
        x += 0.02;
        y += 0.05;
        rotZ = -0.12;
      } else if (action === "scuddle") {
        x += 0.02 + Math.abs(scuddle) * 0.01;
        y += Math.abs(scuddle) * 0.015;
      } else if (action === "idle") y += Math.sin(t * 1.8 + 0.5) * 0.01;
      headRef.current.position.set(x, y, MOUSE_HEAD_POSITION[2]);
      headRef.current.rotation.set(0, 0, rotZ);
    }

    if (earLeftRef.current) {
      const rotZ = action === "jiggle_ears_and_whiskers" ? jiggle * 0.18 : action === "fright" ? -0.08 : 0;
      earLeftRef.current.position.set(...MOUSE_EAR_LEFT_POSITION);
      earLeftRef.current.rotation.set(0, 0, rotZ);
    }
    if (earRightRef.current) {
      const rotZ = action === "jiggle_ears_and_whiskers" ? -jiggle * 0.18 : action === "fright" ? 0.08 : 0;
      earRightRef.current.position.set(...MOUSE_EAR_RIGHT_POSITION);
      earRightRef.current.rotation.set(0, 0, rotZ);
    }

    whiskerRefs.current.forEach((group, index) => {
      if (!group) return;
      const side = index < 3 ? -1 : 1;
      const base = index % 3 === 1 ? 0.1 : index % 3 === 2 ? -0.08 : 0;
      const wiggle = action === "jiggle_ears_and_whiskers" ? jiggle * 0.24 * side : action === "fright" ? -0.24 * side : 0;
      group.rotation.set(base + wiggle, side * (0.08 + wiggle * 0.35), 0);
    });

    if (tailRef.current) {
      let rotZ = -0.2;
      if (action === "idle") rotZ += Math.sin(t * 2.2) * 0.08;
      else if (action === "fright") rotZ = -0.65 + Math.sin(t * 8) * 0.04;
      else if (action === "scuddle") rotZ = -0.28 + Math.sin(t * 10) * 0.12;
      tailRef.current.position.set(...MOUSE_TAIL_POSITION);
      tailRef.current.rotation.set(0, 0, rotZ);
    }

    footRefs.current.forEach((group, index) => {
      if (!group) return;
      const base = MOUSE_FOOT_POSITIONS[index];
      const lift = action === "scuddle" ? Math.max(0, Math.sin(t * 12 + (index % 2) * Math.PI)) * 0.03 : 0;
      group.position.set(base[0], base[1] + lift, base[2]);
    });
  });

  return (
    <group>
      {showSkeleton ? MOUSE_SKELETON_POINTS.map((point, index) => (
        <mesh key={`mouse-joint-${index}`} position={point}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshBasicMaterial color={MOUSE_JOINT_COLOR} />
        </mesh>
      )) : null}
      {showSkeleton ? MOUSE_SKELETON_POINTS.slice(0, -1).map((point, index) => <Bone key={`mouse-bone-${index}`} from={point} to={MOUSE_SKELETON_POINTS[index + 1]} />) : null}

      <group ref={bodyRef} position={MOUSE_BODY_POSITION}>
        {highlighted ? <mesh scale={[1.08, 1.08, 1.08]}><boxGeometry args={MOUSE_BODY_SIZE} /><meshBasicMaterial color="#ff59bf" transparent opacity={0.38} /></mesh> : null}
        <mesh castShadow receiveShadow><boxGeometry args={MOUSE_BODY_SIZE} /><meshStandardMaterial color={MOUSE_COLOR} roughness={1} flatShading wireframe={wireframe} /></mesh>
      </group>

      {MOUSE_FOOT_POSITIONS.map((position, index) => (
        <group key={`mouse-foot-${index}`} position={position} ref={(node) => { if (node) footRefs.current[index] = node; }}>
          <mesh castShadow receiveShadow><boxGeometry args={MOUSE_FOOT_SIZE} /><meshStandardMaterial color={MOUSE_COLOR} roughness={1} flatShading wireframe={wireframe} /></mesh>
        </group>
      ))}

      <group ref={headRef} position={MOUSE_HEAD_POSITION}>
        {highlighted ? <mesh scale={[1.08, 1.08, 1.08]}><boxGeometry args={MOUSE_HEAD_SIZE} /><meshBasicMaterial color="#ff59bf" transparent opacity={0.38} /></mesh> : null}
        <mesh castShadow receiveShadow><boxGeometry args={MOUSE_HEAD_SIZE} /><meshStandardMaterial color={MOUSE_COLOR} roughness={1} flatShading wireframe={wireframe} /></mesh>
      </group>

      <group ref={earLeftRef} position={MOUSE_EAR_LEFT_POSITION}><mesh castShadow receiveShadow><boxGeometry args={MOUSE_EAR_SIZE} /><meshStandardMaterial color={MOUSE_EAR_COLOR} roughness={1} flatShading wireframe={wireframe} /></mesh></group>
      <group ref={earRightRef} position={MOUSE_EAR_RIGHT_POSITION}><mesh castShadow receiveShadow><boxGeometry args={MOUSE_EAR_SIZE} /><meshStandardMaterial color={MOUSE_EAR_COLOR} roughness={1} flatShading wireframe={wireframe} /></mesh></group>

      <mesh position={MOUSE_EYE_LEFT_POSITION} castShadow receiveShadow><boxGeometry args={MOUSE_FEATURE_SIZE} /><meshStandardMaterial color="#111111" roughness={1} flatShading wireframe={wireframe} /></mesh>
      <mesh position={MOUSE_EYE_RIGHT_POSITION} castShadow receiveShadow><boxGeometry args={MOUSE_FEATURE_SIZE} /><meshStandardMaterial color="#111111" roughness={1} flatShading wireframe={wireframe} /></mesh>
      <mesh position={MOUSE_NOSE_POSITION} castShadow receiveShadow><boxGeometry args={MOUSE_FEATURE_SIZE} /><meshStandardMaterial color="#111111" roughness={1} flatShading wireframe={wireframe} /></mesh>

      {MOUSE_WHISKER_POSITIONS.map((position, index) => (
        <group key={`mouse-whisker-${index}`} position={position} ref={(node) => { if (node) whiskerRefs.current[index] = node; }}>
          <mesh castShadow receiveShadow><boxGeometry args={[0.015, 0.015, 0.16]} /><meshStandardMaterial color={MOUSE_WHISKER_COLOR} roughness={1} flatShading wireframe={wireframe} /></mesh>
        </group>
      ))}

      <group ref={tailRef} position={MOUSE_TAIL_POSITION}><mesh castShadow receiveShadow><boxGeometry args={MOUSE_TAIL_SIZE} /><meshStandardMaterial color={MOUSE_TAIL_COLOR} roughness={1} flatShading wireframe={wireframe} /></mesh></group>
    </group>
  );
}
