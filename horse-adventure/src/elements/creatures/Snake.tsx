import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group, Quaternion, Vector3 } from "three";

export type SnakeAction = "coil" | "slither" | "spring" | "idle";

type SnakeProps = {
  action: SnakeAction;
  wireframe: boolean;
  showSkeleton: boolean;
  highlighted?: boolean;
};

const SEGMENT_POSITIONS = [-1.6875, -1.0125, -0.3375, 0.3375, 1.0125, 1.6875] as const;
const SEGMENT_Y = 0.1125;
const SEGMENT_SIZE: [number, number, number] = [0.675, 0.225, 0.225];
const TAIL_POSITION: [number, number, number] = [-2.19375, 0.09375, 0];
const TAIL_SIZE: [number, number, number] = [0.3375, 0.1875, 0.1875];
const HEAD_POSITION: [number, number, number] = [2.19375, 0.15, 0];
const HEAD_SIZE: [number, number, number] = [0.45, 0.3, 0.3];
const EYE_LEFT_POSITION: [number, number, number] = [2.1375, 0.16875, -0.1875];
const EYE_RIGHT_POSITION: [number, number, number] = [2.1375, 0.16875, 0.1875];
const EYE_SIZE: [number, number, number] = [0.075, 0.075, 0.075];
const COLOR = "#4f9f4a";
const SKELETON_POINTS: [number, number, number][] = [TAIL_POSITION, ...SEGMENT_POSITIONS.map((x) => [x, SEGMENT_Y, 0] as [number, number, number]), HEAD_POSITION];

