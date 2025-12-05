// src/context/PasswordResetContext.jsx
import React, { createContext, useContext, useState } from 'react';

const PasswordResetContext = createContext();

export const PasswordResetProvider = ({ children }) => {
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <PasswordResetContext.Provider
      value={{
        resetEmail,
        setResetEmail,
        otp,
        setOtp,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
      }}
    >
      {children}
    </PasswordResetContext.Provider>
  );
};

export const usePasswordReset = () => useContext(PasswordResetContext);
