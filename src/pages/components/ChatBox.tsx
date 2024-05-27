import React, { useState, useEffect, useRef, useContext, useMemo, Dispatch, SetStateAction } from "react";
import { Conversation, Message } from "@/types/chat";
import { updateConversation } from "@/utils/app/Conversation";
import { createMessage, createSystemPrompt } from "@/pages/api/completions";
import ChatMessage from "./ChatMessage";
import { Box } from "@mui/material";
import { AIPersonalityContext } from "@/contexts/AIPersonalityContext";
import { ConversationIdContext } from "@/contexts/ConversationContext";
import { ConversationsContext } from "@/contexts/ConversationsContext";
import { FormContext } from "@/contexts/FormContext";
import { loadSelectedConversation } from "@/utils/app/Conversation";

type Props = {
  prompt: string;
  setPrompt: Dispatch<SetStateAction<string>>;
};

const ChatBox: React.FC<Props> = ({ prompt, setPrompt }) => {
  const aiPersonalityContext = useContext(AIPersonalityContext);
  if (!aiPersonalityContext) throw new Error("not AIPersonalityContext");
  const { aiPersonalityLoader, aiPersonality, setAiPersonality } = aiPersonalityContext;

  const conversationIdContext = useContext(ConversationIdContext);
  if (!conversationIdContext) throw new Error("not ConversationIdContext");
  const { selectedConversationId, setSelectedConversationId } = conversationIdContext;

  const conversationsContext = useContext(ConversationsContext);
  if (!conversationsContext) throw new Error("ConversationsContext not found.");
  const { conversations, setConversations } = conversationsContext;

  const formContext = useContext(FormContext);
  if (!formContext) throw new Error("FormContext not found.");
  const { isLoading, setIsLoading } = formContext;

  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null); // 選択しているスレッドの会話履歴を保持
  const messages = useMemo(() => {
    return currentConversation ? currentConversation.messages : [];
  }, [currentConversation]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchSelectedConversation = async () => {
      // 選択しているスレッドの会話履歴をセット
      const selectedConversation = loadSelectedConversation();
      if (selectedConversation && selectedConversation.id) {
        setCurrentConversation(selectedConversation);
      } else if (conversations.length > 0) {
        // スレッド履歴がある場合、一番最後に追加されたスレッドを選択スレッドにする
        setCurrentConversation(conversations[conversations.length - 1]);
        if (currentConversation) setSelectedConversationId(currentConversation.id);
      } else {
        // スレッド履歴がない場合、新規会話を作成する
        const newId = Date.now();
        const tmpConversation = { id: newId, title: "new-chat", messages: [] };
        setCurrentConversation(tmpConversation);
        const updatedConversations = [...conversations, tmpConversation];
        setConversations(updatedConversations);
        setSelectedConversationId(newId);
      }
    };
    fetchSelectedConversation();
  }, [selectedConversationId, conversations]); // 依存配列にセレクトされた会話?のidなどを設置し、会話が切り替わるたびにuseEffectを発火させる

  useEffect(() => {
    if (!prompt || !currentConversation) return;
    const promptMessage = createMessage("user", prompt);
    const requestMessages = [...messages, promptMessage];

    // AIパーソナリティのメッセージのプロフィールをSystemPromptに設定
    if (aiPersonality) requestMessages.unshift(createSystemPrompt(aiPersonality));

    // ユーザーのメッセージを会話に追加
    currentConversation.messages.push(promptMessage);
    setConversations(updateConversation(currentConversation, conversations).all);

    const fetchApi = async () => {
      setIsLoading(true);
      const response = await fetch("/api/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestMessages),
      });
      const result = await response.json();
      const responseMessage = createMessage("assistant", result.message);

      // responseを会話に追加
      currentConversation.messages.push(responseMessage);
      const res = updateConversation(currentConversation, conversations);
      setConversations(res.all);

      setIsLoading(false);
      setPrompt("");
    };

    fetchApi();
  }, [prompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, messages]);

  return (
    <Box>
      <Box sx={{ p: 1 }}>
        <ChatMessage messages={messages} loading={isLoading} />
      </Box>
      <div ref={messagesEndRef}></div>
    </Box>
  );
};

export default ChatBox;
