'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function Home() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  // Start with undefined to indicate loading state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>(undefined);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // Show nothing while checking auth status
  if (isLoggedIn === undefined) {
    return (
      <div className="loading-container">
        <span className="loading-spinner"></span>
      </div>
    )
  }

  return (
    <>
      <Navigation />
      <main className={`min-h-screen bg-gray-50 transition-opacity duration-300 ${
        isMenuOpen ? 'opacity-20' : 'opacity-100'
      }`}>
        {/* Hero Section */}
        <motion.section 
          className="relative h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50"
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <div className="max-w-[1200px] mx-auto px-8 md:px-12">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
                Master Any Subject with Smart Flashcards
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Enhance your learning experience with our AI-powered flashcard system
              </p>
              {isLoggedIn ? (
            <Link 
              href="/dashboard" 
              className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Go to Dashboard
              <svg 
                className="ml-2 w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          ) : (
            <Link 
              href="/dashboard" 
              className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start Learning for Free
              <svg 
                className="ml-2 w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          )}
              <p className="mt-4 text-sm text-gray-500">No credit card required • Free forever plan available</p>
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-6 sm:px-8">
            <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
              Features that Make Learning Easier
            </h2>
            <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              {/* AI-Powered Learning */}
              <div className="text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-brain text-2xl text-blue-600"></i>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  AI-Powered Learning
                </h3>
                <p className="text-gray-600">
                  Our AI analyzes your performance and adapts to your learning style
                </p>
              </div>

              {/* Spaced Repetition */}
              <div className="text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-clock text-2xl text-blue-600"></i>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  Spaced Repetition
                </h3>
                <p className="text-gray-600">
                  Review cards at optimal intervals to maximize retention
                </p>
              </div>

              {/* Progress Tracking */}
              <div className="text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-chart-line text-2xl text-blue-600"></i>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  Progress Tracking
                </h3>
                <p className="text-gray-600">
                  Monitor your learning progress with detailed analytics
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-gray-50">
          <div className="max-w-[1200px] mx-auto px-8 md:px-12">
            <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
              How It Works
            </h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Create Your Flashcards
                </h3>
                <p className="text-gray-600 text-lg">
                  Easily create and organize your flashcards with our intuitive interface.
                  Add text, images, and even audio to make your cards more engaging.
                </p>
                <a 
                  href="#" 
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Learn more 
                  <svg 
                    className="ml-2 w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
              <div className="bg-gray-200 h-80 rounded-lg">
                {/* Placeholder for image/illustration */}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
} 