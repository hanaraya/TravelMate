import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import DestinationForm from "@/components/DestinationForm";
import Testimonials from "@/components/Testimonials";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <HowItWorks />
        <DestinationForm />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
