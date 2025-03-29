import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { formInputSchema, promptSchema, itineraryResultSchema } from "@shared/schema";
import { generateOpenAIItinerary } from "./ai/openai";
import { generateAnthropicItinerary } from "./ai/anthropic";
import { extractTravelDetailsFromPrompt } from "./ai/prompt-parser";
import { ZodError } from "zod";
import * as auth from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize authentication routes
  await auth.registerRoutes(app);
  
  const httpServer = createServer(app);

  // API endpoint to generate itineraries
  app.post("/api/itineraries", async (req, res) => {
    try {
      // Validate request body
      const formInput = formInputSchema.parse(req.body);
      
      // Get user ID from session if authenticated
      const userId = req.session?.userId || null;

      // Create itinerary record
      const itinerary = await storage.createItinerary({
        ...formInput,
        userId
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
        id: updatedItinerary?.id,
        openAiItinerary,
        anthropicItinerary
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid input", details: error.errors });
      } else {
        console.error("Error generating itineraries:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: "Failed to generate itineraries", message: errorMessage });
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

      // Check if the user correctly identified the AI model
      // If they picked OpenAI and got OpenAI's itinerary, or they picked Anthropic and got Anthropic's
      // In this simplified version, we're just matching the model name directly
      let correct = false;
      if (choice === 'openai' && typeof itinerary.openAiItinerary === 'object' && itinerary.openAiItinerary && 'model' in itinerary.openAiItinerary && 
          typeof itinerary.openAiItinerary.model === 'string' && itinerary.openAiItinerary.model.includes('GPT')) {
        correct = true;
      } else if (choice === 'anthropic' && typeof itinerary.anthropicItinerary === 'object' && itinerary.anthropicItinerary && 
                 'model' in itinerary.anthropicItinerary && typeof itinerary.anthropicItinerary.model === 'string' && 
                 itinerary.anthropicItinerary.model.includes('Claude')) {
        correct = true;
      }

      const updatedItinerary = await storage.updateItinerary(itineraryId, {
        chosenItinerary: choice
      });

      res.status(200).json({ 
        success: true, 
        choice,
        correct 
      });
    } catch (error) {
      console.error("Error saving choice:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: "Failed to save choice", message: errorMessage });
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: "Failed to retrieve itinerary", message: errorMessage });
    }
  });

  // API endpoint to save an itinerary
  app.post("/api/itineraries/:id/save", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session?.userId) {
        return res.status(401).json({ error: "You must be logged in to save itineraries" });
      }

      const itineraryId = parseInt(req.params.id);
      const itinerary = await storage.getItinerary(itineraryId);
      
      if (!itinerary) {
        return res.status(404).json({ error: "Itinerary not found" });
      }
      
      // Check if the itinerary belongs to the logged-in user
      if (itinerary.userId !== req.session.userId) {
        return res.status(403).json({ error: "You can only save your own itineraries" });
      }
      
      const updatedItinerary = await storage.saveItinerary(itineraryId, true);
      
      res.status(200).json({ 
        message: "Itinerary saved successfully", 
        itinerary: updatedItinerary 
      });
    } catch (error) {
      console.error("Error saving itinerary:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: "Failed to save itinerary", message: errorMessage });
    }
  });

  // API endpoint to unsave an itinerary
  app.post("/api/itineraries/:id/unsave", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session?.userId) {
        return res.status(401).json({ error: "You must be logged in to manage saved itineraries" });
      }

      const itineraryId = parseInt(req.params.id);
      const itinerary = await storage.getItinerary(itineraryId);
      
      if (!itinerary) {
        return res.status(404).json({ error: "Itinerary not found" });
      }
      
      // Check if the itinerary belongs to the logged-in user
      if (itinerary.userId !== req.session.userId) {
        return res.status(403).json({ error: "You can only manage your own itineraries" });
      }
      
      const updatedItinerary = await storage.saveItinerary(itineraryId, false);
      
      res.status(200).json({ 
        message: "Itinerary removed from saved list", 
        itinerary: updatedItinerary 
      });
    } catch (error) {
      console.error("Error updating itinerary:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: "Failed to update itinerary", message: errorMessage });
    }
  });

  // API endpoint to get user's saved itineraries
  app.get("/api/itineraries/user/saved", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session?.userId) {
        return res.status(401).json({ error: "You must be logged in to view saved itineraries" });
      }

      const savedItineraries = await storage.getSavedItineraries(req.session.userId);
      
      res.status(200).json(savedItineraries);
    } catch (error) {
      console.error("Error retrieving saved itineraries:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: "Failed to retrieve saved itineraries", message: errorMessage });
    }
  });
  
  // API endpoint to get all AI statistics
  app.get("/api/statistics", async (req, res) => {
    try {
      const statistics = await storage.getAIStatistics();
      res.status(200).json(statistics);
    } catch (error) {
      console.error("Error retrieving statistics:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: "Failed to retrieve statistics", message: errorMessage });
    }
  });
  
  // API endpoint to get top destinations
  app.get("/api/statistics/destinations", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const destinations = await storage.getTopDestinations(limit);
      res.status(200).json(destinations);
    } catch (error) {
      console.error("Error retrieving destination statistics:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: "Failed to retrieve destination statistics", message: errorMessage });
    }
  });
  
  // API endpoint to get AI model performance
  app.get("/api/statistics/models", async (req, res) => {
    try {
      const modelStats = await storage.getAIModelPerformance();
      res.status(200).json(modelStats);
    } catch (error) {
      console.error("Error retrieving model statistics:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: "Failed to retrieve model statistics", message: errorMessage });
    }
  });

  // API endpoint to generate itineraries from a natural language prompt
  app.post("/api/generate-itinerary", async (req, res) => {
    try {
      // Validate the prompt
      const { prompt } = promptSchema.parse(req.body);
      
      // Extract structured travel details from the prompt using AI
      const formInput = await extractTravelDetailsFromPrompt(prompt);
      
      // Get user ID from session if authenticated
      const userId = req.session?.userId || null;

      // Create itinerary record
      const itinerary = await storage.createItinerary({
        ...formInput,
        userId,
        notes: (formInput.notes ? formInput.notes + "\n\nOriginal prompt: " : "Original prompt: ") + prompt
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
        id: updatedItinerary?.id,
        openAiItinerary,
        anthropicItinerary
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid prompt", details: error.errors });
      } else {
        console.error("Error generating itineraries from prompt:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: "Failed to generate itineraries", message: errorMessage });
      }
    }
  });

  return httpServer;
}
