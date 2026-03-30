type HillProps = {
  position: [number, number, number];
  scale: [number, number, number];
  tint: string;
};

export function Hill({ position, scale, tint }: HillProps) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <sphereGeometry args={[1, 20, 16]} />
      <meshStandardMaterial color={tint} roughness={1} flatShading />
    </mesh>
  );
}

export type { HillProps };
