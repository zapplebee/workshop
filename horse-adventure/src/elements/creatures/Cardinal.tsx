import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group, Quaternion, Vector3 } from "three";

export type CardinalAction = "idle" | "preen" | "flutter" | "fly";

type CardinalProps = {
  action: CardinalAction;
  wireframe: boolean;
  showSkeleton: boolean;
  highlighted?: boolean;
};

const CARDINAL_BODY_POSITION: [number, number, number] = [0, 0.42, 0];
const CARDINAL_BODY_SIZE: [number, number, number] = [0.48, 0.42, 0.56];
const CARDINAL_BREAST_POSITION: [number, number, number] = [0.14, 0.39, 0];
const CARDINAL_BREAST_SIZE: [number, number, number] = [0.28, 0.28, 0.42];
const CARDINAL_HEAD_POSITION: [number, number, number] = [0.28, 0.6, 0];
const CARDINAL_HEAD_SIZE: [number, number, number] = [0.24, 0.24, 0.24];
const CARDINAL_CREST_POSITION: [number, number, number] = [0.2, 0.79, 0];
const CARDINAL_CREST_SIZE: [number, number, number] = [0.1, 0.24, 0.1];
const CARDINAL_MASK_POSITION: [number, number, number] = [0.38, 0.58, 0];
const CARDINAL_MASK_SIZE: [number, number, number] = [0.12, 0.14, 0.22];
const CARDINAL_BEAK_POSITION: [number, number, number] = [0.44, 0.57, 0];
const CARDINAL_BEAK_SIZE: [number, number, number] = [0.14, 0.08, 0.1];
const CARDINAL_TAIL_POSITION: [number, number, number] = [-0.36, 0.44, 0];
const CARDINAL_TAIL_SIZE: [number, number, number] = [0.28, 0.08, 0.2];
const CARDINAL_WING_SIZE: [number, number, number] = [0.3, 0.1, 0.24];
const CARDINAL_WING_LEFT_POSITION: [number, number, number] = [-0.02, 0.42, -0.27];
const CARDINAL_WING_RIGHT_POSITION: [number, number, number] = [-0.02, 0.42, 0.27];
const CARDINAL_LEG_SIZE: [number, number, number] = [0.04, 0.22, 0.04];
const CARDINAL_LEG_LEFT_POSITION: [number, number, number] = [0.06, 0.13, -0.09];
const CARDINAL_LEG_RIGHT_POSITION: [number, number, number] = [0.06, 0.13, 0.09];
const CARDINAL_FOOT_SIZE: [number, number, number] = [0.12, 0.03, 0.08];
const CARDINAL_FOOT_LEFT_POSITION: [number, number, number] = [0.09, 0.02, -0.09];
const CARDINAL_FOOT_RIGHT_POSITION: [number, number, number] = [0.09, 0.02, 0.09];
const CARDINAL_EYE_LEFT_POSITION: [number, number, number] = [0.37, 0.61, -0.1];
const CARDINAL_EYE_RIGHT_POSITION: [number, number, number] = [0.37, 0.61, 0.1];
const CARDINAL_EYE_SIZE: [number, number, number] = [0.05, 0.05, 0.05];

const CARDINAL_BODY_COLOR = "#b32328";
const CARDINAL_WING_COLOR = "#941f25";
const CARDINAL_BREAST_COLOR = "#c52a2f";
const CARDINAL_HEAD_COLOR = "#b9242a";
const CARDINAL_CREST_COLOR = "#9f2026";
const CARDINAL_MASK_COLOR = "#1f1717";
const CARDINAL_BEAK_COLOR = "#d57732";
const CARDINAL_LEG_COLOR = "#71543b";
const CARDINAL_JOINT_COLOR = "#ff8fd1";
const CARDINAL_HIGHLIGHT_COLOR = "#ff59bf";

