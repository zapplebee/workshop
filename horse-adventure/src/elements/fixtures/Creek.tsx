import { useMemo } from "react";
import { Shape } from "three";

export type CreekProps = {
  position: [number, number, number];
  scale?: number;
  rotationY?: number;
};

const creekPoints: Array<[number, number]> = [
  [-214, 42],
  [-196, 40],
  [-176, 38],
  [-142, 30],
  [-126, 23],
  [-110, 12],
  [-92, 0],
  [-76, -10],
  [-58, -18],
  [-40, -20],
  [-22, -16],
  [-4, -8],
  [16, 1],
  [34, 8],
  [52, 10],
  [70, 7],
  [88, -1],
  [106, -12],
  [124, -24],
  [142, -34],
  [164, -40],
  [186, -46],
  [212, -52],
];

function buildRibbonShape(points: Array<[number, number]>, width: number) {
  const left: Array<[number, number]> = [];
  const right: Array<[number, number]> = [];
  const halfWidth = width * 0.5;

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index]!;
    const previous = points[index - 1] ?? current;
    const next = points[index + 1] ?? current;
    const dx = next[0] - previous[0];
    const dy = next[1] - previous[1];
    const length = Math.hypot(dx, dy) || 1;
    const nx = -dy / length;
    const ny = dx / length;

    left.push([current[0] + nx * halfWidth, current[1] + ny * halfWidth]);
    right.push([current[0] - nx * halfWidth, current[1] - ny * halfWidth]);
  }

  const outline = [...left, ...right.reverse()];
  const shape = new Shape();
  shape.moveTo(outline[0]![0], outline[0]![1]);

  for (let index = 1; index < outline.length; index += 1) {
    shape.lineTo(outline[index]![0], outline[index]![1]);
  }

  shape.closePath();
  return shape;
}

export function Creek({ position, scale = 1, rotationY = 0 }: CreekProps) {
  const waterShape = useMemo(() => buildRibbonShape(creekPoints, 6.4), []);
  const bankShape = useMemo(() => buildRibbonShape(creekPoints, 10.6), []);

  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <shapeGeometry args={[bankShape]} />
        <meshStandardMaterial color="#8a9f68" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <shapeGeometry args={[waterShape]} />
        <meshStandardMaterial color="#5ca3c7" roughness={0.35} metalness={0.05} flatShading />
      </mesh>
      <mesh position={[0, 0.014, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <shapeGeometry args={[buildRibbonShape(creekPoints, 2.4)]} />
        <meshStandardMaterial color="#9fd5ef" roughness={0.2} metalness={0.08} flatShading transparent opacity={0.7} />
      </mesh>
    </group>
  );
}
