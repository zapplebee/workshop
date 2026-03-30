import { useCallback, useMemo, useState } from "react";
import type { WorldFlagEvent, WorldFlagId, WorldFlagSnapshot } from "./types";

type UseWorldFlagsOptions = {
  initialSnapshot?: WorldFlagSnapshot;
  onChange?: (snapshot: WorldFlagSnapshot, event: WorldFlagEvent) => void;
};

function normalizeSnapshot(snapshot?: WorldFlagSnapshot): WorldFlagSnapshot {
  return { ...(snapshot ?? {}) };
}

export function useWorldFlags(options: UseWorldFlagsOptions = {}) {
  const { onChange } = options;
  const [snapshot, setSnapshot] = useState<WorldFlagSnapshot>(() => normalizeSnapshot(options.initialSnapshot));

  const emitChange = useCallback((nextSnapshot: WorldFlagSnapshot, event: Omit<WorldFlagEvent, "nextSnapshot">) => {
    onChange?.(nextSnapshot, {
      ...event,
      nextSnapshot,
    });
  }, [onChange]);

  const initialize = useCallback((nextSnapshot: WorldFlagSnapshot) => {
    const normalized = normalizeSnapshot(nextSnapshot);
    setSnapshot(normalized);
    emitChange(normalized, { type: "initialize" });
  }, [emitChange]);

  const reset = useCallback(() => {
    setSnapshot({});
    emitChange({}, { type: "reset" });
  }, [emitChange]);

  const hasFlag = useCallback((flagId: WorldFlagId) => Boolean(snapshot[flagId]), [snapshot]);

  const setFlag = useCallback((flagId: WorldFlagId) => {
    if (snapshot[flagId]) {
      return false;
    }

    const nextSnapshot: WorldFlagSnapshot = { ...snapshot, [flagId]: true };
    setSnapshot(nextSnapshot);
    emitChange(nextSnapshot, { type: "set", flagId });
    return true;
  }, [emitChange, snapshot]);

  const clearFlag = useCallback((flagId: WorldFlagId) => {
    if (!snapshot[flagId]) {
      return false;
    }

    const nextSnapshot = { ...snapshot };
    delete nextSnapshot[flagId];
    setSnapshot(nextSnapshot);
    emitChange(nextSnapshot, { type: "clear", flagId });
    return true;
  }, [emitChange, snapshot]);

  const toggleFlag = useCallback((flagId: WorldFlagId) => {
    if (snapshot[flagId]) {
      const nextSnapshot: WorldFlagSnapshot = { ...snapshot };
      delete nextSnapshot[flagId];
      setSnapshot(nextSnapshot);
      emitChange(nextSnapshot, { type: "toggle", flagId });
      return false;
    }

    const nextSnapshot: WorldFlagSnapshot = { ...snapshot, [flagId]: true };
    setSnapshot(nextSnapshot);
    emitChange(nextSnapshot, { type: "toggle", flagId });
    return true;
  }, [emitChange, snapshot]);

  const flags = useMemo(() => Object.keys(snapshot).sort(), [snapshot]);

  return {
    snapshot,
    flags,
    initialize,
    reset,
    hasFlag,
    setFlag,
    clearFlag,
    toggleFlag,
  };
}
