import { Conversation } from "./chat";

export interface LocalStorage {
  conversationHistory: Conversation[];
  selectedConversation: Conversation;
}
