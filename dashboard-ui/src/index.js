import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import './i18n';
import './index.css';
import './assets/styles/fonts.css';

// Starting React app initialization

try {
  const rootElement = document.getElementById('root');
  // Root element found
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = ReactDOM.createRoot(rootElement);
  // React root created successfully
  
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
  
  // React app rendered successfully
} catch (error) {
  // Error initializing React app - could add proper error handling
  
  // Fallback: Add visible error message to the page
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = '<h1 style="color: red; text-align: center; padding: 20px;">React Initialization Error: ' + error.message + '</h1>';
  }
}
