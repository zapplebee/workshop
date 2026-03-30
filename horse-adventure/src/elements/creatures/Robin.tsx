import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group, Quaternion, Vector3 } from "three";

export type RobinAction = "idle" | "preen" | "flutter" | "fly";

type RobinProps = {
  action: RobinAction;
  wireframe: boolean;
  showSkeleton: boolean;
  highlighted?: boolean;
};

const ROBIN_BODY_POSITION: [number, number, number] = [0, 0.42, 0];
const ROBIN_BODY_SIZE: [number, number, number] = [0.46, 0.42, 0.54];
const ROBIN_BREAST_POSITION: [number, number, number] = [0.14, 0.39, 0];
const ROBIN_BREAST_SIZE: [number, number, number] = [0.28, 0.28, 0.4];
const ROBIN_HEAD_POSITION: [number, number, number] = [0.26, 0.58, 0];
const ROBIN_HEAD_SIZE: [number, number, number] = [0.24, 0.24, 0.24];
const ROBIN_BEAK_POSITION: [number, number, number] = [0.42, 0.57, 0];
const ROBIN_BEAK_SIZE: [number, number, number] = [0.14, 0.06, 0.08];
const ROBIN_TAIL_POSITION: [number, number, number] = [-0.34, 0.44, 0];
const ROBIN_TAIL_SIZE: [number, number, number] = [0.24, 0.08, 0.22];
const ROBIN_WING_SIZE: [number, number, number] = [0.28, 0.1, 0.24];
const ROBIN_WING_LEFT_POSITION: [number, number, number] = [-0.02, 0.42, -0.26];
const ROBIN_WING_RIGHT_POSITION: [number, number, number] = [-0.02, 0.42, 0.26];
const ROBIN_LEG_SIZE: [number, number, number] = [0.04, 0.22, 0.04];
const ROBIN_LEG_LEFT_POSITION: [number, number, number] = [0.06, 0.13, -0.09];
const ROBIN_LEG_RIGHT_POSITION: [number, number, number] = [0.06, 0.13, 0.09];
const ROBIN_FOOT_SIZE: [number, number, number] = [0.12, 0.03, 0.08];
const ROBIN_FOOT_LEFT_POSITION: [number, number, number] = [0.09, 0.02, -0.09];
const ROBIN_FOOT_RIGHT_POSITION: [number, number, number] = [0.09, 0.02, 0.09];
const ROBIN_EYE_LEFT_POSITION: [number, number, number] = [0.31, 0.61, -0.1];
const ROBIN_EYE_RIGHT_POSITION: [number, number, number] = [0.31, 0.61, 0.1];
const ROBIN_EYE_SIZE: [number, number, number] = [0.04, 0.04, 0.04];

const ROBIN_BODY_COLOR = "#7f533f";
const ROBIN_WING_COLOR = "#6d4637";
const ROBIN_BREAST_COLOR = "#c86a43";
const ROBIN_HEAD_COLOR = "#6f4d3b";
const ROBIN_BEAK_COLOR = "#d2b07d";
const ROBIN_LEG_COLOR = "#705538";
const ROBIN_JOINT_COLOR = "#ff8fd1";
const ROBIN_HIGHLIGHT_COLOR = "#ff59bf";

const ROBIN_SKELETON_POINTS: [number, number, number][] = [
  ROBIN_LEG_LEFT_POSITION,
  ROBIN_BODY_POSITION,
  ROBIN_HEAD_POSITION,
  ROBIN_BEAK_POSITION,
  ROBIN_TAIL_POSITION,
  ROBIN_WING_LEFT_POSITION,
  ROBIN_WING_RIGHT_POSITION,
];

function Bone({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const delta = useMemo(() => new Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]), [from, to]);
  const length = delta.length();
  const midpoint = useMemo(() => new Vector3((from[0] + to[0]) * 0.5, (from[1] + to[1]) * 0.5, (from[2] + to[2]) * 0.5), [from, to]);
  const quaternion = useMemo(() => {
    if (length === 0) {
      return new Quaternion();
    }

    return new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), delta.clone().normalize());
  }, [delta, length]);

  if (length === 0) {
    return null;
  }

  return (
    <mesh position={midpoint} quaternion={quaternion}>
      <boxGeometry args={[0.035, length, 0.035]} />
      <meshBasicMaterial color={ROBIN_JOINT_COLOR} transparent opacity={0.72} />
    </mesh>
  );
}

