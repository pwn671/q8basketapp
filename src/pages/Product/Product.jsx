import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "../../components/navbar/NavBar";
import styles from "./Product.module.css";
import layoutStyles from "../../styles/Layout.module.css";
import Sidebar from "../../components/sidebar/Sidebar";
import ViewCart from "../../components/cart/ViewCart";
import Filter from "../../components/filter/Filter";
import Sort from "../../components/sort/Sort";
import SearchHeader from "../../components/searchHeader/SearchHeader";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../hooks/useAuth";
import { SortOptions } from "../../data/staticData";
import config from "../../config/env";
import { safeApiCall, parseApiResponse } from "../../utils/errorHandler";
import { formatCurrency } from "../../config/currency";
import useLockBodyScrollOnApp from "../../hooks/useLockBodyScrollOnApp";
import ProductImage from "../../components/productimage/ProductImage";

// Helper function to build API URL with all parameters
const buildProductsUrl = (
  baseUrl,
  categoryIds = null,
  sort = null,
  highlight = null,
  limit = 20,
  offset = 0,
) => {
  let url = `${baseUrl}/front/products`;
  const params = [];

  if (categoryIds && categoryIds.length > 0) {
    params.push(
      `category_ids=${Array.isArray(categoryIds) ? categoryIds.join(",") : categoryIds}`,
    );
  }

  if (sort) {
    params.push(`sort=${sort}`);
  }

  if (highlight) {
    params.push(`highlight=${highlight}`);
  }

  params.push(`limit=${limit}`);
  params.push(`offset=${offset}`);

  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }

  return url;
};

