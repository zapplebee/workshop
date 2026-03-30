import { DoubleSide } from "three";

type CanyonRingProps = {
  innerRadius: number;
  wallThickness: number;
  wallHeight: number;
  segments: number;
};

export function CanyonRing({ innerRadius, wallThickness, wallHeight, segments }: CanyonRingProps) {
  const outerRadius = innerRadius + wallThickness;
  const ringY = wallHeight * 0.5;

  return (
    <group position={[0, ringY, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[outerRadius, outerRadius, wallHeight, segments, 1, true]} />
        <meshStandardMaterial color="#b4663f" roughness={1} flatShading side={DoubleSide} />
      </mesh>

      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[innerRadius, innerRadius, wallHeight - 2, segments, 1, true]} />
        <meshStandardMaterial color="#c57f50" roughness={1} flatShading side={DoubleSide} />
      </mesh>

      <mesh position={[0, wallHeight * 0.5 - 1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[outerRadius, outerRadius, 2.4, segments, 1, true]} />
        <meshStandardMaterial color="#dda06c" roughness={1} flatShading side={DoubleSide} />
      </mesh>

      <mesh position={[0, -wallHeight * 0.5 + 1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[outerRadius, outerRadius, 2.4, segments, 1, true]} />
        <meshStandardMaterial color="#9e5534" roughness={1} flatShading side={DoubleSide} />
      </mesh>
    </group>
  );
}

export type { CanyonRingProps };