function HighlightBox({ position, size, scale = [1.08, 1.08, 1.08] }: { position: [number, number, number]; size: [number, number, number]; scale?: [number, number, number] }) {
  return (
    <mesh position={position} scale={scale}>
      <boxGeometry args={size} />
      <meshBasicMaterial color={ROBIN_HIGHLIGHT_COLOR} transparent opacity={0.38} />
    </mesh>
  );
}

export function Robin({ action, wireframe, showSkeleton, highlighted = false }: RobinProps) {
  const rootRef = useRef<Group | null>(null);
  const headRef = useRef<Group | null>(null);
  const tailRef = useRef<Group | null>(null);
  const wingLeftRef = useRef<Group | null>(null);
  const wingRightRef = useRef<Group | null>(null);
  const legLeftRef = useRef<Group | null>(null);
  const legRightRef = useRef<Group | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const flap = Math.sin(t * 18);
    const glide = Math.sin(t * 4.2);
    const idleBob = Math.sin(t * 2.1);

    if (rootRef.current) {
      let y = 0;
      let rotZ = 0;
      let rotX = 0;

      if (action === "idle") {
        y = idleBob * 0.018;
        rotZ = Math.sin(t * 1.1) * 0.02;
      } else if (action === "preen") {
        y = Math.sin(t * 3.6) * 0.012;
        rotZ = -0.08 + Math.sin(t * 3.6) * 0.03;
      } else if (action === "flutter") {
        y = Math.abs(flap) * 0.09;
        rotZ = Math.sin(t * 9) * 0.04;
      } else if (action === "fly") {
        y = 0.35 + Math.sin(t * 6.2) * 0.08;
        rotX = -0.14 + Math.sin(t * 2.2) * 0.03;
      }

      rootRef.current.position.set(0, y, 0);
      rootRef.current.rotation.set(rotX, 0, rotZ);
    }

    if (headRef.current) {
      let x = ROBIN_HEAD_POSITION[0];
      let y = ROBIN_HEAD_POSITION[1];
      let z = ROBIN_HEAD_POSITION[2];
      let rotY = 0;
      let rotZ = 0;

      if (action === "idle") {
        y += Math.sin(t * 2.6 + 0.4) * 0.016;
        rotZ = Math.sin(t * 1.5) * 0.05;
      } else if (action === "preen") {
        x -= 0.02;
        y -= 0.04 + Math.abs(Math.sin(t * 4.2)) * 0.03;
        z = -0.16;
        rotY = -0.9;
        rotZ = 0.3;
      } else if (action === "flutter") {
        y += Math.abs(flap) * 0.03;
        rotZ = Math.sin(t * 6) * 0.04;
      } else if (action === "fly") {
        x += 0.03;
        y += Math.sin(t * 6.2) * 0.02;
        rotZ = -0.08;
      }

      headRef.current.position.set(x, y, z);
      headRef.current.rotation.set(0, rotY, rotZ);
    }

    if (tailRef.current) {
      let rotZ = -0.12;

      if (action === "idle") {
        rotZ += Math.sin(t * 1.8) * 0.05;
      } else if (action === "preen") {
        rotZ = -0.28 + Math.sin(t * 4.2) * 0.04;
      } else if (action === "flutter") {
        rotZ = -0.08 + Math.abs(flap) * 0.14;
      } else if (action === "fly") {
        rotZ = -0.18 + glide * 0.05;
      }

      tailRef.current.position.set(...ROBIN_TAIL_POSITION);
      tailRef.current.rotation.set(0, 0, rotZ);
    }

    if (wingLeftRef.current && wingRightRef.current) {
      let wingLift = 0;
      let leftRotY = -0.08;
      let rightRotY = 0.08;
      let leftRotZ = -0.12;
      let rightRotZ = 0.12;

      if (action === "preen") {
        wingLift = 0.03;
        leftRotY = -0.24;
        rightRotY = 0.04;
        leftRotZ = -0.5;
        rightRotZ = 0.08;
      } else if (action === "flutter") {
        wingLift = Math.abs(flap) * 0.05;
        leftRotY = -0.2 - flap * 0.18;
        rightRotY = 0.2 + flap * 0.18;
        leftRotZ = -0.48 - Math.abs(flap) * 0.26;
        rightRotZ = 0.48 + Math.abs(flap) * 0.26;
      } else if (action === "fly") {
        wingLift = 0.04 + Math.abs(flap) * 0.08;
        leftRotY = -0.34 - flap * 0.2;
        rightRotY = 0.34 + flap * 0.2;
        leftRotZ = -0.9 - Math.abs(flap) * 0.34;
        rightRotZ = 0.9 + Math.abs(flap) * 0.34;
      }

      wingLeftRef.current.position.set(ROBIN_WING_LEFT_POSITION[0], ROBIN_WING_LEFT_POSITION[1] + wingLift, ROBIN_WING_LEFT_POSITION[2]);
      wingRightRef.current.position.set(ROBIN_WING_RIGHT_POSITION[0], ROBIN_WING_RIGHT_POSITION[1] + wingLift, ROBIN_WING_RIGHT_POSITION[2]);
      wingLeftRef.current.rotation.set(0, leftRotY, leftRotZ);
      wingRightRef.current.rotation.set(0, rightRotY, rightRotZ);
    }

    if (legLeftRef.current && legRightRef.current) {
      const perchLift = action === "fly" ? 0.09 : action === "flutter" ? 0.03 : 0;
      legLeftRef.current.position.set(ROBIN_LEG_LEFT_POSITION[0], ROBIN_LEG_LEFT_POSITION[1] + perchLift, ROBIN_LEG_LEFT_POSITION[2]);
      legRightRef.current.position.set(ROBIN_LEG_RIGHT_POSITION[0], ROBIN_LEG_RIGHT_POSITION[1] + perchLift, ROBIN_LEG_RIGHT_POSITION[2]);
      legLeftRef.current.rotation.set(0, 0, action === "fly" ? 0.32 : 0.08);
      legRightRef.current.rotation.set(0, 0, action === "fly" ? 0.32 : 0.08);
    }
  });

  return (
    <group>
      {showSkeleton ? (
        <>
          {ROBIN_SKELETON_POINTS.map((point, index) => (
            <mesh key={`robin-joint-${index}`} position={point}>
              <boxGeometry args={[0.08, 0.08, 0.08]} />
              <meshBasicMaterial color={ROBIN_JOINT_COLOR} />
            </mesh>
          ))}
          <Bone from={ROBIN_LEG_LEFT_POSITION} to={ROBIN_BODY_POSITION} />
          <Bone from={ROBIN_BODY_POSITION} to={ROBIN_HEAD_POSITION} />
          <Bone from={ROBIN_HEAD_POSITION} to={ROBIN_BEAK_POSITION} />
          <Bone from={ROBIN_BODY_POSITION} to={ROBIN_TAIL_POSITION} />
          <Bone from={ROBIN_BODY_POSITION} to={ROBIN_WING_LEFT_POSITION} />
          <Bone from={ROBIN_BODY_POSITION} to={ROBIN_WING_RIGHT_POSITION} />
        </>
      ) : null}

      <group ref={rootRef}>
        {highlighted ? (
          <>
            <HighlightBox position={ROBIN_BODY_POSITION} size={ROBIN_BODY_SIZE} />
            <HighlightBox position={ROBIN_HEAD_POSITION} size={ROBIN_HEAD_SIZE} />
            <HighlightBox position={ROBIN_WING_LEFT_POSITION} size={ROBIN_WING_SIZE} scale={[1.1, 1.08, 1.14]} />
            <HighlightBox position={ROBIN_WING_RIGHT_POSITION} size={ROBIN_WING_SIZE} scale={[1.1, 1.08, 1.14]} />
          </>
        ) : null}

        <mesh position={ROBIN_BODY_POSITION} castShadow receiveShadow>
          <boxGeometry args={ROBIN_BODY_SIZE} />
          <meshStandardMaterial color={ROBIN_BODY_COLOR} roughness={1} flatShading wireframe={wireframe} />
        </mesh>

        <mesh position={ROBIN_BREAST_POSITION} castShadow receiveShadow>
          <boxGeometry args={ROBIN_BREAST_SIZE} />
          <meshStandardMaterial color={ROBIN_BREAST_COLOR} roughness={1} flatShading wireframe={wireframe} />
        </mesh>

        <group ref={headRef} position={ROBIN_HEAD_POSITION}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={ROBIN_HEAD_SIZE} />
            <meshStandardMaterial color={ROBIN_HEAD_COLOR} roughness={1} flatShading wireframe={wireframe} />
          </mesh>
          <mesh position={[ROBIN_BEAK_POSITION[0] - ROBIN_HEAD_POSITION[0], ROBIN_BEAK_POSITION[1] - ROBIN_HEAD_POSITION[1], 0]} castShadow receiveShadow>
            <boxGeometry args={ROBIN_BEAK_SIZE} />
            <meshStandardMaterial color={ROBIN_BEAK_COLOR} roughness={1} flatShading wireframe={wireframe} />
          </mesh>
          <mesh position={[ROBIN_EYE_LEFT_POSITION[0] - ROBIN_HEAD_POSITION[0], ROBIN_EYE_LEFT_POSITION[1] - ROBIN_HEAD_POSITION[1], ROBIN_EYE_LEFT_POSITION[2]]} castShadow receiveShadow>
            <boxGeometry args={ROBIN_EYE_SIZE} />
            <meshStandardMaterial color="#111111" roughness={1} flatShading wireframe={wireframe} />
          </mesh>
          <mesh position={[ROBIN_EYE_RIGHT_POSITION[0] - ROBIN_HEAD_POSITION[0], ROBIN_EYE_RIGHT_POSITION[1] - ROBIN_HEAD_POSITION[1], ROBIN_EYE_RIGHT_POSITION[2]]} castShadow receiveShadow>
            <boxGeometry args={ROBIN_EYE_SIZE} />
            <meshStandardMaterial color="#111111" roughness={1} flatShading wireframe={wireframe} />
          </mesh>
        </group>

        <group ref={wingLeftRef} position={ROBIN_WING_LEFT_POSITION}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={ROBIN_WING_SIZE} />
            <meshStandardMaterial color={ROBIN_WING_COLOR} roughness={1} flatShading wireframe={wireframe} />
          </mesh>
        </group>

        <group ref={wingRightRef} position={ROBIN_WING_RIGHT_POSITION}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={ROBIN_WING_SIZE} />
            <meshStandardMaterial color={ROBIN_WING_COLOR} roughness={1} flatShading wireframe={wireframe} />
          </mesh>
        </group>

        <group ref={tailRef} position={ROBIN_TAIL_POSITION}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={ROBIN_TAIL_SIZE} />
            <meshStandardMaterial color={ROBIN_WING_COLOR} roughness={1} flatShading wireframe={wireframe} />
          </mesh>
        </group>

        <group ref={legLeftRef} position={ROBIN_LEG_LEFT_POSITION}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={ROBIN_LEG_SIZE} />
            <meshStandardMaterial color={ROBIN_LEG_COLOR} roughness={1} flatShading wireframe={wireframe} />
          </mesh>
        </group>

        <group ref={legRightRef} position={ROBIN_LEG_RIGHT_POSITION}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={ROBIN_LEG_SIZE} />
            <meshStandardMaterial color={ROBIN_LEG_COLOR} roughness={1} flatShading wireframe={wireframe} />
          </mesh>
        </group>

        <mesh position={ROBIN_FOOT_LEFT_POSITION} castShadow receiveShadow>
          <boxGeometry args={ROBIN_FOOT_SIZE} />
          <meshStandardMaterial color={ROBIN_LEG_COLOR} roughness={1} flatShading wireframe={wireframe} />
        </mesh>

        <mesh position={ROBIN_FOOT_RIGHT_POSITION} castShadow receiveShadow>
          <boxGeometry args={ROBIN_FOOT_SIZE} />
          <meshStandardMaterial color={ROBIN_LEG_COLOR} roughness={1} flatShading wireframe={wireframe} />
        </mesh>
      </group>
    </group>
  );
}
