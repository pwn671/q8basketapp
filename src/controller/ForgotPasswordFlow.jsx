import React, { useState } from 'react';
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword';
import OTPVerification from '../pages/OTPVerification/OTPVerification';
import UpdatePassword from '../pages/UpdatePassword/UpdatePassword';

export default function ForgotPasswordFlow({ onComplete }) {
  const [step, setStep] = useState('forgot'); // could be 'forgot', 'otp', 'update'

  const handleOtpSent = () => {
    setStep('otp');
  };

  const handleVerified = () => {
    setStep('update');
  };

  const handleResetComplete = () => {
    onComplete && onComplete();
  };

  return (
    <>
      {step === 'forgot' && <ForgotPassword onOtpSent={handleOtpSent} />}

      {step === 'otp' && <OTPVerification onVerify={handleVerified} />}

      {step === 'update' && (
        <UpdatePassword onBackToSignIn={handleResetComplete} />
      )}
    </>
  );
}
