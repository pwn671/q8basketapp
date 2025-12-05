import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import store from './store/store';
import { Provider } from 'react-redux';
import { PasswordResetProvider } from './context/PasswordResetContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import AuthInitializer from './components/AuthInitializer.jsx';
import ThemeProvider from './components/theme/ThemeProvider.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { OfflineIndicator, ServiceWorkerUpdate } from './components/PWAUtils.jsx';

import './assets/styles/styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <AuthInitializer>
          <PasswordResetProvider>
            <CartProvider>
              <ThemeProvider>
                <App />
                <OfflineIndicator />
                <ServiceWorkerUpdate />
              </ThemeProvider>
            </CartProvider>
          </PasswordResetProvider>
        </AuthInitializer>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);

// ✅ Enhanced Service Worker registration for PWA
// Register service worker after app is ready to prevent white screen on first install
if ('serviceWorker' in navigator) {
  // Use a small delay to ensure app loads first, especially on first install
  const registerServiceWorker = () => {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration.scope);
        
        // Don't wait for service worker to be ready - let app load normally
        if (registration.active) {
          console.log('Service Worker is active');
        } else if (registration.installing) {
          console.log('Service Worker is installing (will activate after app loads)');
        } else if (registration.waiting) {
          console.log('Service Worker is waiting');
        }
        
        // Listen for updates (only relevant after first install)
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, notify the user
                window.dispatchEvent(new CustomEvent('sw-update-available'));
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
        // Don't block app if service worker fails - app should work without it
      });
  };

  // Register after DOM is ready, with a small delay for first install
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
      // Small delay to ensure app starts loading first
      setTimeout(registerServiceWorker, 500);
    });
  } else {
    // DOM already loaded, but still add small delay
    setTimeout(registerServiceWorker, 500);
  }

  // Listen for service worker updates
  window.addEventListener('sw-update-available', () => {
    console.log('Service Worker update available');
  });
}
