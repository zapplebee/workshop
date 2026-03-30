import { memo } from "react";
import { DoubleSide } from "three";

export type GrassClumpProps = {
  position: [number, number, number];
  scale?: number;
  lean?: number;
  tint?: string;
  highlighted?: boolean;
};

export const GrassClump = memo(function GrassClump({
  position,
  scale = 1,
  lean = 0,
  tint = "#7aa05c",
  highlighted = false,
}: GrassClumpProps) {
  const prisms = [
    { offset: [-0.08, 0.42, 0], scale: [0.08, 0.84, 0.08], rotation: -0.22, color: tint },
    { offset: [0, 0.54, 0.02], scale: [0.09, 1.08, 0.09], rotation: 0.04, color: "#93c977" },
    { offset: [0.08, 0.48, -0.01], scale: [0.08, 0.96, 0.08], rotation: 0.24, color: tint },
  ] as const;

  return (
    <group position={position} scale={scale} rotation={[0, lean, 0]}>
      {prisms.map((prism, index) => (
        <group key={index} position={prism.offset} rotation={[0, prism.rotation, 0]} scale={prism.scale}>
          {highlighted ? (
            <mesh scale={[1.35, 1.08, 1.35]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="#ff59bf" transparent opacity={0.45} side={DoubleSide} />
            </mesh>
          ) : null}

          <mesh castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={prism.color} roughness={1} flatShading side={DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
});
