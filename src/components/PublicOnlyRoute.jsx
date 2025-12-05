// components/PublicOnlyRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useIsLoggedIn } from '../hooks/useIsLoggedIn';

export default function PublicOnlyRoute({ children }) {
  const isLoggedIn = useIsLoggedIn();

  if (isLoggedIn) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
