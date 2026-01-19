import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../features/auth/authThunks";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import "react-toastify/dist/ReactToastify.css";
import styles from "./SignIn.module.css";
import layoutStyles from "../../styles/Layout.module.css";
import useLockBodyScrollOnApp from '../../hooks/useLockBodyScrollOnApp';
import config from '../../config/env';

export default function SignIn({ onForgotPassword, onSignUp }) {
  const isMobileApp = Capacitor.isNativePlatform();
  
  // Use different client IDs for web and mobile
  const GOOGLE_CLIENT_ID = isMobileApp 
    ? (import.meta.env.VITE_GOOGLE_CLIENT_ID_MOBILE || import.meta.env.VITE_GOOGLE_CLIENT_ID)
    : import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, user, token } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const googleLoginRef = useRef(null);
  const lastErrorRef = useRef(null);

  // Use config for API URLs (consistent with SignUp.jsx and other pages)
  const BASE_URL = config.BACKEND_URL; // For auth endpoints and images
  const APP_URL = config.APP_URL; // For OAuth redirects

  useLockBodyScrollOnApp();

  // ✅ Redirect on successful login
  useEffect(() => {
    if (user && token && !loading) {
      // Check if phone number is missing
      const needsProfileCompletion = localStorage.getItem('needsProfileCompletion') === 'true';
      const missingFields = JSON.parse(localStorage.getItem('missingFields') || '[]');
      const isPhoneMissing = !user.phone || user.phone === null || user.phone === '' || missingFields.includes('phone');
      
      // Set flag to show offer popup after login
      localStorage.setItem('justLoggedIn', 'true');
      
      if (needsProfileCompletion && isPhoneMissing) {
        // Redirect to edit-profile if phone is missing
        toast.info("Please update your phone number to continue");
        const timer = setTimeout(() => navigate("/edit-profile"), 1500);
        return () => clearTimeout(timer);
      } else {
        // Normal redirect to home
        toast.success("Login successful! Redirecting...");
        const timer = setTimeout(() => navigate("/home"), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, token, loading, navigate]);

  // ✅ Show error toast
  useEffect(() => {
    if (error) {
      const message = error.message || "Something went wrong";
      // Prevent duplicate error toasts
      if (lastErrorRef.current !== message) {
        lastErrorRef.current = message;
        toast.error(message);
      }
    } else {
      // Reset when error is cleared
      lastErrorRef.current = null;
    }
  }, [error]);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warn("Please enter both email and password.");
      return;
    }

    dispatch(loginUser({ email, password }));
  };

  // ✅ Handle Google Login
  const handleGoogleLogin = async (credentialResponse) => {
    console.log('========================================');
    console.log('🔄 [BACKEND] Processing Google login...');
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
        const errorMessage = data?.error?.message || data?.error || data?.message || "Google login failed!";
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
      console.error('Exception in handleGoogleLogin:', err);
      console.error('Exception details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      
      toast.error(err.message || "Something went wrong during Google login.");
      
      // Dispatch loginUser.rejected to update error state
      dispatch({
        type: 'auth/loginUser/rejected',
        payload: {
          message: err.message || "Something went wrong during Google login.",
          status: 500
        }
      });
    }
  };

  // ✅ Handle Google Login Error
  const handleGoogleError = () => {
    toast.error("Google login failed. Please try again.");
  };

  // ✅ Trigger Native Google Login (for mobile app)
  const handleGoogleButtonClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('========================================');
    console.log('🔵 [GOOGLE LOGIN] Starting native Google Sign-In...');
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
      console.log('📞 [GOOGLE LOGIN] Calling GoogleAuth.signIn()...');
      const startTime = Date.now();
      
      // Use native Google Sign-In
      const user = await GoogleAuth.signIn();
      
      const duration = Date.now() - startTime;
      console.log(`✅ [GOOGLE LOGIN] GoogleAuth.signIn() completed in ${duration}ms`);
      console.log('📦 [GOOGLE LOGIN] User object received:', {
        hasUser: !!user,
        userKeys: user ? Object.keys(user) : null,
        hasAuthentication: !!user?.authentication,
        authenticationKeys: user?.authentication ? Object.keys(user.authentication) : null,
        fullUserObject: user
      });
      
      // Extract the ID token
      const idToken = user?.authentication?.idToken;
      const accessToken = user?.authentication?.accessToken;

      console.log('🔑 [GOOGLE LOGIN] Token extraction:', {
        hasIdToken: !!idToken,
        idTokenLength: idToken?.length || 0,
        idTokenPreview: idToken ? idToken.substring(0, 50) + '...' : null,
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken?.length || 0
      });

      if (!idToken) {
        console.error('❌ [GOOGLE LOGIN] No ID token found in user object');
        console.error('Full user object structure:', JSON.stringify(user, null, 2));
        throw new Error('No ID token received from Google');
      }

      console.log('✅ [GOOGLE LOGIN] ID Token validated, proceeding to handleGoogleLogin...');
      console.log('📤 [GOOGLE LOGIN] Calling handleGoogleLogin with token...');

      // Process the token using the same handler as web
      await handleGoogleLogin({ credential: idToken });
      
      console.log('✅ [GOOGLE LOGIN] handleGoogleLogin completed successfully');
    } catch (err) {
      console.error('========================================');
      console.error('❌ [GOOGLE LOGIN] Error with native Google login');
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
      
      // Error code 10 is DEVELOPER_ERROR - provide specific guidance
      if (err.code === '10' || err.code === 10) {
        console.error('🔴 [GOOGLE LOGIN] Error Code 10 (DEVELOPER_ERROR) detected!');
        console.error('🔴 [GOOGLE LOGIN] This usually means:');
        console.error('   1. SHA-1 fingerprint mismatch in Google Cloud Console');
        console.error('   2. Package name mismatch (should be: com.q8basket.app)');
        console.error('   3. Android OAuth Client ID not properly configured');
        console.error('🔴 [GOOGLE LOGIN] To fix:');
        console.error('   1. Run: cd android && ./gradlew signingReport');
        console.error('   2. Copy the SHA-1 from "Variant: debug" → "SHA1:"');
        console.error('   3. Add it to Google Cloud Console → APIs & Services → Credentials');
        console.error('   4. Verify package name is exactly: com.q8basket.app');
        console.error('   5. Rebuild and reinstall the app');
      }
      
      // Show more specific error message
      let errorMsg = err.message || err.code || err.toString() || "Google login failed. Please try again.";
      
      // Provide user-friendly message for error code 10
      if (err.code === '10' || err.code === 10) {
        errorMsg = "Google Sign-In configuration error. Please check SHA-1 fingerprint and package name in Google Cloud Console.";
      }
      
      console.error('🚨 [GOOGLE LOGIN] Showing error toast:', errorMsg);
      toast.error(errorMsg);
    } finally {
      console.log('========================================');
      console.log('🏁 [GOOGLE LOGIN] handleGoogleButtonClick completed');
      console.log('========================================');
    }
  };

  return (
    <>
      <div
        className={layoutStyles.formContainer}
        style={{
          backgroundImage: `url(${BASE_URL}/image/o/assets/images/app/login-bg.png)`,
        }}
        aria-label="Sign In Screen"
      >
        <form
          className={layoutStyles.formCard}
          onSubmit={handleSubmit}
          noValidate
        >
          <h1 className={layoutStyles.formHeading}>Hello Again!</h1>
          <p className={styles.subheading}>Welcome back! You’ve been missed.</p>

          {/* Email */}
          <label htmlFor="email">Email Address</label>
          <div className={styles.inputWrapper}>
            <input
              id="email"
              type="email"
              className={styles.inputField}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
            <img
              src="/icons/email.svg"
              alt=""
              aria-hidden="true"
              className={styles.inputIcon}
            />
          </div>

          {/* Password */}
          <label htmlFor="password">Password</label>
          <div className={styles.inputWrapper}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className={styles.inputField}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="current-password"
              placeholder="**********"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className={styles.togglePassword}
            >
              <img
                src={showPassword ? "/icons/eye-open.svg" : "/icons/eye-off.svg"}
                alt=""
                className={styles.eyeIcon}
              />
            </button>
            <img
              src="/icons/password.svg"
              alt=""
              aria-hidden="true"
              className={styles.inputIcon}
            />
          </div>

          {/* Options */}
          <div className={styles.formOptions}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember Me
            </label>
            <button
              type="button"
              className={styles.forgetBtn}
              onClick={onForgotPassword}
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={styles.signInButton}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* ✅ Social Sign-in - Different approach for web vs mobile */}
          {isMobileApp ? (
            /* ================= MOBILE (CAPACITOR) ================= */
            <button
              type="button"
              className={styles.socialButton}
              aria-label="Sign in with Google"
              onClick={handleGoogleButtonClick}
            >
              <img
                src="/icons/google.svg"
                alt="Google Logo"
                className={styles.socialIcon}
                draggable={false}
              />
              Sign In With Google
            </button>
          ) : (
            /* ================= WEB (PWA / BROWSER) ================= */
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <div style={{ position: 'relative', width: '100%', minHeight: '48px' }}>
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
                    onSuccess={handleGoogleLogin}
                    onError={handleGoogleError}
                    text="signin_with"
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
                  <span>Sign In With Google</span>
                </div>
              </div>
            </GoogleOAuthProvider>
          )}

          {/* Sign Up */}
          <div className={styles.signUpText}>
            Don’t have an account?{" "}
            <button type="button" onClick={onSignUp}>
              Sign Up
            </button>
          </div>
        </form>
      </div>

      <ToastContainer position="top-center" autoClose={1500} />
    </>
  );
}
