import React from 'react';
import { Link } from 'wouter';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-teal-800/90"></div>
      </div>
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="absolute top-4 right-4 space-x-4">
          <Link href="/login">
            <a className="inline-block px-6 py-2 text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors">
              Sign In
            </a>
          </Link>
          <Link href="/register">
            <a className="inline-block px-6 py-2 bg-white text-primary rounded-lg hover:bg-gray-100 transition-colors">
              Sign Up
            </a>
          </Link>
        </div>

        <div className="max-w-3xl mx-auto text-center text-white">
          <h1 className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            AI-Powered Travel Planning
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-200">
            Experience the future of travel planning with dueling AI experts.
            Let them craft your perfect itinerary.
          </p>
          <div className="flex justify-center gap-4">
            <a href="#create-itinerary" 
               className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-medium text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl">
              Plan Your Trip
            </a>
          </div>

          <div className="mt-12 flex justify-center gap-8">
            <div className="flex items-center text-gray-200">
              <i className="fas fa-robot mr-2"></i>
              <span>AI Experts</span>
            </div>
            <div className="flex items-center text-gray-200">
              <i className="fas fa-clock mr-2"></i>
              <span>Instant Plans</span>
            </div>
            <div className="flex items-center text-gray-200">
              <i className="fas fa-star mr-2"></i>
              <span>Smart Optimization</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}