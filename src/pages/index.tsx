import React, { useState, useEffect } from "react";
import { Box, Dialog } from "@mui/material";
import Header from "@/com/Header";
import ChatBox from "@/com/ChatBox";
import ChatForm from "@/com/ChatForm";
import SideBar from "@/com/SideBar";
import AIPersonalityGenerator from "@/com/AIPersonalityGenerator";
import AIPersonalityLoader from "@/utils/AIPersonalityLoader";
import { ConversationIdContext } from "@/contexts/ConversationContext";
import { ConversationsContext } from "@/contexts/ConversationsContext";
import { AIPersonalityContext } from "@/contexts/AIPersonalityContext";
import { FormContext } from "@/contexts/FormContext";
import { Conversation } from "@/types/chat";
import { AIPersonality } from "@/types/ai-personality";
import { loadConversations, loadSelectedConversation } from "@/utils/app/Conversation";

const aiPersonalityLoader = new AIPersonalityLoader();

export default function Home() {
  const [aiPersonality, setAiPersonality] = useState<AIPersonality | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<Conversation["id"] | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [showAISettings, setShowAISettings] = useState(false);

  useEffect(() => {
    // 会話履歴を読み込む
    setConversations(loadConversations());
    setSelectedConversationId(loadSelectedConversation().id);

    // AIパーソナリティを読み込む
    aiPersonalityLoader.load().then((aiPersonalityStr) => {
      setAiPersonality(JSON.parse(aiPersonalityStr));
    });
  }, []);

  const handleFormSubmit = (prompt: string) => {
    setPrompt(prompt);
  };

  const handleShowAISettings = () => {
    setShowAISettings(true);
  };

  const handleCloseAISettings = () => {
    setShowAISettings(false);
  };

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <AIPersonalityContext.Provider value={{ aiPersonalityLoader, aiPersonality, setAiPersonality }}>
          <ConversationIdContext.Provider value={{ selectedConversationId, setSelectedConversationId }}>
            <ConversationsContext.Provider value={{ conversations, setConversations }}>
              <FormContext.Provider value={{ isLoading, setIsLoading }}>
                <SideBar prompt={prompt} />
                <Box
                  component="main"
                  sx={{
                    flexGrow: 1,
                    bgcolor: "background.default",
                    p: 3,
                    "z-index": 1,
                  }}
                >
                  <Header title="ScAIChat" />
                  <Box
                    sx={{
                      maxHeight: "calc(100vh - 150px)",
                      overflowY: "auto",
                      paddingBottom: "60px",
                    }}
                  >
                    <ChatBox prompt={prompt} setPrompt={setPrompt} />
                  </Box>
                  <Box
                    sx={{
                      height: "150px",
                      position: "fixed",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      "z-index": 1000,
                    }}
                  >
                    <ChatForm onSubmit={handleFormSubmit} onSubmitSettings={handleShowAISettings} />
                  </Box>
                  <Dialog
                    open={showAISettings}
                    onClose={handleCloseAISettings}
                    PaperProps={{
                      style: { maxWidth: "none", width: "80%" },
                    }}
                  >
                    <AIPersonalityGenerator />
                  </Dialog>
                </Box>
              </FormContext.Provider>
            </ConversationsContext.Provider>
          </ConversationIdContext.Provider>
        </AIPersonalityContext.Provider>
      </Box>
    </>
  );
}
