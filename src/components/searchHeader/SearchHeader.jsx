import React from "react";
import styles from "./SearchHeader.module.css";
import SearchBar from "../searchbar/SearchBar";
import { useSmartBack } from "../../hooks/useSmartBack";

export default function SearchHeader({ title, search, setSearch, searchActive, toggleSearch }) {
  const handleBack = useSmartBack('/home');

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.backBtn} onClick={handleBack}>
          <img src="/icons/left-arrow.svg" alt="Back" />
        </button>

        {!searchActive ? (
          <SearchBar 
            search={search} 
            setSearch={setSearch}
            showSearchIcon={false}
            showMicIcon={true}
          />
        ) : (
          <h3 className={styles.title}>{title}</h3>
        )}
      </div>

      <button
        className={styles.searchBtn}
        onClick={toggleSearch}
        aria-label="Toggle search"
      >
        {searchActive ? (
          <img
            src="/icons/search.svg"
            alt="Search"
            className={styles.searchIcons}
          />
        ) : (
          <img
            src="/icons/close.svg"
            alt="Close"
            className={styles.searchIcons}
          />
        )}
      </button>
    </header>
  );
}
