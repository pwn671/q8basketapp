import React from 'react';
import styles from './SplashLogo.module.css';
import config from '../../config/env';

export default function SplashLogo({ onNext }) {
  const BASE_URL = config.BACKEND_URL; // Use config for consistency with SignUp/SignIn

  return (
    <div className="app-container"> {/* Center content using app-container */}
      <div className="screen splash-logo">
        <img
          src={`${BASE_URL}/image/o/assets/images/app/logo-vertical.png`}
          alt="Q8 Basket Logo"
          className={styles.logoLarge}
          onClick={onNext}
          style={{ cursor: 'pointer' }}
        />
      </div>
    </div>
  );
}
