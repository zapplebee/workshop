import type { ReactNode } from "react";
import { AntagonistHorse, type AntagonistHorseAction } from "./creatures/AntagonistHorse";
import { Cardinal, type CardinalAction } from "./creatures/Cardinal";
import { Donkey, type DonkeyAction } from "./creatures/Donkey";
import { Horse, type HorseAction } from "./creatures/Horse";
import { Mouse, type MouseAction } from "./creatures/Mouse";
import { Owl, type OwlAction } from "./creatures/Owl";
import { Robin, type RobinAction } from "./creatures/Robin";
import { Rabbit } from "./creatures/Rabbit";
import { Snake, type SnakeAction } from "./creatures/Snake";
import { CanyonRing } from "./fixtures/CanyonRing";
import { Cloud } from "./fixtures/Cloud";
import { GrassClump } from "./fixtures/GrassClump";
import { Hill } from "./fixtures/Hill";
import { Carrot } from "./items/Carrot";

export type ElementCategory = "creatures" | "fixtures" | "items";

export type CleanroomControlConfig<Action extends string = string> = {
  title: string;
  help: string;
  actions: readonly Action[];
  defaultAction: Action;
  wireframeLabel?: string;
};

export type CleanroomRenderContext<Action extends string = string> = {
  action?: Action;
  wireframe: boolean;
};

export type ElementManifestEntry<Action extends string = string> = {
  id: string;
  name: string;
  category: ElementCategory;
  controls?: CleanroomControlConfig<Action>;
  render: (context: CleanroomRenderContext<Action>) => ReactNode;
};

