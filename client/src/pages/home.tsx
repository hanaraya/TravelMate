import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import ChatInterface from "@/components/ChatInterface";
import Testimonials from "@/components/Testimonials";
import { ItineraryResult } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const [showChat, setShowChat] = useState(false);

  // Function to handle when itineraries are generated
  const handleItinerariesGenerated = (
    openAiItinerary: ItineraryResult,
    anthropicItinerary: ItineraryResult,
    itineraryId: number
  ) => {
    // Store itineraries in session storage for the comparison page
    sessionStorage.setItem(
      "generatedItineraries",
      JSON.stringify({
        id: itineraryId,
        openAiItinerary,
        anthropicItinerary,
      })
    );
    
    // Navigate to the comparison page
    setLocation(`/comparison/${itineraryId}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection onGetStarted={() => setShowChat(true)} />
        <HowItWorks />
        
        {/* Chat interface with conditional display based on user interaction */}
        <section id="chat-section" className="py-12 px-4">
          <div className="container mx-auto">
            {showChat ? (
              <div className="bg-background rounded-xl shadow-lg border h-[600px] overflow-hidden">
                <ChatInterface onItinerariesGenerated={handleItinerariesGenerated} />
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Ready to plan your next adventure?</h2>
                <button
                  onClick={() => setShowChat(true)}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Start Planning
                </button>
              </div>
            )}
          </div>
        </section>
        
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
