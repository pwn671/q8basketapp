import React from 'react';
import { Capacitor } from '@capacitor/core';
import useLockBodyScrollOnApp from '../../hooks/useLockBodyScrollOnApp'; // ✅ your new hook
import styles from './SplashWelcome.module.css';
import config from '../../config/env';

export default function SplashWelcome({ onContinue }) {
  const BASE_URL = config.BACKEND_URL; // Use config for consistency with SignUp/SignIn
  const isMobileApp = Capacitor.isNativePlatform();

  // 🔒 Prevent overall window scrolling on phone app
  useLockBodyScrollOnApp();

  return (
    <div
      className={`${styles.root} ${isMobileApp ? styles.mobileApp : ''}`}
      style={{
        backgroundImage: `url(${BASE_URL}/image/o/assets/images/app/login-bg.png)`,
      }}
    >
      <div className={styles.card}>
        {/* Welcome text */}
        <div className={styles.welcomeText}>Welcome to</div>

        {/* Logo */}
        <div className={styles.logoInline}>
          <img
            src={`${BASE_URL}/image/o/assets/images/app/logo-vertical.png`}
            alt="Logo"
          />
        </div>

        <div className={styles.subtitle}>Fresh and healthy food basket PWA</div>
      </div>

      {/* Continue button (same place on web + app) */}
      <div className={styles.buttonContainer}>
        <button className={styles.button} onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}
