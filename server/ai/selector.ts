import { type FormInput, type ItineraryResult } from "@shared/schema";
import { generateOpenAIItinerary } from "./openai";
import { generateAnthropicItinerary } from "./anthropic";
import { generateGeminiItinerary } from "./gemini";
import { generateGrokItinerary } from "./grok";

type ItineraryGenerator = (formInput: FormInput) => Promise<ItineraryResult>;

const MODEL_GENERATORS: Record<string, ItineraryGenerator> = {
  "OpenAI": generateOpenAIItinerary,
  "Anthropic": generateAnthropicItinerary,
  "Gemini": generateGeminiItinerary,
  "Grok": generateGrokItinerary
};

const AI_MODELS = ["OpenAI", "Anthropic", "Gemini", "Grok"];

function selectRandomModels(): [string, string] {
  const availableModels = [...AI_MODELS];
  const firstIndex = Math.floor(Math.random() * availableModels.length);
  const firstModel = availableModels[firstIndex];
  availableModels.splice(firstIndex, 1);
  const secondIndex = Math.floor(Math.random() * availableModels.length);
  const secondModel = availableModels[secondIndex];
  return [firstModel, secondModel];
}

async function tryGenerateItinerary(
  model: string,
  formInput: FormInput,
  failedModels: Set<string>
): Promise<ItineraryResult | null> {
  try {
    console.log(`Attempting to generate itinerary with ${model}...`);
    if (!MODEL_GENERATORS[model]) {
      throw new Error(`Unknown model: ${model}`);
    }
    const result = await MODEL_GENERATORS[model](formInput);
    return result;
  } catch (error) {
    console.error(`Error with model ${model}:`, error);
    failedModels.add(model);
    return null;
  }
}

export async function generateRandomItineraries(
  formInput: FormInput
): Promise<[ItineraryResult, ItineraryResult]> {
  const failedModels = new Set<string>();
  const [model1, model2] = selectRandomModels();

  // Try first selected model
  const result1 = await tryGenerateItinerary(model1, formInput, failedModels);

  // Try second selected model
  const result2 = await tryGenerateItinerary(model2, formInput, failedModels);

  // If both initial models worked, return their results
  if (result1 && result2) {
    return [result1, result2];
  }

  // Try remaining models as fallbacks
  const remainingModels = AI_MODELS.filter(model => 
    model !== model1 && 
    model !== model2 && 
    !failedModels.has(model)
  );

  let finalResult1 = result1;
  let finalResult2 = result2;

  // If first result failed, try fallbacks
  if (!finalResult1) {
    for (const fallbackModel of remainingModels) {
      const fallbackResult = await tryGenerateItinerary(fallbackModel, formInput, failedModels);
      if (fallbackResult) {
        finalResult1 = fallbackResult;
        finalResult1.model = `${fallbackModel} (fallback from ${model1})`;
        break;
      }
    }
  }

  // If second result failed, try remaining fallbacks
  if (!finalResult2) {
    const unusedModels = AI_MODELS.filter(model => 
      !failedModels.has(model) && 
      (finalResult1?.model !== model)
    );

    for (const fallbackModel of unusedModels) {
      const fallbackResult = await tryGenerateItinerary(fallbackModel, formInput, failedModels);
      if (fallbackResult) {
        finalResult2 = fallbackResult;
        finalResult2.model = `${fallbackModel} (fallback from ${model2})`;
        break;
      }
    }
  }

  // If we still don't have two results but have at least one, duplicate it
  if (finalResult1 && !finalResult2) {
    finalResult2 = { ...finalResult1 };
    finalResult2.model = `${finalResult1.model} (copy due to other models failing)`;
  } else if (!finalResult1 && finalResult2) {
    finalResult1 = { ...finalResult2 };
    finalResult1.model = `${finalResult2.model} (copy due to other models failing)`;
  }

  // If all models failed, throw error
  if (!finalResult1 || !finalResult2) {
    throw new Error("All AI models failed to generate itineraries");
  }

  return [finalResult1, finalResult2];
}

export async function generateItineraryWithFallback(
  model: string,
  formInput: FormInput,
  fallbackModel: string | null = null
): Promise<ItineraryResult> {
  try {
    const result = await MODEL_GENERATORS[model](formInput);
    return result;
  } catch (error) {
    if (fallbackModel) {
      console.log(`Falling back to ${fallbackModel}...`);
      return await MODEL_GENERATORS[fallbackModel](formInput);
    } else {
      throw new Error(`Model ${model} failed and no fallback provided.`);
    }
  }
}