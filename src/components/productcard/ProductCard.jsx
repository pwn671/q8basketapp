// src/components/ProductCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ProductCard.module.css";

export default function ProductCard({ id, title, thumbnail, category_id }) {
  const navigate = useNavigate();

  const handleProductCard = () => {
    // Navigate to products page with category filter if category_id exists
    if (category_id) {
      navigate(`/products?category=${category_id}`);
    } else {
      navigate(`/products`);
    }
  };

  return (
    <li key={id} className={styles.productCard} role="listitem" onClick={handleProductCard} >
      <div className={styles.imageWrapper}  style={{ cursor: "pointer" }}>
        <img
          src={thumbnail}
          alt={title}
          loading="lazy"
          width={120}
          height={120}
          className={styles.productImage}
        />
      </div>
      <span className={styles.productTitle}>{title}</span>
    </li>
  );
}
