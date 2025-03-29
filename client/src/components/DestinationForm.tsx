import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FormInput, formInputSchema } from "@shared/schema";
import { BUDGET_OPTIONS, TRAVELER_OPTIONS, INTEREST_OPTIONS } from "@/lib/constants";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

export default function DestinationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<FormInput>({
    resolver: zodResolver(formInputSchema),
    defaultValues: {
      destination: "",
      dates: "",
      budget: "",
      travelers: "",
      interests: [],
      notes: ""
    }
  });

  const onSubmit = async (data: FormInput) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest("POST", "/api/itineraries", data);
      const result = await response.json();

      toast({
        title: "Itineraries Generated!",
        description: "Your AI travel itineraries are ready to explore.",
      });

      setLocation(`/comparison/${result.id}`);
    } catch (error) {
      console.error("Error generating itineraries:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Could not generate itineraries. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="create-itinerary" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-heading font-bold text-3xl mb-4">Create Your AI Itineraries</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Enter your travel details below and let our AI experts craft two unique itineraries for you.</p>
          </div>
          
          {/* Travel Preference Form */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Destination */}
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className="fas fa-map-marker-alt text-gray-500"></i>
                            </div>
                            <Input 
                              placeholder="Where are you going?" 
                              className="pl-10"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Travel Dates */}
                  <FormField
                    control={form.control}
                    name="dates"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Travel Dates</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className="fas fa-calendar-alt text-gray-500"></i>
                            </div>
                            <Input 
                              placeholder="Jun 15, 2023 - Jun 22, 2023" 
                              className="pl-10"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Budget */}
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                <i className="fas fa-dollar-sign text-gray-500"></i>
                              </div>
                              <SelectTrigger className="pl-10">
                                <SelectValue placeholder="Select your budget range" />
                              </SelectTrigger>
                            </div>
                          </FormControl>
                          <SelectContent>
                            {BUDGET_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Travelers */}
                  <FormField
                    control={form.control}
                    name="travelers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Travelers</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                <i className="fas fa-users text-gray-500"></i>
                              </div>
                              <SelectTrigger className="pl-10">
                                <SelectValue placeholder="Number of travelers" />
                              </SelectTrigger>
                            </div>
                          </FormControl>
                          <SelectContent>
                            {TRAVELER_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Interests */}
                <FormField
                  control={form.control}
                  name="interests"
                  render={() => (
                    <FormItem>
                      <div className="mb-2">
                        <FormLabel>Travel Interests</FormLabel>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {INTEREST_OPTIONS.map((option) => (
                          <FormField
                            key={option.value}
                            control={form.control}
                            name="interests"
                            render={({ field }) => {
                              return (
                                <FormItem className="flex items-center space-x-2 space-y-0 border border-gray-300 rounded-lg p-3 hover:bg-gray-50">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(option.value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, option.value])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== option.value
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer font-normal">
                                    {option.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Additional Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any specific requests or preferences?"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="text-center">
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium shadow-sm transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">
                          <i className="fas fa-spinner"></i>
                        </span>
                        Generating...
                      </>
                    ) : (
                      "Generate AI Itineraries"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}
