import type { ConversationActor } from "./types";

export const conversationActors = ["mouse", "rabbit", "snake", "robin", "cardinal", "donkey", "antagonist-horse", "owl"] as const satisfies readonly ConversationActor[];

export function getConversationApiPath(actor: ConversationActor) {
  return `/api/conversations/${actor}`;
}
