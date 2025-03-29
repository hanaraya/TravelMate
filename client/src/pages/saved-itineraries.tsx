import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Itinerary } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MapPinIcon, CalendarIcon, UsersIcon, DollarSignIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function SavedItineraries() {
  const { user, isLoading: authLoading } = useAuth();
  
  const { data: savedItineraries, isLoading, error } = useQuery<Itinerary[]>({
    queryKey: ['/api/itineraries/user/saved'],
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Login Required</h2>
              <p className="text-gray-600 mb-6">
                You need to be logged in to view your saved itineraries.
              </p>
              <Link href="/auth">
                <Button className="w-full">Log In</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-8 text-center">Your Saved Itineraries</h1>
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Error</h2>
              <p className="text-gray-600 mb-6">
                An error occurred while loading your saved itineraries.
              </p>
              <Button onClick={() => window.location.reload()} className="w-full">
                Try Again
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="mb-10 text-center">
              <h1 className="text-4xl font-bold mb-4">Your Saved Itineraries</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore your collection of saved travel plans created by AI.
              </p>
            </div>
            
            {savedItineraries && savedItineraries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedItineraries.map((itinerary) => (
                  <motion.div
                    key={itinerary.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">{itinerary.destination}</CardTitle>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-0">
                            {itinerary.chosenItinerary === 'openai' ? 'OpenAI' : 'Anthropic'}
                          </Badge>
                        </div>
                        <CardDescription>{itinerary.dates}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-4 flex-grow">
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center">
                            <UsersIcon className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{itinerary.travelers}</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSignIcon className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{itinerary.budget}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-3">
                            {itinerary.interests.slice(0, 3).map((interest, i) => (
                              <span 
                                key={i}
                                className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs"
                              >
                                {interest}
                              </span>
                            ))}
                            {itinerary.interests.length > 3 && (
                              <span className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs">
                                +{itinerary.interests.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Link href={`/comparison/${itinerary.id}`}>
                          <Button variant="default" className="w-full">View Itinerary</Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center bg-white p-10 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-4 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">No saved itineraries yet</h3>
                <p className="text-gray-500 mb-6">
                  Create new itineraries and save them to build your collection.
                </p>
                <Link href="/">
                  <Button>Create New Itinerary</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}