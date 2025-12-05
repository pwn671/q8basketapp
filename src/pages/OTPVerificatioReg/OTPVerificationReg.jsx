import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // import navigate
import styles from './OTPVerificationReg.module.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePasswordReset } from '../../context/PasswordResetContext.jsx';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../features/auth/authThunks';
import { safeApiCall, parseApiResponse, handleApiError } from '../../utils/errorHandler';

export default function OTPVerification() {
  const [otpArray, setOtpArray] = useState(['', '', '', '']);
  const otpRefs = useRef([]);
  const [timer, setTimer] = useState(10);
  const [resending, setResending] = useState(false);

  const { otp: debugOtp, resetEmail: contextEmail, setOtp } = usePasswordReset();
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Hook for navigation

  const resetEmail = contextEmail;

  const BASE_URL = import.meta.env.VITE_APP_URL;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);


  const handleChange = (value, index) => {
    if (/[^0-9]/.test(value)) return;
    const newOtp = [...otpArray];
    newOtp[index] = value;
    setOtpArray(newOtp);
    if (value && index < 3) otpRefs.current[index + 1]?.focus();
  };

  const handleSubmit = async () => {
    const enteredOtp = otpArray.join('');

    if (enteredOtp.length !== 4) {
      toast.error('Enter a valid 4-digit OTP');
      return;
    }

   

    try {
      // Try separate OTP verification endpoint first
      let response = await fetch(`${BACKEND_URL}/user/registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-otp',
          email: resetEmail,
          otp: enteredOtp,
        }),
      });

      // If separate endpoint doesn't exist, fallback to registration endpoint
      if (!response.ok && response.status === 404) {
        console.log('Separate verify-otp endpoint not found, using registration endpoint');
        response = await fetch(`${BACKEND_URL}/user/registration`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'verify-otp',
            email: resetEmail,
            otp: enteredOtp,
          }),
        });
      }

      const data = await parseApiResponse(response);
      
      // Debug: Log the actual API response
      console.log('OTP Verification API Response:', data);

      toast.success(data.data.message || 'OTP Verified!');
      setOtp(enteredOtp);

      // Check if we have user data and token from OTP verification
      if (data.data.user && data.data.token) {
        // Set user as authenticated by dispatching loginUser.fulfilled action
        dispatch({
          type: 'auth/loginUser/fulfilled',
          payload: {
            user: data.data.user,
            token: data.data.token,
            refreshToken: data.data.refreshToken
          }
        });
        console.log('User authenticated successfully:', data.data.user);
      } else if (data.data.user_id && data.data.email) {
        // If we only have user_id and email, we need to create a user object
        console.log('OTP verified with user_id, creating user object:', data.data);
        
        // Create a basic user object from the available data
        const userObject = {
          id: data.data.user_id,
          email: data.data.email,
          // Add other default fields if needed
          name: data.data.email.split('@')[0], // Use email prefix as default name
          is_verified: true
        };
        
        // If we have a token, use it; otherwise, we might need to make a login call
        if (data.data.token) {
          dispatch({
            type: 'auth/loginUser/fulfilled',
            payload: {
              user: userObject,
              token: data.data.token,
              refreshToken: data.data.refreshToken
            }
          });
          console.log('User authenticated with created user object:', userObject);
        } else {
          console.log('No token provided, user will need to login separately');
        }
      } else {
        // If no user/token returned, just show success and redirect
        console.log('OTP verified but no user data returned:', data.data);
        console.log('Available data keys:', Object.keys(data.data || {}));
        console.log('User will need to login separately after verification');
      }

      // Redirect to /verified page
      navigate('/verified');

    } catch (err) {
      // Use enhanced error handling
      handleApiError(err, 'OTP verification failed. Please try again.');
    }
  };

  const handleResend = async () => {
    if (resending) return;
    setResending(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/user/registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resend-otp', email: resetEmail }),
      });

      const data = await parseApiResponse(response);

      const newOtp = data.data.debug_otp;
      toast.success(data.data.message || 'New OTP sent');
      setOtpArray(['', '', '', '']);
      setTimer(10);
      setOtp(newOtp);
    } catch (err) {
      handleApiError(err, 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className={styles.root}
      style={{
        backgroundImage: `url(${BASE_URL}api/image/o/assets/images/app/otp-verification-bg.png)`,
      }}
    >
      <form className={styles.card} onSubmit={(e) => e.preventDefault()}>
        <h1 className={styles.heading}>OTP Code</h1>
        <p className={styles.subheading}>
          OTP sent to <strong>{resetEmail || 'your email'}</strong>
        </p>

        <div className={styles.otpContainer}>
          {otpArray.map((val, idx) => (
            <input
              key={idx}
              maxLength="1"
              value={val}
              onChange={(e) => handleChange(e.target.value, idx)}
              ref={(el) => (otpRefs.current[idx] = el)}
              className={styles.otpBox}
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          ))}
        </div>

        <div className={styles.timerContainer}>
          {timer === 0 ? (
            <span
              className={styles.resendLink}
              onClick={handleResend}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleResend();
              }}
            >
              {resending ? 'Resending...' : 'Send Again'}
            </span>
          ) : (
            <span className={styles.timer}>Wait for {timer}s</span>
          )}
        </div>

        <button
          type="button"
          className={styles.verifyButton}
          onClick={handleSubmit}
        >
          Verify
        </button>
      </form>
      
  
      <ToastContainer position="top-center" autoClose={1500} />
    </div>
  );
}
