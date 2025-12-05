import React from 'react';
import styles from './OfferPopup.module.css';

const OfferPopup = ({ isOpen, onClose, offerImage, offerLink }) => {
  if (!isOpen || !offerImage) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageClick = () => {
    if (offerLink) {
      window.open(offerLink, '_blank', 'noopener,noreferrer');
    }
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div className={styles.popup}>
        <button 
          className={styles.closeButton} 
          onClick={onClose}
          aria-label="Close offer popup"
        >
          ✕
        </button>
        <div className={styles.content}>
          <img
            src={offerImage}
            alt="Special Offer"
            className={styles.offerImage}
            onClick={handleImageClick}
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
};

export default OfferPopup;

