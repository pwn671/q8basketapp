import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import NavBar from "../../components/navbar/NavBar";
import CategoryCard from "../../components/categorycard/CategoryCard";
import styles from "./Home.module.css";
import layoutStyles from "../../styles/Layout.module.css";
import ProductCard from "../../components/productcard/ProductCard";
import Header from "../../components/header/Header";
import config from "../../config/env";
import OfferPopup from "../../components/OfferPopup";
import useLockBodyScrollOnApp from '../../hooks/useLockBodyScrollOnApp';
import addressService from "../../services/addressService";
import { useCart } from "../../context/CartContext";
import { logout } from "../../features/auth/authSlice";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
    const { user, token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const { state: cartState } = useCart(); // Get selected address from cart context
    const [search, setSearch] = useState("");
    const [categories, setCategories] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [banners, setBanners] = useState([]);
    const [activeBanner, setActiveBanner] = useState(0);
    const [showOfferPopup, setShowOfferPopup] = useState(false);
    const [offerData, setOfferData] = useState(null);
    const [defaultAddress, setDefaultAddress] = useState(null);
    const [loadingAddress, setLoadingAddress] = useState(false);
    const navigate = useNavigate();

    const BASE_URL = config.API_BASE_URL;

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

    // Auto-slide interval ref
    const bannerIntervalRef = useRef(null);
    const offerFetchedRef = useRef(false);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const isUserInteracting = useRef(false);
    const autoScrollPaused = useRef(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${BASE_URL}/front/categories`);
                const data = await res.json();
                if (data.status) setCategories(data.data);
            } catch (err) {
                console.error("Category fetch error:", err);
            }
        };

        const fetchNewArrivals = async () => {
            try {
                const res = await fetch(`${BASE_URL}/front/products`);
                const data = await res.json();
                if (data.status) setNewArrivals(data.data);
            } catch (err) {
                console.error("New arrivals fetch error:", err);
            }
        };

        const fetchBanners = async () => {
            try {
                const res = await fetch(`${BASE_URL}/front/banners?type=TopSmall`);
                const data = await res.json();
                if (data.status) setBanners(data.data);
            } catch (err) {
                console.error("Banner fetch error:", err);
            }
        };

        fetchCategories();
        fetchNewArrivals();
        fetchBanners();
    }, []);

    // Fetch offer popup when user is authenticated
    useEffect(() => {
        const fetchOffer = async () => {
            // Only fetch if user is authenticated and we haven't fetched yet
            if (!user || !token || offerFetchedRef.current) return;

            // Check if we just logged in (show popup only once after login)
            const justLoggedIn = localStorage.getItem('justLoggedIn') === 'true';
            if (!justLoggedIn) return;

            try {
                // Mark as fetched to prevent multiple calls
                offerFetchedRef.current = true;

                // Fetch offer from API
                const res = await fetch(`${BASE_URL}/front/banners?type=TopSmall`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                });

                const data = await res.json();

                if (data.status && data.data && data.data.image) {
                    setOfferData({
                        image: data.data.image,
                        link: data.data.link || null,
                    });
                    setShowOfferPopup(true);
                }

                // Clear the login flag
                localStorage.removeItem('justLoggedIn');
            } catch (err) {
                console.error("Offer fetch error:", err);
                // Clear the login flag even on error
                localStorage.removeItem('justLoggedIn');
            }
        };

        fetchOffer();
    }, [user, token, BASE_URL]);

    // Fetch default address (only if no address is selected)
    useEffect(() => {
        const fetchDefaultAddress = async () => {
            // If address is already selected in cart context, don't fetch default
            if (cartState.selectedAddress) {
                setDefaultAddress(null);
                return;
            }

            if (!token || !user) {
                setDefaultAddress(null);
                return;
            }

            setLoadingAddress(true);
            try {
                const result = await addressService.fetchAddresses(token);
                
                // Check if logout is required
                if (result.requiresLogout) {
                    handleAuthError();
                    return;
                }
                
                if (result.success && result.data && result.data.length > 0) {
                    // Find default address (is_default === 1 or true)
                    const defaultAddr = result.data.find(addr => addr.is_default === 1 || addr.is_default === true);
                    if (defaultAddr) {
                        const addressText = `${defaultAddr.address}${defaultAddr.apartment_building ? `, ${defaultAddr.apartment_building}` : ''}`;
                        setDefaultAddress(addressText);
                    } else {
                        // If no default, use first address
                        const firstAddr = result.data[0];
                        const addressText = `${firstAddr.address}${firstAddr.apartment_building ? `, ${firstAddr.apartment_building}` : ''}`;
                        setDefaultAddress(addressText);
                    }
                } else {
                    setDefaultAddress(null);
                }
            } catch (err) {
                console.error("Error fetching default address:", err);
                setDefaultAddress(null);
            } finally {
                setLoadingAddress(false);
            }
        };

        fetchDefaultAddress();
    }, [token, user, cartState.selectedAddress]);

    // Auto-slide logic (pauses when user is interacting)
    useEffect(() => {
        if (banners.length > 1) {
            const startAutoScroll = () => {
                if (bannerIntervalRef.current) {
                    clearInterval(bannerIntervalRef.current);
                }
                bannerIntervalRef.current = setInterval(() => {
                    if (!autoScrollPaused.current) {
                        setActiveBanner((prev) => (prev + 1) % banners.length);
                    }
                }, 4000);
            };
            
            if (!autoScrollPaused.current) {
                startAutoScroll();
            }
        }
        return () => {
            if (bannerIntervalRef.current) {
                clearInterval(bannerIntervalRef.current);
            }
        };
    }, [banners]);

    // Pause auto-scroll temporarily when user interacts
    const pauseAutoScroll = () => {
        autoScrollPaused.current = true;
        if (bannerIntervalRef.current) {
            clearInterval(bannerIntervalRef.current);
        }
    };

    // Resume auto-scroll after user interaction ends
    const resumeAutoScroll = () => {
        autoScrollPaused.current = false;
        if (banners.length > 1) {
            if (bannerIntervalRef.current) {
                clearInterval(bannerIntervalRef.current);
            }
            bannerIntervalRef.current = setInterval(() => {
                if (!autoScrollPaused.current) {
                    setActiveBanner((prev) => (prev + 1) % banners.length);
                }
            }, 4000);
        }
    };

    // Handle touch start
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        isUserInteracting.current = true;
        pauseAutoScroll();
    };

    // Handle touch move
    const handleTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX;
    };

    // Handle touch end - detect swipe direction
    const handleTouchEnd = () => {
        if (!isUserInteracting.current) return;
        
        const swipeThreshold = 50; // Minimum distance for a swipe
        const diff = touchStartX.current - touchEndX.current;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next banner
                setActiveBanner((prev) => (prev + 1) % banners.length);
            } else {
                // Swipe right - previous banner
                setActiveBanner((prev) => (prev - 1 + banners.length) % banners.length);
            }
        }

        isUserInteracting.current = false;
        // Resume auto-scroll after 3 seconds
        setTimeout(() => {
            resumeAutoScroll();
        }, 3000);
    };

    // Handle mouse drag for desktop
    const handleMouseDown = (e) => {
        touchStartX.current = e.clientX;
        isUserInteracting.current = true;
        pauseAutoScroll();
    };

    const handleMouseMove = (e) => {
        if (isUserInteracting.current) {
            touchEndX.current = e.clientX;
        }
    };

    const handleMouseUp = () => {
        if (!isUserInteracting.current) return;

        const swipeThreshold = 50;
        const diff = touchStartX.current - touchEndX.current;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Drag left - next banner
                setActiveBanner((prev) => (prev + 1) % banners.length);
            } else {
                // Drag right - previous banner
                setActiveBanner((prev) => (prev - 1 + banners.length) % banners.length);
            }
        }

        isUserInteracting.current = false;
        // Resume auto-scroll after 3 seconds
        setTimeout(() => {
            resumeAutoScroll();
        }, 3000);
    };

    // Helper function to truncate address to 10 characters
    const truncateAddress = (address) => {
        if (!address) return address;
        return address.length > 10 ? address.substring(0, 10) + '...' : address;
    };

    // Helper function to handle banner link navigation
    const handleBannerClick = (banner) => {
        if (banner.is_clickable !== 1 || !banner.link || banner.link === '#') {
            return;
        }

        try {
            // Check if it's a full URL
            if (banner.link.startsWith('https://')) {
                // Parse the URL to extract path and query params
                const url = new URL(banner.link);
                
                // Check if it's an API endpoint that we need to convert to app route
                if (url.pathname.includes('/api/front/products')) {
                    // Extract query parameters
                    const categoryIds = url.searchParams.get('category_ids');
                    const categoryId = url.searchParams.get('category_id'); // Fallback for old format
                    const tags = url.searchParams.get('tags');
                    
                    if (categoryIds) {
                        // Handle comma-separated category IDs - use first one for navigation
                        const firstCategoryId = categoryIds.split(',')[0];
                        navigate(`/products?category=${firstCategoryId}`);
                    } else if (categoryId) {
                        // Navigate to products page with category filter (legacy support)
                        navigate(`/products?category=${categoryId}`);
                    } else if (tags) {
                        // Navigate to products page with tags filter
                        navigate(`/products?tags=${encodeURIComponent(tags)}`);
                    } else {
                        // Just navigate to products page
                        navigate('/products');
                    }
                } else {
                    // For other external URLs, open in new tab
                    window.open(banner.link, '_blank', 'noopener,noreferrer');
                }
            } else {
                // It's a relative path, use navigate directly
                navigate(banner.link);
            }
        } catch (error) {
            console.error('Error handling banner link:', error);
            // Fallback: try to navigate directly if URL parsing fails
            if (banner.link && banner.link !== '#') {
                navigate(banner.link);
            }
        }
    };

    useLockBodyScrollOnApp();
    return (
        <div className={layoutStyles.appWrapper}>
            <div className={layoutStyles.appContainer}>
                <Header
                    location={truncateAddress(
                        cartState.selectedAddress
                            ? `${cartState.selectedAddress.address}${cartState.selectedAddress.apartment_building ? `, ${cartState.selectedAddress.apartment_building}` : ''}`
                            : loadingAddress
                            ? "Loading address..."
                            : defaultAddress
                            ? defaultAddress
                            : "Select address"
                    )}
                    search={search}
                    setSearch={setSearch}
                />

                {/* 🔄 Banner Carousel */}
                <section className={styles.discountBannerWrapper} aria-label="Promotional Banners">
                    {banners.length > 0 ? (
                        <div 
                            className={styles.bannerCarousel}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            style={{ userSelect: 'none', touchAction: 'pan-x' }}
                        >
                            {banners.map((banner, index) => (
                                <div
                                    key={banner.id}
                                    className={`${styles.discountBanner} ${
                                        index === activeBanner ? styles.active : styles.hidden
                                    }`}
                                    onClick={() => handleBannerClick(banner)}
                                    style={{
                                        cursor: banner.is_clickable === 1 ? 'pointer' : 'default'
                                    }}
                                >
                                    <img
                                        src={banner.image}
                                        alt={banner.title}
                                        className={styles.discountImg}
                                        loading="lazy"
                                    />
                                    <div className={styles.discountText}>
                                        <h2>{banner.title}</h2>
                                        <p>
                                            {banner.text}
                                            <br />
                                            <span className={styles.discountValidity}>
                                                Offer valid till 30 July
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Loading banners...</p>
                    )}

                    {/* Dots indicator */}
                    {banners.length > 1 && (
                        <div className={styles.dotsContainer}>
                            {banners.map((_, idx) => (
                                <span
                                    key={idx}
                                    className={`${styles.dot} ${
                                        idx === activeBanner ? styles.activeDot : ""
                                    }`}
                                    onClick={() => {
                                        pauseAutoScroll();
                                        setActiveBanner(idx);
                                        setTimeout(() => {
                                            resumeAutoScroll();
                                        }, 3000);
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Categories Section */}
                <section className={styles.categoriesSection}>
                    <div className={styles.sectionHeader}>
                        <h4>Categories</h4>
                        <button
                            className={styles.seeAllBtn}
                            onClick={() => navigate("/category")}
                        >
                            See all
                        </button>
                    </div>
                    <ul className={styles.categoriesList}>
                        {categories.map(({ id, name, image }) => (
                            <CategoryCard key={id} id={id} name={name} image={image} />
                        ))}
                    </ul>
                </section>

                {/* New Arrivals Section */}
                <section className={styles.newArrivalSection}>
                    <div className={styles.sectionHeader}>
                        <h4>New arrival</h4>
                        <button
                            className={styles.seeAllBtn}
                            onClick={() => navigate("/products")}
                        >
                            See all
                        </button>
                    </div>
                    <ul className={styles.newArrivalList}>
                        {newArrivals.slice(0, 4).map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                title={product.title}
                                thumbnail={product.thumbnail}
                                category_id={product.main_category.id}
                            />
                        ))}
                    </ul>
                </section>
            </div>

            <NavBar />

            {/* Offer Popup */}
            <OfferPopup
                isOpen={showOfferPopup}
                onClose={() => setShowOfferPopup(false)}
                offerImage={offerData?.image}
                offerLink={offerData?.link}
            />
            <ToastContainer position="top-center" autoClose={3000} />
        </div>
    );
}
