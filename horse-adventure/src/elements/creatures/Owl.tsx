import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group, Quaternion, Vector3 } from "three";

export type OwlAction = "idle" | "blink" | "swivel" | "flap";

type OwlProps = {
  action: OwlAction;
  wireframe: boolean;
  showSkeleton: boolean;
  highlighted?: boolean;
};

const OWL_BODY_POSITION: [number, number, number] = [0, 0.58, 0];
const OWL_BODY_SIZE: [number, number, number] = [0.62, 0.68, 0.62];
const OWL_BELLY_POSITION: [number, number, number] = [0.08, 0.5, 0];
const OWL_BELLY_SIZE: [number, number, number] = [0.36, 0.4, 0.42];
const OWL_HEAD_POSITION: [number, number, number] = [0.12, 1.06, 0];
const OWL_HEAD_SIZE: [number, number, number] = [0.52, 0.4, 0.42];
const OWL_BEAK_POSITION: [number, number, number] = [0.4, 1.02, 0];
const OWL_BEAK_SIZE: [number, number, number] = [0.12, 0.1, 0.12];
const OWL_BROW_LEFT_POSITION: [number, number, number] = [0.22, 1.16, -0.12];
const OWL_BROW_RIGHT_POSITION: [number, number, number] = [0.22, 1.16, 0.12];
const OWL_BROW_SIZE: [number, number, number] = [0.16, 0.08, 0.12];
const OWL_EYE_LEFT_POSITION: [number, number, number] = [0.34, 1.06, -0.12];
const OWL_EYE_RIGHT_POSITION: [number, number, number] = [0.34, 1.06, 0.12];
const OWL_EYE_SIZE: [number, number, number] = [0.16, 0.16, 0.14];
const OWL_PUPIL_SIZE: [number, number, number] = [0.06, 0.06, 0.06];
const OWL_WING_LEFT_POSITION: [number, number, number] = [-0.08, 0.54, -0.32];
const OWL_WING_RIGHT_POSITION: [number, number, number] = [-0.08, 0.54, 0.32];
const OWL_WING_SIZE: [number, number, number] = [0.28, 0.5, 0.18];
const OWL_TAIL_POSITION: [number, number, number] = [-0.28, 0.42, 0];
const OWL_TAIL_SIZE: [number, number, number] = [0.22, 0.16, 0.26];
const OWL_LEG_LEFT_POSITION: [number, number, number] = [0.1, 0.16, -0.12];
const OWL_LEG_RIGHT_POSITION: [number, number, number] = [0.1, 0.16, 0.12];
const OWL_LEG_SIZE: [number, number, number] = [0.05, 0.22, 0.05];
const OWL_FOOT_LEFT_POSITION: [number, number, number] = [0.12, 0.03, -0.12];
const OWL_FOOT_RIGHT_POSITION: [number, number, number] = [0.12, 0.03, 0.12];
const OWL_FOOT_SIZE: [number, number, number] = [0.16, 0.04, 0.1];

const OWL_BODY_COLOR = "#6d5e50";
const OWL_HEAD_COLOR = "#746456";
const OWL_BELLY_COLOR = "#d9ccb8";
const OWL_WING_COLOR = "#5d4e44";
const OWL_BEAK_COLOR = "#caa25f";
const OWL_LEG_COLOR = "#7e6641";
const OWL_EYE_COLOR = "#e9bb4e";
const OWL_JOINT_COLOR = "#ff8fd1";
const OWL_HIGHLIGHT_COLOR = "#ff59bf";

const OWL_SKELETON_POINTS: [number, number, number][] = [
  OWL_LEG_LEFT_POSITION,
  OWL_BODY_POSITION,
  OWL_HEAD_POSITION,
  OWL_BEAK_POSITION,
  OWL_WING_LEFT_POSITION,
  OWL_WING_RIGHT_POSITION,
  OWL_TAIL_POSITION,
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
      <boxGeometry args={[0.035, length, 0.035]} />
      <meshBasicMaterial color={OWL_JOINT_COLOR} transparent opacity={0.72} />
    </mesh>
  );
}

function HighlightBox({ position, size, scale = [1.08, 1.08, 1.08] }: { position: [number, number, number]; size: [number, number, number]; scale?: [number, number, number] }) {
  return (
    <mesh position={position} scale={scale}>
      <boxGeometry args={size} />
      <meshBasicMaterial color={OWL_HIGHLIGHT_COLOR} transparent opacity={0.38} />
    </mesh>
  );
}

