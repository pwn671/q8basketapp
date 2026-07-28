import React, { useState, useEffect, useRef } from 'react';
import styles from './OTPVerification.module.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePasswordReset } from '../../context/PasswordResetContext.jsx';
import config from '../../config/env';

export default function OTPVerification({ onVerify }) {
  const [otpArray, setOtpArray] = useState(['', '', '', '']);
  const otpRefs = useRef([]);
  const [timer, setTimer] = useState(10);
  const [resending, setResending] = useState(false);

  const { otp: debugOtp, resetEmail, setOtp } = usePasswordReset();
  const BASE_URL = config.APP_URL;
    const BACKEND_URL = config.BACKEND_URL;

  // Countdown logic
  useEffect(() => {
    if (timer === 0) return;
    const socket = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(socket);
  }, [timer]);

  const handleChange = (value, index) => {
    if (/[^0-9]/.test(value)) return;
    const newOtp = [...otpArray];
    newOtp[index] = value;
    setOtpArray(newOtp);
    if (value && index < 3) otpRefs.current[index + 1]?.focus();
  };

  const handleSubmit = () => {
    const enteredOtp = otpArray.join('');
    if (enteredOtp.length !== 4) {
      toast.error('Enter a valid 4-digit OTP');
      return;
    }
    if (!resetEmail) {
      toast.error('Email missing. Start over.');
      return;
    }
    if (enteredOtp !== debugOtp) {
      toast.error('Invalid OTP. Please try again.');
      return;
    }
    setOtp(enteredOtp);
    toast.success('OTP Verified!');
    setTimeout(() => onVerify(), 1000); // Go to next screen
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
      const data = await response.json();

      if (!response.ok || data.status !== true) {
        throw new Error(data?.data?.message || 'Failed to resend OTP');
      }

      const newOtp = data.data.debug_otp;
      toast.success(data.data.message || 'New OTP sent');
      setOtpArray(['', '', '', '']);
      setTimer(10);
      setOtp(newOtp);
    } catch (err) {
      toast.error(err.message);
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
            />
          ))}
        </div>

        <div className={styles.timerContainer}>
          {timer === 0 ? (
            <span className={styles.resendLink} onClick={handleResend}>
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
