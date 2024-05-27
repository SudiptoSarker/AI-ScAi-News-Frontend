import { createContext, Dispatch, SetStateAction } from "react";
import { AIPersonality } from "@/types/ai-personality";
import AIPersonalityLoader from "@/utils/AIPersonalityLoader";

type AIPersonalityContextType = {
  aiPersonalityLoader: AIPersonalityLoader;
  aiPersonality: AIPersonality | null;
  setAiPersonality: Dispatch<SetStateAction<AIPersonality | null>>;
};

const defaultAIPersonalityContextContext: AIPersonalityContextType = {
  aiPersonalityLoader: new AIPersonalityLoader(),
  aiPersonality: null,
  setAiPersonality: () => {},
};

export const AIPersonalityContext = createContext<AIPersonalityContextType>(defaultAIPersonalityContextContext);
