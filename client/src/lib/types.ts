export interface AIModel {
  name: string;
  description: string;
  strength: string;
  focus: string;
  color: string;
}

export const AI_MODELS = {
  openai: {
    name: "GPT-4o",
    description: "OpenAI's advanced language model",
    strength: "Focuses on cultural immersion",
    focus: "Local Experiences",
    color: "blue"
  },
  anthropic: {
    name: "Claude 3.7 Sonnet",
    description: "Anthropic's most capable AI assistant",
    strength: "Efficient landmark coverage",
    focus: "Iconic Experiences",
    color: "teal"
  }
};
