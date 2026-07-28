import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import styles from "./YourOrderPage.module.css";
import { useAuth } from "../../hooks/useAuth";
import SimpleHeader from "../../components/simpleHeader/SimpleHeader";
import config from "../../config/env";
import { formatCurrency } from "../../config/currency";
import layoutStyles from "../../styles/Layout.module.css";
import useLockBodyScrollOnApp from '../../hooks/useLockBodyScrollOnApp';
import { logout } from "../../features/auth/authSlice";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavBar from "../../components/navbar/NavBar";
import ProductImage from "../../components/productimage/ProductImage";

export default function YourOrderPage() {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BASE_URL = config.API_BASE_URL;
  
  // Preserve the original source when navigating to order details
  const originalSource = location.state?.from || '/home';

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
    const fetchOrders = async () => {
      if (!isAuthenticated || !token) {
        setError("Please login to view your orders");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${BASE_URL}/user/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Check for authentication/authorization errors (400, 401, 403) - logout user
        if (res.status === 400 || res.status === 401 || res.status === 403) {
          handleAuthError();
          return;
        }

        const data = await res.json();

        if (data.status && data.data?.orders) {
          setOrders(data.data.orders);
        } else {
          setError("Failed to fetch orders");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, token]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Parse total amount from API string format "KWD335.5" to number
  const parseTotal = (totalStr) => {
    if (!totalStr) return 0;
    // If it's already a number, return it
    if (typeof totalStr === 'number') return totalStr;
    // If it's a string, extract the numeric part
    const numericValue = totalStr.replace(/[^0-9.]/g, '');
    return parseFloat(numericValue) || 0;
  };

  useLockBodyScrollOnApp();
  return (
    <div className={layoutStyles.appWrapper}>
      <div className={layoutStyles.appContainer}>
        <SimpleHeader title="Your orders" fallbackRoute="/home" />

        {loading && <p className={styles.infoText}>Loading orders...</p>}
        {error && <p className={styles.errorText}>{error}</p>}
        {!loading && !error && orders.length === 0 && (
          <p className={styles.infoText}>No orders placed yet!</p>
        )}

        <div className={styles.orderList}>
          {!loading &&
            !error &&
            orders.map((order, index) => (
              
              <div 
                key={index} 
                className={styles.orderCard}
                onClick={() => navigate(`/user/order/${order.id}/details`, { state: { from: '/orders', originalSource: originalSource } })}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.cardTop}>
                  <div className={styles.iconBox}>
                    <span className={styles.checkIcon}>✓</span>
                  </div>
                  <div className={styles.orderDetails}>
                    <div className={styles.topRow}>
                      <span className={styles.statusText}>
                        {order.status || "Arrived in 5hr"}
                      </span>
                    </div>
                    {order.number && (
                      <div className={styles.orderNumberRow}>
                        <span className={styles.orderNumberLabel}>Order #:</span>
                        <span className={styles.orderNumber}>{order.number}</span>
                      </div>
                    )}
                    <div className={styles.bottomRow}>
                      <span className={styles.price}>{formatCurrency(parseTotal(order.total))}</span>
                      <span className={styles.date}>
                        {formatDate(order.created_at || new Date())}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.itemsRow}>
                  {(order.items || []).slice(0, 4).map((item, i) => (
                    <ProductImage
                      key={i}
                      src={item.image}
                      alt=""
                      className={styles.orderItemImage}
                    />
                  ))}
                  {order.items && order.items.length > 4 && (
                    <div className={styles.moreItems}>
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>

                <div className={styles.actionRow}>
                  {/* <button className={styles.reorderBtn}>Reorder</button> */}
                  {/* <button className={styles.rateBtn}>Rate order</button> */}
                </div>
              </div>
            ))}
        </div>
      </div>
      <NavBar />
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
