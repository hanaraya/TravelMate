import RegisterForm from '@/components/auth/RegisterForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="container mx-auto px-6 md:px-8 max-w-screen-xl">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl mb-4">Create Your Account</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Sign up to start creating personalized travel itineraries with AI
            </p>
          </div>
          <RegisterForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}