import LoginForm from '@/components/auth/LoginForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="container mx-auto px-6 md:px-8 max-w-screen-xl">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl mb-4">Login to Your Account</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Access your saved itineraries and continue planning your adventures
            </p>
          </div>
          <LoginForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}