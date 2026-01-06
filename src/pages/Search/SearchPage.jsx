import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./SearchPage.module.css";
import layoutStyles from "../../styles/Layout.module.css";
import config from "../../config/env";
import { safeApiCall, parseApiResponse, handleApiError } from "../../utils/errorHandler";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../hooks/useAuth";
import { formatCurrency } from "../../config/currency";
import NavBar from "../../components/navbar/NavBar";
import useLockBodyScrollOnApp from "../../hooks/useLockBodyScrollOnApp";

export default function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get("query") || ""; // ← gets query from route

  const [search, setSearch] = useState(initialQuery); // ← initialize with it
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const BASE_URL = config.API_BASE_URL;

  const { state, dispatch } = useCart();
  const { isAuthenticated } = useAuth();

  const fetchResults = async (query) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError("");
    
    const result = await safeApiCall(
      async () => {
        const response = await fetch(`${BASE_URL}/front/search?search=${encodeURIComponent(query)}`);
        const data = await parseApiResponse(response);
        
        if (data.status && Array.isArray(data.data)) {
          return data.data;
        } else {
          setError("No results found");
          return [];
        }
      },
      {
        showErrorToast: false, // Handle errors manually
        customErrorMessage: 'Search failed',
        fallbackValue: []
      }
    );

    setResults(result || []);
    setLoading(false);
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchResults(search);
    }, 500); // debounce input

    return () => clearTimeout(debounce);
  }, [search]);

  // 👇 add this useEffect to trigger once on mount in case initial query exists
  useEffect(() => {
    if (initialQuery) {
      fetchResults(initialQuery);
    }
  }, [initialQuery]);

  const handleAdd = (item) => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: item.id,
        title: item.title,
        price: item.price_regular,
        image: item.thumbnail,
      },
    });
  };

  const handleIncrement = (item) => handleAdd(item);
  const handleDecrement = (id) =>
    dispatch({ type: "REMOVE_ITEM", payload: id });

  const getQuantity = (id) => {
    const productInCart = state.items.find((i) => i.id === id);
    return productInCart ? productInCart.quantity : 0;
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  const handleProductCard = (id) => {
    navigate(`/products/${id}`);
  };

  useLockBodyScrollOnApp();

  return (
    <div className={layoutStyles.appWrapper}>
      <div className={`${layoutStyles.appContainer} ${styles.searchPageContainer}`}>
        <div className={styles.searchContainer}>
          <header className={styles.searchHeader}>
            
          <div className={styles.searchBarWrapper}>
            <img src="/icons/search.svg" alt="" className={styles.searchIcon} />

            <input
              type="search"
              placeholder="Search for products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />

            <button className={styles.micBtn} aria-label="Voice search">
              <img src="/icons/mic.svg" alt="mic" className={styles.micIcon} />
            </button>
          </div>
          {search && (
            <h3>Showing results for <span>{search}</span></h3>
          )}
        </header>

        <section className={styles.resultsSection}>
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {results.length > 0 && (
            <div className={styles.grid}>
              {results.map((p) => {
                const qty = getQuantity(p.id);

                return (
                  <div key={p.id} className={styles.card}>
                    <div className={styles.imageWrapper} style={{ position: "relative" }}>
                      <img
                        src={p.thumbnail}
                        alt={p.title}
                        className={styles.productImg}
                      />

                      {qty > 0 ? (
                        <div className={styles.qtyControls}>
                          <button onClick={() => handleDecrement(p.id)}>-</button>
                          <span>{qty}</span>
                          <button onClick={() => handleIncrement(p)}>+</button>
                        </div>
                      ) : (
                        <button
                          className={styles.addBtn}
                          onClick={() => handleAdd(p)}
                        >
                          Add
                        </button>
                      )}
                    </div>

                    <div
                      className={styles.productInfo}
                      onClick={() => handleProductCard(p.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <h2 className={styles.name}>{p.title}</h2>

                      {Number(p.price_sale) > Number(p.price_regular) && (
                        <p className={styles.discount}>
                          {Math.round(
                            ((p.price_sale - p.price_regular) /
                              p.price_sale) *
                            100
                          )}
                          % OFF
                        </p>
                      )}

                      <p className={styles.price}>
                        {formatCurrency(p.price_regular)}{" "}
                        <span className={styles.mrp}>
                          {formatCurrency(p.price_sale)}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !error && results.length === 0 && search && (
            <p className={styles.noResults}>No results found</p>
          )}
        </section>
        </div>
      </div>
      <NavBar />
    </div>
  );
}
