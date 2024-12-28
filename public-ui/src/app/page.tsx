'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  if (!mounted) {
    return null;
  }

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navigation />
      <main className={`min-h-screen transition-opacity duration-300 ${
        isMenuOpen ? 'opacity-20' : 'opacity-100'
      }`}>
        {/* Hero Section */}
        <motion.section 
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"/>
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"/>
            <div className="absolute top-40 right-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"/>
          </div>

          <div className="relative max-w-7xl mx-auto px-8 md:px-12">
            <motion.div 
              className="text-center"
              variants={fadeInUp}
            >
              <motion.h1 
                className="text-6xl md:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
                variants={fadeInUp}
              >
                Learn Smarter,<br/>Not Harder
              </motion.h1>
              <motion.p 
                className="text-2xl text-gray-700 mb-12 max-w-3xl mx-auto"
                variants={fadeInUp}
              >
                Revolutionize your learning experience with AI-powered flashcards that adapt to your unique style
              </motion.p>
              
              <motion.div variants={fadeInUp}>
                {isLoggedIn ? (
                  <Link href="/dashboard" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600">
                    <span>Go to Dashboard</span>
                    <svg className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                    </svg>
                  </Link>
                ) : (
                  <Link 
                    href="/dashboard" 
                    className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white text-lg transition-all duration-300 
                      bg-gradient-to-r from-blue-600 to-purple-600 
                      hover:from-blue-700 hover:to-purple-700 
                      rounded-full shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)]
                      hover:shadow-[0_10px_40px_rgba(8,_112,_184,_0.9)]
                      transform hover:-translate-y-1
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                  >
                    <span>Start Your Journey</span>
                    <svg className="ml-3 w-6 h-6 transition-transform duration-300 group-hover:translate-x-2" 
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                    </svg>
                  </Link>
                )}
                <p className="mt-6 text-sm text-gray-600">No credit card required • Free forever plan available</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Social Proof Section - NEW */}
        <section className="py-20 bg-white/80 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <p className="text-blue-600 font-semibold mb-4">TRUSTED BY LEARNERS WORLDWIDE</p>
              <div className="flex flex-wrap justify-center items-center gap-12 opacity-70">
                {/* Add your company/university logos here */}
                {['Harvard', 'Stanford', 'MIT', 'Oxford'].map((uni, i) => (
                  <div key={i} className="text-2xl font-bold text-gray-400">{uni}</div>
                ))}
              </div>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8 md:gap-12 mt-16">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="text-center p-8 md:p-10 rounded-2xl bg-white 
                    shadow-xl hover:shadow-2xl transition-shadow duration-300
                    border border-gray-100"
                >
                  <h3 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent 
                    bg-gradient-to-r from-blue-600 to-purple-600 mb-4">{stat.value}</h3>
                  <p className="text-gray-600 text-lg">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 md:py-40 relative overflow-hidden">
          <motion.div 
            className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-bold text-center mb-20 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Supercharge Your Learning
            </h2>
            <div className="grid lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="relative group p-2"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  // transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 transform rotate-2 rounded-xl transition-transform group-hover:rotate-1"/>
                  <div className="relative p-8 bg-white rounded-xl shadow-lg transform transition-transform group-hover:-translate-y-1">
                    <div className="w-14 h-14 mb-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Interactive Demo Section - NEW */}
        <section className="py-32 md:py-40 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5" />
          <motion.div
            className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-2xl shadow-2xl"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="space-y-4">
                    {demoCards.map((card, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.2 }}
                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
                      >
                        <h4 className="font-semibold">{card.question}</h4>
                        <p className="text-gray-600 text-sm mt-2">{card.answer}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Experience the Future of Learning
                </h2>
                <p className="text-xl text-gray-600">
                  Our interactive flashcards bring your study material to life. With rich media support,
                  AI-powered suggestions, and real-time progress tracking, learning becomes an immersive experience.
                </p>
                <div className="space-y-4">
                  {features2.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: 20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Testimonials Section - NEW */}
        <section className="py-32 bg-white">
          <motion.div
            className="max-w-7xl mx-auto px-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-center mb-20 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              What Our Users Say
            </h2>
            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="p-8 md:p-10 rounded-2xl bg-gradient-to-br from-white to-gray-50 
                    shadow-xl hover:shadow-2xl transition-shadow duration-300
                    border border-gray-100"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.title}</p>
                    </div>
                  </div>
                  <p className="text-gray-600">{testimonial.quote}</p>
                  <div className="flex gap-1 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* CTA Section - NEW */}
        <section className="py-32 md:py-40 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-10" />
          <motion.div
            className="max-w-4xl mx-auto px-8 text-center space-y-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">Ready to Transform Your Learning?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of successful learners who have already revolutionized their study habits.
            </p>
            <div className="pt-4">
              <Link
                href="/dashboard"
                className="group relative inline-flex items-center justify-center 
                  px-10 py-5 font-bold text-white text-lg
                  transition-all duration-300 
                  bg-gradient-to-r from-blue-600 to-purple-600 
                  hover:from-blue-700 hover:to-purple-700 
                  rounded-full
                  shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)]
                  hover:shadow-[0_10px_40px_rgba(8,_112,_184,_0.9)]
                  transform hover:-translate-y-1
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
              >
                <span className="relative">Get Started Now</span>
                <svg 
                  className="ml-3 w-6 h-6 transition-transform duration-300 group-hover:translate-x-2" 
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
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

const features = [
  {
    title: "AI-Powered Learning",
    description: "Our advanced AI adapts to your learning style and optimizes your study schedule for maximum retention.",
    icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
    </svg>
  },
  {
    title: "Smart Repetition",
    description: "Review cards at scientifically optimized intervals using our advanced spaced repetition algorithm.",
    icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  },
  {
    title: "Deep Analytics",
    description: "Track your progress with detailed insights and visualizations of your learning journey.",
    icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
    </svg>
  }
]; 

const stats = [
  { value: "1M+", label: "Active Users" },
  { value: "50M+", label: "Flashcards Created" },
  { value: "99%", label: "Success Rate" },
];

const demoCards = [
  { question: "What is spaced repetition?", answer: "A learning technique that incorporates increasing intervals of time between reviews of previously learned material." },
  { question: "How does AI enhance learning?", answer: "AI analyzes your performance patterns and adjusts review schedules for optimal retention." },
  { question: "What makes effective flashcards?", answer: "Clear, concise content with visual elements and meaningful connections." },
];

const features2 = [
  {
    title: "Rich Media Support",
    description: "Add images, audio, and video to your cards",
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
  },
  // Add more features...
];

const testimonials = [
  {
    name: "Sarah Johnson",
    title: "Medical Student",
    quote: "This platform transformed how I study for medical school. The AI-powered suggestions are incredibly helpful!"
  },
  {
    name: "David Chen",
    title: "Software Engineer",
    quote: "The spaced repetition system helped me master programming concepts in record time."
  },
  {
    name: "Emily Williams",
    title: "Language Learner",
    quote: "I've tried many flashcard apps, but this one's interactive features make learning so much more engaging."
  },
]; 