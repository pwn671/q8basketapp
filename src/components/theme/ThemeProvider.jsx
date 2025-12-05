// src/components/theme/ThemeProvider.jsx
import React, { useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';

const ThemeProvider = ({ children }) => {
    const { mode, isDark } = useTheme();

    useEffect(() => {
        const root = document.documentElement;
        
        if (isDark) {
            root.classList.add('dark-theme');
            root.classList.remove('light-theme');
        } else {
            root.classList.add('light-theme');
            root.classList.remove('dark-theme');
        }
    }, [isDark]);

    return <>{children}</>;
};

export default ThemeProvider;
