import { useMemo, useState, useEffect } from "react";
import { conversationActors, getConversationApiPath } from "./registry";
import type { ConversationActor, ConversationOption, ConversationStore, ConversationTree } from "./types";

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationStore>({});
  const [activeConversationActor, setActiveConversationActor] = useState<ConversationActor | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadConversations = async () => {
      const loadedEntries = await Promise.all(
        conversationActors.map(async (actor) => {
          const response = await fetch(getConversationApiPath(actor));
          const conversation = (await response.json()) as ConversationTree;
          return [actor, conversation] as const;
        }),
      );

      if (!cancelled) {
        setConversations(Object.fromEntries(loadedEntries) as ConversationStore);
      }
    };

    loadConversations().catch(() => {
      if (!cancelled) {
        setConversations({});
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const activeConversation = useMemo(
    () => (activeConversationActor ? conversations[activeConversationActor] ?? null : null),
    [activeConversationActor, conversations],
  );
  const activeNode = currentNodeId && activeConversation ? activeConversation.nodes[currentNodeId] : null;

  const startConversation = (actor: ConversationActor) => {
    const conversation = conversations[actor];

    if (!conversation) {
      return;
    }

    setActiveConversationActor(actor);
    setCurrentNodeId(conversation.start);
  };

  const closeConversation = () => {
    setActiveConversationActor(null);
    setCurrentNodeId(null);
  };

  const chooseOption = (option: ConversationOption) => {
    if (option.next) {
      setCurrentNodeId(option.next);
      return;
    }

    closeConversation();
  };

  return {
    conversations,
    activeConversationActor,
    activeConversation,
    activeNode,
    currentNodeId,
    startConversation,
    closeConversation,
    chooseOption,
    setCurrentNodeId,
  };
}
