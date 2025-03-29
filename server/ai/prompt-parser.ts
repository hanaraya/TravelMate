import { FormInput } from "@shared/schema";
import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key-for-development"
});

/**
 * Extracts structured travel details from a natural language prompt
 */
export async function extractTravelDetailsFromPrompt(prompt: string): Promise<FormInput> {
  try {
    const systemPrompt = `
      You are an AI travel assistant tasked with extracting structured travel details from a user's natural language query.
      Extract the following information from the user's travel request:
      
      1. Destination (required, default to "unspecified" if unclear)
      2. Travel dates (required, use "flexible" if not specified)
      3. Budget level (required, one of: "budget", "moderate", "luxury", default to "moderate" if unclear)
      4. Number of travelers (required, default to "1 person" if not specified)
      5. Interests (at least one required, choose from: culture, food, nature, history, adventure, relaxation, family, shopping, nightlife, default to "culture, food")
      6. Additional notes (optional)
      
      Return ONLY a JSON object with these keys: destination, dates, budget, travelers, interests (array), notes.
      Do not include any explanation or additional text - just the JSON.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    const parsedResponse = JSON.parse(content);
    
    // Ensure interests is an array
    if (typeof parsedResponse.interests === 'string') {
      parsedResponse.interests = [parsedResponse.interests];
    }
    
    // Validate and provide defaults if needed
    const result: FormInput = {
      destination: parsedResponse.destination || "unspecified",
      dates: parsedResponse.dates || "flexible",
      budget: ["budget", "moderate", "luxury"].includes(parsedResponse.budget) 
        ? parsedResponse.budget 
        : "moderate",
      travelers: parsedResponse.travelers || "1 person",
      interests: Array.isArray(parsedResponse.interests) && parsedResponse.interests.length > 0
        ? parsedResponse.interests
        : ["culture", "food"],
      notes: parsedResponse.notes || ""
    };

    return result;
  } catch (error) {
    console.error("Error extracting travel details from prompt:", error);
    
    // Fallback to basic defaults if AI parsing fails
    return {
      destination: "unspecified",
      dates: "flexible",
      budget: "moderate",
      travelers: "1 person",
      interests: ["culture", "food"],
      notes: "Original prompt: " + prompt
    };
  }
}