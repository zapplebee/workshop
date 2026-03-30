import type { InventoryItemDefinition, InventoryItemId } from "./types";

export const inventoryItems: Record<InventoryItemId, InventoryItemDefinition> = {
  carrot: {
    id: "carrot",
    name: "Carrot",
    kind: "stackable",
    description: "A crisp meadow carrot. Good for stockpiling.",
    maxStack: 99,
  },
  flowers: {
    id: "flowers",
    name: "Flowers",
    kind: "key",
    description: "A hand-tied bunch of meadow flowers. Fresh, uneven, and arranged by someone trying harder than they want to admit.",
  },
  "mysterious-letter": {
    id: "mysterious-letter",
    name: "Mysterious Letter",
    kind: "key",
    description: "A folded letter with no sender's name. The paper is worn soft at the edges, as if it has already changed hands more than once.",
  },
  "cowboy-hat": {
    id: "cowboy-hat",
    name: "Cowboy Hat",
    kind: "key",
    description: "A weathered cowboy hat with a dramatic crease and a sweatband that suggests a previous owner with very strong opinions.",
  },
};

export function getInventoryItem(itemId: InventoryItemId) {
  return inventoryItems[itemId];
}
