import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { formInputSchema, itineraryResultSchema } from "@shared/schema";
import { generateOpenAIItinerary } from "./ai/openai";
import { generateAnthropicItinerary } from "./ai/anthropic";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // API endpoint to generate itineraries
  app.post("/api/itineraries", async (req, res) => {
    try {
      // Validate request body
      const formInput = formInputSchema.parse(req.body);

      // Create itinerary record
      const itinerary = await storage.createItinerary({
        ...formInput,
        userId: req.body.userId || null
      });

      // Generate itineraries from both AI models in parallel
      const [openAiItinerary, anthropicItinerary] = await Promise.all([
        generateOpenAIItinerary(formInput),
        generateAnthropicItinerary(formInput)
      ]);

      // Update itinerary with generated content
      const updatedItinerary = await storage.updateItinerary(itinerary.id, {
        openAiItinerary,
        anthropicItinerary
      });

      res.status(200).json({
        id: updatedItinerary.id,
        openAiItinerary,
        anthropicItinerary
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid input", details: error.errors });
      } else {
        console.error("Error generating itineraries:", error);
        res.status(500).json({ error: "Failed to generate itineraries", message: error.message });
      }
    }
  });

  // API endpoint to record user's choice
  app.post("/api/itineraries/:id/choice", async (req, res) => {
    try {
      const itineraryId = parseInt(req.params.id);
      const { choice } = req.body;

      if (!choice || (choice !== "openai" && choice !== "anthropic")) {
        return res.status(400).json({ error: "Invalid choice. Must be 'openai' or 'anthropic'" });
      }

      const itinerary = await storage.getItinerary(itineraryId);
      if (!itinerary) {
        return res.status(404).json({ error: "Itinerary not found" });
      }

      const updatedItinerary = await storage.updateItinerary(itineraryId, {
        chosenItinerary: choice
      });

      res.status(200).json({ success: true, choice });
    } catch (error) {
      console.error("Error saving choice:", error);
      res.status(500).json({ error: "Failed to save choice", message: error.message });
    }
  });

  // API endpoint to get an itinerary by ID
  app.get("/api/itineraries/:id", async (req, res) => {
    try {
      const itineraryId = parseInt(req.params.id);
      const itinerary = await storage.getItinerary(itineraryId);
      
      if (!itinerary) {
        return res.status(404).json({ error: "Itinerary not found" });
      }
      
      res.status(200).json(itinerary);
    } catch (error) {
      console.error("Error retrieving itinerary:", error);
      res.status(500).json({ error: "Failed to retrieve itinerary", message: error.message });
    }
  });

  return httpServer;
}
