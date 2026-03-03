// src/components/Header.jsx
import React from "react";
import styles from "./Header.module.css";
import SearchBar from "../searchbar/SearchBar";
import { useNavigate } from "react-router-dom";
import config from "../../config/env";

export default function Header({ location, search, setSearch }) {
    const navigate = useNavigate();
    const BASE_URL = config.BACKEND_URL;

    const handleArrowClick = () => {
        navigate("/my-address", { state: { from: "/home" } });
    };

    return (
        <header className={styles.homeHeader}>
            <img
                src={`${BASE_URL}/image/o/assets/images/app/logo-vertical.png`}
                alt="Q8 Basket"
                className={styles.headerLogo}
                tabIndex={0}
            />

            {/* Location Info */}
            <div className={styles.locationWrapper} onClick={handleArrowClick}>
                <div className={styles.locationIcon}>
                    <img src="/icons/location.svg" alt="" aria-hidden="true" />
                </div>
                <div className={styles.locationInfo}>
                    <span className={styles.locationLabel}>Your Location</span>
                    <span className={styles.locationText}>{location}</span>
                </div>
                <div className={styles.arrowIcon} >
                    <img src="/icons/arrow-right.svg" alt="" aria-hidden="true" />
                </div>
            </div>


            {/* 🔽 Search moved inside header */}
            <SearchBar 
                search={search} 
                setSearch={setSearch}
                showSearchIcon={true}
                showMicIcon={true}
            />
        </header>
    );
}
