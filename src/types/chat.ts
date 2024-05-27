export interface Message {
  role: Role;
  content: string;
}

export type Role = "system" | "user" | "assistant";

export interface Conversation {
  id: number;
  title: string;
  messages: Message[];
}
