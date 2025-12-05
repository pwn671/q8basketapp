import React, { useState, useEffect } from "react";
import styles from "./CouponPage.module.css";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import SearchHeader from "../../components/searchHeader/SearchHeader";
import config from "../../config/env";
import { safeApiCall, parseApiResponse } from "../../utils/errorHandler";
import { formatCurrency } from "../../config/currency";

export default function CouponPage() {
    const { state, dispatch } = useCart();
    const navigate = useNavigate();
    const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const [searchActive, setSearchActive] = useState(true);
    const [search, setSearch] = useState("");
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState("");
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);

    const BASE_URL = config.API_BASE_URL;

    // Fetch coupons
    useEffect(() => {
        const fetchCoupons = async () => {
            setLoading(true);

            const result = await safeApiCall(
                async () => {
                    const response = await fetch(`${BASE_URL}/front/coupons?limit=10&offset=0`);
                    const data = await parseApiResponse(response);

                    if (data.status && data.data?.items) {
                        return data.data.items;
                    }
                    return [];
                },
                {
                    showErrorToast: false,
                    customErrorMessage: "Failed to load coupons",
                    fallbackValue: [],
                }
            );

            setCoupons(result);
            setLoading(false);
        };

        fetchCoupons();
    }, [BASE_URL]);

    // Validate coupon conditions
    const validateCoupon = (coupon) => {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Reset time for accurate date comparison

        const startDate = new Date(coupon.start_date);
        const endDate = new Date(coupon.end_date);

        // Check if current date is within valid range
        if (currentDate < startDate || currentDate > endDate) {
            return { valid: false, error: "This coupon has expired or is not yet valid" };
        }

        // Check minimum cart amount
        if (total < coupon.minimum_amount) {
            return {
                valid: false,
                error: `Minimum cart amount of ${formatCurrency(coupon.minimum_amount)} required.`
            };
        }

        return { valid: true };
    };

    // Apply coupon from list (local apply)
    const handleApplyCoupon = (coupon) => {
        const validation = validateCoupon(coupon);

        if (!validation.valid) {
            setCouponError(validation.error);
            return;
        }

        dispatch({ type: "APPLY_COUPON", payload: coupon });
        setAppliedCoupon(coupon);
        setCouponError("");

        // Redirect to cart page after successful coupon application
        setTimeout(() => {
            navigate("/cart");
        }, 500);
    };

    // Remove coupon
    const handleRemoveCoupon = () => {
        dispatch({ type: "REMOVE_COUPON" });
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponError("");
    };

    // Manual coupon apply via API call
    const handleManualCouponApply = async () => {
        if (!couponCode.trim()) {
            setCouponError("Please enter a coupon code");
            return;
        }

        setLoading(true);
        const result = await safeApiCall(
            async () => {
                const response = await fetch(
                    `${BASE_URL}/front/get/coupon-code?coupon=${encodeURIComponent(couponCode.trim())}`
                );
                const data = await parseApiResponse(response);

                if (data.status && data.data) {
                    return data.data;
                }
                throw new Error(data.error || "Coupon Not Found");
            },
            {
                showErrorToast: false,
                customErrorMessage: "Failed to validate coupon",
                fallbackValue: null,
            }
        );

        setLoading(false);

        if (result) {
            const validation = validateCoupon(result);

            if (!validation.valid) {
                setCouponError(validation.error);
                return;
            }

            handleApplyCoupon(result);
        } else {
            setCouponError("Invalid coupon code");
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.pageInner}>
                {/* ===== Scrollable content ===== */}
                <SearchHeader
                    title="Coupon"
                    search={search}
                    setSearch={setSearch}
                    searchActive={searchActive}
                    toggleSearch={() => setSearchActive((prev) => !prev)}
                />

                {/* Manual Coupon Code Input Section */}
                <div className={styles.manualCouponSection}>
                    <h4 className={styles.sectionTitle}>Enter Coupon Code</h4>
                    <div className={styles.couponInputWrapper}>
                        <input
                            type="text"
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className={styles.couponInput}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleManualCouponApply();
                                }
                            }}
                        />
                        <button
                            className={styles.applyCouponBtn}
                            onClick={handleManualCouponApply}
                            disabled={!couponCode.trim() || loading}
                        >
                            {loading ? "Checking..." : "Apply"}
                        </button>
                    </div>

                    {couponError && <p className={styles.couponError}>{couponError}</p>}

                    {appliedCoupon && (
                        <div className={styles.appliedCoupon}>
                            <div className={styles.appliedCouponInfo}>
                                <span className={styles.appliedCouponTitle}>✓ {appliedCoupon.title}</span>
                                <span className={styles.appliedCouponCode}>{appliedCoupon.code}</span>
                            </div>
                            <button className={styles.removeCouponBtn} onClick={handleRemoveCoupon}>
                                Remove
                            </button>
                        </div>
                    )}
                </div>

                <section className={styles.couponCard}>
                    <img src="/icons/discount.svg" alt="Tag" className={styles.couponIcon} />
                    <h6 onClick={() => navigate("/coupon")}>Use Coupon</h6>
                </section>

                <div className={styles.content}>
                    {/* Coupon List */}
                    <section className={styles.cartListSection}>
                        {loading ? (
                            <p>Loading...</p>
                        ) : coupons.length === 0 ? (
                            <p>No coupons available</p>
                        ) : (
                            coupons.map((it) => (
                                <article key={it.id} className={styles.couponItem}>
                                    <div className={styles.couponInfo}>
                                        <div className={styles.couponMeta}>
                                            <h6 className={styles.couponTitle}>{it.title}</h6>
                                            <span className={styles.couponCode}>Use code {it.code}</span>
                                            <p className={styles.couponText}>{it.description}</p>
                                            <p className={styles.couponText}>
                                                Min. Order: {formatCurrency(it.minimum_amount)}
                                            </p>
                                            <p className={styles.couponText}>
                                                Valid: {it.start_date} - {it.end_date}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={styles.couponActions}>
                                        <button
                                            className={styles.applyBtn}
                                            onClick={() => handleApplyCoupon(it)}
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </article>
                            ))
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
