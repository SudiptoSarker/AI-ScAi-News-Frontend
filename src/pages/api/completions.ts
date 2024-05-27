import type { NextApiRequest, NextApiResponse } from "next";
import { Message, Role } from "@/types/chat";
import { AIPersonality } from "@/types/ai-personality";

const apiBase = "https://labo-azure-openai-swedencentral.openai.azure.com/";
const apiEngine = "labo-azure-openai-gpt-4-turbo";
const apiVersion = "2023-05-15";
const apiEndpoint = `${apiBase}/openai/deployments/${apiEngine}/chat/completions?api-version=${apiVersion}`;

type ResponseData = {
  message?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const requestMessages: Message[] = req.body;

  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("AZURE_OPENAI_API_KEY is not defined");
  }

  const headers = {
    "Content-Type": "application/json",
    "api-key": apiKey,
  };

  const messages: Message[] = [{ role: "system", content: "日本語で回答してください" }];
  messages.push(...requestMessages);
  const body = JSON.stringify({ messages });

  const response = await fetch(apiEndpoint, {
    method: "POST",
    headers,
    body,
  });

  const result = await response.json();
  res.status(200).json({ message: result["choices"][0]["message"]["content"] });
}

export function createMessage(role: Role, content: string): Message {
  return {
    role: role,
    content: content,
  };
}

export function createSystemPrompt(aiPersonality: AIPersonality): Message {
  const name = aiPersonality.aiProfile.name;
  const description = aiPersonality.aiProfile.description;
  const instructions = aiPersonality.aiProfile.instructions;
  const conversationStarters = aiPersonality.aiProfile.conversationStarters.join("、");
  const systemPrompt = `次のプロフィールに従って回答してください。あなたの名前は${name}です。あなたの人物像は「${description}」です。あなたの役割は「${instructions}」です。あなたは「${conversationStarters}」等の会話に答えます。`;
  return createMessage("system", systemPrompt);
}
