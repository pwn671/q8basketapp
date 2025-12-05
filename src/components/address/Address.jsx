import React, { useState, useEffect } from "react";
import styles from "./Address.module.css";
import { useAuth } from "../../hooks/useAuth";
import addressService from "../../services/addressService";

export default function Address({
    show,
    onClose,
    onApply,
    onAddNewAddress,   // ✅ new prop for Add Address flow
    options,
    defaultValue = "relevance",
}) {
    const [selected, setSelected] = useState(defaultValue);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token, isAuthenticated } = useAuth();

    useEffect(() => {
        if (show) {
            setSelected(defaultValue);
        }
    }, [show, defaultValue]);

    // Fetch addresses when popup opens
    useEffect(() => {
        const fetchAddresses = async () => {
            if (!show || !isAuthenticated || !token) return;

            setLoading(true);
            setError(null);
            
            try {
                const result = await addressService.fetchAddresses(token);
                if (result.success) {
                    setAddresses(result.data);
                    // Don't show error if addresses array is empty, just show "no addresses" message
                } else {
                    // Only show error for actual API failures, not empty results
                    if (result.error && !result.error.includes('No addresses found')) {
                        setError(result.error || 'Failed to fetch addresses');
                    }
                }
            } catch (err) {
                setError('Failed to fetch addresses');
            } finally {
                setLoading(false);
            }
        };

        fetchAddresses();
    }, [show, isAuthenticated, token]);

    if (!show) return null;

    const handleSelect = (locationId) => {
        setSelected(locationId);
        if (onApply) onApply(locationId); // ✅ safeguard
        onClose();   // close after selection
    };

    const openAddAddress = () => {
        onClose(); // close current modal
        if (onAddNewAddress) onAddNewAddress(); // ✅ open AddAddress modal
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <button className={styles.closeBtn} onClick={onClose}>
                ✕
            </button>

            <div className={styles.bottomSheet} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3>Select delivery location</h3>
                </div>

                {/* Add new address option */}
                <div className={styles.addressItem} onClick={openAddAddress}>
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
                    {loading && (
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <p>Loading addresses...</p>
                        </div>
                    )}

                    {/* Error state */}
                    {error && (
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <p style={{ color: '#e74c3c' }}>{error}</p>
                        </div>
                    )}

                    {/* No addresses state */}
                    {!loading && !error && addresses.length === 0 && (
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <p>No saved addresses found. Add your first address!</p>
                        </div>
                    )}

                    {/* Address list */}
                    {!loading && !error && addresses.map((address) => (
                        <article
                            key={address.id}
                            className={styles.addressItem}
                            onClick={() => handleSelect(address.location_id)}
                        >
                            <img src="/icons/location.svg" alt="Location" className={styles.addressIcon} />
                            <div className={styles.addressInfo}>
                                <div className={styles.addressMeta}>
                                    <h6 className={styles.addressTitle}>
                                        {address.is_default ? 'Default Address' : 'Address'}
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
        </div>
    );
}
