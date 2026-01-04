import React, { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export default function OAuthCallback() {
  useEffect(() => {
    // Extract token from URL hash
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(window.location.search);
    
    let token = null;
    let error = null;
    let state = null;

    // Check for token in hash (OAuth implicit flow)
    if (hash && hash.includes('id_token=')) {
      const hashParams = new URLSearchParams(hash.substring(1));
      token = hashParams.get('id_token');
      state = hashParams.get('state');
      error = hashParams.get('error');
    }

    // Check for token in query params (backup)
    if (!token && !error) {
      token = urlParams.get('id_token');
      state = urlParams.get('state');
      error = urlParams.get('error');
    }

    // Verify state matches
    const storedState = localStorage.getItem('google_oauth_state');
    if (state && storedState && state !== storedState) {
      error = 'state_mismatch';
    }

    // Clean up stored state
    localStorage.removeItem('google_oauth_state');

    // Check if opened from mobile app
    const isMobileApp = Capacitor.isNativePlatform();

    if (isMobileApp) {
      // Redirect back to app using deep link
      const deepLink = error
        ? `com.q8basket.app://oauth?error=${encodeURIComponent(error)}`
        : `com.q8basket.app://oauth?token=${encodeURIComponent(token)}`;
      
      window.location.href = deepLink;
    } else {
      // For web, redirect to signin/signup page with token in URL
      const redirectUrl = error
        ? `/signin?error=${encodeURIComponent(error)}`
        : `/signin?token=${encodeURIComponent(token)}`;
      
      window.location.href = redirectUrl;
    }
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{ fontSize: '18px', color: '#333' }}>
        Processing Google authentication...
      </div>
      <div style={{ 
        width: '50px', 
        height: '50px', 
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #d32f2f',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

