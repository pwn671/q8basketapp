import React from 'react';
import { useNavigate } from "react-router-dom";
import styles from './Verified.module.css'; // Make sure this CSS file exists
import config from '../../config/env';

export default function Verification() {
  const BASE_URL = config.APP_URL;
  const navigate = useNavigate();

  const handleVerifiedClick = () => {
    navigate('/signin'); // 👈 Navigate to Sign In page
  };

  return (
    <div
      className={styles.root}
      style={{
        backgroundImage: `url(${BASE_URL}api/image/o/assets/images/app/otp-verified-bg.png)`,
      }}
      aria-label="Verification Screen"
    >
      <form className={styles.card} noValidate>
        <div className={styles.logoWrapper}>
          <img
            src="/icons/verified.svg"
            alt="Verified"
            className={styles.logo}
          />
        </div>

        <button
          type="button"
          className={styles.verifiedButton}
          onClick={handleVerifiedClick} // 👈 Updated here
        >
          Verified
        </button>
      </form>
    </div>
  );
}