export default function ProductPage() {
  const [originalProducts, setOriginalProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchActive, setSearchActive] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [sortOption, setSortOption] = useState("relevance");
  const [activeFilters, setActiveFilters] = useState([]);
  const [categories, setCategories] = useState([]); // Add categories state
  const [limit] = useState(20); // Products per page - load 20 at a time
  const [offset, setOffset] = useState(0); // Current page offset
  const [totalCount, setTotalCount] = useState(0); // Total products available
  const [loadingMore, setLoadingMore] = useState(false); // Loading more products state
  const observerRef = useRef(null); // Ref for intersection observer
  const loadMoreTriggerRef = useRef(null); // Ref for the element that triggers load more

  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch } = useCart();
  const { isAuthenticated } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const categoryId = queryParams.get("category");
  const BASE_URL = config.API_BASE_URL;

  // Fetch categories first
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${BASE_URL}/front/categories`);
        const data = await res.json();
        if (data.status && Array.isArray(data.data)) {
          setCategories(data.data);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Sync activeCategoryIndex with URL categoryId
  useEffect(() => {
    if (categories.length > 0) {
      if (categoryId) {
        // Find the index of the category with the given ID
        const categoryIndex = categories.findIndex(
          (cat) => cat.id.toString() === categoryId.toString(),
        );
        if (categoryIndex !== -1) {
          setActiveCategoryIndex(categoryIndex + 1); // +1 because index 0 is "All"
        } else {
          setActiveCategoryIndex(0); // Default to "All" if category not found
        }
      } else {
        setActiveCategoryIndex(0); // Default to "All" if no category in URL
      }
    }
  }, [categoryId, categories]);

  // Reset offset and clear products when category changes
  useEffect(() => {
    setOffset(0);
    // Clear products immediately when category changes to prevent showing old products
    setProducts([]);
    setOriginalProducts([]);
    setTotalCount(0);
    // Modal filters are scoped to the current list; clear when URL category changes
    setActiveFilters([]);
  }, [categoryId]);

  // Fetch products based on category, sort, and pagination
  useEffect(() => {
    const fetchProducts = async () => {
      // Only set loading for initial load, use loadingMore for pagination
      if (offset === 0) {
        setLoading(true);
      }
      setError("");

      const result = await safeApiCall(
        async () => {
          // Map sort option to API parameters
          let sortParam = null;
          let highlightParam = null;

          if (sortOption === "lowToHigh") {
            sortParam = "low-high";
          } else if (sortOption === "highToLow") {
            sortParam = "high-low";
          } else if (sortOption === "newest") {
            highlightParam = "latest";
          }
          // "relevance" or default: no sort/highlight parameter

          // Modal filters take precedence; otherwise use sidebar/URL category (infinite scroll must match)
          const categoryIdsForApi =
            activeFilters.length > 0
              ? activeFilters
              : categoryId
                ? [categoryId]
                : null;

          // Build URL with all parameters
          const url = buildProductsUrl(
            BASE_URL,
            categoryIdsForApi,
            sortParam,
            highlightParam,
            limit,
            offset,
          );

          console.log("Fetching products:", url);

          const response = await fetch(url);
          const data = await parseApiResponse(response);

          if (data.status && Array.isArray(data.data.data)) {
            // totalCount is at root level, products are at data.data
            const total = data.totalCount || 0;
            setTotalCount(total);
            console.log(
              `Loaded ${data.data.data.length} products, total: ${total}, offset: ${offset}`,
            );
            return { products: data.data.data, totalCount: total };
          } else {
            setError("No products found.");
            return { products: [], totalCount: 0 };
          }
        },
        {
          showErrorToast: false, // Handle errors manually
          customErrorMessage: "Failed to load products",
          fallbackValue: { products: [], totalCount: 0 },
        },
      );

      // If offset is 0, replace products (new category/sort/filter)
      // Otherwise, append products (load more)
      if (offset === 0) {
        setProducts(result?.products || []);
        setOriginalProducts(result?.products || []);
      } else {
        setProducts((prev) => {
          const newProducts = [...prev, ...(result?.products || [])];
          console.log(`Total products now: ${newProducts.length}`);
          return newProducts;
        });
        setOriginalProducts((prev) => [...prev, ...(result?.products || [])]);
      }
      setLoading(false);
      setLoadingMore(false);
    };

    fetchProducts();
  }, [categoryId, sortOption, limit, offset, activeFilters, BASE_URL]);

  // Handle sidebar category selection
  const handleCategorySelect = (index) => {
    setActiveCategoryIndex(index);
    setActiveFilters([]);

    if (index === 0) {
      // "All" selected - remove category from URL
      // Use replace to avoid adding to history
      navigate("/products", { replace: true });
    } else {
      // Specific category selected - update URL
      const selectedCategory = categories[index - 1];
      if (selectedCategory) {
        // Use replace to avoid adding to history
        navigate(`/products?category=${selectedCategory.id}`, {
          replace: true,
        });
      }
    }
  };

  // Cart handlers (same as before)
  const handleAdd = (item) => {
    if (!isAuthenticated) {
      navigate("/signin");
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

  const handleProductCard = (id) => {
    navigate(`/products/${id}`);
  };

  // Filter logic — state update triggers the main fetch effect (same code path as scroll / sort)
  const handleFilter = (selectedCategoryIds) => {
    setActiveFilters(selectedCategoryIds);
    setOffset(0);
  };

  // Handle sort change - triggers new API call
  const handleSortChange = (newSortOption) => {
    setSortOption(newSortOption);
    setOffset(0); // Reset pagination when sorting changes
  };

  // Handle load more products (triggered by intersection observer)
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && !loading && products.length < totalCount) {
      setLoadingMore(true);
      setOffset((prev) => prev + limit);
    }
  }, [loadingMore, loading, products.length, totalCount, limit]);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // If the trigger element is visible and we have more products to load
        if (
          entries[0].isIntersecting &&
          products.length > 0 &&
          products.length < totalCount
        ) {
          console.log("Intersection triggered - loading more products", {
            currentProducts: products.length,
            totalCount: totalCount,
            loadingMore: loadingMore,
            loading: loading,
          });
          handleLoadMore();
        }
      },
      {
        root: null, // viewport
        rootMargin: "200px", // Start loading 200px before reaching the bottom
        threshold: 0,
      },
    );

    // Observe the trigger element
    if (loadMoreTriggerRef.current) {
      observerRef.current.observe(loadMoreTriggerRef.current);
      console.log("Intersection observer attached", {
        productsLength: products.length,
        totalCount: totalCount,
      });
    }

    // Cleanup on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [products.length, totalCount, handleLoadMore, loadingMore, loading]);

  // Add this function with more detailed logic
  const getPageTitle = () => {
    // If no categories loaded yet, show default
    if (categories.length === 0) {
      return "Products";
    }

    // If "All" is selected (index 0)
    if (activeCategoryIndex === 0) {
      return "All Products";
    }

    // If specific category is selected
    if (activeCategoryIndex > 0 && activeCategoryIndex <= categories.length) {
      const selectedCategory = categories[activeCategoryIndex - 1];
      if (selectedCategory) {
        // You can customize the title format here
        return `${selectedCategory.name}`;
        // Or with more context:
        // return `${selectedCategory.name} Products`;
      }
    }

    // Fallback
    return "Products";
  };

  useLockBodyScrollOnApp();
  return (
    <div className={layoutStyles.appWrapper}>
      <div
        className={`${layoutStyles.appContainer} ${styles.productPageContainer}`}
      >
        <div className={styles.productContainer}>
          {/* Header */}
          <SearchHeader
            title={getPageTitle()}
            search={search}
            setSearch={setSearch}
            searchActive={searchActive}
            toggleSearch={() => setSearchActive((prev) => !prev)}
          />

          <div className={styles.layout}>
            {/* Side Navigation */}
            <Sidebar
              activeCategoryIndex={activeCategoryIndex}
              setActiveCategoryIndex={handleCategorySelect} // Use the new handler
              categories={categories} // Pass categories to sidebar
            />

            {/* Product Section */}
            <main className={styles.products}>
              <div className={styles.filters}>
                <button
                  className={styles.filterBtn}
                  onClick={() => setShowFilter(true)}
                >
                  <img
                    src="/icons/filter.svg"
                    alt="filter"
                    className={styles.filterIcon}
                  />
                  Filters
                </button>

                <button onClick={() => setShowSort(true)}>
                  <img
                    src="/icons/sort.svg"
                    alt="sort"
                    className={styles.sortIcon}
                  />{" "}
                  Sort
                </button>
              </div>

              <div className={styles.grid}>
                {products.map((p) => {
                  const qty = getQuantity(p.id);

                  return (
                    <div key={p.id} className={styles.card}>
                      <div
                        className={styles.imageWrapper}
                        style={{ position: "relative" }}
                      >
                        <ProductImage
                          src={p.thumbnail}
                          alt={p.title}
                          className={styles.productImg}
                        />

                        {qty > 0 ? (
                          <div className={styles.qtyControls}>
                            <button onClick={() => handleDecrement(p.id)}>
                              -
                            </button>
                            <span>{qty}</span>
                            <button onClick={() => handleIncrement(p)}>
                              +
                            </button>
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
                                100,
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

              {/* Loading and error states */}
              {loading && offset === 0 && (
                <p style={{ textAlign: "center", marginTop: "20px" }}>
                  Loading products...
                </p>
              )}
              {error && (
                <p
                  style={{
                    color: "red",
                    textAlign: "center",
                    marginTop: "20px",
                  }}
                >
                  {error}
                </p>
              )}
              {!loading && !error && products.length === 0 && (
                <p className={styles.noResults}>
                  No products found in this category.
                </p>
              )}

              {/* Infinite scroll trigger - element that triggers loading when visible */}
              {!error &&
                products.length > 0 &&
                products.length < totalCount && (
                  <div
                    ref={loadMoreTriggerRef}
                    style={{
                      height: "40px",
                      margin: "20px 0",
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {loadingMore ? (
                      <p style={{ fontSize: "14px", color: "#666" }}>
                        Loading more products...
                      </p>
                    ) : (
                      <p style={{ fontSize: "12px", color: "#999" }}>
                        Scroll for more
                      </p>
                    )}
                  </div>
                )}

              {/* Show total loaded message when all products are loaded */}
              {!error &&
                products.length > 0 &&
                products.length >= totalCount && (
                  <p
                    style={{
                      textAlign: "center",
                      margin: "20px 0",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    All {totalCount} products loaded
                  </p>
                )}

              {/* Filter Modal */}
              <Filter
                show={showFilter}
                onClose={() => setShowFilter(false)}
                filters={categories}
                appliedIds={activeFilters}
                onApply={handleFilter}
              />

              {/* Sort Modal */}
              <Sort
                show={showSort}
                onClose={() => setShowSort(false)}
                options={SortOptions}
                defaultValue={sortOption}
                onApply={handleSortChange}
              />
            </main>
          </div>

          {/* Global Cart Preview */}
          <ViewCart />
          <NavBar />
        </div>
      </div>
    </div>
  );
}
