import React, { useContext } from "react";
import { Drawer, List, Divider, Box } from "@mui/material";
import { ListItem, ListItemIcon, ListItemButton, ListItemText } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import { Message, Conversation } from "@/types/chat";
import { saveConversations, saveConversation, clearConversations } from "@/utils/app/Conversation";
import { ConversationIdContext } from "@/contexts/ConversationContext";
import { ConversationsContext } from "@/contexts/ConversationsContext";
import { FormContext } from "@/contexts/FormContext";

const drawerWidth = 240;

const testMessages: Message[] = [];

type Props = {
  prompt: string;
};

const SideBar: React.FC<Props> = ({ prompt }) => {
  const context = useContext(ConversationIdContext);
  if (!context) throw new Error("ConversationIdContext not found.");
  const { selectedConversationId, setSelectedConversationId } = context;

  const conversationsContext = useContext(ConversationsContext);
  if (!conversationsContext) throw new Error("ConversationsContext not found.");
  const { conversations: pastConversations, setConversations: setPastConversations } = conversationsContext;

  const formContext = useContext(FormContext);
  if (!formContext) throw new Error("FormContext not found.");
  const { isLoading } = formContext;

  const handleNewConversation = async () => {
    const newConversation: Conversation = {
      id: Date.now(),
      title: "new-chat",
      messages: testMessages,
    };
    // 新規会話スレッドを全体の会話スレッドに追加
    const updatedConversations = [...pastConversations, newConversation];
    saveConversation(newConversation);
    saveConversations(updatedConversations);

    // 最新の全ての会話履歴を取得
    const savedConversations = localStorage.getItem("conversationHistory");
    if (savedConversations) setPastConversations(JSON.parse(savedConversations));
    // 新規会話idを現在選択中の会話idにセット
    setSelectedConversationId(newConversation.id);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    // クリックされた会話スレッドタイトルのidと同じidを持つ会話スレッドを取得し、現在の選択された会話に設定
    const selectedConversation = pastConversations.find((c) => c.id === conversation.id);
    if (selectedConversation) {
      saveConversation(selectedConversation);
      setSelectedConversationId(selectedConversation.id);
    }
  };

  const handleClearConversations = () => {
    clearConversations();
    setPastConversations([]);
    setSelectedConversationId(null);
  };

  const menuItems = [{ name: "新規チャット", handler: handleNewConversation }];
  return (
    <Drawer
      sx={{
        display: "flex",
        flexDirection: "column",
        width: drawerWidth,
        "z-index": 1,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          paddingBottom: "140px",
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <List>
        {menuItems.map((item, index) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton onClick={item.handler} disabled={isLoading}>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ overflow: "auto", flexGrow: 1 }}>
        <List>
          {pastConversations.map((pastMessage, index) => (
            <ListItem key={pastMessage.id} disablePadding>
              <ListItemButton
                onClick={() => handleSelectConversation(pastMessage)}
                style={{ backgroundColor: pastMessage.id === selectedConversationId ? "lightgray" : "white" }}
                disabled={isLoading}
              >
                <ListItemIcon>
                  <ChatIcon />
                </ListItemIcon>
                <ListItemText primary={pastMessage.title} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Divider />
      {/* これ以降は設定を置く */}
      <List>
        {["全ての会話を削除"].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton onClick={handleClearConversations} disabled={isLoading}>
              <ListItemIcon>
                <DeleteIcon />
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default SideBar;
