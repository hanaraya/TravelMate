import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { formInputSchema, promptSchema, itineraryResultSchema } from "@shared/schema";
import { generateOpenAIItinerary } from "./ai/openai";
import { generateAnthropicItinerary } from "./ai/anthropic";
import { generateGeminiItinerary } from "./ai/gemini";
import { generateGrokItinerary } from "./ai/grok";
import { generateRandomItineraries, generateItineraryWithFallback } from "./ai/selector";
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

      // Determine which itinerary the user selected (first or second)
      const selectedItinerary = choice === 'openai' ? itinerary.openAiItinerary : itinerary.anthropicItinerary;
      
      if (!selectedItinerary || typeof selectedItinerary !== 'object' || !('model' in selectedItinerary)) {
        return res.status(400).json({ error: "Selected itinerary is not valid" });
      }
      
      // Extract the actual model name, handling the fallback case
      const actualModelName = String(selectedItinerary.model);
      
      // Check if the user correctly identified the AI model family
      let correct = false;
      
      // Define model family mappings
      const modelFamilies = {
        'openai': ['GPT', 'OpenAI'],
        'anthropic': ['Claude', 'Anthropic'],
        // These would map to openai or anthropic in the choice
        'gemini': ['Gemini'],
        'grok': ['Grok']
      };
      
      // Check for exact match first (for core models)
      if ((choice === 'openai' && actualModelName.includes('OpenAI')) || 
          (choice === 'anthropic' && actualModelName.includes('Anthropic'))) {
        correct = true;
      } 
      // Check for model-specific keyword matches
      else if ((choice === 'openai' && actualModelName.includes('GPT')) || 
               (choice === 'anthropic' && actualModelName.includes('Claude'))) {
        correct = true;
      }
      // Check for Gemini/Grok (user would select based on the interface showing just openai/anthropic)
      else if (actualModelName.includes('Gemini') || actualModelName.includes('Grok')) {
        // For Gemini and Grok, we treat them as "wild cards"
        // We consider the guess correct - this rewards exploration of the new models
        // Alternatively, we could randomly assign correct/incorrect since it's a true guess
        correct = true;
      }
      
      // Handle fallback cases more carefully
      if (actualModelName.includes('fallback')) {
        // Example: "Anthropic (fallback from OpenAI)"
        // In this case, the user might reasonably guess either model, so we're generous
        correct = true;
      }

      const updatedItinerary = await storage.updateItinerary(itineraryId, {
        chosenItinerary: choice
      });

      res.status(200).json({ 
        success: true, 
        choice,
        correct,
        actualModel: actualModelName // Return the actual model for UI display
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

      try {
        // Generate itineraries using the random AI selector with fallback support
        const [itinerary1, itinerary2] = await generateRandomItineraries(formInput);
        
        // Store the generated itineraries - map them to the existing openAI and anthropic fields 
        // for now for database compatibility
        const updatedItinerary = await storage.updateItinerary(itinerary.id, {
          openAiItinerary: itinerary1,
          anthropicItinerary: itinerary2
        });

        res.status(200).json({
          id: updatedItinerary?.id,
          openAiItinerary: itinerary1,
          anthropicItinerary: itinerary2
        });
      } catch (aiError) {
        // If the random selection fails, fall back to fixed OpenAI + Anthropic
        console.warn("Random AI selection failed, falling back to fixed model selection:", aiError);
        
        // Generate itineraries from both AI models in parallel
        const [openAiItinerary, anthropicItinerary] = await Promise.all([
          generateItineraryWithFallback("OpenAI", formInput),
          generateItineraryWithFallback("Anthropic", formInput, "OpenAI")
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
      }
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
