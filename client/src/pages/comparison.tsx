import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import ReactConfetti from 'react-confetti';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ItineraryCard from '@/components/ItineraryCard';
import LoadingState from '@/components/LoadingState';
import RevealModal from '@/components/RevealModal';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Itinerary } from '@shared/schema';
import { useIsMobile } from '@/hooks/use-mobile';

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
      
      <main className="flex-grow bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl mb-4">Your AI Itineraries</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our AI experts have crafted two unique itineraries for your trip to{' '}
              <span className="font-medium">{itinerary.destination}</span>. 
              {!choiceMade ? (
                <span> Compare them and guess which AI created which itinerary!</span>
              ) : (
                <span> You've made your guess! See how well you did.</span>
              )}
            </p>
          </div>
          
          {isGenerating ? (
            <LoadingState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Itinerary A - OpenAI */}
              <div className="card-container flex flex-col h-full">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-t-lg">
                  <h3 className="text-xl font-semibold text-center mb-2">Itinerary A</h3>
                </div>
                <div className="flex-grow">
                  <ItineraryCard 
                    itinerary={itinerary.openAiItinerary}
                    type="openai"
                    onSelectItinerary={handleSelectItinerary}
                    revealed={choiceMade}
                  />
                </div>
              </div>
              
              {/* Itinerary B - Anthropic */}
              <div className="card-container flex flex-col h-full">
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-t-lg">
                  <h3 className="text-xl font-semibold text-center mb-2">Itinerary B</h3>
                </div>
                <div className="flex-grow">
                  <ItineraryCard 
                    itinerary={itinerary.anthropicItinerary}
                    type="anthropic"
                    onSelectItinerary={handleSelectItinerary}
                    revealed={choiceMade}
                  />
                </div>
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
