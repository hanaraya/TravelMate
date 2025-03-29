export default function Testimonials() {
  return (
    <section id="testimonials" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl mb-4">What Travelers Are Saying</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Real experiences from travelers who used our AI itinerary planning service.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Testimonial 1 */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80" 
                  alt="Sarah J." className="w-full h-full object-cover" />
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Sarah J.</h4>
                <p className="text-sm text-gray-600">Tokyo Trip</p>
              </div>
            </div>
            <div className="flex mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <i key={star} className="fas fa-star text-yellow-400"></i>
              ))}
            </div>
            <p className="text-gray-800">
              "The AI comparison was fascinating! I chose what I thought was the 'human-like' itinerary but it was actually GPT-4. It created the perfect balance of popular spots and local gems for our Tokyo trip."
            </p>
          </div>
          
          {/* Testimonial 2 */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80" 
                  alt="Michael T." className="w-full h-full object-cover" />
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Michael T.</h4>
                <p className="text-sm text-gray-600">Barcelona Adventure</p>
              </div>
            </div>
            <div className="flex mb-4">
              {[1, 2, 3, 4].map((star) => (
                <i key={star} className="fas fa-star text-yellow-400"></i>
              ))}
              <i className="fas fa-star-half-alt text-yellow-400"></i>
            </div>
            <p className="text-gray-800">
              "Saved me hours of research! The side-by-side comparison made it easy to pick the perfect itinerary for our Barcelona trip. Loved the local food recommendations from Claude's itinerary."
            </p>
          </div>
          
          {/* Testimonial 3 */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80" 
                  alt="Emma L." className="w-full h-full object-cover" />
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Emma L.</h4>
                <p className="text-sm text-gray-600">Bali Family Vacation</p>
              </div>
            </div>
            <div className="flex mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <i key={star} className="fas fa-star text-yellow-400"></i>
              ))}
            </div>
            <p className="text-gray-800">
              "As a family of 5, planning our Bali trip was overwhelming until we found ItineraryAI. The AI-generated options were amazingly detailed, and my kids loved guessing which AI made which plan!"
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
