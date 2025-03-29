import { FormInput, ItineraryResult } from "@shared/schema";
import { generateOpenAIItinerary } from "./openai";
import { generateAnthropicItinerary } from "./anthropic";
import { generateGeminiItinerary } from "./gemini";
import { generateGrokItinerary } from "./grok";

// Define the available AI models
const AI_MODELS = ["OpenAI", "Anthropic", "Gemini", "Grok"];

// Map of model names to their generator functions
type ItineraryGenerator = (formInput: FormInput) => Promise<ItineraryResult>;
const MODEL_GENERATORS: Record<string, ItineraryGenerator> = {
  "OpenAI": generateOpenAIItinerary,
  "Anthropic": generateAnthropicItinerary,
  "Gemini": generateGeminiItinerary,
  "Grok": generateGrokItinerary
};

/**
 * Randomly selects two different AI models to generate itineraries
 * @returns Array of two unique AI model names
 */
export function selectRandomModels(): [string, string] {
  // Create a copy of the models array to modify
  const availableModels = [...AI_MODELS];
  
  // Select the first model randomly
  const firstIndex = Math.floor(Math.random() * availableModels.length);
  const firstModel = availableModels[firstIndex];
  
  // Remove the first model from the available pool
  availableModels.splice(firstIndex, 1);
  
  // Select the second model randomly from remaining models
  const secondIndex = Math.floor(Math.random() * availableModels.length);
  const secondModel = availableModels[secondIndex];
  
  return [firstModel, secondModel];
}

/**
 * Generates an itinerary using the specified model with fallback support
 * @param model The primary AI model to use
 * @param formInput The travel form input
 * @param excludeModel Optional model to exclude from fallback options
 * @returns A generated itinerary result
 */
export async function generateItineraryWithFallback(
  model: string,
  formInput: FormInput,
  excludeModel?: string
): Promise<ItineraryResult> {
  // Create a prioritized list of fallback models (excluding the specified one)
  const fallbackModels = AI_MODELS.filter(m => m !== model && m !== excludeModel);
  
  // Try the primary model first
  try {
    console.log(`Attempting to generate itinerary with ${model}...`);
    if (!MODEL_GENERATORS[model]) {
      throw new Error(`Unknown model: ${model}`);
    }
    return await MODEL_GENERATORS[model](formInput);
  } catch (primaryError: unknown) {
    console.error(`Error with primary model ${model}:`, primaryError);
    
    // Special handling for Anthropic overload
    const isAnthropicOverload = primaryError instanceof Error && 
      primaryError.message.includes('529') && 
      primaryError.message.includes('overloaded_error');
    
    // Try each fallback model in sequence
    for (const fallbackModel of fallbackModels) {
      try {
        // Skip Anthropic if we're in an overload situation
        if (isAnthropicOverload && fallbackModel === 'Anthropic') {
          continue;
        }
        
        console.log(`Attempting fallback with ${fallbackModel}...`);
        const result = await MODEL_GENERATORS[fallbackModel](formInput);
        // Override the model name in the result to maintain transparency
        result.model = `${fallbackModel} (fallback from ${model})`;
        return result;
      } catch (fallbackError) {
        console.error(`Error with fallback model ${fallbackModel}:`, fallbackError);
        // Continue to the next fallback
      }
    }
    
    // If all models failed, rethrow the original error
    const errorMessage = primaryError instanceof Error ? primaryError.message : String(primaryError);
    throw new Error(`Failed to generate itinerary with ${model} and all fallbacks: ${errorMessage}`);
  }
}

/**
 * Generates two different itineraries using randomly selected AI models with fallback support
 * @param formInput The travel form input
 * @returns A tuple of two itinerary results from different models
 */
export async function generateRandomItineraries(
  formInput: FormInput
): Promise<[ItineraryResult, ItineraryResult]> {
  // Select two different AI models randomly
  const [model1, model2] = selectRandomModels();
  
  // Generate itineraries with both models in parallel with fallback support
  // Each model excludes the other from its fallback options to ensure different results
  const [itinerary1, itinerary2] = await Promise.all([
    generateItineraryWithFallback(model1, formInput, model2),
    generateItineraryWithFallback(model2, formInput, model1)
  ]);
  
  return [itinerary1, itinerary2];
}