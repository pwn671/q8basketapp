// src/hooks/useTheme.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { 
    setThemeMode, 
    toggleTheme, 
    setSystemTheme, 
    enableAutoDetect, 
    disableAutoDetect,
    initializeTheme 
} from '../features/theme/themeSlice';

export const useTheme = () => {
    const dispatch = useDispatch();
    const themeState = useSelector((state) => state.theme);

    // Initialize theme on mount
    useEffect(() => {
        dispatch(initializeTheme());
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemThemeChange = (e) => {
            dispatch(setSystemTheme(e.matches ? 'dark' : 'light'));
        };
        
        // Set initial system theme
        dispatch(setSystemTheme(mediaQuery.matches ? 'dark' : 'light'));
        
        // Listen for changes
        mediaQuery.addEventListener('change', handleSystemThemeChange);
        
        return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
    }, [dispatch]);

    const setMode = useCallback((mode) => {
        dispatch(setThemeMode(mode));
    }, [dispatch]);

    const toggle = useCallback(() => {
        dispatch(toggleTheme());
    }, [dispatch]);

    const enableAuto = useCallback(() => {
        dispatch(enableAutoDetect());
    }, [dispatch]);

    const disableAuto = useCallback(() => {
        dispatch(disableAutoDetect());
    }, [dispatch]);

    return {
        mode: themeState.mode,
        systemTheme: themeState.systemTheme,
        autoDetect: themeState.autoDetect,
        setMode,
        toggle,
        enableAuto,
        disableAuto,
        isDark: themeState.mode === 'dark',
        isLight: themeState.mode === 'light',
    };
};
