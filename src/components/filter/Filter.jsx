import React, { useState } from "react";
import styles from "./Filter.module.css";
import SearchBar from "../searchbar/SearchBar";

export default function Filter({ show, onClose, onApply, filters }) {
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");

  if (!show) return null;

  const toggleFilter = (item) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleClear = () => {
    setSelected([]);
    onApply([]);   // 🔥 reset products to original state
  };
  const handleApply = () => {
    onApply(selected);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.bottomSheet}
        onClick={(e) => e.stopPropagation()}
      >
        {/* floating close button */}
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>

        {/* Header */}
        <div className={styles.header}>
          <h3>Filters</h3>
        </div>

        {/* Two-column content */}
        <div className={styles.filterContainer}>
          <div className={styles.left}>
            <button className={styles.leftOption}>Type</button>
            <button className={styles.leftOption}>Properties</button>
          </div>

          <div className={styles.right}>
            {/* Search bar */}
            <div className={styles.searchBox}>
              <SearchBar 
                search={search}
                setSearch={setSearch}
                placeholder="Search filters..."
                showSearchIcon={true}
                showMicIcon={false}
              />
            </div>
            <ul className={styles.list}>
              {filters
                ?.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
                .map((f) => (
                  <li
                    key={f.id}
                    className={selected.includes(f.id) ? styles.activeItem : ""}
                    onClick={() => toggleFilter(f.id)}
                  >
                    <img src={f.image} alt={f.name} />
                    <span>
                      {f.name}
                    </span>
                    <input
                      type="checkbox"
                      className={styles.checkBox}
                      checked={selected.includes(f.id)}
                      readOnly
                    />
                  </li>
                ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            className={styles.clearBtn}
            onClick={handleClear}
            disabled={selected.length === 0}
          >
            Clear filters
          </button>
          <button
            className={styles.applyBtn}
            onClick={handleApply}
            disabled={selected.length === 0}
          >
            Apply
          </button>
        </div>

      </div>
    </div>
  );
}
