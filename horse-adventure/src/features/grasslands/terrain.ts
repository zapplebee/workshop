import { hills } from "./worldData";

export function getTerrainHeight(x: number, z: number) {
  let height = 0;

  for (const hill of hills) {
    const [centerX, centerY, centerZ] = hill.position;
    const [radiusX, radiusY, radiusZ] = hill.scale;
    const normalizedX = (x - centerX) / radiusX;
    const normalizedZ = (z - centerZ) / radiusZ;
    const distanceSquared = normalizedX * normalizedX + normalizedZ * normalizedZ;

    if (distanceSquared > 1) {
      continue;
    }

    const hillHeight = centerY + radiusY * Math.sqrt(1 - distanceSquared);
    height = Math.max(height, hillHeight);
  }

  return height;
}
