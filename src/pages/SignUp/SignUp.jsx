import React, { useState, useEffect, useRef } from 'react';
import styles from './SignUp.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../features/auth/authThunks';
import { resetAuthState } from '../../features/auth/authSlice';
import { toast, ToastContainer } from 'react-toastify';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { Capacitor } from '@capacitor/core';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { usePasswordReset } from '../../context/PasswordResetContext.jsx';
import { formatValidationErrors } from '../../utils/errorHandler';
import useLockBodyScrollOnApp from '../../hooks/useLockBodyScrollOnApp'; // ✅ your new hook
import addressService from '../../services/addressService';
import config from '../../config/env';

export default function SignUp({ onSignIn, onRegistrationSuccess }) {
  const isMobileApp = Capacitor.isNativePlatform();
  // Use mobile client ID for mobile app, web client ID for web
  const GOOGLE_CLIENT_ID = isMobileApp 
    ? (import.meta.env.VITE_GOOGLE_CLIENT_ID_MOBILE || import.meta.env.VITE_GOOGLE_CLIENT_ID)
    : import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [alternativeNumber, setAlternativeNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState(''); // store city ID
  const [cities, setCities] = useState([]); // store city options  const [address, setAddress] = useState('');
  const [agree, setAgree] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { loading, error, isRegistered, user, token } = useSelector((state) => state.auth);
  const { setResetEmail } = usePasswordReset();  // Get setter from PasswordResetContext
  const googleLoginRef = useRef(null);
  const navigate = useNavigate();
  const lastErrorRef = useRef(null);

  const dispatch = useDispatch();

  // Use config for API URLs (consistent with other pages like Category.jsx, SearchPage.jsx)
  const BASE_URL = config.BACKEND_URL; // For auth endpoints and images

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Validation: Full Name
    if (!fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    // ✅ Validation: Mobile Number
    if (!mobileNumber.trim()) {
      toast.error('Mobile number is required');
      return;
    }

    // ✅ Validation: Email
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // ✅ Validation: City
    if (!city) {
      toast.error('Please select a city');
      return;
    }

    // ✅ Validation: Address
    if (!address.trim()) {
      toast.error('Address is required');
      return;
    }

    // ✅ Validation: Password
    if (!password.trim()) {
      toast.error('Password is required');
      return;
    }


    // ✅ Validation: Agree checkbox
    if (!agree) {
      toast.error('Please agree to the terms and conditions');
      return;
    }
    setResetEmail(email);

    const payload = {
      fullname: fullName,
      email,
      phone: mobileNumber,
      alternative_number: alternativeNumber,
      password,
      addresses: [
        {
          address,
          apartment_building: address,
          landmark: address,
          location_id: parseInt(city),
          latitude: 23.55555,
          longitude: -73.1245,
          is_default: true,
        },
      ],
    };

    dispatch(registerUser(payload));
  };


  function togglePasswordVisibility() {
    setShowPassword(!showPassword);
  }

  useEffect(() => {
    if (error) {
      // The error.message is already formatted by parseApiResponse
      // If error.validationErrors exists, we can format it, otherwise use error.message
      let errorMessage = error.message;

      // If no message but has validationErrors, format them
      if (!errorMessage && error.validationErrors) {
        errorMessage = formatValidationErrors(error.validationErrors);
      }

      // Fallback to generic error string if needed
      if (!errorMessage) {
        errorMessage = typeof error === 'string' ? error : 'Registration failed. Please try again.';
      }

      // Prevent duplicate error toasts
      if (lastErrorRef.current !== errorMessage) {
        lastErrorRef.current = errorMessage;
        toast.error(errorMessage);
      }
    } else {
      // Reset when error is cleared
      lastErrorRef.current = null;
    }
  }, [error]);

  useEffect(() => {
    if (isRegistered) {
      // Reset the flag, but don't show toast here - let the redirect useEffect handle it
      setTimeout(() => {
        // Call onRegistrationSuccess if provided, otherwise fallback to onSignIn
        const callback = onRegistrationSuccess || onSignIn;
        if (callback) callback();
        dispatch(resetAuthState()); // 🧹 Reset the flag
      }, 1500);
    }
  }, [isRegistered, onRegistrationSuccess, onSignIn, dispatch]);

  // Fetch cities from /front/locations
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const result = await addressService.fetchLocations();
        
        if (result.success && Array.isArray(result.data)) {
          setCities(result.data);
        } else {
          toast.error(result.error || "Failed to load cities.");
        }
      } catch (err) {
        console.error("Error fetching cities:", err);
        toast.error("Error fetching city list: " + (err.message || "Unknown error"));
      }
    };
    fetchCities();
  }, []);

  useLockBodyScrollOnApp();

  // ✅ Handle OAuth redirect callback for mobile app
  useEffect(() => {
    const isCapacitor = Capacitor.isNativePlatform();
    if (!isCapacitor) return; // Only handle for mobile app

    // Check for OAuth callback in URL fragment (id_token response)
    const hash = window.location.hash;
    if (hash && hash.includes('id_token=')) {
      try {
        // Extract id_token from URL fragment
        const params = new URLSearchParams(hash.substring(1)); // Remove # and parse
        const idToken = params.get('id_token');
        const state = params.get('state');
        const error = params.get('error');

        if (error) {
          toast.error(`Google signup failed: ${error}`);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }

        if (idToken) {
          // Verify state matches what we stored
          const storedState = localStorage.getItem('google_oauth_state');
          if (state && storedState && state !== storedState) {
            toast.error("Security error: State mismatch");
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
          }

          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          localStorage.removeItem('google_oauth_state');

          // Process the token as if it came from GoogleLogin component
          handleGoogleSignup({ credential: idToken });
        }
      } catch (err) {
        toast.error("Failed to process Google signup callback");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []); // Run once on mount

  // ✅ Redirect on successful login
  useEffect(() => {
    if (user && token && !loading) {
      // Set flag to show offer popup after login
      localStorage.setItem('justLoggedIn', 'true');
      toast.success("Signup successful! Redirecting...");
      const timer = setTimeout(() => navigate("/home"), 1500);
      return () => clearTimeout(timer);
    }
  }, [user, token, loading, navigate]);

  // ✅ Handle Google Signup
  const handleGoogleSignup = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { email, name, sub: googleId, picture } = decoded;

      const body = {
        provider: 'google',
        id_token: credentialResponse.credential,
        name,
        email,
        googleId,
        avatar: picture
      };

      const res = await fetch(`${BASE_URL}/user/social/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.status && data.data) {
        // Dispatch loginUser.fulfilled action to save token and user (same as normal login)
        dispatch({
          type: 'auth/loginUser/fulfilled',
          payload: {
            user: data.data.user,
            token: data.data.token,
            refreshToken: data.data.refreshToken || null
          }
        });

        // Store profile completion info if needed
        if (data.data.needs_profile_completion) {
          localStorage.setItem('needsProfileCompletion', 'true');
          if (data.data.missing && Array.isArray(data.data.missing)) {
            localStorage.setItem('missingFields', JSON.stringify(data.data.missing));
          }
        } else {
          localStorage.removeItem('needsProfileCompletion');
          localStorage.removeItem('missingFields');
        }

        // Set flag to show offer popup after login
        localStorage.setItem('justLoggedIn', 'true');
        // Don't show toast here - let the redirect useEffect handle it
        // Navigation will happen automatically via useEffect when user and token are set
      } else {
        // Handle error response
        const errorMessage = data?.error?.message || data?.error || "Google signup failed!";
        toast.error(errorMessage);
        
        // Dispatch loginUser.rejected to update error state
        dispatch({
          type: 'auth/loginUser/rejected',
          payload: {
            message: errorMessage,
            status: res.status || 500
          }
        });
      }
    } catch (err) {
      toast.error("Something went wrong during Google signup.");
      
      // Dispatch loginUser.rejected to update error state
      dispatch({
        type: 'auth/loginUser/rejected',
        payload: {
          message: err.message || "Something went wrong during Google signup.",
          status: 500
        }
      });
    }
  };

  // ✅ Handle Google Signup Error
  const handleGoogleError = () => {
    toast.error("Google signup failed. Please try again.");
  };

  // ✅ Trigger Google Signup from custom button
  const handleGoogleButtonClick = async (e) => {
    // Check if we're in a Capacitor environment (mobile app)
    const isCapacitor = Capacitor.isNativePlatform();
    
    if (isCapacitor) {
      // For mobile: Use direct OAuth flow with Google One Tap
      // The @react-oauth/google library doesn't work well in WebView
      // So we'll use a direct approach
      e.preventDefault();
      e.stopPropagation();
      try {
        toast.info("Opening Google sign-in...");
        
        // Use Google's OAuth 2.0 implicit flow
        const state = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('google_oauth_state', state);
        
        // For mobile apps, use custom URL scheme; for web, use origin
        const redirectUri = isMobileApp 
          ? 'com.q8basket.app:/oauth2redirect'
          : `${window.location.origin}${window.location.pathname}`;
        
        const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${GOOGLE_CLIENT_ID}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `response_type=id_token&` +
          `scope=openid%20email%20profile&` +
          `state=${state}&` +
          `nonce=${Math.random().toString(36).substring(2, 15)}`;
        
        // Try to use Capacitor Browser plugin if available
        // Check if Browser plugin is available without importing
        let browserOpened = false;
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Browser) {
          try {
            await window.Capacitor.Plugins.Browser.open({ 
              url: oauthUrl
            });
            browserOpened = true;
          } catch (browserErr) {
            // Browser plugin error, using fallback
          }
        }
        
        // Fallback: use window.location if Browser plugin not available
        if (!browserOpened) {
          window.location.href = oauthUrl;
        }
      } catch (err) {
        toast.error("Failed to open Google signup. Please try again.");
      }
    } else {
      // For web: Use a more reliable approach with retries
      e.preventDefault();
      e.stopPropagation();
      
      if (!googleLoginRef.current) {
        toast.error("Google signup button not ready. Please try again.");
        return;
      }

      // Function to attempt clicking the Google button
      const attemptClick = () => {
        const wrapper = googleLoginRef.current;
        if (!wrapper) return false;

        // Try multiple strategies
        // Strategy 1: Find and click the iframe
        const iframe = wrapper.querySelector('iframe');
        if (iframe) {
          // Since we can't directly click iframe content due to CORS,
          // we'll use a workaround: temporarily make the GoogleLogin visible and clickable
          // by changing pointer-events
          wrapper.style.pointerEvents = 'auto';
          wrapper.style.opacity = '0.01'; // Almost invisible but clickable
          
          // Create a click at the center of the iframe
          const rect = iframe.getBoundingClientRect();
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
            detail: 1,
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2,
            button: 0
          });
          
          // Dispatch on iframe
          iframe.dispatchEvent(clickEvent);
          
          // Also try on wrapper
          wrapper.dispatchEvent(clickEvent);
          
          // Reset after a moment
          setTimeout(() => {
            wrapper.style.pointerEvents = 'none';
            wrapper.style.opacity = '0';
          }, 100);
          
          return true;
        }

        // Strategy 2: Find any clickable div
        const clickableDiv = wrapper.querySelector('div[role="button"], div[tabindex="0"], button');
        if (clickableDiv) {
          clickableDiv.click();
          return true;
        }

        // Strategy 3: Click wrapper directly
        wrapper.click();
        return true;
      };

      // Try immediately
      let clicked = attemptClick();
      
      // If not successful, retry with delays (button might still be loading)
      if (!clicked) {
        for (let i = 0; i < 3; i++) {
          await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
          clicked = attemptClick();
          if (clicked) break;
        }
      }

      if (!clicked) {
        toast.warn("Please click the Google sign-up button directly.");
      }
    }
  };
 
  return (
    <div
      className={styles.root}
      style={{
        backgroundImage: `url(${BASE_URL}/image/o/assets/images/app/login-bg.png)`,
      }}
      aria-label="Sign Up Screen"
    >
      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        <h1 className={styles.heading}>Create Account</h1>
        <p className={styles.subheading}>Let's create an account together</p>

        {/* Full Name Input */}
        <label htmlFor="fullName">Full Name</label>
        <div className={styles.inputWrapper}>
          <input
            className={styles.inputField}
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        {/* Mobile Number Input */}
        <label htmlFor="mobileNumber">Mobile Number</label>
        <div className={styles.inputWrapper}>
          <input
            className={styles.inputField}
            id="mobileNumber"
            type="tel"
            placeholder="Enter your mobile number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            required
          />
          <img src="/icons/phone.svg" alt="" aria-hidden="true" className={styles.inputIcon} />

        </div>

        {/* Alternative Number Input */}
        <label htmlFor="alternativeNumber">Alternative Number</label>
        <div className={styles.inputWrapper}>
          <input
            className={styles.inputField}
            id="alternativeNumber"
            type="tel"
            placeholder="Enter your alternative number"
            value={alternativeNumber}
            onChange={(e) => setAlternativeNumber(e.target.value)}
            required
          />
          <img src="/icons/phone.svg" alt="" aria-hidden="true" className={styles.inputIcon} />

        </div>

        {/* Email Address Input */}
        <label htmlFor="email">Email Address</label>
        <div className={styles.inputWrapper}>
          <input
            className={styles.inputField}
            id="email"
            type="email"
            placeholder="johan0135@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <img src="/icons/email.svg" alt="" aria-hidden="true" className={styles.inputIcon} />

        </div>

        {/* City Location Input */}
        <label htmlFor="city">City Location</label>
        <div className={styles.inputWrapper}>
          <select
            className={styles.inputField}
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          >
            <option value="">Select City</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <img src="/icons/urbanize.svg" alt="" aria-hidden="true" className={styles.inputIcon} />
        </div>

        {/* Address Input */}
        <label htmlFor="address">Address</label>
        <div className={styles.inputWrapper}>
          <input
            className={styles.inputField}
            id="address"
            type="text"
            placeholder="Aelggialp, Aelggi, 6072, Sachseln"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <img src="/icons/location.svg" alt="" aria-hidden="true" className={styles.inputIcon} />

        </div>
        {/* Password Input */}
        <label htmlFor="password">Password</label>
        <div className={styles.inputWrapper}>
          <input
            className={styles.inputField}
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="current-password"
            placeholder='**********'
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className={styles.togglePassword}
          >
            <img
              src={showPassword ? "/icons/eye-open.svg" : "/icons/eye-off.svg"}
              alt=""
              className={styles.eyeIcon}
            />
          </button>
          <img src="/icons/password.svg" alt="" aria-hidden="true" className={styles.inputIcon} />
        </div>

        {/* Checkbox for Terms & Conditions */}
        <div className={styles.checkboxWrapper}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              required
            />
            I Agree To Terms and Conditions
          </label>
        </div>

        {/* Sign Up Button */}
        <button type="submit" className={styles.signUpButton} disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        {/* ✅ Social Sign-up */}
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          {Capacitor.isNativePlatform() ? (
            // For mobile: Use custom button that triggers OAuth flow
            <button
              type="button"
              className={styles.socialButton}
              aria-label="Sign up with Google"
              onClick={handleGoogleButtonClick}
              style={{ 
                width: '100%',
                cursor: 'pointer',
                marginTop: '12px'
              }}
            >
              <img
                src="/icons/google.svg"
                alt="Google Logo"
                className={styles.socialIcon}
                draggable={false}
              />
              Sign Up With Google
            </button>
          ) : (
            // For web: Make GoogleLogin clickable by positioning it correctly
            <div style={{ position: 'relative', width: '100%', minHeight: '48px', marginTop: '12px' }}>
              {/* GoogleLogin button - positioned to receive clicks */}
              <div 
                ref={googleLoginRef}
                style={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0.01, // Almost invisible but still clickable
                  pointerEvents: 'auto',
                  zIndex: 1,
                  overflow: 'visible'
                }}
              >
                <GoogleLogin
                  onSuccess={handleGoogleSignup}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  text="signup_with"
                  shape="rectangular"
                  width="100%"
                  useOneTap={false}
                />
              </div>
              {/* Custom styled overlay - visual only, clicks pass through naturally */}
              <div
                className={styles.socialButton}
                style={{ 
                  position: 'relative',
                  zIndex: 2,
                  width: '100%',
                  pointerEvents: 'none', // Clicks pass through to GoogleLogin below
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  userSelect: 'none' // Prevent text selection
                }}
                aria-hidden="true" // Screen readers should focus on GoogleLogin
              >
                <img
                  src="/icons/google.svg"
                  alt=""
                  className={styles.socialIcon}
                  draggable={false}
                  aria-hidden="true"
                />
                <span>Sign Up With Google</span>
              </div>
            </div>
          )}
        </GoogleOAuthProvider>

        {/* Sign In Link */}
        <div className={styles.signUpText}>
          Already have an account?{' '}
          <button type="button" onClick={onSignIn}>
            Sign In
          </button>
        </div>
      </form>
      <ToastContainer position="top-center" autoClose={1500} />

    </div>
  );
}