export const elementManifest = [
  {
    id: "antagonist-horse",
    name: "Antagonist Horse",
    category: "creatures",
    controls: {
      title: "Antagonist Horse Workshop",
      help: "Drag to orbit, scroll to zoom, right-drag to pan, arrow keys to switch scenes.",
      actions: ["stand", "walk", "eat", "jiggle_ears", "strut", "snort", "stomp"] as const,
      defaultAction: "stand",
      wireframeLabel: "Wireframe antagonist horse",
    },
    render: ({ action = "stand", wireframe }) => <AntagonistHorse action={action as AntagonistHorseAction} showSkeleton={wireframe} wireframe={wireframe} />,
  },
  {
    id: "cardinal",
    name: "Cardinal",
    category: "creatures",
    controls: {
      title: "Cardinal Workshop",
      help: "Drag to orbit, scroll to zoom, right-drag to pan, arrow keys to switch scenes.",
      actions: ["idle", "preen", "flutter", "fly"] as const,
      defaultAction: "idle",
      wireframeLabel: "Wireframe cardinal",
    },
    render: ({ action = "idle", wireframe }) => <Cardinal action={action as CardinalAction} showSkeleton={wireframe} wireframe={wireframe} />,
  },
  {
    id: "horse",
    name: "Horse",
    category: "creatures",
    controls: {
      title: "Horse Workshop",
      help: "Drag to orbit, scroll to zoom, right-drag to pan, arrow keys to switch scenes.",
      actions: ["stand", "walk", "eat", "jiggle_ears"] as const,
      defaultAction: "stand",
      wireframeLabel: "Wireframe horse",
    },
    render: ({ action = "stand", wireframe }) => <Horse action={action as HorseAction} showSkeleton={wireframe} wireframe={wireframe} />,
  },
  {
    id: "donkey",
    name: "Donkey",
    category: "creatures",
    controls: {
      title: "Donkey Workshop",
      help: "Drag to orbit, scroll to zoom, right-drag to pan, arrow keys to switch scenes.",
      actions: ["stand", "walk", "eat", "jiggle_ears", "blush"] as const,
      defaultAction: "stand",
      wireframeLabel: "Wireframe donkey",
    },
    render: ({ action = "stand", wireframe }) => <Donkey action={action as DonkeyAction} showSkeleton={wireframe} wireframe={wireframe} />,
  },
  {
    id: "mouse",
    name: "Field Mouse",
    category: "creatures",
    controls: {
      title: "Mouse Workshop",
      help: "Drag to orbit, scroll to zoom, right-drag to pan, arrow keys to switch scenes.",
      actions: ["idle", "jiggle_ears_and_whiskers", "fright", "scuddle"] as const,
      defaultAction: "idle",
      wireframeLabel: "Wireframe mouse",
    },
    render: ({ action = "idle", wireframe }) => <Mouse action={action as MouseAction} showSkeleton={wireframe} wireframe={wireframe} />,
  },
  {
    id: "snake",
    name: "Snake",
    category: "creatures",
    controls: {
      title: "Snake Workshop",
      help: "Drag to orbit, scroll to zoom, right-drag to pan, arrow keys to switch scenes.",
      actions: ["idle", "slither", "coil", "spring"] as const,
      defaultAction: "idle",
      wireframeLabel: "Wireframe snake",
    },
    render: ({ action = "idle", wireframe }) => <Snake action={action as SnakeAction} showSkeleton={wireframe} wireframe={wireframe} />,
  },
  {
    id: "rabbit",
    name: "Rabbit",
    category: "creatures",
    controls: {
      title: "Rabbit Preview",
      help: "Drag to orbit, scroll to zoom, right-drag to pan, arrow keys to switch scenes.",
      actions: ["still"] as const,
      defaultAction: "still",
      wireframeLabel: "Wireframe rabbit",
    },
    render: ({ wireframe }) => <Rabbit id="preview-rabbit" position={[0, 0, 0]} wireframe={wireframe} />,
  },
  {
    id: "owl",
    name: "Owl",
    category: "creatures",
    controls: {
      title: "Owl Workshop",
      help: "Drag to orbit, scroll to zoom, right-drag to pan, arrow keys to switch scenes.",
      actions: ["idle", "blink", "swivel", "flap"] as const,
      defaultAction: "idle",
      wireframeLabel: "Wireframe owl",
    },
    render: ({ action = "idle", wireframe }) => <Owl action={action as OwlAction} showSkeleton={wireframe} wireframe={wireframe} />,
  },
  {
    id: "robin",
    name: "Robin",
    category: "creatures",
    controls: {
      title: "Robin Workshop",
      help: "Drag to orbit, scroll to zoom, right-drag to pan, arrow keys to switch scenes.",
      actions: ["idle", "preen", "flutter", "fly"] as const,
      defaultAction: "idle",
      wireframeLabel: "Wireframe robin",
    },
    render: ({ action = "idle", wireframe }) => <Robin action={action as RobinAction} showSkeleton={wireframe} wireframe={wireframe} />,
  },
  {
    id: "cloud",
    name: "Cloud",
    category: "fixtures",
    render: () => <Cloud position={[0, 1.4, 0]} scale={2.3} drift={0.2} />,
  },
  {
    id: "hill",
    name: "Hill",
    category: "fixtures",
    render: () => <Hill position={[0, 0.2, 0]} scale={[3.2, 1.6, 2.4]} tint="#8fb26f" />,
  },
  {
    id: "grass-clump",
    name: "Grass Clump",
    category: "fixtures",
    render: () => <GrassClump position={[0, 0, 0]} scale={2.6} />,
  },
  {
    id: "canyon-ring",
    name: "Canyon Ring",
    category: "fixtures",
    render: () => <CanyonRing innerRadius={5} wallThickness={1.4} wallHeight={4.5} segments={20} />,
  },
  {
    id: "carrot",
    name: "Carrot",
    category: "items",
    controls: {
      title: "Carrot Preview",
      help: "Drag to orbit, scroll to zoom, right-drag to pan, arrow keys to switch scenes.",
      actions: ["still"] as const,
      defaultAction: "still",
      wireframeLabel: "Wireframe carrot",
    },
    render: ({ wireframe }) => <Carrot position={[0, 0, 0]} wireframe={wireframe} />,
  },
] satisfies ElementManifestEntry[];

export const elementManifestById = Object.fromEntries(elementManifest.map((entry) => [entry.id, entry])) as Record<string, ElementManifestEntry>;
