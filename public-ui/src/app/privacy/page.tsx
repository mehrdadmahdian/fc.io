'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <main className="flex-grow mt-16">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 py-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">
              Privacy Policy
            </h1>
            
            <div className="space-y-5 text-gray-600">
              <section>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Introduction</h2>
                <p className="text-base leading-relaxed">
                  At NoName.io, we take your privacy seriously. This Privacy Policy explains how we collect, 
                  use, disclose, and safeguard your information when you use our service.
                </p>
              </section>

              <section>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Information We Collect</h2>
                <p className="mb-3">We collect information that you provide directly to us, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Account information (name, email, password)</li>
                  <li>Profile information</li>
                  <li>Content you create using our service</li>
                  <li>Communications with us</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">How We Use Your Information</h2>
                <p className="mb-3">We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process your transactions</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Communicate with you about products, services, and events</li>
                  <li>Monitor and analyze trends and usage</li>
                  <li>Detect, investigate, and prevent fraudulent transactions and unauthorized access</li>
                  <li>Personalize and improve the service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Data Security</h2>
                <p>
                  We implement appropriate technical and organizational security measures to protect your 
                  personal information. However, no security system is impenetrable and we cannot guarantee 
                  the security of our systems 100%.
                </p>
              </section>

              <section>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Your Rights</h2>
                <p className="mb-3">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your information</li>
                  <li>Object to our use of your information</li>
                  <li>Withdraw consent</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at:{' '}
                  <a href="mailto:mahdian.mhd@gmail.com" className="text-blue-600 hover:text-blue-800">
                    mahdian.mhd@gmail.com
                  </a>
                </p>
              </section>

              <section>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by 
                  posting the new Privacy Policy on this page and updating the "Last Updated" date.
                </p>
              </section>

              <p className="text-sm text-gray-500 mt-6">
                Last Updated: March 19, 2024
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 