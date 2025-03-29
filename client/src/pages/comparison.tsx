import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ItineraryCard from '@/components/ItineraryCard';
import LoadingState from '@/components/LoadingState';
import RevealModal from '@/components/RevealModal';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Itinerary } from '@shared/schema';

export default function Comparison() {
  const [, params] = useRoute('/comparison/:id');
  const itineraryId = params?.id ? parseInt(params.id) : null;
  
  const [selectedModel, setSelectedModel] = useState<'openai' | 'anthropic' | null>(null);
  const [showRevealModal, setShowRevealModal] = useState(false);
  
  const { toast } = useToast();

  const { data: itinerary, isLoading, error } = useQuery<Itinerary>({
    queryKey: [`/api/itineraries/${itineraryId}`],
    enabled: !!itineraryId,
  });

  const recordChoiceMutation = useMutation({
    mutationFn: async (choice: 'openai' | 'anthropic') => {
      const response = await apiRequest('POST', `/api/itineraries/${itineraryId}/choice`, { choice });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/itineraries/${itineraryId}`] });
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
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl mb-4">Your AI Itineraries</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our AI experts have crafted two unique itineraries for your trip to{' '}
              <span className="font-medium">{itinerary.destination}</span>. 
              Compare them and pick your favorite!
            </p>
          </div>
          
          {isGenerating ? (
            <LoadingState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Itinerary A */}
              <ItineraryCard 
                itinerary={itinerary.openAiItinerary}
                type="openai"
                onSelectItinerary={handleSelectItinerary}
                revealed={choiceMade}
              />
              
              {/* Itinerary B */}
              <ItineraryCard 
                itinerary={itinerary.anthropicItinerary}
                type="anthropic"
                onSelectItinerary={handleSelectItinerary}
                revealed={choiceMade}
              />
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
