import { createContext, Dispatch, SetStateAction } from "react";
import { Conversation } from "@/types/chat";

type ConversationsContextType = {
  conversations: Conversation[];
  setConversations: Dispatch<SetStateAction<Conversation[]>>;
};

const defaultConversationsContext: ConversationsContextType = {
  conversations: [],
  setConversations: () => {},
};

export const ConversationsContext = createContext<ConversationsContextType>(defaultConversationsContext);
