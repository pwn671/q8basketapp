// Auth initialization component to handle app startup
import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const AuthInitializer = ({ children }) => {
    const { initializeAuthState } = useAuth();

    useEffect(() => {
        // Initialize auth state from localStorage on app startup
        initializeAuthState();
    }, [initializeAuthState]);

    return <>{children}</>;
};

export default AuthInitializer;
