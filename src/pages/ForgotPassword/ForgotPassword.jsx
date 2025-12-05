import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword } from '../../features/auth/authThunks';
import { resetAuthState } from '../../features/auth/authSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './ForgotPassword.module.css';
import { usePasswordReset } from '../../context/PasswordResetContext.jsx';

export default function ForgetPassword({ onOtpSent }) {
  const [email, setEmail] = useState('');
const { setResetEmail, setOtp } = usePasswordReset();
  const dispatch = useDispatch();
  const { loading, error, forgotStatus } = useSelector((state) => state.auth);
  const BASE_URL = import.meta.env.VITE_APP_URL;

  useEffect(() => {
    dispatch(resetAuthState());
    return () => dispatch(resetAuthState());
  }, [dispatch]);

 const onSubmit = async (e) => {
  e.preventDefault();
  if (!email.trim()) {
    toast.warn('Please enter your email');
    return;
  }

  try {
    const resultAction = await dispatch(forgotPassword({ email }));
    if (forgotPassword.fulfilled.match(resultAction)) {
      const { debug_otp, email: returnedEmail } = resultAction.payload.data;
      setResetEmail(returnedEmail);
      setOtp(debug_otp || '');  // Save debug OTP to context
      toast.success(resultAction.payload.data.message);
      if (onOtpSent) onOtpSent();
    } else {
      toast.error('Failed to send OTP');
    }
  } catch (error) {
    toast.error('Something went wrong');
  }
};

 useEffect(() => {
  if (forgotStatus && !loading) {
    toast.success(forgotStatus);
    setTimeout(() => {
      if (onOtpSent) onOtpSent(); // 👈 This should navigate to /otp
      dispatch(resetAuthState());
    }, 1500);
  }
}, [forgotStatus, loading, onOtpSent, dispatch]);


  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div
      className={styles.root}
      style={{
        backgroundImage: `url(${BASE_URL}api/image/o/assets/images/app/forgot-password-bg.png)`,
      }}
      aria-label="Forget Password Screen"
    >
      <form className={styles.card} onSubmit={onSubmit} noValidate>
        <h1 className={styles.heading}>Forget Password</h1>
        <p className={styles.subheading}>
          Enter your email or phone number to send OTP
        </p>

        {/* Email Input */}
        <label htmlFor="email">Email Address</label>
        <div className={styles.inputWrapper}>
          <input
            className={styles.inputField}
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <img
            src="/icons/email.svg"
            alt=""
            aria-hidden="true"
            className={styles.inputIcon}
          />
        </div>

        {/* Send Now Button */}
        <button type="submit" className={styles.sendNowButton} disabled={loading}>
          {loading ? 'Sending...' : 'Send Now'}
        </button>
      </form>

      <ToastContainer position="top-center" autoClose={1500} />
    </div>
  );
}
