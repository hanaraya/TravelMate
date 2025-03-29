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

  const { data: itinerary, isLoading, error } = useQuery<Itinerary>({
    queryKey: [`/api/itineraries/${itineraryId}`],
    enabled: !!itineraryId,
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
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 rounded-t-2xl text-white shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
                    <i className="fas fa-robot text-9xl absolute -top-6 -right-6 transform rotate-12"></i>
                  </div>
                  <div className="relative z-10 flex items-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mr-4 shadow-inner backdrop-blur-sm">
                      <span className="text-white font-bold text-xl">A</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1">AI Expert A</h3>
                      <p className="text-white/80 text-sm">
                        {revealed ? (
                          <span className="font-medium">{itinerary.openAiItinerary?.model || "GPT-4"}</span>
                        ) : (
                          <span>Guess which AI created this itinerary</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-grow">
                  <ItineraryCard 
                    itinerary={itinerary.openAiItinerary}
                    type="openai"
                    onSelectItinerary={handleSelectItinerary}
                    revealed={choiceMade}
                  />
                </div>
              </motion.div>
              
              {/* Itinerary B - Anthropic */}
              <motion.div 
                className="flex flex-col h-full"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-5 rounded-t-2xl text-white shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
                    <i className="fas fa-brain text-9xl absolute -top-6 -right-6 transform rotate-12"></i>
                  </div>
                  <div className="relative z-10 flex items-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mr-4 shadow-inner backdrop-blur-sm">
                      <span className="text-white font-bold text-xl">B</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1">AI Expert B</h3>
                      <p className="text-white/80 text-sm">
                        {revealed ? (
                          <span className="font-medium">{itinerary.anthropicItinerary?.model || "Claude"}</span>
                        ) : (
                          <span>Guess which AI created this itinerary</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-grow">
                  <ItineraryCard 
                    itinerary={itinerary.anthropicItinerary}
                    type="anthropic"
                    onSelectItinerary={handleSelectItinerary}
                    revealed={choiceMade}
                  />
                </div>
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
      />
    </div>
  );
}
