import { createContext, Dispatch, SetStateAction } from "react";
import { Conversation } from "@/types/chat";

type ConversationIdContextType = {
  selectedConversationId: Conversation["id"] | null;
  setSelectedConversationId: Dispatch<SetStateAction<Conversation["id"] | null>>;
};

const defaultConversationIdContext: ConversationIdContextType = {
  selectedConversationId: null,
  setSelectedConversationId: () => {},
};

export const ConversationIdContext = createContext<ConversationIdContextType>(defaultConversationIdContext);
