import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Check if user is already authenticated
  const { user, isLoading } = useAuth();
  
  // Redirect to home if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      setLocation('/');
    }
  }, [user, isLoading, setLocation]);
  
  // If still loading or user is authenticated, don't render anything yet
  if (isLoading || user) {
    return null;
  }
  
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Auth Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 lg:p-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Welcome to AItinerary</h1>
            <p className="text-gray-500">
              {activeTab === 'login' 
                ? 'Sign in to your account to continue' 
                : 'Create an account to get started'}
            </p>
          </div>
          
          <Tabs 
            defaultValue="login" 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as 'login' | 'register')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            
            <TabsContent value="register">
              <RegisterForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Right Side - Hero Image & Info */}
      <div className="hidden md:flex md:w-1/2 bg-primary/5 flex-col justify-center p-12 relative">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Your AI Travel Agent</h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-2 rounded-full mt-1">
                <i className="fas fa-robot text-primary"></i>
              </div>
              <div>
                <h3 className="font-semibold text-lg">AI-Powered Itineraries</h3>
                <p className="text-gray-600">
                  Experience the power of multiple AI models creating personalized travel plans just for you.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-2 rounded-full mt-1">
                <i className="fas fa-map-marked-alt text-primary"></i>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Compare Different Approaches</h3>
                <p className="text-gray-600">
                  See how different AI models handle your travel preferences and pick your favorite.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-2 rounded-full mt-1">
                <i className="fas fa-bookmark text-primary"></i>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Save Your Favorites</h3>
                <p className="text-gray-600">
                  Create an account to save your favorite itineraries and access them anytime.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 p-4 bg-white rounded-lg shadow-md">
            <p className="italic text-gray-600">
              "AItinerary transformed our vacation planning. The AI-generated itinerary saved us hours of research and gave us ideas we wouldn't have found on our own!"
            </p>
            <div className="mt-4 flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">JS</div>
              <div className="ml-3">
                <p className="font-medium">Jane Smith</p>
                <p className="text-sm text-gray-500">Travel Enthusiast</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}