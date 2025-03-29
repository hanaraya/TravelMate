import { Link, useLocation } from "wouter";
import UserProfileDropdown from "@/components/auth/UserProfileDropdown";
import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const [location] = useLocation();
  const isHomePage = location === "/";
  
  // Check if user is authenticated
  const { data: user } = useQuery({
    queryKey: ['/api/users/me'],
    retry: false,
    refetchOnWindowFocus: false,
  });
  
  const isAuthenticated = !!user;
  
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <i className="fas fa-plane-departure text-primary text-2xl mr-2"></i>
          <Link href="/" className="font-heading font-bold text-xl sm:text-2xl text-primary">
            <span className="text-orange-500">AI</span>tinerary
          </Link>
        </div>
        
        <nav className="hidden md:flex space-x-8">
          {isHomePage ? (
            <>
              <a href="#how-it-works" className="font-medium hover:text-primary transition-colors">
                How It Works
              </a>
              <a href="#create-itinerary" className="font-medium hover:text-primary transition-colors">
                Plan Trip
              </a>
              <a href="#testimonials" className="font-medium hover:text-primary transition-colors">
                Testimonials
              </a>
            </>
          ) : (
            <>
              <Link href="/" className="font-medium hover:text-primary transition-colors">
                Home
              </Link>
              {isAuthenticated && (
                <Link href="/profile" className="font-medium hover:text-primary transition-colors">
                  My Account
                </Link>
              )}
            </>
          )}
        </nav>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <UserProfileDropdown />
          ) : (
            <>
              {isHomePage ? (
                <a 
                  href="#create-itinerary" 
                  className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Get Started
                </a>
              ) : (
                <Link 
                  href="/auth" 
                  className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Sign In
                </Link>
              )}
            </>
          )}
          
          <button className="md:hidden text-gray-800 text-xl">
            <i className="fas fa-bars"></i>
          </button>
        </div>
      </div>
    </header>
  );
}
