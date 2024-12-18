export default function Footer() {
  return (
    <footer className="w-full py-6 mt-auto border-t border-gray-100">
      <div className="flex flex-col items-center max-w-7xl mx-auto px-4">
        {/* Links */}
        <div className="flex gap-8">
          <a 
            href="/privacy" 
            className="text-[13px] text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            Privacy Policy
          </a>
          <a 
            href="/terms" 
            className="text-[13px] text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            Terms of Service
          </a>
          <a 
            href="/contact" 
            className="text-[13px] text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            Contact
          </a>
          <a 
            href="https://twitter.com" 
            className="text-[13px] text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            Twitter
          </a>
        </div>

        {/* Copyright */}
        <p className="mt-3 text-[12px] text-gray-400">
          © 2024 "No Name Defined Yet Website". All rights reserved.
        </p>
      </div>
    </footer>
  );
} 