import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SearchBar.module.css";

export default function SearchBar({ 
    search, 
    setSearch, 
    placeholder = "Search for products",
    showSearchIcon = true,
    showMicIcon = true 
}) {
    const navigate = useNavigate();

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && search.trim()) {
            navigate(`/search?query=${encodeURIComponent(search.trim())}`);
        }
    };

    return (
        <div className={styles.searchBarWrapper}>
            {showSearchIcon && (
                <img src="/icons/search.svg" alt="" aria-hidden="true" className={styles.searchIcon} />
            )}

            <input
                type="search"
                aria-label="Search for products"
                placeholder={placeholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
                onKeyDown={handleKeyDown}
            />

            {/* {showMicIcon && (
                <button className={styles.micBtn} aria-label="Voice search">
                    <img src="/icons/mic.svg" alt="mic" className={styles.micIcon} />
                </button>
            )} */}
        </div>
    );
}
