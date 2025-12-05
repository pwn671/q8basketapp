import React from "react";
import styles from "./Profile.module.css";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../../features/auth/authThunks';
import { useAuth } from '../../hooks/useAuth';
import ThemeDropdown from '../../components/ThemeDropdown/ThemeDropdown';
import useLockBodyScrollOnApp from '../../hooks/useLockBodyScrollOnApp';
import { useSmartBack } from '../../hooks/useSmartBack';
import layoutStyles from "../../styles/Layout.module.css";
export default function Profile({
    onBack = () => { },
    onAddBirthday = () => { },
    onSupport = () => { },
    onPayments = () => {},
    onLogout = () => { },
}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { loading } = useSelector(state => state.auth);
    const { user, isAuthenticated } = useAuth();

    useLockBodyScrollOnApp();

    // Smart back navigation hook (must be called at top level)
    const smartBack = useSmartBack('/home');

    // Get phone number from user data, with fallback
    const getPhoneNumber = () => {
        if (!isAuthenticated || !user) {
            return "xxxx-xxxx"; // Default fallback
        }
        
        // Try different possible phone field names from API
        return user.phone || 
               user.phone_number || 
               user.mobile || 
               user.mobile_number ||
               user.contact ||
               "xxxx-xxxx"; // Fallback if no phone found
    };


    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            navigate('/signin');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    // Smart back navigation - avoid loops with child pages
    const handleBack = () => {
        const state = location.state;
        
        // List of pages that can be accessed from Profile
        const profileChildPages = [
            '/my-address',
            '/edit-profile',
            '/orders',
            '/aboutus',
            '/account-privacy',
            '/checkout'
        ];
        
        // If we came from any Profile child page, go to home instead of going back
        // This prevents the back-and-forth navigation loops
        if (state?.from && profileChildPages.includes(state.from)) {
            navigate('/home');
            return;
        }
        
        // If preventLoop flag is set, go to home
        if (state?.preventLoop) {
            navigate('/home');
            return;
        }
        
        // Otherwise use smart back navigation
        smartBack();
    };

    return (
        <div className={layoutStyles.appWrapper} role="main" aria-label="Profile screen">
            <div className={layoutStyles.appContainer}>
                <header className={styles.header}>
                    <button
                        style={{
                            background: "none",
                            border: "none",
                            fontSize: "1.1rem",
                            cursor: "pointer",
                        }}
                        onClick={handleBack}
                    >
                        <img src="/icons/left-arrow.svg" alt="Back" className={styles.backBtn} />
                    </button>

                    <div className={styles.headerTitle}>Profile</div>
                </header>

                <div className={styles.content}>
                    <h1 className={styles.accountTitle}>Your account</h1>

                    <div className={styles.phoneRow}>
                        <svg
                            className={styles.phoneIcon}
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.09 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72c.12.9.38 1.78.76 2.6a2 2 0 0 1-.45 2.11L8.91 9.91a16 16 0 0 0 6 6l1.48-1.48a2 2 0 0 1 2.11-.45c.82.38 1.7.64 2.6.76A2 2 0 0 1 22 16.92z"
                                fill="currentColor"
                            />
                        </svg>
                        <span className={styles.phoneText}>{getPhoneNumber()}</span>
                    </div>

                    {/* Birthday CTA */}
                    <button
                        className={styles.birthdayCard}
                        onClick={onAddBirthday}
                        aria-label="Add your birthday"
                    >
                        <div className={styles.birthdayTitle}>Add your birthday</div>
                        <div className={styles.birthdaySub}>Enter details</div>
                    </button>

                    {/* Two action pills */}
                    <div className={styles.pillsRow} role="toolbar" aria-label="Quick actions">
                        <button className={styles.pill} onClick={onSupport}>
                            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M21 15a2 2 0 0 1-2 2h-3l-3 3v-3H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Support</span>
                        </button>

                        <button className={styles.pill} onClick={()=>navigate('/checkout', { state: { from: '/profile' } })}>
                            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                                <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                <path d="M7 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Payments</span>
                        </button>
                    </div>

                    {/* Appearance row with dropdown */}
                    <div className={styles.appearanceRow}>
                        <div className={styles.appearanceLeft}>
                            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                                <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Appearance</span>
                        </div>

                        <ThemeDropdown />
                    </div>

                    {/* Sections with list rows */}
                    <div className={styles.sectionLabel}>YOUR INFORMATION</div>

                    <ul className={styles.list}>
                        <li className={styles.row} onClick={()=>navigate('/edit-profile', { state: { from: '/profile' } })}>
                            <div className={styles.rowLeft}>
                                <div className={styles.iconBox}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                    </svg>
                                </div>
                                <div className={styles.rowText}>
                                    <div className={styles.rowTitle}>Edit Profile</div>
                                </div>
                            </div>
                            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className={styles.chev}>
                                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                        </li>

                        <li className={styles.row} onClick={()=>navigate('/orders', { state: { from: '/profile' } })}>
                            <div className={styles.rowLeft}>
                                <div className={styles.iconBox}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M21 16V8a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                        <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                    </svg>
                                </div>
                                <div className={styles.rowText} >
                                    <div className={styles.rowTitle}>Your orders</div>
                                </div>
                            </div>
                            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className={styles.chev}>
                                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                        </li>

                        <li className={styles.row} onClick={()=>navigate('/my-address', { state: { from: '/profile' } })}>
                            <div className={styles.rowLeft}>
                                <div className={styles.iconBox}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M20 21V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                        <path d="M8 21v-6h8v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                    </svg>
                                </div>
                                <div className={styles.rowText} >
                                    <div className={styles.rowTitle}>Address book</div>
                                </div>
                            </div>
                            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className={styles.chev}>
                                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                        </li>
                    </ul>

                    <div className={styles.sectionLabel}>PAYMENTS AND COUPONS</div>
                    <ul className={styles.list}>
                        <li className={styles.row}>
                            <div className={styles.rowLeft}>
                                <div className={styles.iconBox}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M21 7H3v10h18V7z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                        <path d="M7 11h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                    </svg>
                                </div>
                                <div className={styles.rowText}>
                                    <div className={styles.rowTitle}>Your collected rewards</div>
                                </div>
                            </div>
                            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className={styles.chev}>
                                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                        </li>
                    </ul>

                    <div className={styles.sectionLabel}>OTHER INFORMATION</div>
                    <ul className={styles.list}>
                        <li className={styles.row}>
                            <div className={styles.rowLeft}>
                                <div className={styles.iconBox}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M12 2v20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                        <path d="M5 7h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                    </svg>
                                </div>
                                <div className={styles.rowText}>
                                    <div className={styles.rowTitle}>Share the app</div>
                                </div>
                            </div>
                            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className={styles.chev}>
                                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                        </li>

                        <li className={styles.row} onClick={()=>navigate('/aboutus', { state: { from: '/profile' } })}>
                            <div className={styles.rowLeft}>
                                <div className={styles.iconBox}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                        <path d="M12 8v4l2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                    </svg>
                                </div>
                                <div className={styles.rowText}>
                                    <div className={styles.rowTitle} >About us</div>
                                </div>
                            </div>
                            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className={styles.chev}>
                                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                        </li>
                         <li className={styles.row} onClick={()=>navigate('/account-privacy', { state: { from: '/profile' } })}>
                            <div className={styles.rowLeft}>
                                <div className={styles.iconBox}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                        <path d="M12 8v4l2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                    </svg>
                                </div>
                                <div className={styles.rowText}>
                                    <div className={styles.rowTitle}>Account Privacy</div>
                                </div>
                            </div>
                            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className={styles.chev}>
                                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                        </li>
                    </ul>

                    {/* Logout button */}
                    <button
                        type="button"
                        className={styles.logoutButton}
                        onClick={handleLogout}
                        aria-label="Logout"
                    >
                        {loading ? 'Logging out...' : 'Logout'}
                    </button>

                    {/* small spacer to avoid bottom nav overlap */}
                    <div style={{ height: 90 }} />
                </div>
            </div>
        </div>
    );
}
