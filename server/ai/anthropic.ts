import Anthropic from '@anthropic-ai/sdk';
import { type FormInput, type ItineraryResult } from "@shared/schema";

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025. Do not change this unless explicitly requested by the user.
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "sk-ant-dummy-key-for-development"
});

export async function generateAnthropicItinerary(formInput: FormInput): Promise<ItineraryResult> {
  const { destination, dates, budget, travelers, interests, notes } = formInput;
  
  const interestsString = interests.join(", ");
  
  const prompt = `
    Generate a detailed travel itinerary for ${destination}. 

    Travel details:
    - Dates: ${dates}
    - Budget level: ${budget}
    - Number of travelers: ${travelers}
    - Interests: ${interestsString}
    - Additional notes: ${notes || "None"}

    Your itinerary should focus on popular landmarks, luxury experiences, and efficient time management. Include the most iconic and popular attractions that would appeal to tourists.
    
    Structure your response as a JSON object with these fields:
    - destination: name of the destination
    - summary: a brief overview of the trip
    - highlights: an array of 3-5 trip highlights
    - days: an array of daily itineraries, where each day has:
      - title: a catchy title for the day's theme
      - activities: an array of activities, each with:
        - title: name of the activity
        - description: detailed description
        - time: approximate time (Morning, Afternoon, Evening)
        - type: type of activity (Food, Culture, Adventure, etc.)
        - location: specific location or venue
    - tips: an array of 2-3 practical travel tips
    - focus: "Popular Attractions"
    - rating: 5 (on a scale of 1-5)
  `;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 4000,
      system: "You are a luxury travel planning assistant that specializes in creating efficient, popular attraction-focused itineraries. You always respond with valid JSON.",
      messages: [
        { role: "user", content: prompt }
      ],
    });

    const content = response.content[0].text;
    if (!content) {
      throw new Error("Empty response from Anthropic");
    }

    // Extract JSON from the response (in case the AI includes additional text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from Anthropic response");
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);
    return {
      ...parsedResponse,
      model: "Claude 3.7 Sonnet"
    };
  } catch (error) {
    console.error("Error generating Anthropic itinerary:", error);
    throw new Error(`Failed to generate Anthropic itinerary: ${error.message}`);
  }
}
