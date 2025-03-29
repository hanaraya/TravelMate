import OpenAI from "openai";
import { type FormInput, type ItineraryResult } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key-for-development"
});

export async function generateOpenAIItinerary(formInput: FormInput): Promise<ItineraryResult> {
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

    Your itinerary should focus on cultural immersion and local experiences. Find hidden gems and authentic experiences that tourists might miss.
    
    Respond with a JSON object that includes:
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
    - focus: "Cultural Immersion"
    - rating: 4.5 (on a scale of 1-5)
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    const parsedResponse = JSON.parse(content);
    return {
      ...parsedResponse,
      model: "GPT-4o"
    };
  } catch (error) {
    console.error("Error generating OpenAI itinerary:", error);
    throw new Error(`Failed to generate OpenAI itinerary: ${error.message}`);
  }
}
