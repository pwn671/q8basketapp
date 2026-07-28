import React from "react";
import styles from "./ItemCard.module.css";
import { formatCurrency } from "../../config/currency";
import ProductImage from "../productimage/ProductImage";

export default function ItemCard({
  product,
  quantity,
  handleAdd,
  handleIncrement,
  handleDecrement,
}) {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <ProductImage
          src={product.thumbnail}
          alt={product.title}
          className={styles.productImg}
        />

        {quantity > 0 ? (
          <div className={styles.qtyControls}>
            <button onClick={() => handleDecrement(product.id)}>-</button>
            <span>{quantity}</span>
            <button onClick={() => handleIncrement(product.id)}>+</button>
          </div>
        ) : (
          <button
            className={styles.addBtn}
            onClick={() => handleAdd(product.id)}
          >
            Add
          </button>
        )}
      </div>

      <div className={styles.productInfo}>
        <h2 className={styles.name}>{product.title}</h2>

        {Number(product.previous_price) > Number(product.current_price) && (
          <p className={styles.discount}>
            {Math.round(
              ((product.previous_price - product.current_price) /
                product.previous_price) *
                100,
            )}
            % OFF
          </p>
        )}

        <p className={styles.price}>
          {formatCurrency(product.current_price)}{" "}
          <span className={styles.mrp}>
            {formatCurrency(product.previous_price)}
          </span>
        </p>
      </div>
    </div>
  );
}
