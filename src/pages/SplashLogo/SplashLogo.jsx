import React from 'react';
import styles from './SplashLogo.module.css';

const BASE_URL = import.meta.env.VITE_APP_URL;;

export default function SplashLogo({ onNext }) {
  return (
    <div className="app-container"> {/* Center content using app-container */}
      <div className="screen splash-logo">
        <img
          src={`${BASE_URL}api/image/o/assets/images/app/logo-vertical.png`}
          alt="Q8 Basket Logo"
          className={styles.logoLarge}
          onClick={onNext}
          style={{ cursor: 'pointer' }}
        />
      </div>
    </div>
  );
}
