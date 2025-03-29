import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
  profilePicture: text("profile_picture"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  fullName: true,
  password: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const itineraries = pgTable("itineraries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  destination: text("destination").notNull(),
  dates: text("dates").notNull(),
  budget: text("budget").notNull(),
  travelers: text("travelers").notNull(),
  interests: text("interests").array().notNull(),
  notes: text("notes"),
  openAiItinerary: jsonb("openai_itinerary"),
  anthropicItinerary: jsonb("anthropic_itinerary"),
  chosenItinerary: text("chosen_itinerary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isSaved: boolean("is_saved").default(false),
});

export const itinerariesRelations = relations(itineraries, ({ one }) => ({
  user: one(users, {
    fields: [itineraries.userId],
    references: [users.id]
  })
}));

export const usersRelations = relations(users, ({ many }) => ({
  itineraries: many(itineraries)
}));

export const formInputSchema = z.object({
  destination: z.string().min(2, "Destination is required"),
  dates: z.string().min(2, "Travel dates are required"),
  budget: z.string().min(1, "Budget is required"),
  travelers: z.string().min(1, "Number of travelers is required"),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  notes: z.string().optional()
});

export const insertItinerarySchema = createInsertSchema(itineraries).omit({
  id: true,
  openAiItinerary: true,
  anthropicItinerary: true,
  chosenItinerary: true,
  createdAt: true,
  isSaved: true
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Itinerary = typeof itineraries.$inferSelect;
export type InsertItinerary = z.infer<typeof insertItinerarySchema>;
export type FormInput = z.infer<typeof formInputSchema>;

export const DAY_STRUCTURE = z.object({
  title: z.string(),
  activities: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      time: z.string().optional(),
      type: z.string().optional(),
      location: z.string().optional(),
      isPlaceholder: z.boolean().optional(),
    })
  )
});

export const itineraryResultSchema = z.object({
  destination: z.string(),
  summary: z.string(),
  highlights: z.array(z.string()),
  days: z.array(DAY_STRUCTURE),
  tips: z.array(z.string()).optional(),
  model: z.string().optional(),
  focus: z.string().optional(),
  rating: z.number().min(1).max(5).optional()
});

export type ItineraryResult = z.infer<typeof itineraryResultSchema>;
export type Day = z.infer<typeof DAY_STRUCTURE>;

// AI Statistics types
export interface AIModelStats {
  modelName: string;
  totalSelections: number;
  correctGuesses: number;
  percentageCorrect: number;
}

export interface DestinationStats {
  destination: string;
  openaiCount: number;
  anthropicCount: number;
  totalCount: number;
}

export interface StatisticsData {
  aiModelStats: AIModelStats[];
  destinationStats: DestinationStats[];
  totalItineraries: number;
  recentTrends: {
    openaiTrend: number[];
    anthropicTrend: number[];
    labels: string[];
  };
}

// Weather types
export interface WeatherData {
  city: string;
  country: string;
  daily: WeatherDay[];
}

export interface WeatherDay {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  weatherCode: number;
  weatherDescription: string;
  precipitation: number;
  humidity: number;
}
