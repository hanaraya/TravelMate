import { Link } from "wouter";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <i className="fas fa-route text-primary text-2xl mr-2"></i>
          <Link href="/" className="font-heading font-bold text-xl sm:text-2xl text-primary">
            Itinerary<span className="text-orange-500">AI</span>
          </Link>
        </div>
        <nav className="hidden md:flex space-x-8">
          <a href="#how-it-works" className="font-medium hover:text-primary transition-colors">
            How It Works
          </a>
          <a href="#create-itinerary" className="font-medium hover:text-primary transition-colors">
            Plan Trip
          </a>
          <a href="#testimonials" className="font-medium hover:text-primary transition-colors">
            Testimonials
          </a>
        </nav>
        <div className="flex items-center space-x-4">
          <a href="#create-itinerary" className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
            Get Started
          </a>
          <button className="md:hidden text-gray-800 text-xl">
            <i className="fas fa-bars"></i>
          </button>
        </div>
      </div>
    </header>
  );
}
