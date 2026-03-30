import { useEffect, useMemo, useState } from "react";
import { PlaneGeometry } from "three";
import heightmapUrl from "../../assets/terrain/box-canyon-heightmap.svg";
import { CANYON_WALL_HEIGHT } from "./worldData";

const TERRAIN_WORLD_SIZE = 440;
const TERRAIN_SEGMENTS = 220;

export type TerrainSampler = {
  sampleHeight: (x: number, z: number) => number;
  imageWidth: number;
  imageHeight: number;
  imageData: Uint8ClampedArray;
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

    image.src = heightmapUrl;

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

    for (let index = 0; index < position.count; index += 1) {
      const x = position.getX(index);
      const z = position.getY(index);
      const height = sampler.sampleHeight(x, z);
      position.setZ(index, height);
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  }, [sampler]);
}
