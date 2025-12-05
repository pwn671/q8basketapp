// src/components/theme/ThemeDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import styles from './ThemeDropdown.module.css';

const ThemeDropdown = () => {
    const { mode, systemTheme, autoDetect, setMode, enableAuto, disableAuto } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleOptionClick = (option) => {
        switch (option) {
            case 'light':
                setMode('light');
                disableAuto();
                break;
            case 'dark':
                setMode('dark');
                disableAuto();
                break;
            case 'auto':
                enableAuto();
                break;
            default:
                break;
        }
        setIsOpen(false);
    };

    const getDisplayText = () => {
        if (autoDetect) {
            return 'AUTO';
        }
        return mode.toUpperCase();
    };

    const getDisplayIcon = () => {
        if (autoDetect) {
            return (
                <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        }
        
        if (mode === 'dark') {
            return (
                <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
            );
        }
        
        return (
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    };

    return (
        <div className={styles.dropdownContainer} ref={dropdownRef}>
            <button 
                className={styles.dropdownButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Theme selector"
                aria-expanded={isOpen}
            >
                <span className={styles.buttonContent}>
                    {getDisplayIcon()}
                    <span className={styles.buttonText}>{getDisplayText()}</span>
                </span>
                <svg 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24" 
                    aria-hidden="true"
                    className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                >
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
            </button>

            {isOpen && (
                <div className={styles.dropdownMenu}>
                    <button 
                        className={`${styles.dropdownItem} ${mode === 'light' && !autoDetect ? styles.active : ''}`}
                        onClick={() => handleOptionClick('light')}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Light</span>
                    </button>

                    {/* <button 
                        className={`${styles.dropdownItem} ${mode === 'dark' && !autoDetect ? styles.active : ''}`}
                        onClick={() => handleOptionClick('dark')}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                        <span>Dark</span>
                    </button> */}

                    <button 
                        className={`${styles.dropdownItem} ${autoDetect ? styles.active : ''}`}
                        onClick={() => handleOptionClick('auto')}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Auto ({systemTheme})</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ThemeDropdown;
