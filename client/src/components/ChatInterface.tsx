import { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PromptInput, ItineraryResult } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Avatar } from "@/components/ui/avatar";
import { Loader2, Send, User2 } from "lucide-react";
import LoadingState from "./LoadingState";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatInterfaceProps {
  onItinerariesGenerated?: (
    openAiItinerary: ItineraryResult, 
    anthropicItinerary: ItineraryResult,
    itineraryId: number
  ) => void;
}

const EXAMPLE_PROMPTS = [
  "A relaxing beach vacation in Bali for a couple",
  "Family trip to Disney World with young kids",
  "Backpacking adventure in South America for 2 weeks",
  "Week-long food tour in Tokyo",
  "Cultural exploration of Egypt with historical sites"
];

export default function ChatInterface({ onItinerariesGenerated }: ChatInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your travel planning assistant. Where would you like to go? Describe your ideal trip in a few sentences."
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formSchema = z.object({
    prompt: z.string().min(5, "Please describe your travel plans in more detail"),
  });

  const form = useForm<PromptInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const onSubmit = async (data: PromptInput) => {
    try {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: data.prompt,
      };
      
      setMessages((prev) => [...prev, userMessage]);
      form.reset();
      
      // Show processing message
      setIsLoading(true);
      
      // Call the API to generate itineraries
      const response = await apiRequest("POST", "/api/generate-itinerary", data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate itineraries");
      }
      
      const result = await response.json();
      
      // Add the assistant response
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I've created two travel itineraries based on your request! Take a look at both options and see which one you prefer.",
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Notify parent component that itineraries are ready
      if (onItinerariesGenerated) {
        onItinerariesGenerated(
          result.openAiItinerary, 
          result.anthropicItinerary,
          result.id
        );
      }
    } catch (error) {
      console.error("Error generating itineraries:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate itineraries",
        variant: "destructive",
      });
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm sorry, I couldn't generate your itineraries. Please try again with more details about your trip.",
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const setExamplePrompt = (prompt: string) => {
    form.setValue("prompt", prompt);
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      <div className="bg-card rounded-t-lg shadow-sm p-4 border-b">
        <h3 className="text-lg font-semibold">Travel Assistant</h3>
        <p className="text-sm text-muted-foreground">
          Describe your ideal trip and I'll create personalized itineraries for you
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex gap-3 max-w-[80%] ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <Avatar className={`h-8 w-8 ${message.role === "user" ? "bg-primary" : "bg-secondary"}`}>
                {message.role === "user" ? (
                  user ? (
                    <span className="text-xs font-bold">{user.username.substring(0, 2).toUpperCase()}</span>
                  ) : (
                    <User2 className="h-4 w-4" />
                  )
                ) : (
                  <span className="text-xs font-bold">AI</span>
                )}
              </Avatar>
              <div
                className={`rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
        
        {isLoading && (
          <div className="flex justify-center my-4">
            <LoadingState message="Creating your personalized travel itineraries..." />
          </div>
        )}
      </div>
      
      <div className="p-4 bg-card rounded-b-lg border-t">
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-2">Try one of these examples:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setExamplePrompt(prompt)}
                className="text-xs bg-muted py-1 px-2 rounded-full hover:bg-muted/80 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        {...field}
                        placeholder="Describe your ideal trip (destination, dates, budget, interests...)"
                        className="min-h-[80px] pr-12 resize-none"
                        disabled={isLoading}
                      />
                      <Button
                        size="icon"
                        type="submit"
                        className="absolute bottom-2 right-2"
                        disabled={isLoading}
                        variant="ghost"
                      >
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Send className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  );
}