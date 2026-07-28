import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ViewCart.module.css";
import { useCart } from "../../hooks/useCart";
import ProductImage from "../productimage/ProductImage";

const ViewCart = () => {
  const { state, itemsCount, isAuthenticated } = useCart();
  const navigate = useNavigate();

  // Don't show cart if user is not authenticated or cart is empty
  if (!isAuthenticated || !itemsCount || itemsCount === 0) return null;

  const images = state.items.map((i) => i.image).slice(0, 3);

  return (
    <div
      className={styles.viewCart}
      onClick={() => navigate("/cart")}
      role="button"
      tabIndex={0}
    >
      <div className={styles.imageStack}>
        {images.length > 0 ? (
          images.map((img, index) => (
            <ProductImage
              key={index}
              src={img}
              alt={`cart item ${index + 1}`}
              className={styles.cartImg}
              style={{ left: `${index * 18}px` }}
            />
          ))
        ) : (
          <div className={styles.placeholder}>🛒</div>
        )}
      </div>
      <div className={styles.cartInfo}>
        <p className={styles.cartTitle}>View Cart</p>
        <p className={styles.cartCount}>{itemsCount} ITEM{itemsCount > 1 ? "S" : ""}</p>
      </div>
      <div className={styles.arrowIcon}>
        <img
          src="/icons/arrow-right.svg"
          alt="Go to cart"
          width={24}
          height={24}
        />
      </div>
    </div>
  );
};

export default ViewCart;
