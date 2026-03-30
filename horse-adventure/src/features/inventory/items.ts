import type { InventoryItemDefinition, InventoryItemId } from "./types";

export const inventoryItems: Record<InventoryItemId, InventoryItemDefinition> = {
  carrot: {
    id: "carrot",
    name: "Carrot",
    kind: "stackable",
    description: "A crisp meadow carrot. Good for stockpiling.",
    maxStack: 99,
  },
};

export function getInventoryItem(itemId: InventoryItemId) {
  return inventoryItems[itemId];
}
