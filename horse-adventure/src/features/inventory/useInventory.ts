import { useCallback, useMemo, useState } from "react";
import { getInventoryItem, inventoryItems } from "./items";
import type { InventoryActionResult, InventoryDisplayEntry, InventoryEvent, InventoryItemId, InventorySnapshot } from "./types";

type UseInventoryOptions = {
  initialSnapshot?: InventorySnapshot;
  onChange?: (snapshot: InventorySnapshot, event: InventoryEvent) => void;
  onOpenChange?: (isOpen: boolean) => void;
};

const emptySnapshot: InventorySnapshot = {
  stackables: {},
  keys: {},
};

function normalizeSnapshot(snapshot?: InventorySnapshot): InventorySnapshot {
  return {
    stackables: { ...(snapshot?.stackables ?? {}) },
    keys: { ...(snapshot?.keys ?? {}) },
  };
}

export function useInventory(options: UseInventoryOptions = {}) {
  const { onChange, onOpenChange } = options;
  const [snapshot, setSnapshot] = useState<InventorySnapshot>(() => normalizeSnapshot(options.initialSnapshot));
  const [isOpen, setIsOpen] = useState(false);

  const emitChange = useCallback((nextSnapshot: InventorySnapshot, event: Omit<InventoryEvent, "nextSnapshot" | "isOpen">, nextIsOpen = isOpen) => {
    onChange?.(nextSnapshot, {
      ...event,
      nextSnapshot,
      isOpen: nextIsOpen,
    });
  }, [isOpen, onChange]);

  const setOpenState = useCallback((nextIsOpen: boolean, type: "open" | "close" | "toggle") => {
    setIsOpen(nextIsOpen);
    onOpenChange?.(nextIsOpen);
    emitChange(snapshot, { type }, nextIsOpen);
  }, [emitChange, onOpenChange, snapshot]);

  const initialize = useCallback((nextSnapshot: InventorySnapshot) => {
    const normalized = normalizeSnapshot(nextSnapshot);
    setSnapshot(normalized);
    emitChange(normalized, { type: "initialize" });
  }, [emitChange]);

  const reset = useCallback(() => {
    setSnapshot(emptySnapshot);
    emitChange(emptySnapshot, { type: "reset" });
  }, [emitChange]);

  const open = useCallback(() => {
    setOpenState(true, "open");
  }, [setOpenState]);

  const close = useCallback(() => {
    setOpenState(false, "close");
  }, [setOpenState]);

  const toggle = useCallback(() => {
    setOpenState(!isOpen, "toggle");
  }, [isOpen, setOpenState]);

  const getQuantity = useCallback((itemId: InventoryItemId) => {
    const definition = getInventoryItem(itemId);
    return definition.kind === "stackable" ? snapshot.stackables[itemId] ?? 0 : snapshot.keys[itemId] ? 1 : 0;
  }, [snapshot.keys, snapshot.stackables]);

  const hasItem = useCallback((itemId: InventoryItemId) => getQuantity(itemId) > 0, [getQuantity]);

  const canAddItem = useCallback((itemId: InventoryItemId, amount = 1) => {
    const definition = getInventoryItem(itemId);

    if (definition.kind === "key") {
      return !snapshot.keys[itemId];
    }

    const currentQuantity = snapshot.stackables[itemId] ?? 0;
    const maxStack = definition.maxStack ?? 99;
    return currentQuantity + amount <= maxStack;
  }, [snapshot.keys, snapshot.stackables]);

  const addItem = useCallback((itemId: InventoryItemId, amount = 1): InventoryActionResult => {
    const definition = getInventoryItem(itemId);

    if (definition.kind === "key") {
      if (snapshot.keys[itemId]) {
        return { added: false, quantity: 1, hitCap: true, alreadyOwned: true };
      }

      const nextSnapshot: InventorySnapshot = {
        stackables: { ...snapshot.stackables },
        keys: { ...snapshot.keys, [itemId]: true },
      };
      setSnapshot(nextSnapshot);
      emitChange(nextSnapshot, { type: "add", itemId, amount });
      return { added: true, quantity: 1, hitCap: false, alreadyOwned: false };
    }

    const currentQuantity = snapshot.stackables[itemId] ?? 0;
    const maxStack = definition.maxStack ?? 99;
    const nextQuantity = Math.min(maxStack, currentQuantity + amount);

    if (nextQuantity === currentQuantity) {
      return { added: false, quantity: currentQuantity, hitCap: true, alreadyOwned: false };
    }

    const nextSnapshot: InventorySnapshot = {
      stackables: { ...snapshot.stackables, [itemId]: nextQuantity },
      keys: { ...snapshot.keys },
    };
    setSnapshot(nextSnapshot);
    emitChange(nextSnapshot, { type: "add", itemId, amount });
    return { added: true, quantity: nextQuantity, hitCap: nextQuantity >= maxStack, alreadyOwned: false };
  }, [emitChange, snapshot.keys, snapshot.stackables]);

  const removeItem = useCallback((itemId: InventoryItemId, amount = 1): InventoryActionResult => {
    const definition = getInventoryItem(itemId);

    if (definition.kind === "key") {
      if (!snapshot.keys[itemId]) {
        return { added: false, removed: false, quantity: 0, hitCap: false, alreadyOwned: false };
      }

      const nextKeys = { ...snapshot.keys };
      delete nextKeys[itemId];
      const nextSnapshot: InventorySnapshot = {
        stackables: { ...snapshot.stackables },
        keys: nextKeys,
      };
      setSnapshot(nextSnapshot);
      emitChange(nextSnapshot, { type: "remove", itemId, amount });
      return { added: false, removed: true, quantity: 0, hitCap: false, alreadyOwned: false };
    }

    const currentQuantity = snapshot.stackables[itemId] ?? 0;

    if (currentQuantity === 0) {
      return { added: false, removed: false, quantity: 0, hitCap: false, alreadyOwned: false };
    }

    const nextQuantity = Math.max(0, currentQuantity - amount);
    const nextStackables = { ...snapshot.stackables };

    if (nextQuantity === 0) {
      delete nextStackables[itemId];
    } else {
      nextStackables[itemId] = nextQuantity;
    }

    const nextSnapshot: InventorySnapshot = {
      stackables: nextStackables,
      keys: { ...snapshot.keys },
    };
    setSnapshot(nextSnapshot);
    emitChange(nextSnapshot, { type: "remove", itemId, amount });
    return { added: false, removed: true, quantity: nextQuantity, hitCap: false, alreadyOwned: false };
  }, [emitChange, snapshot.keys, snapshot.stackables]);

  const stackableEntries = useMemo<InventoryDisplayEntry[]>(() => {
    return Object.values(inventoryItems)
      .filter((item) => item.kind === "stackable")
      .map((item) => ({
        id: item.id,
        name: item.name,
        quantity: snapshot.stackables[item.id] ?? 0,
        description: item.description,
      }))
      .filter((item) => item.quantity > 0);
  }, [snapshot.stackables]);

  const keyEntries = useMemo<InventoryDisplayEntry[]>(() => {
    return Object.values(inventoryItems)
      .filter((item) => item.kind === "key" && Boolean(snapshot.keys[item.id]))
      .map((item) => ({
        id: item.id,
        name: item.name,
        quantity: 1,
        description: item.description,
      }));
  }, [snapshot.keys]);

  return {
    snapshot,
    isOpen,
    initialize,
    reset,
    open,
    close,
    toggle,
    getQuantity,
    hasItem,
    canAddItem,
    addItem,
    removeItem,
    stackableEntries,
    keyEntries,
  };
}
