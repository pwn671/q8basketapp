import React, { useState, useEffect } from "react";
import styles from "./CartPage.module.css";
import RelatedProducts from "../../components/relatedproduct/RelatedProducts";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import SearchHeader from "../../components/searchHeader/SearchHeader";
import Address from "../../components/address/Address";
import AddAddress from "../../components/address/AddAddress";
import config from "../../config/env";
import { formatCurrency } from "../../config/currency";
import { useAuth } from "../../hooks/useAuth";
import addressService from "../../services/addressService";
import { useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import useLockBodyScrollOnApp from "../../hooks/useLockBodyScrollOnApp";
import { useSmartBack } from "../../hooks/useSmartBack";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductImage from "../../components/productimage/ProductImage";

export default function CartPage() {
  const {
    state,
    dispatch: cartDispatch,
    itemsCount,
    subtotal,
    discount,
    totalPrice,
  } = useCart();
  const { token, user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const total = subtotal;
  const cartItems = state.items;

  // Default shipping charge if API doesn't provide one
  const DEFAULT_SHIPPING_CHARGE = 8;

  // State declarations
  const [searchActive, setSearchActive] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddress, setShowAddress] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  // Use persisted state from context
  const selectedLocationId = state.selectedLocationId;
  const selectedAddress = state.selectedAddress;
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [loadingDefaultAddress, setLoadingDefaultAddress] = useState(false);
  const [orderResult, setOrderResult] = useState(null); // { success, message, method, orderNumber }
  const [shippingQuote, setShippingQuote] = useState(null); // { shipping, payable, location_id }
  const [showConfirmation, setShowConfirmation] = useState(false); // Confirmation dialog before placing order

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const BASE_URL = config.API_BASE_URL;

  // Helper function to truncate address to 10 characters
  const truncateAddress = (address) => {
    if (!address) return address;
    return address.length > 10 ? address.substring(0, 10) + "..." : address;
  };

  // Helper function to handle authentication errors
  const handleAuthError = () => {
    // Clear token and user data
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userProfile");

    // Dispatch logout action
    dispatch(logout());

    // Show error message as toast
    toast.error("Your session has expired. Please login again.");

    // Redirect to login
    navigate("/signin");
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/front/products`);
        const data = await res.json();
        if (data.status) {
          setRelatedProducts(data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, []);

  // Fetch and auto-select address (matching Home page logic)
  useEffect(() => {
    const fetchAndSelectAddress = async () => {
      // If address is already selected in cart context, don't fetch
      if (selectedAddress) {
        setDefaultAddress(null);
        return;
      }

      // Only fetch if user is authenticated
      if (!token) {
        setDefaultAddress(null);
        return;
      }

      setLoadingDefaultAddress(true);
      try {
        const result = await addressService.fetchAddresses(token);
        if (result.success && result.data && result.data.length > 0) {
          // Use same logic as Home page:
          // 1. Find default address (is_default === 1 or true)
          // 2. If no default, use first address
          const defaultAddr = result.data.find(
            (addr) => addr.is_default === 1 || addr.is_default === true,
          );
          const addressToUse = defaultAddr || result.data[0];

          if (addressToUse) {
            setDefaultAddress(addressToUse);

            // Automatically set this address in cart context
            // This matches what's shown on Home page and will trigger shipping calculation
            cartDispatch({
              type: "SET_SELECTED_ADDRESS",
              payload: {
                locationId: addressToUse.location_id,
                address: addressToUse,
              },
            });
          }
        } else {
          // User has no addresses
          setDefaultAddress(null);
        }
      } catch (err) {
        console.error("Error fetching address:", err);
        // On error, assume no addresses
        setDefaultAddress(null);
      } finally {
        setLoadingDefaultAddress(false);
      }
    };

    fetchAndSelectAddress();
  }, [token, selectedAddress, showAddAddress, cartDispatch]); // Refresh when returning from add address page

  // Refresh addresses when page becomes visible (user returns from address picker)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && token && !selectedAddress) {
        // Refresh addresses when page becomes visible
        const refreshAddresses = async () => {
          try {
            const result = await addressService.fetchAddresses(token);
            if (result.success && result.data && result.data.length > 0) {
              const defaultAddr = result.data.find(
                (addr) => addr.is_default === 1 || addr.is_default === true,
              );
              const addressToUse = defaultAddr || result.data[0];

              if (addressToUse) {
                setDefaultAddress(addressToUse);

                // Auto-select the address (matching Home page display)
                cartDispatch({
                  type: "SET_SELECTED_ADDRESS",
                  payload: {
                    locationId: addressToUse.location_id,
                    address: addressToUse,
                  },
                });
              }
            } else {
              setDefaultAddress(null);
            }
          } catch (err) {
            console.error("Error refreshing addresses:", err);
          }
        };
        refreshAddresses();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [token, selectedAddress, cartDispatch]);

  // Re-fetch shipping quote when coupon changes or address is selected
  useEffect(() => {
    const fetchShippingQuote = async () => {
      // Only fetch if address is already selected
      if (!selectedLocationId || !selectedAddress) {
        setShippingQuote(null);
        return;
      }

      try {
        setLoading(true);
        const couponCode = state.appliedCoupon?.code || null;
        const customerEmail = user?.email || null;

        const quoteResult = await addressService.getShippingQuote(
          selectedLocationId,
          subtotal,
          couponCode,
          token,
          customerEmail,
        );

        if (quoteResult.success && quoteResult.data) {
          // API returns: { location_id, subtotal, coupon: {...}, shipping, payable }
          const quote = quoteResult.data;

          // Use the values directly from API response
          // The API calculates everything including subtotal, discount, shipping, and payable
          setShippingQuote({
            location_id: quote.location_id,
            subtotal: quote.subtotal,
            coupon: quote.coupon, // Full coupon object from API
            shipping: quote.shipping || 0,
            payable: quote.payable,
          });
        } else {
          console.error("Failed to fetch shipping quote:", quoteResult.error);
          // Set default shipping quote on error
          setShippingQuote({
            location_id: selectedLocationId,
            subtotal: subtotal,
            coupon: couponCode,
            shipping: DEFAULT_SHIPPING_CHARGE,
            payable: subtotal - discount + DEFAULT_SHIPPING_CHARGE,
          });
        }
      } catch (error) {
        console.error("Error fetching shipping quote:", error);
        // Set default shipping quote on exception
        setShippingQuote({
          location_id: selectedLocationId,
          subtotal: subtotal,
          coupon: state.appliedCoupon?.code || null,
          shipping: DEFAULT_SHIPPING_CHARGE,
          payable: subtotal - discount + DEFAULT_SHIPPING_CHARGE,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchShippingQuote();
  }, [
    state.appliedCoupon,
    selectedLocationId,
    selectedAddress,
    subtotal,
    discount,
  ]);

  // Handlers
  const onInc = (item) => {
    cartDispatch({
      type: "ADD_ITEM",
      payload: {
        id: item.id,
        title: item.title,
        price: item.price,
        image: item.image,
      },
    });
  };
  // Use smart back navigation that avoids empty cart
  const handleBack = useSmartBack("/home");

  const onDec = (id) => {
    cartDispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const onPlaceOrder = async (amount) => {
    // Validate that both address and payment method are selected
    if (!state.paymentMethod) {
      // Navigate to payment selection
      navigate("/checkout");
      return;
    }

    // Check if address is selected
    if (!selectedLocationId || !selectedAddress) {
      // Show address selection popup if not selected
      setShowAddress(true);
      return;
    }

    // Check if shipping quote is available
    if (!shippingQuote) {
      alert(
        "Please wait for shipping charges to load or select address again.",
      );
      return;
    }

    // If both are selected and shipping quote is available, show confirmation dialog
    setShowConfirmation(true);
  };

  const confirmPlaceOrder = async () => {
    setShowConfirmation(false);
    // Place the order with selected location
    await placeOrder(selectedLocationId);
  };

  const handleAddressSelect = async (locationId) => {
    setShowAddress(false);

    try {
      setLoading(true);

      // Fetch full address details
      const addressResult = await addressService.fetchAddresses(token);

      // Check for authentication error
      if (addressResult.requiresLogout) {
        handleAuthError();
        return;
      }

      let foundAddress = null;
      if (addressResult.success) {
        foundAddress = addressResult.data.find(
          (addr) => addr.location_id === locationId,
        );
        if (!foundAddress) {
          alert("Address not found. Please try again.");
          setLoading(false);
          return;
        }
      } else {
        // Show error for non-auth errors
        alert(`Error: ${addressResult.error}`);
        setLoading(false);
        return;
      }

      // Update address in context (this will persist it)
      cartDispatch({
        type: "SET_SELECTED_ADDRESS",
        payload: {
          locationId: locationId,
          address: foundAddress,
        },
      });

      // Fetch shipping quote
      const couponCode = state.appliedCoupon?.code || null;
      const customerEmail = user?.email || null;

      const quoteResult = await addressService.getShippingQuote(
        locationId,
        subtotal,
        couponCode,
        token,
        customerEmail,
      );

      if (quoteResult.success && quoteResult.data) {
        // API returns: { location_id, subtotal, coupon: {...}, shipping, payable }
        const quote = quoteResult.data;

        // Use the values directly from API response
        // The API calculates everything including subtotal, discount, shipping, and payable
        setShippingQuote({
          location_id: quote.location_id,
          subtotal: quote.subtotal,
          coupon: quote.coupon, // Full coupon object from API
          shipping: quote.shipping || 0,
          payable: quote.payable,
        });
      } else {
        console.error("Failed to fetch shipping quote:", quoteResult.error);
        // Set default shipping quote on error
        setShippingQuote({
          location_id: locationId,
          subtotal: subtotal,
          coupon: couponCode,
          shipping: DEFAULT_SHIPPING_CHARGE,
          payable: subtotal - discount + DEFAULT_SHIPPING_CHARGE,
        });
      }
    } catch (error) {
      console.error("Error fetching address details:", error);
      alert("Failed to load address details. Please try again.");
    } finally {
      setLoading(false);
    }

    // Don't auto-place order - wait for user to click Place Order button
  };

  const placeOrder = async (locationId) => {
    try {
      setLoading(true);

      // Get user email from auth state
      const authState = JSON.parse(
        localStorage.getItem("persist:auth") || "{}",
      );
      const user = authState.user ? JSON.parse(authState.user) : null;
      const customerEmail = user?.email || "";

      // Prepare order payload
      const orderPayload = {
        items: cartItems.map((item) => ({
          id: item.id,
          qty: item.quantity,
        })),
        location_id: locationId,
        customer_email: customerEmail,
      };

      const response = await fetch(`${BASE_URL}/front/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      // Check for authentication/authorization errors (400, 401, 403) - logout user
      if (
        response.status === 400 ||
        response.status === 401 ||
        response.status === 403
      ) {
        handleAuthError();
        return;
      }

      const data = await response.json();

      if (data.status) {
        // Show success popup
        setOrderResult({
          success: true,
          message: data.message || "Order placed successfully",
          method: data.method || state.paymentMethod,
          orderNumber: data.order_number,
          orderId: data.order_id,
        });

        // Clear cart and checkout state after successful order
        cartDispatch({ type: "CLEAR_CART" });
        cartDispatch({ type: "CLEAR_CHECKOUT" });

        // Auto-close popup and navigate after 3 seconds
        setTimeout(() => {
          setOrderResult(null);
          navigate("/orders");
        }, 3000);
      } else {
        // Extract error message from API response
        let errorMessage = "Order failed. Please try again.";

        if (data.error && typeof data.error === "object") {
          // Handle error object with message property
          errorMessage = data.error.message || errorMessage;
        } else if (data.error && typeof data.error === "string") {
          // Handle error as string
          errorMessage = data.error;
        } else if (data.message) {
          // Fallback to message field
          errorMessage = data.message;
        }

        // Show failure popup with detailed error
        setOrderResult({
          success: false,
          message: errorMessage,
        });

        // Auto-close failure popup after 5 seconds (longer for error messages)
        setTimeout(() => {
          setOrderResult(null);
        }, 5000);
      }
    } catch (error) {
      console.error("Order placement error:", error);

      // Show error popup instead of alert
      setOrderResult({
        success: false,
        message:
          error.message ||
          "Failed to place order. Please check your connection and try again.",
      });

      setTimeout(() => {
        setOrderResult(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const onOpenProduct = (id) => {
    navigate(`/products/${id}`);
  };
  useLockBodyScrollOnApp();

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageInner}>
        {/* ===== Scrollable content ===== */}
        {/* {header} */}
        <SearchHeader
          title="Checkout"
          search={search}
          setSearch={setSearch}
          searchActive={searchActive}
          toggleSearch={() => setSearchActive((prev) => !prev)}
        />
        <div className={styles.content}>
          {/* Cart Items */}
          <section className={styles.cartListSection}>
            {cartItems.length === 0 ? (
              <div className={styles.empty}>Your cart is empty.</div>
            ) : (
              cartItems.map((it) => (
                <article key={it.id} className={styles.cartItem}>
                  {/* Left: Image */}

                  {/* Center: Info */}
                  <div
                    className={styles.itemInfo}
                    onClick={() => onOpenProduct(it.id)}
                  >
                    <div className={styles.itemImgWrapper}>
                      <ProductImage
                        src={it.image}
                        alt={it.title}
                        className={styles.itemImg}
                        onClick={() => onOpenProduct(it.id)}
                      />
                    </div>
                    <div className={styles.meta}>
                      <h6 className={styles.title}>{it.title}</h6>
                      {/* <span className={styles.weight}>{it.weight || "75 g"}</span> */}
                      <span className={styles.save}>Save for later</span>
                    </div>
                  </div>

                  {/* Right: Quantity Control + Total */}
                  <div className={styles.itemActions}>
                    {it.quantity > 0 ? (
                      <div className={styles.qtyControl}>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => onDec(it.id)}
                        >
                          -
                        </button>
                        <span className={styles.qtyCount}>{it.quantity}</span>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => onInc(it)}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        className={styles.addBtn}
                        onClick={() => onInc(it)}
                      >
                        Add
                      </button>
                    )}
                    <div className={styles.itemTotal}>
                      {formatCurrency(it.quantity * it.price)}
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
          {/* Related products */}
          <RelatedProducts products={relatedProducts} />
          <section
            className={styles.couponCard}
            onClick={() => navigate("/coupon")}
          >
            <img
              src="/icons/discount.svg"
              alt="Tag"
              className={styles.couponIcon}
            />
            {state.appliedCoupon ? (
              <div>
                <h6>Coupon Applied: {state.appliedCoupon.code}</h6>
              </div>
            ) : (
              <h6>Use Coupon</h6>
            )}
          </section>
          {/* Bill Summary */}
          {cartItems.length > 0 && (
            <section className={styles.billCard}>
              <h4 className={styles.billTitle}>Bill details</h4>
              <div className={styles.billRow}>
                <div className={styles.billLeft}>
                  <img
                    src="/icons/notepad.svg"
                    alt="Tag"
                    className={styles.billIcon}
                  />
                  <span>Items total</span>
                </div>
                <span>{formatCurrency(shippingQuote?.subtotal || total)}</span>
              </div>

              <div className={styles.billRow}>
                <div className={styles.billLeft}>
                  <img
                    src="/icons/delivery-truck.svg"
                    alt="Delivery"
                    className={styles.billIcon}
                  />
                  <span>Delivery charge</span>
                </div>
                <span
                  style={{
                    color: !selectedAddress
                      ? "#d32f2f"
                      : shippingQuote
                        ? "#111"
                        : "#ff9800",
                  }}
                >
                  {shippingQuote
                    ? shippingQuote.shipping === 0 ||
                      shippingQuote.shipping === null
                      ? "Free shipping"
                      : formatCurrency(
                          shippingQuote.shipping || DEFAULT_SHIPPING_CHARGE,
                        )
                    : selectedAddress
                      ? loading
                        ? "Calculating..."
                        : "Loading..."
                      : "Select address first"}
                </span>
              </div>

              {(shippingQuote?.coupon || state.appliedCoupon) &&
                (shippingQuote?.coupon?.discount || discount) > 0 && (
                  <div className={styles.billRow} style={{ color: "#22c55e" }}>
                    <div className={styles.billLeft}>
                      <img
                        src="/icons/discount.svg"
                        alt="Discount"
                        className={styles.billIcon}
                      />
                      <span>
                        Coupon Discount (
                        {shippingQuote?.coupon?.code ||
                          state.appliedCoupon?.code}
                        )
                      </span>
                    </div>
                    <span>
                      -
                      {formatCurrency(
                        shippingQuote?.coupon?.discount || discount,
                      )}
                    </span>
                  </div>
                )}

              <div className={styles.billTotal}>
                <span>Total</span>
                <strong>
                  {shippingQuote?.payable
                    ? formatCurrency(shippingQuote.payable)
                    : formatCurrency(total - discount)}
                </strong>
              </div>
            </section>
          )}
          {/* Policy */}
          <section className={styles.policy}>
            <h4>Cancellation Policy</h4>
            <p>
              Orders cannot be canceled once packed for delivery. In case of
              unexpected delays, a refund will be provided, if applicable.
            </p>
          </section>
          <div style={{ height: 60 }} /> {/* spacing for fixed bars */}
        </div>

        {/* ===== Floating Bars (like ViewCart style) ===== */}
        <div className={styles.locationBar}>
          <div className={styles.locationLeft}>
            <div className={styles.locIcon}>📍</div>
            <div className={styles.locText}>
              <div className={styles.locLabel}>
                {selectedAddress ? "Delivery Address" : "Select Address"}
              </div>
              <div
                className={styles.locAddress}
                title={
                  selectedAddress
                    ? `${selectedAddress.address}${selectedAddress.apartment_building ? `, ${selectedAddress.apartment_building}` : ""}`
                    : defaultAddress
                      ? `${defaultAddress.address}${defaultAddress.apartment_building ? `, ${defaultAddress.apartment_building}` : ""}`
                      : "Select address"
                }
              >
                {truncateAddress(
                  selectedAddress
                    ? `${selectedAddress.address}${selectedAddress.apartment_building ? `, ${selectedAddress.apartment_building}` : ""}`
                    : loadingDefaultAddress
                      ? "Loading address..."
                      : defaultAddress
                        ? `${defaultAddress.address}${defaultAddress.apartment_building ? `, ${defaultAddress.apartment_building}` : ""}`
                        : "Select address",
                )}
              </div>
            </div>
          </div>
          <button
            className={styles.changeBtn}
            onClick={() => setShowAddress(true)}
          >
            Change
          </button>
        </div>

        <div className={styles.paymentBar}>
          <div
            className={styles.payLeft}
            onClick={() => navigate("/checkout")}
            style={{ cursor: "pointer" }}
          >
            <div className={styles.payLabel}>Pay Using</div>
            <div className={styles.payMethod}>
              {state.paymentMethod ? state.paymentMethod : "Select Payment"}
            </div>
          </div>

          <button
            className={styles.placeBtn}
            onClick={() => onPlaceOrder()}
            disabled={cartItems.length === 0}
          >
            <div className={styles.totalText}>
              {cartItems.length === 0
                ? "0"
                : shippingQuote?.payable
                  ? formatCurrency(shippingQuote.payable)
                  : selectedAddress
                    ? "Loading..."
                    : formatCurrency(total - discount)}
              <span className={styles.totalSub}> Total</span>
            </div>
            <div className={styles.placeText}>
              {selectedAddress && !shippingQuote
                ? "Loading Charges..."
                : "Place Order"}
            </div>
          </button>
        </div>
        <Address
          show={showAddress}
          onClose={() => setShowAddress(false)}
          onApply={handleAddressSelect}
          onAddNewAddress={() => {
            setShowAddress(false);
            setShowAddAddress(true);
          }}
        />

        <AddAddress
          show={showAddAddress}
          onClose={() => setShowAddAddress(false)}
        />

        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div className={styles.orderResultOverlay}>
            <div className={styles.confirmationPopup}>
              <h3 className={styles.confirmTitle}>Confirm Order</h3>

              <div className={styles.confirmDetails}>
                <div className={styles.confirmRow}>
                  <span className={styles.confirmLabel}>Delivery Address:</span>
                  <span className={styles.confirmValue}>
                    {selectedAddress?.address}
                    {selectedAddress?.apartment_building &&
                      `, ${selectedAddress.apartment_building}`}
                  </span>
                </div>

                <div className={styles.confirmRow}>
                  <span className={styles.confirmLabel}>Payment Method:</span>
                  <span className={styles.confirmValue}>
                    {state.paymentMethod}
                  </span>
                </div>

                <div className={styles.confirmRow}>
                  <span className={styles.confirmLabel}>Total Amount:</span>
                  <span className={styles.confirmValue}>
                    {cartItems.length === 0
                      ? "0"
                      : shippingQuote?.payable
                        ? formatCurrency(shippingQuote.payable)
                        : formatCurrency(
                            total - discount + DEFAULT_SHIPPING_CHARGE,
                          )}
                  </span>
                </div>
              </div>

              <div className={styles.confirmButtons}>
                <button
                  className={styles.cancelBtn}
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.confirmBtn}
                  onClick={confirmPlaceOrder}
                  disabled={loading}
                >
                  {loading ? "Placing Order..." : "Confirm Order"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Result Popup */}
        {orderResult && (
          <div className={styles.orderResultOverlay}>
            <div
              className={`${styles.orderResultPopup} ${orderResult.success ? styles.success : styles.failure}`}
            >
              <div className={styles.resultIcon}>
                {orderResult.success ? "✓" : "✗"}
              </div>
              <h3 className={styles.resultTitle}>
                {orderResult.success
                  ? "Order Placed Successfully!"
                  : "Order Failed"}
              </h3>
              <p className={styles.resultMessage}>{orderResult.message}</p>
              {orderResult.success && (
                <>
                  {orderResult.orderNumber && (
                    <p className={styles.orderNumber}>
                      Order #{orderResult.orderNumber}
                    </p>
                  )}
                  <p className={styles.paymentMethod}>
                    Payment Method: <strong>{orderResult.method}</strong>
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
