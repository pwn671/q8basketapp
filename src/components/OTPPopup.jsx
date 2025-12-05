import React from 'react';
import styles from './OTPPopup.module.css';

const OTPPopup = ({ isOpen, onClose, otp, email }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(otp).then(() => {
      // You could add a toast notification here
      console.log('OTP copied to clipboard');
    });
  };

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div className={styles.popup}>
        <div className={styles.header}>
          <h3>🔐 OTP for Testing</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.info}>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>OTP:</strong></p>
          </div>
          
          <div className={styles.otpDisplay}>
            <div className={styles.otpCode}>{otp}</div>
            <button 
              className={styles.copyButton} 
              onClick={copyToClipboard}
              title="Copy OTP"
            >
              📋 Copy
            </button>
          </div>
          
          <div className={styles.note}>
            <p>💡 <strong>Note:</strong> This OTP is for testing purposes only.</p>
            <p>In production, this would be sent via email.</p>
          </div>
        </div>
        
        <div className={styles.footer}>
          <button className={styles.okButton} onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPPopup;
