import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import styles from "./MyAddressPage.module.css";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { useSmartBack } from "../../hooks/useSmartBack";
import Address from "../../components/address/Address";
import AddAddress from "../../components/address/AddAddress";
import addressService from "../../services/addressService";
import config from "../../config/env";
import layoutStyles from "../../styles/Layout.module.css";
import useLockBodyScrollOnApp from "../../hooks/useLockBodyScrollOnApp";
import { useCart } from "../../context/CartContext";
import { logout } from "../../features/auth/authSlice";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavBar from "../../components/navbar/NavBar";


export default function MyAddressPage() {

    const { token, isAuthenticated } = useAuth();
    const dispatch = useDispatch();
    const { dispatch: cartDispatch } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get return path from location state or default to home
    const returnPath = location.state?.from || '/home';
 

    const [addresses, setAddresses] = useState([]);
    const [addressLoading, setAddressLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAddress, setShowAddress] = useState(false);
    const [showAddAddress, setShowAddAddress] = useState(false);

    const BASE_URL = config.API_BASE_URL;

    // Smart back navigation hook (must be called at top level)
    const smartBack = useSmartBack(returnPath);

    // Helper function to handle authentication errors
    const handleAuthError = () => {
        // Clear token and user data
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userProfile');

        // Dispatch logout action
        dispatch(logout());

        // Show error message as toast
        toast.error('Your session has expired. Please login again.');

        // Redirect to login
        navigate('/signin');
    };

    // Reset popup states and refresh addresses when coming back from address picker
    useEffect(() => {
        // Reset popup states when navigating back from address picker
        const state = location.state;
        if (state?.from === '/address-picker' || state?.from === '/search-location') {
            setShowAddress(false);
            setShowAddAddress(false);
            
            // Refresh addresses list after saving a new address
            if (isAuthenticated && token) {
                const refreshAddresses = async () => {
                    try {
                        const result = await addressService.fetchAddresses(token);
                        if (result.success) {
                            setAddresses(result.data);
                        }
                    } catch (err) {
                        console.error('Error refreshing addresses:', err);
                    }
                };
                refreshAddresses();
            }
        }
    }, [location.state, isAuthenticated, token]);

    // Fetch addresses from API
    useEffect(() => {
        const fetchAddresses = async () => {
            if (!isAuthenticated || !token) {
                setError('Please login to view addresses');
                return;
            }

            setAddressLoading(true);
            setError(null);
            
            try {
                const result = await addressService.fetchAddresses(token);
                
                // Check if logout is required
                if (result.requiresLogout) {
                    handleAuthError();
                    return;
                }
                
                if (result.success) {
                    setAddresses(result.data);
                } else {
                    setError(result.error || 'Failed to fetch addresses');
                }
            } catch (err) {
                console.error('Error fetching addresses:', err);
                setError('Failed to fetch addresses');
            } finally {
                setAddressLoading(false);
            }
        };

        fetchAddresses();
    }, [isAuthenticated, token]);

   

    // Handlers
    const handleSelect = async (locationId) => {
        // Prevent action if popups are showing
        if (showAddress || showAddAddress) {
            return;
        }

        // Find the selected address
        const selectedAddress = addresses.find(addr => addr.location_id === locationId);

        if (selectedAddress) {
            // Update address in cart context (this will persist and update both Home and Cart pages)
            cartDispatch({
                type: 'SET_SELECTED_ADDRESS',
                payload: {
                    locationId: locationId,
                    address: selectedAddress
                }
            });
        }

        // Navigate back to the page that opened this (home or cart)
        navigate(returnPath, { replace: true });
    };

    const handleAddNewAddress = () => {
        setShowAddress(true);
    };

    // Smart back navigation - avoid loops with child pages
    const handleBack = () => {
        const state = location.state;
        
        // List of pages that can be accessed from My Address
        const myAddressChildPages = [
            '/address-picker',
            '/search-location'
        ];
        
        // If we came from any My Address child page, go to returnPath instead of going back
        // This prevents the back-and-forth navigation loops
        if (state?.from && myAddressChildPages.includes(state.from)) {
            navigate(returnPath, { replace: true });
            return;
        }
        
        // If preventLoop flag is set, go to returnPath
        if (state?.preventLoop) {
            navigate(returnPath, { replace: true });
            return;
        }
        
        // Otherwise use smart back navigation
        // The smart back hook also has checks for my-address child pages
        smartBack();
    };

    useLockBodyScrollOnApp();

    return (
        <div className={layoutStyles.appWrapper}>
            <div className={layoutStyles.appContainer}>
                {/* ===== Scrollable content ===== */}
                <header style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '12px 16px',
                    borderBottom: '1px solid #eee'
                }}>
                    <button
                        style={{
                            background: "none",
                            border: "none",
                            fontSize: "1.1rem",
                            cursor: "pointer",
                            marginRight: "12px"
                        }}
                        onClick={handleBack}
                    >
                        <img src="/icons/left-arrow.svg" alt="Back" style={{ width: '20px', height: '20px' }} />
                    </button>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>My Address</h3>
                </header>
                <div className={styles.bottomSheet} onClick={(e) => e.stopPropagation()} style={{ pointerEvents: showAddress || showAddAddress ? 'none' : 'auto' }}>
                    <div className={styles.header}>
                        <h3>Select delivery location</h3>
                    </div>

                    {/* Add new address option */}
                    <div className={styles.addressItem} onClick={handleAddNewAddress}>
                        <img src="/icons/location.svg" alt="Location" className={styles.addressIcon} />
                        <div className={styles.addressInfo}>
                            <div className={styles.addressMeta}>
                                <h6 className={styles.addressTitle}>Add New Address</h6>
                            </div>
                        </div>
                        <img src="/icons/arrow-right.svg" alt="Location" className={styles.addressIcon} />
                    </div>

                    {/* Saved addresses */}
                    <section className={styles.cartListSection}>
                        <div className={styles.innerHeader}>
                            <h5>Saved Address</h5>
                        </div>
                        
                        {/* Loading state */}
                        {addressLoading && (
                            <div className={styles.loadingContainer}>
                                <p>Loading addresses...</p>
                            </div>
                        )}

                        {/* Error state */}
                        {error && (
                            <div className={styles.errorContainer}>
                                <p className={styles.errorText}>{error}</p>
                            </div>
                        )}

                        {/* No addresses state */}
                        {!addressLoading && !error && addresses.length === 0 && (
                            <div className={styles.emptyContainer}>
                                <p>No saved addresses found. Add your first address!</p>
                            </div>
                        )}

                        {/* Address list */}
                        {!addressLoading && !error && addresses.map((address) => (
                            <article
                                key={address.id}
                                className={`${styles.addressItem} ${address.is_default ? styles.defaultAddress : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelect(address.location_id);
                                }}
                                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                            >
                                <img src="/icons/location.svg" alt="Location" className={styles.addressIcon} />
                                <div className={styles.addressInfo}>
                                    <div className={styles.addressMeta}>
                                        <h6 className={styles.addressTitle}>
                                            {address.label ? address.label : 'Address'}
                                            {address.is_default == 1 ? <span className={styles.defaultBadge}>(Default)</span>: ""}
                                        </h6>
                                        <p className={styles.addressText}>
                                            {address.address}
                                            {address.apartment_building && `, ${address.apartment_building}`}
                                            {address.landmark && `, ${address.landmark}`}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                </div>

                {/* Address Selection Popup */}
                {showAddress && (
                    <Address
                        show={showAddress}
                        onClose={() => {
                            setShowAddress(false);
                        }}
                        onAddNewAddress={() => {
                            setShowAddress(false);
                            setShowAddAddress(true);
                        }}
                    />
                )}

                {/* Add Address Popup */}
                {showAddAddress && (
                    <AddAddress
                        show={showAddAddress}
                        onClose={() => {
                            setShowAddAddress(false);
                        }}
                    />
                )}

            </div>
            <NavBar />
            <ToastContainer position="top-center" autoClose={3000} />
        </div>
    );
}
