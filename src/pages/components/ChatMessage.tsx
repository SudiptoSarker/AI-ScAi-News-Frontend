import React from "react";
import { Message } from "@/types/chat";
import { Box, CircularProgress } from "@mui/material";
import { blue } from "@mui/material/colors";
import PersonIcon from "@mui/icons-material/Person";
import Adb from "@mui/icons-material/Adb";
import MarkdownRenderer from "./MarkdownRenderer";

type Props = {
  messages: Message[];
  loading: boolean;
};

const ChatMessage: React.FC<Props> = ({ messages, loading }) => {
  if (messages === undefined) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {messages.map(
        (message, index) =>
          message.role !== "system" && (
            <Box key={index} sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                {message.role === "user" ? (
                  <PersonIcon style={{ marginRight: 10, marginTop: 2 }} />
                ) : (
                  <Adb style={{ marginRight: 10, marginTop: 2 }} />
                )}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: message.role === "user" ? "#f5f5f5" : "#e0e0e0",
                    color: "black",
                    borderRadius: 2,
                    boxShadow: 3,
                    maxWidth: "80%",
                  }}
                >
                  {message.role === "user" ? (
                    <div style={{ whiteSpace: "pre-wrap" }}>{message.content}</div>
                  ) : (
                    <MarkdownRenderer text={message.content} />
                  )}
                </Box>
              </Box>
            </Box>
          )
      )}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress size={50} style={{ color: blue[500] }} />
        </Box>
      )}
    </Box>
  );
};

export default ChatMessage;
