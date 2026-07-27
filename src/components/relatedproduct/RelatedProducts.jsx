import React from "react";
import styles from "./RelatedProducts.module.css";
import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../config/currency";
import ProductImage from "../productimage/ProductImage";

export default function RelatedProducts({ products }) {
  const { state, dispatch } = useCart();

  // ✅ Get quantity from cart
  const getQty = (pid) => {
    const item = state.items.find((i) => i.id === pid);
    return item ? item.quantity : 0;
  };

  // ✅ Cart Handlers
  const handleAdd = (item) => {
    const price = item.current_price || item.price_regular || 0;
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: item.id,
        title: item.title,
        price: parseFloat(price),
        image: item.thumbnail,
      },
    });
  };

  const handleIncrement = (item) => handleAdd(item);

  const handleDecrement = (id) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  if (!products || products.length === 0) return null;

  return (
    <div className={styles.related}>
      <h3>You might also like</h3>
      <div className={styles.relatedGrid}>
        {products.slice(0,6).map((item) => {
          const qty = getQty(item.id);
          return (
            <div key={item.id} className={styles.card}>
              <div className={styles.cardImg}>
                <ProductImage src={item.thumbnail} alt={item.title} />
                {qty > 0 ? (
                  <div className={styles.qtyControlsCard}>
                    <button onClick={() => handleDecrement(item.id)}>-</button>
                    <span>{qty}</span>
                    <button onClick={() => handleIncrement(item)}>+</button>
                  </div>
                ) : (
                  <button
                    className={styles.addBtn}
                    onClick={() => handleAdd(item)}
                  >
                    Add
                  </button>
                )}
              </div>
              <h4 className={styles.cardTitle}>{item.title}</h4>
              <p className={styles.price}>
                {formatCurrency(item.current_price || item.price_regular || 0)}{" "}
                <span className={styles.mrp}>
                  {formatCurrency(item.previous_price || item.price_sale || 0)}
                </span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
