import { memo } from "react";

export type CowboyHatProps = {
  position: [number, number, number];
  highlighted?: boolean;
  wireframe?: boolean;
};

export const CowboyHat = memo(function CowboyHat({ position, highlighted = false, wireframe = false }: CowboyHatProps) {
  return (
    <group position={position} rotation={[0.02, 0.28, -0.04]}>
      {highlighted ? (
        <mesh position={[0, 0.18, 0]} scale={[1.16, 1.08, 1.16]}>
          <cylinderGeometry args={[0.54, 0.66, 0.22, 28]} />
          <meshBasicMaterial color="#ff59bf" transparent opacity={0.34} />
        </mesh>
      ) : null}

      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.56, 0.7, 0.08, 28]} />
        <meshStandardMaterial color="#8a643f" roughness={1} flatShading wireframe={wireframe} />
      </mesh>

      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.36, 0.42, 0.28, 24]} />
        <meshStandardMaterial color="#9b7147" roughness={1} flatShading wireframe={wireframe} />
      </mesh>

      <mesh position={[0, 0.18, 0.01]} castShadow receiveShadow>
        <boxGeometry args={[0.86, 0.04, 0.06]} />
        <meshStandardMaterial color="#5f2d22" roughness={1} flatShading wireframe={wireframe} />
      </mesh>
    </group>
  );
});
