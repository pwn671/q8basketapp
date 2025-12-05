import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from '../../features/auth/authThunks';
import { useAuth } from '../../hooks/useAuth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './EditProfile.module.css';
import layoutStyles from '../../styles/Layout.module.css';
import useLockBodyScrollOnApp from '../../hooks/useLockBodyScrollOnApp';
import config from '../../config/env';

export default function EditProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, token, isAuthenticated } = useAuth();
  const { loading } = useSelector((state) => state.auth);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const BASE_URL = config.API_BASE_URL;

  // Load current user data
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/signin');
      return;
    }

    // Set initial values from user data
    setFullName(user.fullname || user.name || user.full_name || '');
    setEmail(user.email || '');
    setPhone(user.phone || user.phone_number || user.mobile || user.mobile_number || '');
  }, [user, isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Phone (name and email are read-only, so no validation needed)
    if (!phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    try {
      // Using base_url/user/profile/complete endpoint for profile updates
      // The endpoint expects phone field
      const profileData = {
        phone: phone.trim(),
      };

      const result = await dispatch(updateUserProfile(profileData)).unwrap();
      
      if (result) {
        toast.success('Profile updated successfully!');
        setTimeout(() => {
          // Navigate back to profile, preserving the from state if it exists
          const fromState = location.state?.from || '/profile';
          navigate('/profile', { state: { from: '/edit-profile' } });
        }, 1500);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error || 'Failed to update profile. Please try again.');
    }
  };

  const handleBack = () => {
    // Navigate back to profile, passing state to indicate we came from edit-profile
    navigate('/profile', { state: { from: '/edit-profile' } });
  };

  useLockBodyScrollOnApp();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className={layoutStyles.appWrapper} role="main" aria-label="Edit Profile screen">
      <div className={layoutStyles.appContainer}>
        <header className={styles.header}>
          <button
            style={{
              background: "none",
              border: "none",
              fontSize: "1.1rem",
              cursor: "pointer",
            }}
            onClick={handleBack}
            aria-label="Go back"
          >
            <img src="/icons/left-arrow.svg" alt="Back" className={styles.backBtn} />
          </button>
          <div className={styles.headerTitle}>Edit Profile</div>
        </header>

        <div className={styles.content}>
          <h1 className={styles.pageTitle}>Update your profile</h1>

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name Input - Read Only */}
            <div className={styles.formSection}>
              <label htmlFor="fullName" className={styles.label}>Full Name</label>
              <div className={styles.inputWrapper}>
                <input
                  className={`${styles.inputField} ${styles.readOnly}`}
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  readOnly
                  disabled
                />
              </div>
            </div>

            {/* Email Address Input - Read Only */}
            <div className={styles.formSection}>
              <label htmlFor="email" className={styles.label}>Email Address</label>
              <div className={styles.inputWrapper}>
                <img src="/icons/email.svg" alt="" aria-hidden="true" className={styles.inputIcon} />
                <input
                  className={`${styles.inputField} ${styles.readOnly}`}
                  id="email"
                  type="email"
                  placeholder="johan0135@gmail.com"
                  value={email}
                  readOnly
                  disabled
                />
              </div>
            </div>

            {/* Phone Number Input */}
            <div className={styles.formSection}>
              <label htmlFor="phone" className={styles.label}>Phone Number</label>
              <div className={styles.inputWrapper}>
                <img src="/icons/phone.svg" alt="" aria-hidden="true" className={styles.inputIcon} />
                <input
                  className={styles.inputField}
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Update Button */}
            <button 
              type="submit" 
              className={styles.updateButton}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>

          {/* Spacer to avoid bottom nav overlap */}
          <div style={{ height: 90 }} />
        </div>
        <ToastContainer position="top-center" autoClose={1500} />
      </div>
    </div>
  );
}

