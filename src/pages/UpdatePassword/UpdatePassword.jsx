import React, { useState, useEffect } from 'react';
import styles from './UpdatePassword.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { resetAuthState } from '../../features/auth/authSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePasswordReset } from '../../context/PasswordResetContext';
import { useNavigate } from "react-router-dom";
import config from '../../config/env.js';

export default function UpdatePassword({ onNext }) {
  const [newPassword, setNewPasswordInput] = useState('');
  const [confirmPassword, setConfirmPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(prev => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prev => !prev);
  };


  const dispatch = useDispatch();
  const { error } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const {
    resetEmail,
    otp,
  } = usePasswordReset(); // ✅ pull required values

  const BASE_URL = config.APP_URL;
  const BACKEND_URL = config.BACKEND_URL;


  useEffect(() => {
    dispatch(resetAuthState());
    return () => dispatch(resetAuthState());
  }, [dispatch]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.warn('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!resetEmail || !otp) {
      toast.error('Missing email or OTP. Please complete previous steps.');
      return;
    }

    const payload = {
      email: resetEmail,
      otp,
      new_password: newPassword,
      confirm_password: confirmPassword,
    };

    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/user/forgot/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to update password');
      }

      toast.success(data?.message || 'Password updated successfully');

      setTimeout(() => {
        navigate('/signin'); // 👈 redirects to signin page
      }, 1500);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <div
      className={styles.root}
      style={{ backgroundImage: `url(${BASE_URL}/api/image/o/assets/images/app/login-bg.png)` }}
    >
      <form className={styles.card} onSubmit={onSubmit} noValidate>
        <h1 className={styles.heading}>Update Password</h1>
        <p className={styles.subheading}>Enter your new password</p>

        <label htmlFor="newPassword">New Password</label>
        <div className={styles.inputWrapper}>
          <input
            id="newPassword"
            type={showNewPassword ? 'text' : 'password'}
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPasswordInput(e.target.value)}
            required
            minLength={6}
            className={styles.inputField}
          />
          <button
            type="button"
            onClick={toggleNewPasswordVisibility}
            aria-label={showNewPassword ? 'Hide password' : 'Show password'}
            className={styles.togglePassword}
          >
            <img
              src={showNewPassword ? "/icons/eye-open.svg" : "/icons/eye-off.svg"}
              alt=""
              className={styles.eyeIcon}
            />
          </button>
          <img src="/icons/password.svg" alt="" className={styles.inputIcon} />
        </div>


        <label htmlFor="confirmPassword">Confirm Password</label>
        <div className={styles.inputWrapper}>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPasswordInput(e.target.value)}
            required
            minLength={6}
            className={styles.inputField}
          />
          <button
            type="button"
            onClick={toggleConfirmPasswordVisibility}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            className={styles.togglePassword}
          >
            <img
              src={showConfirmPassword ? "/icons/eye-open.svg" : "/icons/eye-off.svg"}
              alt=""
              className={styles.eyeIcon}
            />
          </button>
          <img src="/icons/password.svg" alt="" className={styles.inputIcon} />
        </div>


        <button type="submit" className={styles.updateNowButton} disabled={loading}>
          {loading ? 'Updating...' : 'Update Now'}
        </button>
      </form>

      <ToastContainer position="top-center" autoClose={1500} />
    </div>
  );
}
