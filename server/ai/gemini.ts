import { FormInput, ItineraryResult } from "@shared/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function generateGeminiItinerary(formInput: FormInput): Promise<ItineraryResult> {
  try {
    // Get the generative model (Gemini)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-exp-03-25" });

    // Create a structured prompt with travel details
    const prompt = `
      Create a detailed travel itinerary for a trip with the following details:
      - Destination: ${formInput.destination}
      - Travel dates: ${formInput.dates}
      - Budget level: ${formInput.budget}
      - Number of travelers: ${formInput.travelers}
      - Interests: ${formInput.interests.join(", ")}
      ${formInput.notes ? `- Additional notes: ${formInput.notes}` : ""}

      Structure the response as a valid JSON object with the following format:
      {
        "destination": "${formInput.destination}",
        "summary": "A brief one-paragraph summary of the trip",
        "highlights": ["Key highlight 1", "Key highlight 2", "Key highlight 3", ...],
        "days": [
          {
            "title": "Day 1",
            "activities": [
              {
                "title": "Activity title",
                "description": "Detailed description",
                "time": "Morning/Afternoon/Evening",
                "type": "Activity type (e.g., Sightseeing, Dining, etc.)",
                "location": "Location name"
              },
              ...more activities
            ]
          },
          ...more days
        ],
        "tips": ["Useful tip 1", "Useful tip 2", ...],
        "model": "Gemini",
        "focus": "One main focus of this itinerary (e.g., Adventure, Cultural immersion, etc.)",
        "rating": 5
      }

      Make sure all activities are practical and specific to the destination. Include local cuisine, attractions, and experiences relevant to the interests provided. Aim for 3-4 activities per day, spread across morning, afternoon, and evening.
    `;

    // Generate content from model
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    
    // Extract the JSON object from the response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to generate a valid JSON response from Gemini");
    }
    
    const parsedResponse = JSON.parse(jsonMatch[0]);
    
    // Ensure the result conforms to the ItineraryResult type
    const itinerary: ItineraryResult = {
      destination: parsedResponse.destination || formInput.destination,
      summary: parsedResponse.summary || `A trip to ${formInput.destination}`,
      highlights: Array.isArray(parsedResponse.highlights) ? parsedResponse.highlights : [],
      days: Array.isArray(parsedResponse.days) ? parsedResponse.days.map((day: any) => ({
        title: day.title || "Day",
        activities: Array.isArray(day.activities) ? day.activities.map((activity: any) => ({
          title: activity.title || "Activity",
          description: activity.description || "",
          time: activity.time || "",
          type: activity.type || "",
          location: activity.location || "",
          isPlaceholder: false
        })) : []
      })) : [],
      tips: Array.isArray(parsedResponse.tips) ? parsedResponse.tips : [],
      model: "Gemini",
      focus: parsedResponse.focus || "",
      rating: parsedResponse.rating || 5
    };

    return itinerary;
  } catch (error: unknown) {
    console.error("Error generating Gemini itinerary:", error);
    
    // Return a basic error itinerary in case of failure
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate itinerary with Gemini: ${errorMessage}`);
  }
}