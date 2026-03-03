import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import SimpleHeader from "../../components/simpleHeader/SimpleHeader";
import config from "../../config/env";
import { formatCurrency } from "../../config/currency";
import layoutStyles from "../../styles/Layout.module.css";
import styles from "./OrderDetailPage.module.css";
import useLockBodyScrollOnApp from '../../hooks/useLockBodyScrollOnApp';
import { useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BASE_URL = config.API_BASE_URL;
  
  // Get return path from location state or default to orders
  // Use originalSource if available (to preserve navigation chain from Profile)
  const returnPath = location.state?.originalSource || location.state?.from || '/orders';

  // Helper function to handle authentication errors
  const handleAuthError = () => {
    // Clear token and user data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userProfile');

    // Dispatch logout action
    dispatch(logout());

    // Show error message as toast
    toast.error('Your session has expired. Please login again.');

    // Redirect to login
    navigate('/signin');
  };

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!isAuthenticated || !token || !orderId) {
        setError("Please login to view order details");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${BASE_URL}/user/order/${orderId}/details`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        // Check for 401 Unauthorized
        if (res.status === 401) {
          handleAuthError();
          return;
        }

        // Check for 404 Not Found
        if (res.status === 404) {
          setError("Order not found");
          setLoading(false);
          return;
        }

        // Check for other errors
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          setError(errorData.error || errorData.message || `Failed to fetch order details (${res.status})`);
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (data.status && data.data) {
          setOrder(data.data);
        } else {
          setError(data.error || data.message || "Failed to fetch order details");
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [isAuthenticated, token, orderId, BASE_URL]);

  // Convert ordered_products object to array
  const getOrderItems = () => {
    if (!order || !order.ordered_products) return [];
    
    return Object.values(order.ordered_products).map((productData) => {
      // Handle nested structure: ordered_products[key].item.item
      const productItem = productData.item?.item || productData.item;
      const orderItem = productData.item;
      
      return {
        id: productItem?.id,
        name: productItem?.name || 'Unknown Product',
        photo: productItem?.photo || '',
        qty: orderItem?.qty || 0,
        price: orderItem?.item_price || orderItem?.price || productItem?.price || 0,
        total: (orderItem?.qty || 0) * (orderItem?.item_price || orderItem?.price || productItem?.price || 0)
      };
    });
  };

  useLockBodyScrollOnApp();

  if (loading) {
    return (
      <div className={layoutStyles.appWrapper}>
        <div className={layoutStyles.appContainer}>
          <SimpleHeader title="Order Details" fallbackRoute={returnPath} />
          <div className={styles.loadingContainer}>
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={layoutStyles.appWrapper}>
        <div className={layoutStyles.appContainer}>
          <SimpleHeader title="Order Details" fallbackRoute={returnPath} />
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>{error}</p>
            <button className={styles.backBtn} onClick={() => navigate(returnPath)}>
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={layoutStyles.appWrapper}>
        <div className={layoutStyles.appContainer}>
          <SimpleHeader title="Order Details" fallbackRoute={returnPath} />
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>Order not found</p>
            <button className={styles.backBtn} onClick={() => navigate(returnPath)}>
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const orderItems = getOrderItems();

  return (
    <div className={layoutStyles.appWrapper}>
      <div className={layoutStyles.appContainer}>
        <SimpleHeader title="Order Details" fallbackRoute={returnPath} />
        
        <div className={styles.content}>
          {/* Order Info Header */}
          <div className={styles.orderHeader}>
            <div className={styles.orderNumber}>
              <span className={styles.label}>Order Number:</span>
              <span className={styles.value}>{order.number}</span>
            </div>
            <div className={styles.orderStatus}>
              <span className={styles.label}>Status:</span>
              <span className={`${styles.statusBadge} ${styles[order.status?.toLowerCase()] || ''}`}>
                {order.status || 'Pending'}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <section className={styles.itemsSection}>
            {orderItems.length === 0 ? (
              <div className={styles.empty}>No items found in this order.</div>
            ) : (
              <div className={styles.itemsList}>
                {orderItems.map((item) => (
                  <article key={item.id} className={styles.orderItem}>
                    {/* Left: Image */}
                    <div className={styles.itemInfo}>
                      <img
                        src={item.photo}
                        alt={item.name}
                        className={styles.itemImg}
                      />
                      {/* Center: Info */}
                      <div className={styles.meta}>
                        <h6 className={styles.title}>{item.name}</h6>
                        <span className={styles.quantity}>Quantity: {item.qty}</span>
                      </div>
                    </div>

                    {/* Right: Total */}
                    <div className={styles.itemActions}>
                      <div className={styles.itemTotal}>{formatCurrency(item.total)}</div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Order Summary */}
          <section className={styles.summarySection}>
            <div className={styles.summaryHeader}>
              <h3 className={styles.summaryTitle}>Order Summary</h3>
            </div>
            
            <div className={styles.summaryContent}>
              {/* Subtotal */}
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Subtotal:</span>
                <span className={styles.summaryValue}>
                  {(() => {
                    // Calculate subtotal: total - shipping_cost - packing_cost + coupon_discount
                    const totalValue = parseFloat(order.total?.replace(/[^\d.]/g, '') || 0);
                    const shippingValue = parseFloat(order.shipping_cost || 0);
                    const packingValue = parseFloat(order.packing_cost || 0);
                    const discountValue = parseFloat(order.coupon_discount || 0);
                    const subtotal = totalValue - shippingValue - packingValue + discountValue;
                    return formatCurrency(subtotal);
                  })()}
                </span>
              </div>

              {/* Shipping Cost */}
              {order.shipping_cost !== null && order.shipping_cost !== undefined && (
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>
                    Shipping {order.shipping_title ? `(${order.shipping_title})` : ''}:
                  </span>
                  <span className={styles.summaryValue}>
                    {parseFloat(order.shipping_cost || 0) === 0 
                      ? 'Free shipping' 
                      : formatCurrency(parseFloat(order.shipping_cost || 0))}
                  </span>
                </div>
              )}

              {/* Packing Cost (if exists) */}
              {order.packing_cost !== null && order.packing_cost !== undefined && parseFloat(order.packing_cost) > 0 && (
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>
                    Packing {order.packing_title ? `(${order.packing_title})` : ''}:
                  </span>
                  <span className={styles.summaryValue}>
                    {formatCurrency(parseFloat(order.packing_cost || 0))}
                  </span>
                </div>
              )}

              {/* Coupon Discount (if exists) */}
              {order.coupon_discount !== null && order.coupon_discount !== undefined && parseFloat(order.coupon_discount) > 0 && (
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>
                    Discount {order.coupon_code ? `(${order.coupon_code})` : ''}:
                  </span>
                  <span className={`${styles.summaryValue} ${styles.discountValue}`}>
                    -{formatCurrency(parseFloat(order.coupon_discount || 0))}
                  </span>
                </div>
              )}

              {/* Total Amount */}
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span className={styles.summaryLabel}>Total Amount:</span>
                <span className={styles.totalValue}>{order.total}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className={styles.paymentInfo}>
              <div className={styles.paymentRow}>
                <span className={styles.label}>Payment Method:</span>
                <span className={`${styles.statusBadge}`}>
                  {order.payment_method || 'N/A'}
                </span>
              </div>
              {order.payment_status && (
                <div className={styles.paymentRow}>
                  <span className={styles.label}>Payment Status:</span>
                  <span className={`${styles.statusBadge} ${styles[order.payment_status?.toLowerCase()] || ''}`}>
                    {order.payment_status}
                  </span>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}

