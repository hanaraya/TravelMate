import { FormInput, ItineraryResult } from "@shared/schema";
import axios from "axios";

// Grok API base URL
const GROK_API_BASE_URL = "https://api.grok.ai/v1";

export async function generateGrokItinerary(formInput: FormInput): Promise<ItineraryResult> {
  try {
    // Create a structured prompt for Grok
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
        "model": "Grok",
        "focus": "One main focus of this itinerary (e.g., Adventure, Cultural immersion, etc.)",
        "rating": 5
      }

      Make sure all activities are practical and specific to the destination. Include local cuisine, attractions, and experiences relevant to the interests provided. Aim for 3-4 activities per day, spread across morning, afternoon, and evening. Provide only the JSON response with no additional text.
    `;

    // Make API request to Grok
    const response = await axios.post(
      `${GROK_API_BASE_URL}/chat/completions`,
      {
        model: "grok-1",
        messages: [
          {
            role: "system",
            content: "You are a travel planning expert that provides detailed, personalized travel itineraries. You always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROK_API_KEY}`
        }
      }
    );

    // Parse the response
    const responseData = response.data;
    const contentText = responseData.choices[0].message.content;
    
    // Parse JSON from the response
    const parsedResponse = JSON.parse(contentText);
    
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
      model: "Grok",
      focus: parsedResponse.focus || "",
      rating: parsedResponse.rating || 5
    };

    return itinerary;
  } catch (error: unknown) {
    console.error("Error generating Grok itinerary:", error);
    
    // Return a basic error itinerary in case of failure
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate itinerary with Grok: ${errorMessage}`);
  }
}