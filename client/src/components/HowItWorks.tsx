export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Our AI travel experts compete to create your perfect itinerary based on your preferences.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="text-center p-6 rounded-lg border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-primary text-2xl mx-auto mb-4">
              <i className="fas fa-clipboard-list"></i>
            </div>
            <h3 className="font-heading font-semibold text-xl mb-3">Share Your Preferences</h3>
            <p className="text-gray-600">Tell us about your destination, dates, budget, and travel style.</p>
          </div>
          
          {/* Step 2 */}
          <div className="text-center p-6 rounded-lg border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-primary text-2xl mx-auto mb-4">
              <i className="fas fa-robot"></i>
            </div>
            <h3 className="font-heading font-semibold text-xl mb-3">AI Creates Itineraries</h3>
            <p className="text-gray-600">Two AI experts craft custom itineraries based on your input.</p>
          </div>
          
          {/* Step 3 */}
          <div className="text-center p-6 rounded-lg border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-primary text-2xl mx-auto mb-4">
              <i className="fas fa-check-circle"></i>
            </div>
            <h3 className="font-heading font-semibold text-xl mb-3">Compare & Choose</h3>
            <p className="text-gray-600">Review both itineraries side-by-side and pick your favorite.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
