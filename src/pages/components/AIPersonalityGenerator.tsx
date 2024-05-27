import React, { useState, useContext } from "react";
import {
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Grid,
  CircularProgress,
  Box,
  Button,
} from "@mui/material";
import { blue, green, grey } from "@mui/material/colors";
import { AIPersonalityContext } from "@/contexts/AIPersonalityContext";
import { Message } from "@/types/chat";
import { createMessage } from "@/api/completions";
import ChatForm from "./ChatForm";
import ChatMessage from "./ChatMessage";

const AIPersonalityGenerator: React.FC<{}> = () => {
  const aiPersonalityContext = useContext(AIPersonalityContext);
  if (!aiPersonalityContext) throw new Error("not AIPersonalityContext");
  const { aiPersonalityLoader, aiPersonality, setAiPersonality } = aiPersonalityContext;

  const [chatLoading, setChatLoading] = useState(false);

  const handleResetClick = () => {
    aiPersonalityLoader.reset().then((aiPersonalityStr) => {
      setAiPersonality(JSON.parse(aiPersonalityStr));
    });
  };

  const handleChatSubmit = (prompt: string) => {
    const promptMessage = createMessage("user", prompt);
    const requestMessages: Message[] = [];

    const fetchApi = async () => {
      if (!aiPersonality) {
        return;
      }

      setChatLoading(true);
      const response = await fetch("/api/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestMessages),
      });
      const result = await response.json();

      // プロファイルを抽出する
      // プロファイルが抽出できない場合、Json構造を探し、プロファイルの抽出を試みる
      let aiProfile = parseAIProfile(result.message);
      if (!aiProfile) {
        const jsonString = extractJson(result.message);
        if (jsonString) {
          aiProfile = parseAIProfile(jsonString);
        }
      }

      // プロファイルを抽出できたら、プロファイルを更新する
      // プロファイルを抽出できなかったら、チャットを継続する
      let responseMessage = null;
      if (aiProfile) {
        aiPersonality.aiProfile = aiProfile;
        aiPersonalityLoader.save(JSON.stringify(aiPersonality));
        responseMessage = createMessage("assistant", "ありがとうございます。プロフィールを更新しました。");
      } else {
        responseMessage = createMessage("assistant", result.message);
      }
      aiPersonality.messages.push(responseMessage);
      setAiPersonality({ ...aiPersonality });
      setChatLoading(false);
    };

    if (aiPersonality) {
      if (aiPersonality.messages.length > 0) {
        requestMessages.push(...aiPersonality.messages);
      }
      requestMessages.push(promptMessage);
      aiPersonality.messages.push(promptMessage);
      fetchApi();
    }
  };

  const extractJson = (message: string) => {
    let regex = /```(?:json)?\n([\s\S]*?)\n```/;
    let match = message.match(regex);
    if (!match) {
      // コードブロックがみつからない場合、Json構造を探す
      regex = /\{(?:[^{}]|(?:\{(?:[^{}]|{\})*\}))*\}/;
      match = message.match(regex);
      return match ? match[0] : null;
    }
    return match[1];
  };

  const parseAIProfile = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      return parsed.aiProfile;
    } catch (error) {
      return null;
    }
  };

  if (!aiPersonality) {
    return (
      !aiPersonality && (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      )
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Card sx={{ my: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" sx={{ color: green[700], mb: 2 }}>
              ScAIのプロフィール
            </Typography>
            <Typography variant="h6" sx={{ color: grey[800], mt: 2, mb: 1 }}>
              Name
            </Typography>
            <Typography sx={{ mb: 2, ml: 2 }}>{aiPersonality.aiProfile.name}</Typography>
            <Typography variant="h6" sx={{ color: grey[800], mt: 2, mb: 1 }}>
              Description
            </Typography>
            <Typography sx={{ mb: 2, ml: 2 }}>{aiPersonality.aiProfile.description}</Typography>
            <Typography variant="h6" sx={{ color: grey[800], mt: 2, mb: 1 }}>
              Instructions
            </Typography>
            <Typography sx={{ mb: 2, ml: 2 }}>{aiPersonality.aiProfile.instructions}</Typography>
            <Typography variant="h6" sx={{ color: grey[800], mt: 2, mb: 1 }}>
              Conversation Starters
            </Typography>
            <List sx={{ padding: 0 }}>
              {aiPersonality.aiProfile.conversationStarters.map((starter, index) => (
                <Paper key={index} variant="outlined" square sx={{ my: 0.5 }}>
                  <ListItem sx={{ py: 1 }}>
                    <ListItemText primary={starter} />
                  </ListItem>
                </Paper>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card sx={{ my: 2, boxShadow: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h5" sx={{ color: blue[700], mb: 2 }}>
                ScAIプロフィールをカスタマイズできます
              </Typography>
              <Button variant="contained" onClick={handleResetClick} sx={{ mt: -2.0 }}>
                リセット
              </Button>
            </Box>
            <ChatMessage messages={aiPersonality.messages} loading={chatLoading} />
          </CardContent>
        </Card>
        <ChatForm onSubmit={handleChatSubmit} onSubmitSettings={null} />
      </Grid>
    </Grid>
  );
};

export default AIPersonalityGenerator;
