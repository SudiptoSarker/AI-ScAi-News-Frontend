import React, { useState, useContext } from "react";
import { Box, TextField, IconButton, Paper } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SettingsIcon from "@mui/icons-material/Settings";
import { FormContext } from "@/contexts/FormContext";

type Props = {
  onSubmit: (text: string) => void;
  onSubmitSettings: (() => void) | null;
};

const ChatForm: React.FC<Props> = ({ onSubmit, onSubmitSettings }) => {
  const formContext = useContext(FormContext);
  if (!formContext) throw new Error("FormContext not found.");
  const { isLoading } = formContext;

  const [value, setValue] = useState("");
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isTyping && !isLoading) {
      e.preventDefault();
      if (value.trim()) {
        onSubmit(value);
        setValue("");
      }
    }
  };

  return (
    <Box sx={{ p: 1, bgcolor: "background.paper" }}>
      <Paper component="form" onSubmit={(e) => e.preventDefault()} sx={{ display: "flex", alignItems: "center", p: 1 }}>
        <TextField
          fullWidth
          multiline
          minRows={4}
          maxRows={4}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsTyping(true)}
          onCompositionEnd={() => setIsTyping(false)}
          placeholder="Send a message"
          variant="outlined"
          sx={{ mr: 1 }}
        />
        <IconButton
          type="submit"
          color="primary"
          disabled={!value.trim() || isLoading}
          onClick={() => {
            if (value.trim()) {
              onSubmit(value);
              setValue("");
            }
          }}
        >
          <SendIcon />
        </IconButton>
        {onSubmitSettings && (
          <IconButton
            type="submit"
            onClick={() => {
              onSubmitSettings();
            }}
          >
            <SettingsIcon />
          </IconButton>
        )}
      </Paper>
    </Box>
  );
};

export default ChatForm;
