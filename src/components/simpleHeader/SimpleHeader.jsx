import React from "react";
import styles from "./SimpleHeader.module.css";
import { useSmartBack } from "../../hooks/useSmartBack";

export default function SimpleHeader({ title, fallbackRoute = "/home" }) {
  const handleBack = useSmartBack(fallbackRoute);

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.backBtn} onClick={handleBack}>
          <img src="/icons/left-arrow.svg" alt="Back" />
        </button>
        <h3 className={styles.title}>{title}</h3>
      </div>
    </header>
  );
}
