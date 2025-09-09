/**
 * React Application Entry Point
 * 
 * This file initializes the React application with all necessary providers,
 * error boundaries, and performance monitoring.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Service imports
import './services/firebaseConfig';

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './styles/index.css';

// Performance monitoring
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

// Error reporting (optional - uncomment if you have error tracking service)
// import * as Sentry from '@sentry/react';

// Initialize error tracking (uncomment if using Sentry)
/*
if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [
      new Sentry.BrowserTracing(),
    ],
    tracesSampleRate: 0.1,
    beforeSend(event) {
      // Filter out non-critical errors
      if (event.exception) {
        const error = event.exception.values[0];
        if (error && error.type === 'ChunkLoadError') {
          return null; // Don't send chunk load errors
        }
      }
      return event;
    }
  });
}
*/

// Performance monitoring function
function sendToAnalytics(metric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric);
  }
  
  // Send to analytics service in production
  if (process.env.NODE_ENV === 'production') {
    // Example: Google Analytics 4
    if (window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
      });
    }
    
    // Example: Custom analytics endpoint
    // fetch('/api/analytics/web-vitals', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(metric)
    // }).catch(console.error);
  }
}

// Measure and report Web Vitals
if (typeof window !== 'undefined') {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  
  // Send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to error tracking service
    // Sentry.captureException(event.error);
  }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to error tracking service
    // Sentry.captureException(event.reason);
  }
});

// Check for browser compatibility
function checkBrowserCompatibility() {
  const isCompatible = (
    'fetch' in window &&
    'Promise' in window &&
    'Map' in window &&
    'Set' in window &&
    'Symbol' in window &&
    'localStorage' in window &&
    'sessionStorage' in window
  );

  if (!isCompatible) {
    const message = `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 50px auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        text-align: center;
      ">
        <h1 style="color: #dc3545;">Browser Not Supported</h1>
        <p>This application requires a modern web browser with the following features:</p>
        <ul style="text-align: left; display: inline-block;">
          <li>ES6+ JavaScript support</li>
          <li>Fetch API</li>
          <li>Local Storage</li>
          <li>Modern CSS features</li>
        </ul>
        <p>Please update your browser or try using:</p>
        <ul style="text-align: left; display: inline-block;">
          <li>Chrome 60+</li>
          <li>Firefox 55+</li>
          <li>Safari 12+</li>
          <li>Edge 79+</li>
        </ul>
      </div>
    `;
    
    document.body.innerHTML = message;
    return false;
  }
  
  return true;
}

// Initialize application
function initializeApp() {
  try {
    console.log('🍳 Initializing Smart Recipe Tracker...');
    console.log('Environment:', process.env.NODE_ENV);
    
    // Check browser compatibility
    if (!checkBrowserCompatibility()) {
      return;
    }

    // Get root element
    const container = document.getElementById('root');
    if (!container) {
      throw new Error('Root element not found');
    }

    // Create React root
    const root = createRoot(container);

    // Environment-specific setup
    if (process.env.NODE_ENV === 'development') {
      console.log('🛠️ Development mode enabled');
      console.log('Available environment variables:');
      console.log('- Firebase API Key:', process.env.REACT_APP_FIREBASE_API_KEY ? '✓' : '✗');
      console.log('- Spoonacular API Key:', process.env.REACT_APP_SPOONACULAR_API_KEY ? '✓' : '✗');
    }

    // Check for required environment variables
    const requiredEnvVars = [
      'REACT_APP_FIREBASE_API_KEY',
      'REACT_APP_FIREBASE_AUTH_DOMAIN',
      'REACT_APP_FIREBASE_PROJECT_ID',
      'REACT_APP_SPOONACULAR_API_KEY'
    ];

    const missingEnvVars = requiredEnvVars.filter(
      varName => !process.env[varName]
    );

    if (missingEnvVars.length > 0) {
      console.warn('⚠️ Missing environment variables:', missingEnvVars);
      
      if (process.env.NODE_ENV === 'production') {
        const errorMessage = `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            border: 1px solid #dc3545;
            border-radius: 8px;
            text-align: center;
            background-color: #f8d7da;
            color: #721c24;
          ">
            <h1>Configuration Error</h1>
            <p>The application is missing required configuration. Please contact support.</p>
          </div>
        `;
        
        document.body.innerHTML = errorMessage;
        return;
      }
    }

    // Hide loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      setTimeout(() => {
        document.body.classList.add('app-ready');
      }, 100);
    }

    // Render React application
    root.render(<App />);

    console.log('✅ Application initialized successfully');

    // Register service worker in production
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('✅ Service Worker registered:', registration);
            
            // Handle updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              newWorker?.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 New version available');
                  // Optionally show update notification to user
                }
              });
            });
          })
          .catch((error) => {
            console.warn('❌ Service Worker registration failed:', error);
          });
      });
    }

  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    
    // Show error message to user
    const container = document.getElementById('root') || document.body;
    container.innerHTML = `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 50px auto;
        padding: 20px;
        border: 1px solid #dc3545;
        border-radius: 8px;
        text-align: center;
        background-color: #f8d7da;
        color: #721c24;
      ">
        <h1>Application Error</h1>
        <p>We're sorry, but something went wrong while loading the application.</p>
        <p>Please try refreshing the page. If the problem persists, please contact support.</p>
        <button onclick="window.location.reload()" style="
          background: #dc3545;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 10px;
        ">
          Refresh Page
        </button>
        ${process.env.NODE_ENV === 'development' ? `
          <details style="margin-top: 20px; text-align: left;">
            <summary>Error Details (Development Only)</summary>
            <pre style="background: #fff; padding: 10px; border-radius: 4px; overflow: auto;">
${error.stack || error.message}
            </pre>
          </details>
        ` : ''}
      </div>
    `;
    
    // Send error to tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error tracking service
      // Sentry.captureException(error);
    }
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Hot module replacement for development
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./App', () => {
    console.log('🔄 Hot reloading App component');
    const NextApp = require('./App').default;
    const container = document.getElementById('root');
    const root = createRoot(container);
    root.render(<NextApp />);
  });
}

// Export for testing
export { initializeApp, sendToAnalytics };