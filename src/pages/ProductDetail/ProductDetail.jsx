import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./ProductDetail.module.css";
import useEmblaCarousel from "embla-carousel-react";
import ViewCart from "../../components/cart/ViewCart";
import { useCart } from "../../context/CartContext";
import RelatedProducts from "../../components/relatedproduct/RelatedProducts";
import config from "../../config/env";
import { formatCurrency, getCurrencySymbol } from "../../config/currency";

export default function ProductDetail() {
  const [emblaRef] = useEmblaCarousel({ loop: true });
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useCart();

  const [showDetails, setShowDetails] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const BASE_URL = config.API_BASE_URL;

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/front/product/${id}/details`);
        const data = await res.json();
        if (data.status) {
          setProduct(data.data);
          const related = data.data.related_products || [];

          // If no related products, fetch general products
          if (related.length === 0) {
            try {
              const productsRes = await fetch(`${BASE_URL}/front/products`);
              const productsData = await productsRes.json();
              if (productsData.status && productsData.data) {
                // Filter out the current product and limit to 6 items
                const filteredProducts = productsData.data
                  .filter(p => p.id !== parseInt(id))
                  .slice(0, 6);
                setRelatedProducts(filteredProducts);
              }
            } catch (err) {
              console.error("Failed to fetch general products:", err);
              setRelatedProducts([]);
            }
          } else {
            setRelatedProducts(related);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // ✅ Cart Helpers
  const getQty = (pid) => {
    const item = state.items.find((i) => i.id === pid);
    return item ? item.quantity : 0;
  };

  const handleAdd = (item) => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: item.id,
        title: item.title,
        price: item.current_price,
        image: item.thumbnail,
      },
    });
  };

  const handleIncrement = (item) => handleAdd(item);

  const handleDecrement = (id) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/"); // fallback
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <div className={styles.container}>
      {/* Header Image */}
      <div className={styles.imageWrapper}>
        <div className={styles.embla} ref={emblaRef}>
          <div className={styles.embla__container}>
            {product.images.map((img) => (
              <div key={img.id} className={styles.embla__slide}>
                <img
                  src={img.image}
                  alt={product.title}
                  className={styles.productImg}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <button className={styles.backBtn} onClick={handleBack}>
          <img src="/icons/arrow-down-.svg" alt="Back" />
        </button>

        {/* Right Header Icons */}
        <div className={styles.headerIcons}>
          <button>
            <img src="/icons/search.svg" alt="Zoom" />
          </button>
          <button>
            <img src="/icons/arrow-up.svg" alt="Share" />
          </button>
        </div>
      </div>

      <div className={styles.infoContainer}>
        {/* Product Details */}
        <div className={styles.details}>
          <h2 className={styles.title}>{product.title}</h2>
          <p className={styles.offer}>Free Coriander above {formatCurrency(500)}</p>
          <p className={styles.stock}>
            In Stock: {product.stock > 0 ? product.stock : "Out of stock"}
          </p>
          <p className={styles.price}>
            {formatCurrency(product.current_price)}{" "}
            <span className={styles.mrp}>{formatCurrency(product.previous_price)}</span>
          </p>

          {/* Toggleable Long Description */}
          <button
            className={styles.viewDetails}
            onClick={() => setShowDetails((prev) => !prev)}
          >
            <span className={styles.detailsToggle}>
              {showDetails ? "Hide Product Details" : "View Product Details"}
              <img
                src={
                  showDetails ? "/icons/arrowup1.svg" : "/icons/arrow-down-.svg"
                }
                alt={showDetails ? "up" : "down"}
                className={styles.arrow}
              />
            </span>
          </button>
          {showDetails && (
            <>
              <div className={styles.longDesc}>
                <h3>About this product</h3>
                <p>{product.details}</p>
              </div>
              <button
                className={styles.viewDetails}
                onClick={() => setShowPolicy((prev) => !prev)}
              >
                <span className={styles.detailsToggle}>
                  {showPolicy ? "Hide Policy" : "View Policy"}
                  <img
                    src={
                      showPolicy ? "/icons/arrowup1.svg" : "/icons/arrow-down-.svg"
                    }
                    alt={showPolicy ? "up" : "down"}
                    className={styles.arrow}
                  />
                </span>
              </button>
            </>
          )}

          {/* Toggleable Policy */}
          {showPolicy && (
            <div className={styles.policy}>
              <h3>Policy</h3>
              <p>{product.policy}</p>
            </div>
          )}
        </div>

        {/* Related Products */}
        <RelatedProducts products={relatedProducts} />

        {/* Global Cart Preview */}
        <ViewCart />
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomPrice}>
          <small>
            In Stock: {product.stock > 0 ? product.stock : "Out of stock"}
          </small>
          <p>
            {formatCurrency(product.current_price)}{" "}
            <span className={styles.mrp}>{formatCurrency(product.previous_price)}</span>
          </p>

          <small>Inclusive of all taxes</small>
        </div>
        {getQty(product.id) > 0 ? (
          <div className={styles.qtyControls}>
            <button onClick={() => handleDecrement(product.id)}>-</button>
            <span>{getQty(product.id)}</span>
            <button onClick={() => handleIncrement(product)}>+</button>
          </div>
        ) : (
          <button
            className={styles.addToCart}
            onClick={() => handleAdd(product)}
          >
            Add to cart
          </button>
        )}
      </div>
    </div>
  );
}