export function Owl({ action, wireframe, showSkeleton, highlighted = false }: OwlProps) {
  const rootRef = useRef<Group | null>(null);
  const headRef = useRef<Group | null>(null);
  const wingLeftRef = useRef<Group | null>(null);
  const wingRightRef = useRef<Group | null>(null);
  const tailRef = useRef<Group | null>(null);
  const eyeLeftRef = useRef<Group | null>(null);
  const eyeRightRef = useRef<Group | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const bob = Math.sin(t * 1.8);
    const flap = Math.sin(t * 12);

    if (rootRef.current) {
      let y = 0;
      let rotZ = 0;

      if (action === "idle") {
        y = bob * 0.02;
      } else if (action === "blink") {
        y = Math.sin(t * 4) * 0.012;
      } else if (action === "swivel") {
        y = Math.sin(t * 2.4) * 0.014;
        rotZ = Math.sin(t * 1.2) * 0.02;
      } else if (action === "flap") {
        y = Math.abs(flap) * 0.08;
        rotZ = Math.sin(t * 6) * 0.04;
      }

      rootRef.current.position.set(0, y, 0);
      rootRef.current.rotation.set(0, 0, rotZ);
    }

    if (headRef.current) {
      let y = OWL_HEAD_POSITION[1];
      let rotY = 0;
      let rotZ = 0;

      if (action === "idle") {
        y += Math.sin(t * 1.7 + 0.3) * 0.016;
      } else if (action === "blink") {
        y += Math.sin(t * 4.2) * 0.012;
      } else if (action === "swivel") {
        rotY = Math.sin(t * 1.6) * 0.85;
        rotZ = Math.sin(t * 1.6) * 0.04;
      } else if (action === "flap") {
        y += Math.abs(flap) * 0.03;
      }

      headRef.current.position.set(OWL_HEAD_POSITION[0], y, OWL_HEAD_POSITION[2]);
      headRef.current.rotation.set(0, rotY, rotZ);
    }

    if (wingLeftRef.current && wingRightRef.current) {
      let leftRotZ = -0.08;
      let rightRotZ = 0.08;
      let lift = 0;

      if (action === "flap") {
        lift = Math.abs(flap) * 0.06;
        leftRotZ = -0.5 - Math.abs(flap) * 0.38;
        rightRotZ = 0.5 + Math.abs(flap) * 0.38;
      }

      wingLeftRef.current.position.set(OWL_WING_LEFT_POSITION[0], OWL_WING_LEFT_POSITION[1] + lift, OWL_WING_LEFT_POSITION[2]);
      wingRightRef.current.position.set(OWL_WING_RIGHT_POSITION[0], OWL_WING_RIGHT_POSITION[1] + lift, OWL_WING_RIGHT_POSITION[2]);
      wingLeftRef.current.rotation.set(0, -0.08, leftRotZ);
      wingRightRef.current.rotation.set(0, 0.08, rightRotZ);
    }

    if (tailRef.current) {
      const rotZ = action === "flap" ? -0.12 + Math.abs(flap) * 0.12 : -0.08 + Math.sin(t * 1.4) * 0.03;
      tailRef.current.position.set(...OWL_TAIL_POSITION);
      tailRef.current.rotation.set(0, 0, rotZ);
    }

    const blinkScale = action === "blink" ? 0.2 + Math.abs(Math.sin(t * 8)) * 0.8 : 1;
    eyeLeftRef.current?.scale.set(1, blinkScale, 1);
    eyeRightRef.current?.scale.set(1, blinkScale, 1);
  });

  return (
    <group>
      {showSkeleton ? (
        <>
          {OWL_SKELETON_POINTS.map((point, index) => (
            <mesh key={`owl-joint-${index}`} position={point}>
              <boxGeometry args={[0.08, 0.08, 0.08]} />
              <meshBasicMaterial color={OWL_JOINT_COLOR} />
            </mesh>
          ))}
          <Bone from={OWL_LEG_LEFT_POSITION} to={OWL_BODY_POSITION} />
          <Bone from={OWL_BODY_POSITION} to={OWL_HEAD_POSITION} />
          <Bone from={OWL_HEAD_POSITION} to={OWL_BEAK_POSITION} />
          <Bone from={OWL_BODY_POSITION} to={OWL_WING_LEFT_POSITION} />
          <Bone from={OWL_BODY_POSITION} to={OWL_WING_RIGHT_POSITION} />
          <Bone from={OWL_BODY_POSITION} to={OWL_TAIL_POSITION} />
        </>
      ) : null}

      <group ref={rootRef}>
        {highlighted ? (
          <>
            <HighlightBox position={OWL_BODY_POSITION} size={OWL_BODY_SIZE} />
            <HighlightBox position={OWL_HEAD_POSITION} size={OWL_HEAD_SIZE} />
            <HighlightBox position={OWL_WING_LEFT_POSITION} size={OWL_WING_SIZE} scale={[1.1, 1.1, 1.14]} />
            <HighlightBox position={OWL_WING_RIGHT_POSITION} size={OWL_WING_SIZE} scale={[1.1, 1.1, 1.14]} />
          </>
        ) : null}

        <mesh position={OWL_BODY_POSITION} castShadow receiveShadow>
          <boxGeometry args={OWL_BODY_SIZE} />
          <meshStandardMaterial color={OWL_BODY_COLOR} roughness={1} flatShading wireframe={wireframe} />
        </mesh>

        <mesh position={OWL_BELLY_POSITION} castShadow receiveShadow>
          <boxGeometry args={OWL_BELLY_SIZE} />
          <meshStandardMaterial color={OWL_BELLY_COLOR} roughness={1} flatShading wireframe={wireframe} />
        </mesh>

        <group ref={headRef} position={OWL_HEAD_POSITION}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={OWL_HEAD_SIZE} />
            <meshStandardMaterial color={OWL_HEAD_COLOR} roughness={1} flatShading wireframe={wireframe} />
          </mesh>
          <mesh position={[OWL_BEAK_POSITION[0] - OWL_HEAD_POSITION[0], OWL_BEAK_POSITION[1] - OWL_HEAD_POSITION[1], 0]} castShadow receiveShadow>
            <boxGeometry args={OWL_BEAK_SIZE} />
            <meshStandardMaterial color={OWL_BEAK_COLOR} roughness={1} flatShading wireframe={wireframe} />
          </mesh>
          <mesh position={[OWL_BROW_LEFT_POSITION[0] - OWL_HEAD_POSITION[0], OWL_BROW_LEFT_POSITION[1] - OWL_HEAD_POSITION[1], OWL_BROW_LEFT_POSITION[2]]} castShadow receiveShadow>
            <boxGeometry args={OWL_BROW_SIZE} />
            <meshStandardMaterial color={OWL_WING_COLOR} roughness={1} flatShading wireframe={wireframe} />
          </mesh>
          <mesh position={[OWL_BROW_RIGHT_POSITION[0] - OWL_HEAD_POSITION[0], OWL_BROW_RIGHT_POSITION[1] - OWL_HEAD_POSITION[1], OWL_BROW_RIGHT_POSITION[2]]} castShadow receiveShadow>
            <boxGeometry args={OWL_BROW_SIZE} />
            <meshStandardMaterial color={OWL_WING_COLOR} roughness={1} flatShading wireframe={wireframe} />
          </mesh>
          <group ref={eyeLeftRef} position={[OWL_EYE_LEFT_POSITION[0] - OWL_HEAD_POSITION[0], OWL_EYE_LEFT_POSITION[1] - OWL_HEAD_POSITION[1], OWL_EYE_LEFT_POSITION[2]]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={OWL_EYE_SIZE} />
              <meshStandardMaterial color={OWL_EYE_COLOR} roughness={1} flatShading wireframe={wireframe} />
            </mesh>
            <mesh position={[0.04, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={OWL_PUPIL_SIZE} />
              <meshStandardMaterial color="#111111" roughness={1} flatShading wireframe={wireframe} />
            </mesh>
          </group>
          <group ref={eyeRightRef} position={[OWL_EYE_RIGHT_POSITION[0] - OWL_HEAD_POSITION[0], OWL_EYE_RIGHT_POSITION[1] - OWL_HEAD_POSITION[1], OWL_EYE_RIGHT_POSITION[2]]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={OWL_EYE_SIZE} />
              <meshStandardMaterial color={OWL_EYE_COLOR} roughness={1} flatShading wireframe={wireframe} />
            </mesh>
            <mesh position={[0.04, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={OWL_PUPIL_SIZE} />
              <meshStandardMaterial color="#111111" roughness={1} flatShading wireframe={wireframe} />
            </mesh>
          </group>
        </group>

        <group ref={wingLeftRef} position={OWL_WING_LEFT_POSITION}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={OWL_WING_SIZE} />
            <meshStandardMaterial color={OWL_WING_COLOR} roughness={1} flatShading wireframe={wireframe} />
          </mesh>
        </group>

        <group ref={wingRightRef} position={OWL_WING_RIGHT_POSITION}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={OWL_WING_SIZE} />
            <meshStandardMaterial color={OWL_WING_COLOR} roughness={1} flatShading wireframe={wireframe} />
          </mesh>
        </group>

        <group ref={tailRef} position={OWL_TAIL_POSITION}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={OWL_TAIL_SIZE} />
            <meshStandardMaterial color={OWL_WING_COLOR} roughness={1} flatShading wireframe={wireframe} />
          </mesh>
        </group>

        <mesh position={OWL_LEG_LEFT_POSITION} castShadow receiveShadow>
          <boxGeometry args={OWL_LEG_SIZE} />
          <meshStandardMaterial color={OWL_LEG_COLOR} roughness={1} flatShading wireframe={wireframe} />
        </mesh>
        <mesh position={OWL_LEG_RIGHT_POSITION} castShadow receiveShadow>
          <boxGeometry args={OWL_LEG_SIZE} />
          <meshStandardMaterial color={OWL_LEG_COLOR} roughness={1} flatShading wireframe={wireframe} />
        </mesh>
        <mesh position={OWL_FOOT_LEFT_POSITION} castShadow receiveShadow>
          <boxGeometry args={OWL_FOOT_SIZE} />
          <meshStandardMaterial color={OWL_LEG_COLOR} roughness={1} flatShading wireframe={wireframe} />
        </mesh>
        <mesh position={OWL_FOOT_RIGHT_POSITION} castShadow receiveShadow>
          <boxGeometry args={OWL_FOOT_SIZE} />
          <meshStandardMaterial color={OWL_LEG_COLOR} roughness={1} flatShading wireframe={wireframe} />
        </mesh>
      </group>
    </group>
  );
}
