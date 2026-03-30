import type { ReactNode } from "react";
import { WorkshopControls } from "./WorkshopControls";

const workshopReferenceCubePosition: [number, number, number] = [3.5, 0.5, 0];

export function WorkshopScene({
  content,
  onCameraQuaternionChange,
  showReferenceRabbit = false,
}: {
  content: ReactNode;
  onCameraQuaternionChange?: (quaternion: [number, number, number, number]) => void;
  showReferenceRabbit?: boolean;
}) {
  return (
    <>
      <WorkshopControls onCameraQuaternionChange={onCameraQuaternionChange} />

      <color attach="background" args={["#2f78d8"]} />
      <fog attach="fog" args={["#2f78d8", 40, 120]} />

      <ambientLight intensity={1.2} color="#dfeeff" />
      <hemisphereLight intensity={1} color="#9fd2ff" groundColor="#8ea2b8" />
      <directionalLight position={[8, 14, 10]} intensity={2.2} color="#fff0c2" castShadow />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#50555d" roughness={1} flatShading />
      </mesh>

      {content}

      {showReferenceRabbit ? (
        <mesh position={workshopReferenceCubePosition} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#efe8de" roughness={1} flatShading wireframe />
        </mesh>
      ) : null}
    </>
  );
}
