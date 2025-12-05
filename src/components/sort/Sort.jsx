import React, { useState, useEffect } from "react";
import styles from "./Sort.module.css";

export default function Sort({ show, onClose, onApply, options, defaultValue = "relevance" }) {
  const [selected, setSelected] = useState(defaultValue);

  useEffect(() => {
    if (show) {
      setSelected(defaultValue);
    }
  }, [show, defaultValue]);

  if (!show) return null;

  const handleSelect = (id) => {
    setSelected(id);
    onApply(id); // immediately apply sort
    onClose();   // close after selection
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <button className={styles.closeBtn} onClick={onClose}>
        ✕
      </button>

      <div className={styles.bottomSheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Sort By</h3>
        </div>

        <ul className={styles.list}>
          {options?.map((opt) => (
            <li
              key={opt.id}
              className={selected === opt.id ? styles.activeItem : ""}
              onClick={() => handleSelect(opt.id)}
            >
              <input
                type="radio"
                name="sort"
                checked={selected === opt.id}
                readOnly
                className={styles.checkBox}
              />
              <span>{opt.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
