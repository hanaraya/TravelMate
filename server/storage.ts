import { 
  users, 
  itineraries, 
  type User, 
  type InsertUser, 
  type Itinerary, 
  type InsertItinerary, 
  StatisticsData, 
  DestinationStats, 
  AIModelStats 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Itinerary operations
  createItinerary(itinerary: InsertItinerary): Promise<Itinerary>;
  getItinerary(id: number): Promise<Itinerary | undefined>;
  updateItinerary(id: number, updates: Partial<Itinerary>): Promise<Itinerary | undefined>;
  getItinerariesByUserId(userId: number): Promise<Itinerary[]>;
  saveItinerary(id: number, save: boolean): Promise<Itinerary | undefined>;
  getSavedItineraries(userId: number): Promise<Itinerary[]>;
  
  // Analytics operations
  getAIStatistics(): Promise<StatisticsData>;
  getTopDestinations(limit?: number): Promise<DestinationStats[]>;
  getAIModelPerformance(): Promise<AIModelStats[]>;
  
  // Session management
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }

  async createItinerary(insertItinerary: InsertItinerary): Promise<Itinerary> {
    const [itinerary] = await db
      .insert(itineraries)
      .values(insertItinerary)
      .returning();
    
    return itinerary;
  }

  async getItinerary(id: number): Promise<Itinerary | undefined> {
    const [itinerary] = await db.select().from(itineraries).where(eq(itineraries.id, id));
    return itinerary;
  }

  async updateItinerary(id: number, updates: Partial<Itinerary>): Promise<Itinerary | undefined> {
    const [updatedItinerary] = await db
      .update(itineraries)
      .set(updates)
      .where(eq(itineraries.id, id))
      .returning();
    
    return updatedItinerary;
  }

  async getItinerariesByUserId(userId: number): Promise<Itinerary[]> {
    return db
      .select()
      .from(itineraries)
      .where(eq(itineraries.userId, userId))
      .orderBy(desc(itineraries.createdAt));
  }

  async saveItinerary(id: number, save: boolean): Promise<Itinerary | undefined> {
    const [updatedItinerary] = await db
      .update(itineraries)
      .set({ isSaved: save })
      .where(eq(itineraries.id, id))
      .returning();
    
    return updatedItinerary;
  }

  async getSavedItineraries(userId: number): Promise<Itinerary[]> {
    return db
      .select()
      .from(itineraries)
      .where(and(
        eq(itineraries.userId, userId),
        eq(itineraries.isSaved, true)
      ))
      .orderBy(desc(itineraries.createdAt));
  }
  
  async getAIStatistics(): Promise<StatisticsData> {
    // Get all itineraries that have a chosen model
    const allItineraries = await db
      .select()
      .from(itineraries)
      .where(sql`${itineraries.chosenItinerary} IS NOT NULL`);
      
    // Model stats
    const modelCounts = {
      openai: 0,
      anthropic: 0,
      openaiCorrect: 0,
      anthropicCorrect: 0
    };
    
    // Destination stats
    const destinations: Record<string, { openai: number, anthropic: number }> = {};
    
    // Recent trends (last 10 days)
    const now = new Date();
    const dates: string[] = [];
    const openaiTrend: number[] = [];
    const anthropicTrend: number[] = [];
    
    // Generate last 10 days
    for (let i = 9; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      openaiTrend.push(0);
      anthropicTrend.push(0);
    }
    
    // Process each itinerary
    for (const itinerary of allItineraries) {
      const destination = itinerary.destination.split(',')[0].trim(); // Take first part of destination
      const chosenModel = itinerary.chosenItinerary;
      
      // Increment model counts
      if (chosenModel === 'openai') {
        modelCounts.openai++;
        // Check if they guessed correctly
        const openAIResult = typeof itinerary.openAiItinerary === 'string' 
          ? JSON.parse(itinerary.openAiItinerary)
          : itinerary.openAiItinerary || {};
          
        if (openAIResult.model?.includes('GPT')) {
          modelCounts.openaiCorrect++;
        }
      } else if (chosenModel === 'anthropic') {
        modelCounts.anthropic++;
        // Check if they guessed correctly
        const anthropicResult = typeof itinerary.anthropicItinerary === 'string' 
          ? JSON.parse(itinerary.anthropicItinerary)
          : itinerary.anthropicItinerary || {};
          
        if (anthropicResult.model?.includes('Claude')) {
          modelCounts.anthropicCorrect++;
        }
      }
      
      // Update destination stats
      if (!destinations[destination]) {
        destinations[destination] = { openai: 0, anthropic: 0 };
      }
      
      if (chosenModel === 'openai') {
        destinations[destination].openai++;
      } else if (chosenModel === 'anthropic') {
        destinations[destination].anthropic++;
      }
      
      // Update trends
      if (itinerary.createdAt) {
        const createdDate = new Date(itinerary.createdAt);
        for (let i = 0; i < dates.length; i++) {
          const trendDate = new Date(now);
          trendDate.setDate(trendDate.getDate() - (9 - i));
          
          if (createdDate.toDateString() === trendDate.toDateString()) {
            if (chosenModel === 'openai') {
              openaiTrend[i]++;
            } else if (chosenModel === 'anthropic') {
              anthropicTrend[i]++;
            }
            break;
          }
        }
      }
    }
    
    // Format destination stats
    const destinationStats: DestinationStats[] = Object.entries(destinations)
      .map(([destination, counts]) => ({
        destination,
        openaiCount: counts.openai,
        anthropicCount: counts.anthropic,
        totalCount: counts.openai + counts.anthropic
      }))
      .sort((a, b) => b.totalCount - a.totalCount);
    
    // Format model stats
    const aiModelStats: AIModelStats[] = [
      {
        modelName: 'GPT-4o',
        totalSelections: modelCounts.openai,
        correctGuesses: modelCounts.openaiCorrect,
        percentageCorrect: modelCounts.openai > 0 
          ? Math.round((modelCounts.openaiCorrect / modelCounts.openai) * 100) 
          : 0
      },
      {
        modelName: 'Claude 3.7 Sonnet',
        totalSelections: modelCounts.anthropic,
        correctGuesses: modelCounts.anthropicCorrect,
        percentageCorrect: modelCounts.anthropic > 0 
          ? Math.round((modelCounts.anthropicCorrect / modelCounts.anthropic) * 100) 
          : 0
      }
    ];
    
    return {
      aiModelStats,
      destinationStats,
      totalItineraries: allItineraries.length,
      recentTrends: {
        openaiTrend,
        anthropicTrend,
        labels: dates
      }
    };
  }
  
  async getTopDestinations(limit: number = 5): Promise<DestinationStats[]> {
    const stats = await this.getAIStatistics();
    return stats.destinationStats.slice(0, limit);
  }
  
  async getAIModelPerformance(): Promise<AIModelStats[]> {
    const stats = await this.getAIStatistics();
    return stats.aiModelStats;
  }
}

export const storage = new DatabaseStorage();
