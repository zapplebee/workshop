import { useEffect, useMemo, useState } from "react";
import { Color, Float32BufferAttribute, PlaneGeometry } from "three";
import { CANYON_WALL_HEIGHT } from "./worldData";

const terrainHeightmapUrl = "/uploads/download.png";

const TERRAIN_WORLD_SIZE = 440;
const TERRAIN_SEGMENTS = 220;
const terrainLowColor = new Color("#7fb15d");
const terrainMidColor = new Color("#9fbb73");
const terrainClayColor = new Color("#bf7a3d");
const terrainClayDarkColor = new Color("#9f5f30");
const terrainPeakColor = new Color("#d6b48a");

function smoothstep(min: number, max: number, value: number) {
  const t = clamp((value - min) / (max - min), 0, 1);
  return t * t * (3 - 2 * t);
}

function getTerrainColor(height: number) {
  const normalized = clamp(height / CANYON_WALL_HEIGHT, 0, 1);
  const color = terrainLowColor.clone().lerp(terrainMidColor, smoothstep(0.08, 0.42, normalized));

  const clayBandA = smoothstep(0.46, 0.56, normalized) - smoothstep(0.58, 0.68, normalized);
  const clayBandB = smoothstep(0.62, 0.72, normalized) - smoothstep(0.74, 0.84, normalized);
  const clayMix = clamp(clayBandA * 0.8 + clayBandB, 0, 1);

  if (clayMix > 0) {
    color.lerp(terrainClayColor, clayMix * 0.75);
    color.lerp(terrainClayDarkColor, clayMix * 0.22);
  }

  const peakMix = smoothstep(0.78, 1, normalized);
  color.lerp(terrainPeakColor, peakMix * 0.9);

  return color;
}

export type TerrainSampler = {
  sampleHeight: (x: number, z: number) => number;
  imageWidth: number;
  imageHeight: number;
  imageData: Uint8ClampedArray;
};

export type TerrainFootprintSample = {
  center: number;
  frontLeft: number;
  frontRight: number;
  rearLeft: number;
  rearRight: number;
  frontAverage: number;
  rearAverage: number;
  sideAverage: number;
  supportHeight: number;
};

const flatSampler: TerrainSampler = {
  sampleHeight: () => 0,
  imageWidth: 1,
  imageHeight: 1,
  imageData: new Uint8ClampedArray([255, 255, 255, 255]),
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getHeightFromImage(imageData: Uint8ClampedArray, imageWidth: number, imageHeight: number, u: number, v: number) {
  const x = clamp(u * (imageWidth - 1), 0, imageWidth - 1);
  const y = clamp(v * (imageHeight - 1), 0, imageHeight - 1);
  const x0 = Math.floor(x);
  const x1 = Math.min(imageWidth - 1, x0 + 1);
  const y0 = Math.floor(y);
  const y1 = Math.min(imageHeight - 1, y0 + 1);
  const tx = x - x0;
  const ty = y - y0;

  const sample = (sx: number, sy: number) => {
    const index = (sy * imageWidth + sx) * 4;
    return imageData[index] ?? 255;
  };

  const top = sample(x0, y0) * (1 - tx) + sample(x1, y0) * tx;
  const bottom = sample(x0, y1) * (1 - tx) + sample(x1, y1) * tx;
  const grayscale = (top * (1 - ty) + bottom * ty) / 255;

  return (1 - grayscale) * CANYON_WALL_HEIGHT;
}

function createTerrainSampler(imageData: Uint8ClampedArray, imageWidth: number, imageHeight: number): TerrainSampler {
  return {
    imageWidth,
    imageHeight,
    imageData,
    sampleHeight: (x: number, z: number) => {
      const u = x / TERRAIN_WORLD_SIZE + 0.5;
      const v = z / TERRAIN_WORLD_SIZE + 0.5;
      return getHeightFromImage(imageData, imageWidth, imageHeight, clamp(u, 0, 1), clamp(v, 0, 1));
    },
  };
}

export function sampleTerrainFootprint(
  sampleHeight: (x: number, z: number) => number,
  x: number,
  z: number,
  heading: number,
  frontDistance: number,
  rearDistance: number,
  halfWidth: number,
): TerrainFootprintSample {
  const forwardX = Math.cos(heading);
  const forwardZ = -Math.sin(heading);
  const rightX = -forwardZ;
  const rightZ = forwardX;

  const sampleAt = (forwardDistance: number, sideDistance: number) => {
    return sampleHeight(
      x + forwardX * forwardDistance + rightX * sideDistance,
      z + forwardZ * forwardDistance + rightZ * sideDistance,
    );
  };

  const center = sampleAt(0, 0);
  const frontLeft = sampleAt(frontDistance, -halfWidth);
  const frontRight = sampleAt(frontDistance, halfWidth);
  const rearLeft = sampleAt(-rearDistance, -halfWidth);
  const rearRight = sampleAt(-rearDistance, halfWidth);
  const frontAverage = (frontLeft + frontRight) * 0.5;
  const rearAverage = (rearLeft + rearRight) * 0.5;
  const sideAverage = (frontLeft + frontRight + rearLeft + rearRight) * 0.25;
  const supportHeight = Math.max(center, rearAverage, frontAverage - 0.06, sideAverage - 0.04);

  return {
    center,
    frontLeft,
    frontRight,
    rearLeft,
    rearRight,
    frontAverage,
    rearAverage,
    sideAverage,
    supportHeight,
  };
}

export function useTerrainSampler() {
  const [sampler, setSampler] = useState<TerrainSampler>(flatSampler);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();

    image.onload = () => {
      if (cancelled) {
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      context.drawImage(image, 0, 0);
      const nextImageData = context.getImageData(0, 0, image.width, image.height);
      setSampler(createTerrainSampler(nextImageData.data, image.width, image.height));
    };

    image.src = terrainHeightmapUrl;

    return () => {
      cancelled = true;
    };
  }, []);

  return sampler;
}

export function useTerrainGeometry(sampler: TerrainSampler) {
  return useMemo(() => {
    const geometry = new PlaneGeometry(TERRAIN_WORLD_SIZE, TERRAIN_WORLD_SIZE, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS);
    const position = geometry.attributes.position!;
    const colors = new Float32Array(position.count * 3);

    for (let index = 0; index < position.count; index += 1) {
      const x = position.getX(index);
      const worldZ = -position.getY(index);
      const height = sampler.sampleHeight(x, worldZ);
      position.setZ(index, height);
      const color = getTerrainColor(height);
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
    }

    position.needsUpdate = true;
    geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    return geometry;
  }, [sampler]);
}
