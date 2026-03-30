import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group } from "three";

type CloudProps = {
  position: [number, number, number];
  scale: number;
  drift?: number;
};

export function Cloud({ position, scale, drift = 0 }: CloudProps) {
  const groupRef = useRef<Group>(null);
  const puffs = useMemo(
    () => [
      [-0.48, 0.05, 0],
      [0, 0.14, 0.08],
      [0.42, 0.04, -0.02],
      [-0.12, -0.03, 0.14],
      [0.2, -0.05, -0.12],
    ] as const,
    [],
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const bob = Math.sin(clock.getElapsedTime() * (0.35 + Math.abs(drift) * 0.3) + position[0]) * 0.08;
    groupRef.current.position.x = position[0] + Math.sin(clock.getElapsedTime() * drift) * 0.5;
    groupRef.current.position.y = position[1] + bob;
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh scale={[1.5, 0.42, 1.1]}>
        <sphereGeometry args={[0.78, 18, 14]} />
        <meshBasicMaterial color="#d6e8ff" transparent opacity={0.75} fog={false} />
      </mesh>

      {puffs.map(([x, y, z], index) => (
        <mesh key={index} position={[x, y, z]} scale={[0.95, 0.82, 0.8]}>
          <sphereGeometry args={[0.55 + (index % 2) * 0.08, 18, 14]} />
          <meshBasicMaterial color={index % 2 === 0 ? "#fffefc" : "#eef5ff"} transparent opacity={0.98} fog={false} />
        </mesh>
      ))}
    </group>
  );
}

export type { CloudProps };
