export type WorldFlagId = string;

export type WorldFlagSnapshot = Record<WorldFlagId, true>;

export type WorldFlagEvent = {
  type: "initialize" | "set" | "clear" | "toggle" | "reset";
  flagId?: WorldFlagId;
  nextSnapshot: WorldFlagSnapshot;
};
