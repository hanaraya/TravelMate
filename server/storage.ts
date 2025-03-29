import { users, type User, type InsertUser, type Itinerary, type InsertItinerary, itineraries } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createItinerary(itinerary: InsertItinerary): Promise<Itinerary>;
  getItinerary(id: number): Promise<Itinerary | undefined>;
  updateItinerary(id: number, updates: Partial<Itinerary>): Promise<Itinerary | undefined>;
  getItinerariesByUserId(userId: number): Promise<Itinerary[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private itineraries: Map<number, Itinerary>;
  userCurrentId: number;
  itineraryCurrentId: number;

  constructor() {
    this.users = new Map();
    this.itineraries = new Map();
    this.userCurrentId = 1;
    this.itineraryCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createItinerary(insertItinerary: InsertItinerary): Promise<Itinerary> {
    const id = this.itineraryCurrentId++;
    const now = new Date();
    const itinerary: Itinerary = { 
      ...insertItinerary, 
      id, 
      openAiItinerary: null, 
      anthropicItinerary: null, 
      chosenItinerary: null,
      createdAt: now
    };
    this.itineraries.set(id, itinerary);
    return itinerary;
  }

  async getItinerary(id: number): Promise<Itinerary | undefined> {
    return this.itineraries.get(id);
  }

  async updateItinerary(id: number, updates: Partial<Itinerary>): Promise<Itinerary | undefined> {
    const itinerary = this.itineraries.get(id);
    if (!itinerary) return undefined;
    
    const updatedItinerary = { ...itinerary, ...updates };
    this.itineraries.set(id, updatedItinerary);
    return updatedItinerary;
  }

  async getItinerariesByUserId(userId: number): Promise<Itinerary[]> {
    return Array.from(this.itineraries.values()).filter(
      (itinerary) => itinerary.userId === userId
    );
  }
}

export const storage = new MemStorage();
