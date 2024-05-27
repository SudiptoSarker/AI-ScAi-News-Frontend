import { Message } from "@/types/chat";

export interface AIPersonality {
  aiProfile: AIProfile;
  messages: Message[];
}

export interface AIProfile {
  name: string;
  description: string;
  instructions: string;
  conversationStarters: string[];
}
