import { memo } from "react";
import { DoubleSide } from "three";

type RabbitProps = {
  id: string;
  position: [number, number, number];
  highlighted?: boolean;
  wireframe?: boolean;
  terrainHeightAt?: (x: number, z: number) => number;
};

export const Rabbit = memo(function Rabbit({ position, highlighted = false, wireframe = false, terrainHeightAt }: RabbitProps) {
  const y = (terrainHeightAt?.(position[0], position[2]) ?? 0) + 0.2;

  return (
    <group position={[position[0], y, position[2]]}>
      {highlighted ? (
        <group>
          <mesh position={[0, 0.34, 0]} scale={[0.96, 0.72, 0.72]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#ff59bf" transparent opacity={0.35} side={DoubleSide} />
          </mesh>
          <mesh position={[-0.12, 0.82, 0]} scale={[0.2, 0.68, 0.2]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#ff59bf" transparent opacity={0.35} side={DoubleSide} />
          </mesh>
          <mesh position={[0.12, 0.82, 0]} scale={[0.2, 0.68, 0.2]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#ff59bf" transparent opacity={0.35} side={DoubleSide} />
          </mesh>
        </group>
      ) : null}

      <mesh castShadow position={[0, 0.34, 0]} scale={[0.84, 0.6, 0.6]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#efe8de" roughness={1} flatShading wireframe={wireframe} />
      </mesh>
      <mesh castShadow position={[-0.12, 0.82, 0]} scale={[0.16, 0.56, 0.16]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#efe8de" roughness={1} flatShading wireframe={wireframe} />
      </mesh>
      <mesh castShadow position={[0.12, 0.82, 0]} scale={[0.16, 0.56, 0.16]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#efe8de" roughness={1} flatShading wireframe={wireframe} />
      </mesh>
      <mesh castShadow position={[0.32, 0.24, -0.08]} scale={[0.22, 0.18, 0.18]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#efe8de" roughness={1} flatShading wireframe={wireframe} />
      </mesh>
    </group>
  );
});
