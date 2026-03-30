import { memo } from "react";
import { DoubleSide } from "three";

export type CarrotProps = {
  position: [number, number, number];
  highlighted?: boolean;
  wireframe?: boolean;
};

export const Carrot = memo(function Carrot({ position, highlighted = false, wireframe = false }: CarrotProps) {
  return (
    <group position={position} rotation={[0.12, 0.3, 1.02]}>
      {highlighted ? (
        <mesh position={[0, 0.16, 0]} scale={[1.2, 1.18, 1.18]}>
          <boxGeometry args={[0.2, 0.62, 0.2]} />
          <meshBasicMaterial color="#ff59bf" transparent opacity={0.38} side={DoubleSide} />
        </mesh>
      ) : null}

      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.16, 0.52, 0.16]} />
        <meshStandardMaterial color="#e3782d" roughness={1} flatShading wireframe={wireframe} />
      </mesh>
      <mesh position={[0.05, 0.43, 0]} rotation={[0, 0, 0.3]} castShadow receiveShadow>
        <boxGeometry args={[0.06, 0.26, 0.06]} />
        <meshStandardMaterial color="#6fa545" roughness={1} flatShading wireframe={wireframe} />
      </mesh>
      <mesh position={[-0.04, 0.45, 0.02]} rotation={[0, 0, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.06, 0.24, 0.06]} />
        <meshStandardMaterial color="#79b24f" roughness={1} flatShading wireframe={wireframe} />
      </mesh>
    </group>
  );
});
