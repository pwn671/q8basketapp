import React from "react";
import styles from "./Sidebar.module.css";

export default function Sidebar({ activeCategoryIndex, setActiveCategoryIndex, categories = [] }) {
  return (
    <aside className={styles.sidebar}>
      <ul>
        {/* Add "All" as default first option */}
        <li
          className={activeCategoryIndex === 0 ? styles.active : ""}
          onClick={() => setActiveCategoryIndex(0)}
        >
          <img src="/icons/fruit1.svg" alt="All" />
          All
        </li>

        {/* Dynamically loaded categories */}
        {categories.map((category, index) => (
          <li
            key={category.id}
            className={activeCategoryIndex === index + 1 ? styles.active : ""}
            onClick={() => setActiveCategoryIndex(index + 1)}
          >
            <img src={category.image} alt={category.name} />
            {category.name}
          </li>
        ))}
      </ul>
    </aside>
  );
}
