import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import ReactConfetti from 'react-confetti';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ItineraryCard from '@/components/ItineraryCard';
import LoadingState from '@/components/LoadingState';
import RevealModal from '@/components/RevealModal';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Itinerary } from '@shared/schema';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { BookmarkIcon, CheckIcon } from 'lucide-react';

export default function Comparison() {
  const [, params] = useRoute('/comparison/:id');
  const itineraryId = params?.id ? parseInt(params.id) : null;
  
  const [selectedModel, setSelectedModel] = useState<'openai' | 'anthropic' | null>(null);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [actualModel, setActualModel] = useState<string>('');
  const [isCorrectGuess, setIsCorrectGuess] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });
  
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if we have itinerary data in sessionStorage from direct navigation
  const [cachedItinerary, setCachedItinerary] = useState<{
    id: number;
    openAiItinerary: any;
    anthropicItinerary: any;
  } | null>(null);
  
  useEffect(() => {
    // Try to get itinerary data from sessionStorage
    const storedData = sessionStorage.getItem('generatedItineraries');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        // Check if this is the itinerary we're looking for
        if (parsedData.id === itineraryId) {
          setCachedItinerary(parsedData);
        }
      } catch (e) {
        console.error('Error parsing stored itinerary data:', e);
      }
    }
  }, [itineraryId]);

  const { data: itinerary, isLoading, error } = useQuery<Itinerary>({
    queryKey: [`/api/itineraries/${itineraryId}`],
    enabled: !!itineraryId && !cachedItinerary,
    initialData: cachedItinerary ? {
      id: cachedItinerary.id,
      openAiItinerary: cachedItinerary.openAiItinerary,
      anthropicItinerary: cachedItinerary.anthropicItinerary,
      destination: cachedItinerary.openAiItinerary.destination || 'Your Destination',
      dates: '',
      budget: '',
      travelers: '',
      interests: [],
      userId: null,
      chosenItinerary: null,
      createdAt: new Date(),
      isSaved: false,
      notes: ''
    } as Itinerary : undefined
  });
  
  const saveItineraryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/itineraries/${itineraryId}/save`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/itineraries/${itineraryId}`] });
      toast({
        title: "Success",
        description: "Itinerary saved successfully!",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to save itinerary: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  const unsaveItineraryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/itineraries/${itineraryId}/unsave`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/itineraries/${itineraryId}`] });
      toast({
        title: "Success",
        description: "Itinerary removed from saved list",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update itinerary: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const recordChoiceMutation = useMutation({
    mutationFn: async (choice: 'openai' | 'anthropic') => {
      const response = await apiRequest('POST', `/api/itineraries/${itineraryId}/choice`, { choice });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/itineraries/${itineraryId}`] });
      
      // If the user got it right, show confetti
      if (data.success && data.correct === true) {
        setShowConfetti(true);
        // Hide confetti after 5 seconds
        setTimeout(() => setShowConfetti(false), 5000);
      }
      
      // Store the actualModel from the response if available
      if (data.actualModel) {
        setActualModel(data.actualModel);
      }
      
      setIsCorrectGuess(data.correct || false);
      setShowRevealModal(true);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to record your choice: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const handleSelectItinerary = (type: 'openai' | 'anthropic') => {
    setSelectedModel(type);
    recordChoiceMutation.mutate(type);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-heading font-bold text-3xl mb-4">Your AI Itineraries</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Loading your custom AI itineraries...</p>
            </div>
            <LoadingState />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="font-heading font-bold text-3xl mb-4">Error</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {error ? `Error loading itineraries: ${error}` : 'Itinerary not found'}
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isGenerating = !itinerary.openAiItinerary || !itinerary.anthropicItinerary;
  const choiceMade = !!itinerary.chosenItinerary;
  const revealed = choiceMade;

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Confetti effect */}
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={isMobile ? 200 : 500}
          gravity={0.15}
          tweenDuration={5000}
        />
      )}
      
      <Header />
      
      <main className="flex-grow bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-md p-8 mb-12 text-center max-w-4xl mx-auto border border-gray-100">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-block bg-primary/10 text-primary font-medium px-4 py-2 rounded-full mb-4">
                <i className="fas fa-map-marked-alt mr-2"></i>
                {itinerary.destination}
              </div>
              <h2 className="font-heading font-bold text-4xl mb-4">Your AI Itineraries</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our AI experts have crafted two unique itineraries for your trip{' '}
                <span className="font-medium">from {itinerary.dates}</span>.{' '}
                {!choiceMade ? (
                  <span>
                    <strong className="text-primary">Can you guess which AI created which itinerary?</strong>{' '}
                    Compare them and make your best guess!
                  </span>
                ) : (
                  <span>You've made your guess! See how the AIs compared.</span>
                )}
              </p>
              
              {/* Save button - only visible for logged-in users and only after the choice is made */}
              {user && choiceMade && (
                <div className="mt-6">
                  {itinerary.isSaved ? (
                    <Button
                      onClick={() => unsaveItineraryMutation.mutate()}
                      variant="outline"
                      className="flex items-center gap-2 mx-auto shadow-sm"
                      disabled={unsaveItineraryMutation.isPending}
                    >
                      <CheckIcon className="h-4 w-4" />
                      Saved to Your Collection
                    </Button>
                  ) : (
                    <Button
                      onClick={() => saveItineraryMutation.mutate()}
                      variant="default"
                      className="flex items-center gap-2 mx-auto shadow-sm"
                      disabled={saveItineraryMutation.isPending}
                    >
                      <BookmarkIcon className="h-4 w-4" />
                      Save This Itinerary
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
          
          {isGenerating ? (
            <LoadingState />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mb-10">
              {/* Itinerary A - OpenAI */}
              <motion.div 
                className="flex flex-col h-full"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <ItineraryCard 
                  itinerary={itinerary.openAiItinerary as any}
                  type="openai"
                  onSelectItinerary={handleSelectItinerary}
                  revealed={choiceMade}
                />
              </motion.div>
              
              {/* Itinerary B - Anthropic */}
              <motion.div 
                className="flex flex-col h-full"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <ItineraryCard 
                  itinerary={itinerary.anthropicItinerary as any}
                  type="anthropic"
                  onSelectItinerary={handleSelectItinerary}
                  revealed={choiceMade}
                />
              </motion.div>
            </div>
          )}
          
          {!choiceMade && !isGenerating && (
            <div className="text-center mb-16">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg inline-block mb-6">
                <p className="text-amber-700 font-medium flex items-center">
                  <i className="fas fa-lightbulb text-amber-500 mr-2"></i>
                  Choose the itinerary you think is best and see which AI created it!
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
      
      <RevealModal 
        isOpen={showRevealModal} 
        onClose={() => setShowRevealModal(false)} 
        selectedModel={selectedModel}
        actualModel={actualModel}
        isCorrectGuess={isCorrectGuess}
      />
    </div>
  );
}
