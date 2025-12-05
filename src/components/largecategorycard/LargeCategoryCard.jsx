import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LargeCategoryCard.module.css";

export default function LargeCategoryCard({ id, name, image }) {
  const navigate = useNavigate();

  return (
    <div
      className={styles.categoryCard}
      role="listitem"
      onClick={() => navigate(`/products?category=${id}`)}
    >
      <img src={image} alt={name} loading="lazy" className={styles.categoryImg} />
      <p className={styles.categoryName}>{name}</p>
    </div>
  );
}
