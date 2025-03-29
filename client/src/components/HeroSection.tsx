import { Link } from "wouter";
import { STOCK_IMAGES } from "@/lib/constants";

export default function HeroSection() {
  const backgroundImage = STOCK_IMAGES.destinations[0];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src={backgroundImage} 
          alt="Travel destinations background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-teal-800/80"></div>
      </div>
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-3xl mx-auto text-center text-white mb-12">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl mb-6">
            Two AI Experts. One Perfect Trip.
          </h2>
          <p className="text-lg md:text-xl mb-8">
            Experience the future of travel planning with dueling AI travel experts. 
            Get custom itineraries, compare them side-by-side, and guess which AI crafted each plan.
          </p>
          <a href="#create-itinerary" className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-heading font-medium text-lg hover:bg-gray-100 transition-colors shadow-md">
            Plan Your Trip Now
          </a>
        </div>
        
        <div className="relative mx-auto max-w-4xl bg-white p-6 rounded-xl shadow-xl">
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-6 py-2 rounded-full font-heading font-medium">
            AI Itinerary Face-Off
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            {/* Itinerary A Preview */}
            <div className="flex-1 border border-gray-200 rounded-lg p-5 bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-all duration-200 cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <i className="fas fa-robot text-xl"></i>
                </div>
                <div className="ml-3">
                  <h3 className="font-heading font-semibold text-lg">AI Expert A</h3>
                  <p className="text-sm text-gray-600">Advanced travel planning</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <i className="fas fa-star text-yellow-500 mt-1 mr-2"></i>
                  <p>Focuses on local experiences</p>
                </div>
                <div className="flex items-start">
                  <i className="fas fa-star text-yellow-500 mt-1 mr-2"></i>
                  <p>Cultural immersion expert</p>
                </div>
                <div className="flex items-start">
                  <i className="fas fa-star text-yellow-500 mt-1 mr-2"></i>
                  <p>Hidden gem discoveries</p>
                </div>
              </div>
            </div>
            
            {/* VS Element */}
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-white font-heading font-bold text-xl">
                VS
              </div>
            </div>
            
            {/* Itinerary B Preview */}
            <div className="flex-1 border border-gray-200 rounded-lg p-5 bg-gradient-to-br from-teal-50 to-white hover:shadow-md transition-all duration-200 cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white">
                  <i className="fas fa-robot text-xl"></i>
                </div>
                <div className="ml-3">
                  <h3 className="font-heading font-semibold text-lg">AI Expert B</h3>
                  <p className="text-sm text-gray-600">Strategic itinerary creation</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <i className="fas fa-star text-yellow-500 mt-1 mr-2"></i>
                  <p>Efficient time management</p>
                </div>
                <div className="flex items-start">
                  <i className="fas fa-star text-yellow-500 mt-1 mr-2"></i>
                  <p>Popular attraction expert</p>
                </div>
                <div className="flex items-start">
                  <i className="fas fa-star text-yellow-500 mt-1 mr-2"></i>
                  <p>Budget optimization</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-gray-600 mb-2">Which AI will create your perfect itinerary?</p>
            <a href="#create-itinerary" className="inline-block bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Find Out Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
