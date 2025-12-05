import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

/**
 * Smart back button hook that intelligently navigates based on:
 * - Cart state (empty or not)
 * - Current route
 * - Browser history
 * - Referrer information
 * 
 * Logic:
 * - If cart is empty and going back would lead to cart, go to home/products instead
 * - If coming from order flow, go to orders page
 * - If on order detail page, go to orders list
 * - Otherwise, use browser history with smart fallbacks
 */
export const useSmartBack = (fallbackRoute = '/home') => {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemsCount } = useCart();

  const handleBack = () => {
    const currentPath = location.pathname;
    const state = location.state;

    // If we have state with a from route, use it (but check if it's valid)
    if (state?.from) {
      const fromRoute = state.from;
      
      // Don't go back to cart if it's empty
      if (fromRoute === '/cart' && itemsCount === 0) {
        navigate('/home');
        return;
      }
      
      // Don't go back to checkout if cart is empty
      if (fromRoute === '/checkout' && itemsCount === 0) {
        navigate('/home');
        return;
      }
      
      // When navigating back, pass state indicating where we came from
      // This helps prevent navigation loops (e.g., Profile <-> My Address)
      navigate(fromRoute, { 
        state: { 
          from: currentPath,
          preventLoop: true 
        } 
      });
      return;
    }

    // Special handling for order detail pages
    if (currentPath.includes('/order/') && currentPath.includes('/details')) {
      // Check if we have state indicating where we came from
      if (state?.from) {
        // Navigate back to where we came from (usually /orders)
        navigate(state.from, { replace: true });
        return;
      }
      // Default: go to orders list
      navigate('/orders', { replace: true });
      return;
    }

    // Special handling for orders list page
    if (currentPath === '/orders') {
      // Check if we have state indicating where we came from
      if (state?.from) {
        // If preventLoop flag is set, go to fallback (usually /home)
        if (state?.preventLoop) {
          navigate(fallbackRoute, { replace: true });
          return;
        }
        // Check if we came from a child page (order details)
        // In this case, we should go back to the original source
        if (state?.originalSource) {
          navigate(state.originalSource, { replace: true });
          return;
        }
        // Otherwise navigate to where we came from
        navigate(state.from, { replace: true });
        return;
      }
      
      // If cart has items, could go to cart, otherwise go to home
      if (itemsCount > 0) {
        // Check if we came from cart (likely after placing order)
        if (window.history.length > 2) {
          navigate(-1);
        } else {
          navigate('/home');
        }
      } else {
        // Cart is empty, go to home
        navigate('/home');
      }
      return;
    }

    // Special handling for cart page
    if (currentPath === '/cart') {
      // If cart is empty, go to home instead of back
      if (itemsCount === 0) {
        navigate('/home');
        return;
      }
      // If cart has items, use normal back navigation
      if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate('/home');
      }
      return;
    }

    // Special handling for checkout/payment page
    if (currentPath === '/checkout' || currentPath === '/payment') {
      // If cart is empty, go to home
      if (itemsCount === 0) {
        navigate('/home');
        return;
      }
      // Otherwise go back (should be cart)
      if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate('/cart');
      }
      return;
    }

    // Special handling for my-address page
    // If we're on my-address and came from a child page, don't use browser history
    if (currentPath === '/my-address') {
      const myAddressChildPages = ['/address-picker', '/search-location'];
      if (state?.from && myAddressChildPages.includes(state.from)) {
        // Don't go back to child pages, use fallback instead
        navigate(fallbackRoute);
        return;
      }
      if (state?.preventLoop) {
        navigate(fallbackRoute);
        return;
      }
    }

    // Special handling for products page
    // If user has been filtering/sorting, always go to home instead of going through history
    if (currentPath === '/products' || currentPath.startsWith('/products?')) {
      // Check if we have query parameters (filters/categories/sort)
      const hasQueryParams = location.search && location.search.length > 0;
      
      // If there are query params or if history is long (likely from filter changes),
      // go directly to home to avoid going through all filter changes
      if (hasQueryParams || window.history.length > 3) {
        navigate('/home');
        return;
      }
      
      // Otherwise, use normal back navigation
      if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate('/home');
      }
      return;
    }

    // For other pages, use browser history with fallback
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      // No history, go to fallback route
      navigate(fallbackRoute);
    }
  };

  return handleBack;
};

