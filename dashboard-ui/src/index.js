import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import './i18n';
import './index.css';
import './assets/styles/fonts.css';

console.log('INDEX: Starting React app initialization...');

try {
  const rootElement = document.getElementById('root');
  console.log('INDEX: Root element found:', !!rootElement);
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = ReactDOM.createRoot(rootElement);
  console.log('INDEX: React root created successfully');
  
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
  
  console.log('INDEX: React app rendered successfully');
} catch (error) {
  console.error('INDEX: Error initializing React app:', error);
  
  // Fallback: Add visible error message to the page
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = '<h1 style="color: red; text-align: center; padding: 20px;">React Initialization Error: ' + error.message + '</h1>';
  }
}
