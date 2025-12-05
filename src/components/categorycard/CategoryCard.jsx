// src/components/CategoryCard.jsx
import React from "react";
import styles from "./CategoryCard.module.css"; // CSS module for styles
import { useNavigate } from "react-router-dom";

export default function CategoryCard({ id, name, image }) {
    const navigate = useNavigate();

    return (
        <li
            className={styles.categoryCard}
            role="listitem"
            onClick={() => navigate(`/products?category=${id}`)}
            style={{ cursor: "pointer" }}
        >
            <img src={image} alt={name} loading="lazy" />
            <span>{name}</span>
        </li>
    );
}
