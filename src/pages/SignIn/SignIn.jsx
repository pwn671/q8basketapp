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

  // ✅ Initialize Google Auth for mobile
  useEffect(() => {
    if (isMobileApp) {
      GoogleAuth.initialize({
        clientId: GOOGLE_CLIENT_ID,
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    }
  }, [isMobileApp, GOOGLE_CLIENT_ID]);

  // ✅ Redirect on successful login
  useEffect(() => {
    if (user && token && !loading) {
      // Set flag to show offer popup after login
      localStorage.setItem('justLoggedIn', 'true');
      toast.success("Login successful! Redirecting...");
      const timer = setTimeout(() => navigate("/home"), 1500);
      return () => clearTimeout(timer);
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
        const errorMessage = data?.error?.message || data?.error || "Google login failed!";
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
      toast.error("Something went wrong during Google login.");
      
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

    try {
      // Use native Google Sign-In
      const user = await GoogleAuth.signIn();
      
      // Extract the ID token
      const idToken = user.authentication.idToken;

      if (!idToken) {
        throw new Error('No ID token received from Google');
      }

      // Process the token using the same handler as web
      await handleGoogleLogin({ credential: idToken });
    } catch (err) {
      console.error('Error with native Google login:', err);
      toast.error("Google login failed. Please try again.");
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
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            {isMobileApp ? (
              // For mobile app: Use custom button that opens OAuth in system browser
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
              // For web: Use @react-oauth/google with iframe button
              <div style={{ position: 'relative', width: '100%', minHeight: '48px' }}>
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
                    onSuccess={handleGoogleLogin}
                    onError={handleGoogleError}
                    theme="outline"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                    width="100%"
                    useOneTap={false}
                  />
                </div>
                {/* Custom styled overlay - visual only, clicks pass through */}
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
            )}
          </GoogleOAuthProvider>

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
