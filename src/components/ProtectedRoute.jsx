// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useIsLoggedIn } from '../hooks/useIsLoggedIn';

export default function ProtectedRoute({ children }) {
  const isLoggedIn = useIsLoggedIn();

  if (!isLoggedIn) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}
