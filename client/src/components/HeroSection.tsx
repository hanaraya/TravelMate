import { Link } from 'wouter';
import { Bot, Clock, Star, Sparkles, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface HeroSectionProps {
  onGetStarted?: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  const { user } = useAuth();
  
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-teal-800/90"></div>
      </div>
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        {!user && (
          <div className="absolute top-4 right-4 space-x-4">
            <Link href="/auth">
              <a className="inline-block px-6 py-2 text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors">
                Sign In
              </a>
            </Link>
          </div>
        )}

        <div className="max-w-3xl mx-auto text-center text-white">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4 mr-2 text-yellow-300" />
            <span className="text-sm">Powered by AI Assistant Technology</span>
          </div>
          
          <h1 className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            Your AI Travel Assistant
          </h1>
          
          <p className="text-lg md:text-xl mb-8 text-gray-200">
            Just chat with our AI and get personalized itineraries from two different AI experts.
            Compare them and pick your favorite!
          </p>
          
          <div className="flex justify-center gap-4">
            <button 
              onClick={onGetStarted}
              className="inline-flex items-center bg-white text-primary px-8 py-3 rounded-lg font-medium text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl">
              <MessageSquare className="h-5 w-5 mr-2" />
              Chat with AI
            </button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8">
            <div className="flex items-center text-gray-200">
              <Bot className="h-5 w-5 mr-2" />
              <span>Dual AI Experts</span>
            </div>
            <div className="flex items-center text-gray-200">
              <Clock className="h-5 w-5 mr-2" />
              <span>Instant Plans</span>
            </div>
            <div className="flex items-center text-gray-200">
              <Star className="h-5 w-5 mr-2" />
              <span>Personalized Trips</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}