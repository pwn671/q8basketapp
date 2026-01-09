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
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';

import './assets/styles/styles.css';

// Initialize Google Auth ONLY for mobile platforms
if (Capacitor.isNativePlatform()) {
  console.log('========================================');
  console.log('🚀 [INIT] Initializing Google Auth for mobile...');
  console.log('========================================');
  
  const webClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  if (!webClientId) {
    console.error('❌ [INIT] VITE_GOOGLE_CLIENT_ID is not set! Google Sign-In will not work.');
  } else {
    console.log('✅ [INIT] Web Client ID found:', webClientId.substring(0, 30) + '...');
    console.log('📋 [INIT] Full Web Client ID length:', webClientId.length);
  }
  
  console.log('📋 [INIT] Environment check:', {
    hasWebClientId: !!webClientId,
    hasMobileClientId: !!import.meta.env.VITE_GOOGLE_CLIENT_ID_MOBILE,
    platform: Capacitor.getPlatform()
  });
  
  try {
    console.log('🔄 [INIT] Calling GoogleAuth.initialize()...');
    GoogleAuth.initialize({
      clientId: webClientId,  // ✅ Use Web Client ID (required by plugin)
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    });
    console.log('✅ [INIT] GoogleAuth.initialize() completed successfully');
    console.log('📋 [INIT] Configuration:', {
      clientId: webClientId.substring(0, 30) + '...',
      scopes: ['profile', 'email'],
      grantOfflineAccess: true
    });
  } catch (initError) {
    console.error('❌ [INIT] Failed to initialize GoogleAuth:', initError);
    console.error('❌ [INIT] Error details:', {
      message: initError?.message,
      stack: initError?.stack,
      name: initError?.name,
      code: initError?.code
    });
  }
  
  console.log('========================================');
}

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
        
        // Don't wait for service worker to be ready - let app load normally
        if (registration.active) {
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
  });
}