const CARDINAL_SKELETON_POINTS: [number, number, number][] = [
  CARDINAL_LEG_LEFT_POSITION,
  CARDINAL_BODY_POSITION,
  CARDINAL_HEAD_POSITION,
  CARDINAL_BEAK_POSITION,
  CARDINAL_TAIL_POSITION,
  CARDINAL_WING_LEFT_POSITION,
  CARDINAL_WING_RIGHT_POSITION,
  CARDINAL_CREST_POSITION,
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
      <meshBasicMaterial color={CARDINAL_JOINT_COLOR} transparent opacity={0.72} />
    </mesh>
  );
}

function HighlightBox({ position, size, scale = [1.08, 1.08, 1.08] }: { position: [number, number, number]; size: [number, number, number]; scale?: [number, number, number] }) {
  return (
    <mesh position={position} scale={scale}>
      <boxGeometry args={size} />
      <meshBasicMaterial color={CARDINAL_HIGHLIGHT_COLOR} transparent opacity={0.38} />
    </mesh>
  );
}

export function Cardinal({ action, wireframe, showSkeleton, highlighted = false }: CardinalProps) {
  const rootRef = useRef<Group | null>(null);
  const headRef = useRef<Group | null>(null);
  const tailRef = useRef<Group | null>(null);
  const wingLeftRef = useRef<Group | null>(null);
  const wingRightRef = useRef<Group | null>(null);
  const legLeftRef = useRef<Group | null>(null);
  const legRightRef = useRef<Group | null>(null);
  const crestRef = useRef<Group | null>(null);

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
      let x = CARDINAL_HEAD_POSITION[0];
      let y = CARDINAL_HEAD_POSITION[1];
      let z = CARDINAL_HEAD_POSITION[2];
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

    if (crestRef.current) {
      let rotZ = -0.08;
      let y = CARDINAL_CREST_POSITION[1] - CARDINAL_HEAD_POSITION[1];

      if (action === "idle") {
        y += Math.sin(t * 2.2 + 0.3) * 0.01;
        rotZ += Math.sin(t * 2.2) * 0.04;
      } else if (action === "preen") {
        y -= 0.01;
        rotZ = -0.16 + Math.sin(t * 3.8) * 0.03;
      } else if (action === "flutter") {
        y += Math.abs(flap) * 0.015;
        rotZ = -0.1 + Math.abs(flap) * 0.08;
      } else if (action === "fly") {
        y += Math.abs(flap) * 0.025;
        rotZ = -0.2 + glide * 0.04;
      }

      crestRef.current.position.set(CARDINAL_CREST_POSITION[0] - CARDINAL_HEAD_POSITION[0], y, CARDINAL_CREST_POSITION[2] - CARDINAL_HEAD_POSITION[2]);
      crestRef.current.rotation.set(0, 0, rotZ);
    }

    if (tailRef.current) {
      let rotZ = -0.16;

      if (action === "idle") {
        rotZ += Math.sin(t * 1.8) * 0.05;
      } else if (action === "preen") {
        rotZ = -0.32 + Math.sin(t * 4.2) * 0.04;
      } else if (action === "flutter") {
        rotZ = -0.1 + Math.abs(flap) * 0.14;
      } else if (action === "fly") {
        rotZ = -0.22 + glide * 0.05;
      }

      tailRef.current.position.set(...CARDINAL_TAIL_POSITION);
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

      wingLeftRef.current.position.set(CARDINAL_WING_LEFT_POSITION[0], CARDINAL_WING_LEFT_POSITION[1] + wingLift, CARDINAL_WING_LEFT_POSITION[2]);
      wingRightRef.current.position.set(CARDINAL_WING_RIGHT_POSITION[0], CARDINAL_WING_RIGHT_POSITION[1] + wingLift, CARDINAL_WING_RIGHT_POSITION[2]);
      wingLeftRef.current.rotation.set(0, leftRotY, leftRotZ);
      wingRightRef.current.rotation.set(0, rightRotY, rightRotZ);
    }

    if (legLeftRef.current && legRightRef.current) {
      const perchLift = action === "fly" ? 0.09 : action === "flutter" ? 0.03 : 0;
      legLeftRef.current.position.set(CARDINAL_LEG_LEFT_POSITION[0], CARDINAL_LEG_LEFT_POSITION[1] + perchLift, CARDINAL_LEG_LEFT_POSITION[2]);
      legRightRef.current.position.set(CARDINAL_LEG_RIGHT_POSITION[0], CARDINAL_LEG_RIGHT_POSITION[1] + perchLift, CARDINAL_LEG_RIGHT_POSITION[2]);
      legLeftRef.current.rotation.set(0, 0, action === "fly" ? 0.32 : 0.08);
      legRightRef.current.rotation.set(0, 0, action === "fly" ? 0.32 : 0.08);
    }
  });

  return (
    <group>
      {showSkeleton ? (
        <>
          {CARDINAL_SKELETON_POINTS.map((point, index) => (
            <mesh key={`cardinal-joint-${index}`} position={point}>
              <boxGeometry args={[0.08, 0.08, 0.08]} />
              <meshBasicMaterial color={CARDINAL_JOINT_COLOR} />
            </mesh>
          ))}
          <Bone from={CARDINAL_LEG_LEFT_POSITION} to={CARDINAL_BODY_POSITION} />
          <Bone from={CARDINAL_BODY_POSITION} to={CARDINAL_HEAD_POSITION} />
          <Bone from={CARDINAL_HEAD_POSITION} to={CARDINAL_BEAK_POSITION} />
          <Bone from={CARDINAL_HEAD_POSITION} to={CARDINAL_CREST_POSITION} />
          <Bone from={CARDINAL_BODY_POSITION} to={CARDINAL_TAIL_POSITION} />
          <Bone from={CARDINAL_BODY_POSITION} to={CARDINAL_WING_LEFT_POSITION} />
          <Bone from={CARDINAL_BODY_POSITION} to={CARDINAL_WING_RIGHT_POSITION} />
        </>
      ) : null}

      <group ref={rootRef}>
        {highlighted ? (
          <>
            <HighlightBox position={CARDINAL_BODY_POSITION} size={CARDINAL_BODY_SIZE} />
            <HighlightBox position={CARDINAL_HEAD_POSITION} size={CARDINAL_HEAD_SIZE} />
            <HighlightBox position={CARDINAL_WING_LEFT_POSITION} size={CARDINAL_WING_SIZE} scale={[1.1, 1.08, 1.14]} />
            <HighlightBox position={CARDINAL_WING_RIGHT_POSITION} size={CARDINAL_WING_SIZE} scale={[1.1, 1.08, 1.14]} />
          </>
        ) : null}

        <mesh position={CARDINAL_BODY_POSITION} castShadow receiveShadow>
          <boxGeometry args={CARDINAL_BODY_SIZE} />
          <meshStandardMaterial color={CARDINAL_BODY_COLOR} roughness={1} flatShading wireframe={wireframe} />
        </mesh>

        <mesh position={CARDINAL_BREAST_POSITION} castShadow receiveShadow>
          <boxGeometry args={CARDINAL_BREAST_SIZE} />
          <meshStandardMaterial color={CARDINAL_BREAST_COLOR} roughness={1} flatShading wireframe={wireframe} />
        </mesh>

        <group ref={headRef} position={CARDINAL_HEAD_POSITION}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={CARDINAL_HEAD_SIZE} />
            <meshStandardMaterial color={CARDINAL_HEAD_COLOR} roughness={1} flatShading wireframe={wireframe} />
          </mesh>
          <mesh position={[CARDINAL_MASK_POSITION[0] - CARDINAL_HEAD_POSITION[0], CARDINAL_MASK_POSITION[1] - CARDINAL_HEAD_POSITION[1], 0]} castShadow receiveShadow>
            <boxGeometry args={CARDINAL_MASK_SIZE} />
            <meshStandardMaterial color={CARDINAL_MASK_COLOR} roughness={1} flatShading wireframe={wireframe} />
          </mesh>
          <mesh position={[CARDINAL_BEAK_POSITION[0] - CARDINAL_HEAD_POSITION[0], CARDINAL_BEAK_POSITION[1] - CARDINAL_HEAD_POSITION[1], 0]} castShadow receiveShadow>
            <boxGeometry args={CARDINAL_BEAK_SIZE} />
            <meshStandardMaterial color={CARDINAL_BEAK_COLOR} roughness={1} flatShading wireframe={wireframe} />
          </mesh>
          <mesh position={[CARDINAL_EYE_LEFT_POSITION[0] - CARDINAL_HEAD_POSITION[0], CARDINAL_EYE_LEFT_POSITION[1] - CARDINAL_HEAD_POSITION[1], CARDINAL_EYE_LEFT_POSITION[2]]} castShadow receiveShadow>
            <boxGeometry args={CARDINAL_EYE_SIZE} />
            <meshStandardMaterial color="#111111" roughness={1} flatShading wireframe={wireframe} />
          </mesh>
          <mesh position={[CARDINAL_EYE_RIGHT_POSITION[0] - CARDINAL_HEAD_POSITION[0], CARDINAL_EYE_RIGHT_POSITION[1] - CARDINAL_HEAD_POSITION[1], CARDINAL_EYE_RIGHT_POSITION[2]]} castShadow receiveShadow>
            <boxGeometry args={CARDINAL_EYE_SIZE} />
            <meshStandardMaterial color="#111111" roughness={1} flatShading wireframe={wireframe} />
          </mesh>
          <group ref={crestRef} position={[CARDINAL_CREST_POSITION[0] - CARDINAL_HEAD_POSITION[0], CARDINAL_CREST_POSITION[1] - CARDINAL_HEAD_POSITION[1], CARDINAL_CREST_POSITION[2] - CARDINAL_HEAD_POSITION[2]]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={CARDINAL_CREST_SIZE} />
              <meshStandardMaterial color={CARDINAL_CREST_COLOR} roughness={1} flatShading wireframe={wireframe} />
            </mesh>
          </group>
        </group>

        <group ref={wingLeftRef} position={CARDINAL_WING_LEFT_POSITION}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={CARDINAL_WING_SIZE} />
            <meshStandardMaterial color={CARDINAL_WING_COLOR} roughness={1} flatShading wireframe={wireframe} />
          </mesh>
        </group>

        <group ref={wingRightRef} position={CARDINAL_WING_RIGHT_POSITION}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={CARDINAL_WING_SIZE} />
            <meshStandardMaterial color={CARDINAL_WING_COLOR} roughness={1} flatShading wireframe={wireframe} />
          </mesh>
        </group>

        <group ref={tailRef} position={CARDINAL_TAIL_POSITION}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={CARDINAL_TAIL_SIZE} />
            <meshStandardMaterial color={CARDINAL_WING_COLOR} roughness={1} flatShading wireframe={wireframe} />
          </mesh>
        </group>

        <group ref={legLeftRef} position={CARDINAL_LEG_LEFT_POSITION}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={CARDINAL_LEG_SIZE} />
            <meshStandardMaterial color={CARDINAL_LEG_COLOR} roughness={1} flatShading wireframe={wireframe} />
          </mesh>
        </group>

        <group ref={legRightRef} position={CARDINAL_LEG_RIGHT_POSITION}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={CARDINAL_LEG_SIZE} />
            <meshStandardMaterial color={CARDINAL_LEG_COLOR} roughness={1} flatShading wireframe={wireframe} />
          </mesh>
        </group>

        <mesh position={CARDINAL_FOOT_LEFT_POSITION} castShadow receiveShadow>
          <boxGeometry args={CARDINAL_FOOT_SIZE} />
          <meshStandardMaterial color={CARDINAL_LEG_COLOR} roughness={1} flatShading wireframe={wireframe} />
        </mesh>

        <mesh position={CARDINAL_FOOT_RIGHT_POSITION} castShadow receiveShadow>
          <boxGeometry args={CARDINAL_FOOT_SIZE} />
          <meshStandardMaterial color={CARDINAL_LEG_COLOR} roughness={1} flatShading wireframe={wireframe} />
        </mesh>
      </group>
    </group>
  );
}
