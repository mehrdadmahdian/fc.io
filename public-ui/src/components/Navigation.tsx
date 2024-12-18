'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { authenticated } from '@/utils/auth';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(authenticated);
    
    const handleStorageChange = () => {
      setIsAuthenticated(authenticated);
    };
  
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      <nav className="fixed w-full bg-white z-50">
        <div className="max-w-[1200px] mx-auto px-8 md:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Title */}
            <Link 
              href="/" 
              className="text-[22px] font-bold text-[#4339CA]"
            >
              NoName.io
            </Link>

            {/* Desktop Navigation Links - explicitly hide on small screens */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How it Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
            </div>

            {/* Desktop Auth Buttons - explicitly hide on small screens */}
            <div className="hidden lg:flex items-center">
              {isAuthenticated ? (
                <a 
                  href="/dashboard" 
                  className="text-gray-600 hover:text-gray-900 px-4 py-2"
                >
                  Dashboard
                </a>
              ) : (
                <a 
                  href="/dashboard/auth/login" 
                  className="text-gray-600 hover:text-gray-900 px-4 py-2"
                >
                  Log in
                </a>
              )}
            </div>

            {/* Mobile menu button - DEBUGGING VERSION */}
            <div className="block lg:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center w-10 h-10 bg-white"
                aria-label="Toggle menu"
              >
                <svg 
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu - improved styling */}
          <div 
            className={`lg:hidden transition-all duration-300 ease-in-out bg-white shadow-lg ${
              isMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="py-4 space-y-2 border-t border-gray-100">
              <a 
                href="#features" 
                className="block w-full px-4 py-3 text-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                className="block w-full px-4 py-3 text-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                How it Works
              </a>
              <a 
                href="#pricing" 
                className="block w-full px-4 py-3 text-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                Pricing
              </a>
              
              <div className="my-3 border-t border-gray-200"></div>
              
              {isAuthenticated ? (
                <a 
                  href="/dashboard" 
                  className="block w-full px-4 py-3 text-lg font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                >
                  Dashboard
                </a>
              ) : (
                <a 
                  href="/dashboard/auth/login" 
                  className="block w-full px-4 py-3 text-lg font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                >
                  Log in
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}