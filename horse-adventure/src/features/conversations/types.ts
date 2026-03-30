import type { InventoryItemId } from "../inventory/types";
import type { WorldFlagId } from "../world-flags/types";

export type ConversationActor = "rabbit" | "snake" | "mouse" | "robin" | "cardinal";

export type ConversationInventoryAmount = {
  itemId: InventoryItemId;
  amount: number;
};

export type ConversationOption = {
  label: string;
  next?: string;
  end?: string;
  requiresItems?: ConversationInventoryAmount[];
  removeItems?: ConversationInventoryAmount[];
  requiresFlags?: WorldFlagId[];
  setFlags?: WorldFlagId[];
};

export type ConversationNode = {
  text: string;
  animation?: string;
  options?: ConversationOption[];
};

export type ConversationTree = {
  actor: ConversationActor;
  name: string;
  start: string;
  nodes: Record<string, ConversationNode>;
};

export type ConversationStore = Partial<Record<ConversationActor, ConversationTree>>;
