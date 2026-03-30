import type { GrassInstance, PlantProps } from "./types";
import { PLAY_AREA_RADIUS, plants, accentPlants } from "./worldData";

function createGrassInstances(source: PlantProps[], prefix: string) {
  return source.map((plant, index) => ({
    ...plant,
    id: `${prefix}-${index}`,
  }));
}

function createArenaGrass(): GrassInstance[] {
  const tufts: GrassInstance[] = [];
  const tuftCount = 2600;
  const maxRadius = PLAY_AREA_RADIUS - 10;

  const hash = (value: number) => {
    const x = Math.sin(value * 127.1) * 43758.5453123;
    return x - Math.floor(x);
  };

  for (let index = 0; index < tuftCount; index += 1) {
    const angle = hash(index + 1) * Math.PI * 2;
    const radius = Math.sqrt(hash(index + 101)) * maxRadius;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    if (Math.hypot(x, z) < 14) {
      continue;
    }

    const variant = index % 7;
    const patch = Math.sin(x * 0.045) + Math.cos(z * 0.04);

    tufts.push({
      id: `arena-${index}`,
      position: [x, 0, z],
      scale: 0.5 + hash(index + 203) * 0.45,
      lean: (hash(index + 307) - 0.5) * 0.28,
      tint: patch > 0.55 ? "#8cbc68" : patch < -0.45 ? "#74a654" : variant > 4 ? "#88ba64" : "#7fb15d",
    });
  }

  return tufts;
}

export const arenaGrassInstances = createArenaGrass();
export const plantInstances = createGrassInstances(plants, "plant");
export const accentPlantInstances = createGrassInstances(accentPlants, "accent");
