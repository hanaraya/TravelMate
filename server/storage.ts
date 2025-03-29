import { 
  users, 
  itineraries, 
  type User, 
  type InsertUser, 
  type Itinerary, 
  type InsertItinerary 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  createItinerary(itinerary: InsertItinerary): Promise<Itinerary>;
  getItinerary(id: number): Promise<Itinerary | undefined>;
  updateItinerary(id: number, updates: Partial<Itinerary>): Promise<Itinerary | undefined>;
  getItinerariesByUserId(userId: number): Promise<Itinerary[]>;
  saveItinerary(id: number, save: boolean): Promise<Itinerary | undefined>;
  getSavedItineraries(userId: number): Promise<Itinerary[]>;
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
}

export const storage = new DatabaseStorage();