export function Snake({ action, wireframe, showSkeleton, highlighted = false }: SnakeProps) {
  const segmentRefs = useRef<Group[]>([]);
  const jointRefs = useRef<Group[]>([]);
  const boneRefs = useRef<Group[]>([]);
  const headRef = useRef<Group | null>(null);
  const tailRef = useRef<Group | null>(null);
  const tempVector = useMemo(() => new Vector3(), []);
  const upVector = useMemo(() => new Vector3(0, 1, 0), []);
  const tempQuaternion = useMemo(() => new Quaternion(), []);
  const jointPositions = useMemo<[number, number, number][]>(() => SKELETON_POINTS.map((point) => [...point] as [number, number, number]), []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const bodyPhase = time * 3.2;
    for (let index = 0; index < SEGMENT_POSITIONS.length; index += 1) {
      let x = SEGMENT_POSITIONS[index]!;
      let y = SEGMENT_Y;
      let z = 0;
      let rotY = 0;
      let rotZ = 0;
      if (action === "slither") {
        z = Math.sin(bodyPhase - index * 0.55) * 0.22;
        rotY = Math.sin(bodyPhase - index * 0.55) * 0.22;
        y += Math.sin(bodyPhase * 2 - index * 0.4) * 0.015;
      } else if (action === "coil") {
        const coilAngles = [2.9, 2.2, 1.45, 0.7, -0.05, -0.8];
        const coilRadii = [0.54, 0.44, 0.36, 0.34, 0.4, 0.5];
        const centerX = -0.15;
        const pulse = Math.sin(time * 2.4) * 0.03;
        const angle = coilAngles[index]! + Math.sin(time * 1.4 + index * 0.55) * 0.04;
        const radius = coilRadii[index]! + pulse;
        x = centerX + Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
        y = SEGMENT_Y + index * 0.012 + Math.cos(time * 2 + index * 0.45) * 0.01;
        rotY = -angle + Math.PI * 0.5;
      } else if (action === "spring") {
        const spring = Math.max(0, Math.sin(time * 4.2));
        const alongBody = index / (SEGMENT_POSITIONS.length - 1);
        const wave = Math.sin(bodyPhase - index * 0.72);
        x += alongBody * spring * 0.26;
        z = wave * (0.05 + alongBody * 0.14) * (0.45 + spring);
        y += alongBody * spring * 0.24 + Math.abs(wave) * alongBody * 0.08;
        rotY = wave * (0.08 + alongBody * 0.26);
        rotZ = spring * (0.02 + alongBody * 0.16);
      } else {
        z = Math.sin(time * 1.4 - index * 0.35) * 0.03;
        rotY = Math.sin(time * 1.4 - index * 0.35) * 0.04;
        y += Math.sin(time * 1.8 - index * 0.2) * 0.008;
      }
      const segment = segmentRefs.current[index];
      if (segment) {
        segment.position.set(x, y, z);
        segment.rotation.set(0, rotY, rotZ);
      }
      jointPositions[index + 1] = [x, y, z];
    }

    const firstSegment = jointPositions[1]!;
    const lastSegment = jointPositions[jointPositions.length - 2]!;
    if (tailRef.current) {
      let tailX = TAIL_POSITION[0];
      let tailY = TAIL_POSITION[1];
      let tailZ = firstSegment[2] * 0.85;
      if (action === "spring") {
        const spring = Math.max(0, Math.sin(time * 4.2));
        tailX = firstSegment[0] - 0.28;
        tailY = firstSegment[1] - 0.02 + spring * 0.02;
      } else if (action === "coil") {
        tailX = firstSegment[0] - 0.32;
        tailY = firstSegment[1] - 0.02;
        tailZ = firstSegment[2] - 0.02;
      }
      tailRef.current.position.set(tailX, tailY, tailZ);
      jointPositions[0] = [tailRef.current.position.x, tailRef.current.position.y, tailRef.current.position.z];
    }
    if (headRef.current) {
      let headY = HEAD_POSITION[1];
      let headZ = lastSegment[2] * 1.15;
      let headX = HEAD_POSITION[0];
      let headRotY = 0;
      let headRotZ = 0;
      if (action === "spring") {
        const spring = Math.max(0, Math.sin(time * 4.2));
        headX = lastSegment[0] + 0.18;
        headY = lastSegment[1] + 0.06 + spring * 0.12;
        headZ = lastSegment[2] + Math.sin(bodyPhase - SEGMENT_POSITIONS.length * 0.72) * 0.06;
        headRotY = Math.sin(bodyPhase - SEGMENT_POSITIONS.length * 0.72) * 0.22;
        headRotZ = -0.14 - spring * 0.1;
      } else if (action === "coil") {
        headX = lastSegment[0] + 0.12;
        headY = lastSegment[1] + 0.34 + Math.sin(time * 2.4) * 0.02;
        headZ = lastSegment[2] + 0.02;
        headRotY = -0.55;
        headRotZ = -0.82 + Math.sin(time * 2.2) * 0.04;
      } else if (action === "idle") {
        headY += Math.sin(time * 2.2) * 0.015;
      }
      headRef.current.position.set(headX, headY, headZ);
      headRef.current.rotation.set(0, headRotY, headRotZ);
      jointPositions[jointPositions.length - 1] = [headRef.current.position.x, headRef.current.position.y, headRef.current.position.z];
    }
    for (let index = 0; index < jointPositions.length; index += 1) {
      const joint = jointRefs.current[index];
      if (joint) joint.position.set(...jointPositions[index]!);
    }
    for (let index = 0; index < jointPositions.length - 1; index += 1) {
      const bone = boneRefs.current[index];
      if (!bone) continue;
      const [fromX, fromY, fromZ] = jointPositions[index]!;
      const [toX, toY, toZ] = jointPositions[index + 1]!;
      tempVector.set(toX - fromX, toY - fromY, toZ - fromZ);
      const length = tempVector.length();
      bone.position.set((fromX + toX) * 0.5, (fromY + toY) * 0.5, (fromZ + toZ) * 0.5);
      if (length > 0) {
        tempQuaternion.setFromUnitVectors(upVector, tempVector.clone().normalize());
        bone.quaternion.copy(tempQuaternion);
        bone.scale.set(1, length, 1);
      }
    }
  });

  return (
    <group>
      {showSkeleton ? SKELETON_POINTS.map((point, index) => (
        <group key={`snake-joint-${index}`} position={point} ref={(node) => { if (node) jointRefs.current[index] = node; }}>
          <mesh><boxGeometry args={[0.11, 0.11, 0.11]} /><meshBasicMaterial color="#ff8fd1" /></mesh>
        </group>
      )) : null}
      {showSkeleton ? SKELETON_POINTS.slice(0, -1).map((_, index) => (
        <group key={`snake-bone-${index}`} ref={(node) => { if (node) boneRefs.current[index] = node; }}>
          <mesh><boxGeometry args={[0.06, 1, 0.06]} /><meshBasicMaterial color="#ff8fd1" transparent opacity={0.72} /></mesh>
        </group>
      )) : null}
      {SEGMENT_POSITIONS.map((x, index) => (
        <group key={`snake-segment-${index}`} position={[x, SEGMENT_Y, 0]} ref={(node) => { if (node) segmentRefs.current[index] = node; }}>
          {highlighted ? <mesh scale={[1.08, 1.12, 1.12]}><boxGeometry args={SEGMENT_SIZE} /><meshBasicMaterial color="#ff59bf" transparent opacity={0.42} wireframe /></mesh> : null}
          <mesh castShadow receiveShadow><boxGeometry args={SEGMENT_SIZE} /><meshStandardMaterial color={COLOR} roughness={1} flatShading wireframe={wireframe} /></mesh>
        </group>
      ))}
      <group position={TAIL_POSITION} ref={tailRef}>
        {highlighted ? <mesh scale={[1.08, 1.12, 1.12]}><boxGeometry args={TAIL_SIZE} /><meshBasicMaterial color="#ff59bf" transparent opacity={0.42} wireframe /></mesh> : null}
        <mesh castShadow receiveShadow><boxGeometry args={TAIL_SIZE} /><meshStandardMaterial color={COLOR} roughness={1} flatShading wireframe={wireframe} /></mesh>
      </group>
      <group position={HEAD_POSITION} ref={headRef}>
        {highlighted ? <mesh scale={[1.08, 1.12, 1.12]}><boxGeometry args={HEAD_SIZE} /><meshBasicMaterial color="#ff59bf" transparent opacity={0.42} wireframe /></mesh> : null}
        <mesh castShadow receiveShadow><boxGeometry args={HEAD_SIZE} /><meshStandardMaterial color={COLOR} roughness={1} flatShading wireframe={wireframe} /></mesh>
        <mesh position={[EYE_LEFT_POSITION[0] - HEAD_POSITION[0], EYE_LEFT_POSITION[1] - HEAD_POSITION[1], EYE_LEFT_POSITION[2]]} castShadow receiveShadow><boxGeometry args={EYE_SIZE} /><meshStandardMaterial color="#111111" roughness={1} flatShading wireframe={wireframe} /></mesh>
        <mesh position={[EYE_RIGHT_POSITION[0] - HEAD_POSITION[0], EYE_RIGHT_POSITION[1] - HEAD_POSITION[1], EYE_RIGHT_POSITION[2]]} castShadow receiveShadow><boxGeometry args={EYE_SIZE} /><meshStandardMaterial color="#111111" roughness={1} flatShading wireframe={wireframe} /></mesh>
      </group>
    </group>
  );
}
