import React, { useState, useEffect } from "react";
import styles from "./SearchLocationPage.module.css";
import { useNavigate, useLocation as useRouterLocation } from "react-router-dom";
import SearchHeader from "../../components/searchHeader/SearchHeader";
import SearchBar from "../../components/searchbar/SearchBar";
import config from "../../config/env";
import { useLocation } from "../../hooks/useLocation";


export default function SearchLocationPage() {

    const navigate = useNavigate();
    const location = useRouterLocation();

    const [searchActive, setSearchActive] = useState(true);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const BASE_URL = config.API_BASE_URL;

    // Use the location hook to get current location
    const { 
        address, 
        isLoadingAddress, 
        locationError, 
        getCurrentLocation 
    } = useLocation({
        enableGeolocation: true,
        enableReverseGeocoding: true,
        enableSearch: false,
        defaultLocation: { lat: 25.2048, lng: 55.2708 }
    });


    return (
        <div className={styles.pageWrapper}>
            <div className={styles.pageInner}>
                {/* ===== Scrollable content ===== */}
                {/* {header} */}
                <SearchHeader
                    title="Search City and Locality"
                    search={search}
                    setSearch={setSearch}
                    searchActive={searchActive}
                    toggleSearch={() => setSearchActive(prev => !prev)}
                />
                <div className={styles.bottomSheet} onClick={(e) => e.stopPropagation()}>

                    <SearchBar 
                        search={search}
                        setSearch={setSearch}
                        placeholder="Search for location..."
                        showSearchIcon={true}
                        showMicIcon={false}
                    />
                        {/* Add new address option */}
                    <div 
                        className={styles.addressItem}
                        onClick={() => {
                            // Handle current location selection
                            if (address) {
                                // Navigate to address picker with current location
                                // Pass state to indicate where we came from
                                const fromState = location.state?.from || '/my-address';
                                navigate('/address-picker', { state: { from: fromState } });
                            } else {
                                // Try to get current location if not available
                                getCurrentLocation();
                            }
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        <img src="/icons/location.svg" alt="Location" className={styles.addressIcon} />
                        <div className={styles.addressInfo}>
                            <div className={styles.addressMeta}>
                                <h6 className={styles.addressTitle}>Use Current Location</h6>
                                <p className={styles.addressSubtitle} style={{ fontSize: '0.85rem', color: '#666', margin: '2px 0', fontWeight: '400' }}>
                                    {isLoadingAddress 
                                        ? "Finding location..." 
                                        : locationError 
                                            ? "Tap to try again" 
                                            : address 
                                                ? address.slice(0,30) + (address.length > 15 ? '...' : '')
                                                : "Tap to get location"
                                    }
                                </p>
                            </div>
                        </div>
                        <img src="/icons/arrow-right.svg" alt="Location" className={styles.addressIcon} />
                    </div>


                </div>

            </div>
        </div>
    );
}
