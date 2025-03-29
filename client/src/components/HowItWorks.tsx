import { MessageSquare, Sparkles, ThumbsUp } from "lucide-react";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Our AI travel assistant makes planning your perfect trip as easy as having a conversation.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="text-center p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h3 className="font-heading font-semibold text-xl mb-3">Chat with AI</h3>
            <p className="text-gray-600">Simply describe your trip in conversational language, just like chatting with a travel agent.</p>
          </div>
          
          {/* Step 2 */}
          <div className="text-center p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="font-heading font-semibold text-xl mb-3">Dual AI Magic</h3>
            <p className="text-gray-600">Two different AI travel experts craft personalized itineraries based on your conversation.</p>
          </div>
          
          {/* Step 3 */}
          <div className="text-center p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
              <ThumbsUp className="h-8 w-8" />
            </div>
            <h3 className="font-heading font-semibold text-xl mb-3">Compare & Pick</h3>
            <p className="text-gray-600">Review both AI-generated itineraries side-by-side and choose your favorite plan.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
