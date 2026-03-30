export type InventoryItemKind = "stackable" | "key";

export type InventoryItemId = "carrot";

export type InventoryItemDefinition = {
  id: InventoryItemId;
  name: string;
  kind: InventoryItemKind;
  description?: string;
  maxStack?: number;
};

export type InventorySnapshot = {
  stackables: Partial<Record<InventoryItemId, number>>;
  keys: Partial<Record<InventoryItemId, true>>;
};

export type InventoryEvent = {
  type: "initialize" | "add" | "remove" | "open" | "close" | "toggle" | "reset";
  itemId?: InventoryItemId;
  amount?: number;
  nextSnapshot: InventorySnapshot;
  isOpen: boolean;
  meta?: Record<string, string | number | boolean>;
};

export type InventoryActionResult = {
  added: boolean;
  removed?: boolean;
  quantity: number;
  hitCap: boolean;
  alreadyOwned: boolean;
};

export type InventoryDisplayEntry = {
  id: InventoryItemId;
  name: string;
  quantity: number;
  description?: string;
};
