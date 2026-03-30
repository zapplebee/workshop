import type { HorseConfig } from "./worldData.types";
import type { PlantProps } from "./types";
import type { CloudProps } from "../../elements/fixtures/Cloud";
import type { HillProps } from "../../elements/fixtures/Hill";

export const plants: PlantProps[] = [
  { position: [-5.3, 0, 1.8], scale: 1, lean: -0.2, tint: "#85b668" },
  { position: [-3.6, 0, 0.7], scale: 0.82, lean: 0.12, tint: "#7ea95f" },
  { position: [-1.9, 0, 2.1], scale: 1.08, lean: -0.05, tint: "#8abb6b" },
  { position: [0.15, 0, 0.85], scale: 0.92, lean: 0.18, tint: "#7ca35c" },
  { position: [2.1, 0, 1.8], scale: 1.06, lean: -0.14, tint: "#90c071" },
  { position: [4.1, 0, 0.8], scale: 0.88, lean: 0.1, tint: "#7aa359" },
  { position: [5.9, 0, 2.3], scale: 0.98, lean: -0.12, tint: "#8bbc69" },
  { position: [-4.5, 0, -1.7], scale: 0.78, lean: 0.16, tint: "#7ea55f" },
  { position: [-2.1, 0, -2.2], scale: 0.88, lean: -0.08, tint: "#8bb96c" },
  { position: [1.3, 0, -1.8], scale: 0.84, lean: 0.06, tint: "#84b364" },
  { position: [3.8, 0, -2.4], scale: 1, lean: -0.14, tint: "#7ca65a" },
  { position: [6.1, 0, -1.4], scale: 0.8, lean: 0.12, tint: "#88b86a" },
];

export const accentPlants: PlantProps[] = [
  { position: [-4.2, 0, 2.8], scale: 0.45, lean: -0.08, tint: "#93c977" },
  { position: [-2.7, 0, 1.5], scale: 0.38, lean: 0.16, tint: "#86b95f" },
  { position: [-0.7, 0, 2.7], scale: 0.4, lean: -0.04, tint: "#9acd75" },
  { position: [0.9, 0, 1.6], scale: 0.42, lean: 0.08, tint: "#8abf66" },
  { position: [2.9, 0, 2.9], scale: 0.35, lean: -0.12, tint: "#90c270" },
  { position: [4.8, 0, 1.5], scale: 0.4, lean: 0.06, tint: "#7fab5c" },
  { position: [-3.4, 0, -1.1], scale: 0.36, lean: 0.1, tint: "#8ebf68" },
  { position: [1.9, 0, -2.8], scale: 0.38, lean: -0.08, tint: "#7ea95f" },
];

export const hills: HillProps[] = [
  { position: [-8.3, -0.2, -15], scale: [8.2, 2.6, 6.8], tint: "#8fb26f" },
  { position: [8.2, -0.28, -16], scale: [7.2, 2.3, 6.1], tint: "#85a95f" },
  { position: [0.5, -0.55, -22], scale: [15.5, 3.5, 10.6], tint: "#7f9f56" },
  { position: [0, -0.82, -9], scale: [11.2, 1.45, 4.6], tint: "#9cbc7b" },
];

export const clouds: CloudProps[] = [
  { position: [-8.2, 18, -8], scale: 4.5, drift: -0.28 },
  { position: [-1.8, 19.5, -9], scale: 3.8, drift: 0.08 },
  { position: [4.6, 18.6, -8], scale: 4.1, drift: 0.22 },
  { position: [9.2, 17.8, -7], scale: 4.2, drift: -0.16 },
  { position: [1.5, 20.4, -10], scale: 2.8, drift: 0.05 },
];

export const snakePosition: [number, number, number] = [-8.8, 0, -7.8];
export const mousePosition: [number, number, number] = [2.8, 0, -10.4];
export const rabbitPosition: [number, number, number] = [13.8, 0, -6.8];
export const robinPosition: [number, number, number] = [-22, 0, 18];
export const cardinalPosition: [number, number, number] = [24, 0, 16];
export const carrotPositions: Array<[number, number, number]> = [
  [-10.5, 0, 8.8],
  [-9.2, 0, 9.6],
  [-8.1, 0, 8.4],
  [13.2, 0, 10.8],
  [14.4, 0, 9.9],
  [15.1, 0, 11.4],
];

export const horses: HorseConfig[] = [
  { position: [1.2, 0.02, -2.8], scale: 0.92, rotationY: -0.18 },
];

export const PLAY_AREA_RADIUS = 200;
export const CANYON_WALL_THICKNESS = 24;
export const CANYON_WALL_HEIGHT = 36;
export const CANYON_SEGMENTS = 24;
export const HORSE_MOVE_SPEED = 8;
export const HORSE_TURN_SPEED = 2.4;
export const HORSE_BOUNDARY_PADDING = 8;
export const HORSE_GROUND_OFFSET = 0.02;
export const INTERACTION_RANGE = 4.5;
export const INTERACTION_CELL_SIZE = 12;
export const INTERACTION_CHECK_INTERVAL = 0.25;
