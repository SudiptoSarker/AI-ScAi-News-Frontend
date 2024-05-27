import { Conversation } from "@/types/chat";

// 既存会話への追加
export const updateConversation = (updatedConversation: Conversation, allConversations: Conversation[]) => {
  const updatedConversations = allConversations.map((c) => {
    if (c.id === updatedConversation.id) {
      return updatedConversation;
    }

    return c;
  });

  saveConversation(updatedConversation);
  saveConversations(updatedConversations);

  return {
    single: updatedConversation,
    all: updatedConversations,
  };
};

// LocalStrageに保存されたデータの削除
export const clearConversations = () => {
  const emptyConversation: Conversation = {
    id: 0,
    title: "",
    messages: [],
  };
  const emptyConversations: Conversation[] = [];

  saveConversation(emptyConversation);
  saveConversations(emptyConversations);
};

// localStorageから会話履歴を読み込む
export const loadConversations = () => {
  const storedConversationHistory = localStorage.getItem("conversationHistory");
  return storedConversationHistory ? JSON.parse(storedConversationHistory) : [];
};

export const loadSelectedConversation = () => {
  const storedSelectedConversation = localStorage.getItem("selectedConversation");
  return storedSelectedConversation ? JSON.parse(storedSelectedConversation) : [];
};

// localStorage.setItem(key, value) で、key に value を保存する
export const saveConversation = (conversation: Conversation) => {
  localStorage.setItem("selectedConversation", JSON.stringify(conversation));
};

export const saveConversations = (conversations: Conversation[]) => {
  localStorage.setItem("conversationHistory", JSON.stringify(conversations));
};
