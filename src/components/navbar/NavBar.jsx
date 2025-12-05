import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import styles from "./NavBar.module.css";

export default function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { itemsCount } = useCart();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className={styles.bottomNav} aria-label="Primary navigation">
            <button
                aria-label="Home"
                className={`${styles.navBtn} ${isActive("/") ? styles.active : ""}`}
                onClick={() => navigate("/home")}
            >
                <img src="/icons/home.svg" alt="" className={styles.navIcon} />
            </button>

            <button
                aria-label="Categories"
                className={`${styles.navBtn} ${isActive("/categories") ? styles.active : ""}`}
                onClick={() => navigate("/category")}
            >
                <img src="/icons/menu.svg" alt="" className={styles.navIcon} />
            </button>

            <button
                aria-label="Cart"
                className={`${styles.navBtn} ${isActive("/cart") ? styles.active : ""}`}
                onClick={() => navigate("/cart")}
            >
                <div className={styles.cartWrapper}>
                    <img src="/icons/cart.svg" alt="" className={styles.navIcon} />
                    {itemsCount > 0 && (
                        <span className={styles.cartBadge}>{itemsCount}</span>
                    )}
                </div>
            </button>

            <button
                aria-label="User Account"
                className={`${styles.navBtn} ${isActive("/profile") ? styles.active : ""}`}
                onClick={() => navigate("/profile")}
            >
                <img src="/icons/profile.svg" alt="" className={styles.navIcon} />
            </button>
        </nav>
    );
}
