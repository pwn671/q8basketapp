import React, { useState, useEffect, useRef } from 'react';
import styles from './SignUp.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../features/auth/authThunks';
import { resetAuthState } from '../../features/auth/authSlice';
import { toast, ToastContainer } from 'react-toastify';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { usePasswordReset } from '../../context/PasswordResetContext.jsx';
import { formatValidationErrors } from '../../utils/errorHandler';
import useLockBodyScrollOnApp from '../../hooks/useLockBodyScrollOnApp';
import addressService from '../../services/addressService';
import config from '../../config/env';

export default function SignUp({ onSignIn, onRegistrationSuccess }) {
  const isMobileApp = Capacitor.isNativePlatform();
  
  // Use different client IDs for web and mobile
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
    console.log('========================================');
    console.log('🔄 [BACKEND] Processing Google signup...');
    console.log('========================================');
    console.log('Credential response:', {
      hasCredential: !!credentialResponse?.credential,
      credentialLength: credentialResponse?.credential?.length || 0,
      credentialPreview: credentialResponse?.credential?.substring(0, 50) + '...' || null,
      allKeys: Object.keys(credentialResponse || {})
    });
    
    try {
      // Decode JWT token
      let decoded;
      try {
        console.log('🔓 [BACKEND] Attempting to decode JWT token...');
        decoded = jwtDecode(credentialResponse.credential);
        console.log('✅ [BACKEND] JWT decoded successfully');
        console.log('📋 [BACKEND] Decoded token data:', {
          email: decoded.email,
          name: decoded.name,
          sub: decoded.sub,
          picture: decoded.picture,
          iss: decoded.iss,
          aud: decoded.aud,
          exp: decoded.exp,
          iat: decoded.iat,
          allKeys: Object.keys(decoded)
        });
      } catch (decodeError) {
        console.error('❌ [BACKEND] JWT decode error:', decodeError);
        console.error('Decode error details:', {
          message: decodeError.message,
          stack: decodeError.stack,
          name: decodeError.name
        });
        throw new Error('Failed to decode Google token: ' + decodeError.message);
      }

      const { email, name, sub: googleId, picture } = decoded;

      const body = {
        provider: 'google',
        id_token: credentialResponse.credential,
        name,
        email,
        googleId,
        avatar: picture
      };

      console.log('📤 [BACKEND] Preparing request to backend...');
      console.log('Request details:', { 
        url: `${BASE_URL}/user/social/login`,
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        bodyPreview: { 
          ...body, 
          id_token: body.id_token.substring(0, 50) + '...' 
        }
      });

      const requestStartTime = Date.now();
      const res = await fetch(`${BASE_URL}/user/social/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const requestDuration = Date.now() - requestStartTime;
      console.log(`📡 [BACKEND] Request completed in ${requestDuration}ms`);
      console.log('Response status:', {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        headers: Object.fromEntries(res.headers.entries())
      });

      const data = await res.json();
      console.log('📦 [BACKEND] Response data received:', {
        hasStatus: 'status' in data,
        status: data.status,
        hasData: 'data' in data,
        hasError: 'error' in data,
        error: data.error,
        fullResponse: data
      });

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
        const errorMessage = data?.error?.message || data?.error || data?.message || "Google signup failed!";
        console.error('Backend returned error:', errorMessage, data);
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
      console.error('Exception in handleGoogleSignup:', err);
      console.error('Exception details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      
      toast.error(err.message || "Something went wrong during Google signup.");
      
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

  // ✅ Trigger Native Google Signup (for mobile app)
  const handleGoogleButtonClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('========================================');
    console.log('🔵 [GOOGLE SIGNUP] Starting native Google Sign-In...');
    console.log('========================================');
    console.log('Platform check:', {
      isMobileApp,
      isNative: Capacitor.isNativePlatform(),
      platform: Capacitor.getPlatform()
    });
    console.log('Client ID configuration:', {
      GOOGLE_CLIENT_ID,
      env_mobile: import.meta.env.VITE_GOOGLE_CLIENT_ID_MOBILE,
      env_web: import.meta.env.VITE_GOOGLE_CLIENT_ID
    });
    console.log('GoogleAuth object available:', typeof GoogleAuth !== 'undefined');
    console.log('GoogleAuth.signIn available:', typeof GoogleAuth?.signIn === 'function');

    try {
      console.log('📞 [GOOGLE SIGNUP] Calling GoogleAuth.signIn()...');
      const startTime = Date.now();
      
      // Use native Google Sign-In
      const user = await GoogleAuth.signIn();
      
      const duration = Date.now() - startTime;
      console.log(`✅ [GOOGLE SIGNUP] GoogleAuth.signIn() completed in ${duration}ms`);
      console.log('📦 [GOOGLE SIGNUP] User object received:', {
        hasUser: !!user,
        userKeys: user ? Object.keys(user) : null,
        hasAuthentication: !!user?.authentication,
        authenticationKeys: user?.authentication ? Object.keys(user.authentication) : null,
        fullUserObject: user
      });
      
      // Extract the ID token
      const idToken = user?.authentication?.idToken;
      const accessToken = user?.authentication?.accessToken;

      console.log('🔑 [GOOGLE SIGNUP] Token extraction:', {
        hasIdToken: !!idToken,
        idTokenLength: idToken?.length || 0,
        idTokenPreview: idToken ? idToken.substring(0, 50) + '...' : null,
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken?.length || 0
      });

      if (!idToken) {
        console.error('❌ [GOOGLE SIGNUP] No ID token found in user object');
        console.error('Full user object structure:', JSON.stringify(user, null, 2));
        throw new Error('No ID token received from Google');
      }

      console.log('✅ [GOOGLE SIGNUP] ID Token validated, proceeding to handleGoogleSignup...');
      console.log('📤 [GOOGLE SIGNUP] Calling handleGoogleSignup with token...');

      // Process the token using the same handler as web
      await handleGoogleSignup({ credential: idToken });
      
      console.log('✅ [GOOGLE SIGNUP] handleGoogleSignup completed successfully');
    } catch (err) {
      console.error('========================================');
      console.error('❌ [GOOGLE SIGNUP] Error with native Google signup');
      console.error('========================================');
      console.error('Error object:', err);
      console.error('Error type:', typeof err);
      console.error('Error constructor:', err?.constructor?.name);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
        code: err.code,
        cause: err.cause,
        toString: err.toString(),
        allProperties: Object.keys(err)
      });
      
      // Try to extract more info if it's a stringified error
      if (err.message && typeof err.message === 'string') {
        console.error('Error message analysis:', {
          message: err.message,
          messageLength: err.message.length,
          containsError: err.message.includes('error'),
          containsFailed: err.message.includes('failed'),
          containsWrong: err.message.includes('wrong')
        });
      }
      
      // Show more specific error message
      const errorMsg = err.message || err.code || err.toString() || "Google signup failed. Please try again.";
      console.error('🚨 [GOOGLE SIGNUP] Showing error toast:', errorMsg);
      toast.error(errorMsg);
    } finally {
      console.log('========================================');
      console.log('🏁 [GOOGLE SIGNUP] handleGoogleButtonClick completed');
      console.log('========================================');
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

        {/* ✅ Social Sign-up - Different approach for web vs mobile */}
        {isMobileApp ? (
          /* ================= MOBILE (CAPACITOR) ================= */
          <button
            type="button"
            className={styles.socialButton}
            aria-label="Sign up with Google"
            onClick={handleGoogleButtonClick}
            style={{ marginTop: '12px' }}
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
          /* ================= WEB (PWA / BROWSER) ================= */
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div style={{ position: 'relative', width: '100%', minHeight: '48px', marginTop: '12px' }}>
              {/* GoogleLogin button - positioned to receive clicks */}
              <div 
                ref={googleLoginRef}
                style={{ 
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.01,
                  zIndex: 1
                }}
              >
                <GoogleLogin
                  onSuccess={handleGoogleSignup}
                  onError={handleGoogleError}
                  text="signup_with"
                  width="100%"
                />
              </div>
              {/* Custom styled overlay - visual only, clicks pass through */}
              <div
                className={styles.socialButton}
                style={{ 
                  position: 'relative',
                  zIndex: 2,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  userSelect: 'none'
                }}
                aria-hidden="true"
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
          </GoogleOAuthProvider>
        )}

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
