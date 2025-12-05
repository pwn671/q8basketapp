import { useCart as useCartContext } from '../context/CartContext';
import { useAuth } from './useAuth';

export const useCart = () => {
  const cartContext = useCartContext();
  const { isAuthenticated, user } = useAuth();

  // Only allow cart operations if user is authenticated
  const addItem = (item) => {
    if (!isAuthenticated) {
      console.warn('Please login to add items to cart');
      return;
    }
    cartContext.dispatch({
      type: "ADD_ITEM",
      payload: item
    });
  };

  const removeItem = (itemId) => {
    if (!isAuthenticated) {
      console.warn('Please login to modify cart');
      return;
    }
    cartContext.dispatch({
      type: "REMOVE_ITEM",
      payload: itemId
    });
  };

  const updateQuantity = (itemId, quantity) => {
    if (!isAuthenticated) {
      console.warn('Please login to modify cart');
      return;
    }
    cartContext.dispatch({
      type: "UPDATE_QUANTITY",
      payload: { id: itemId, quantity }
    });
  };

  const clearCart = () => {
    cartContext.dispatch({ type: "CLEAR_CART" });
  };

  return {
    ...cartContext,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isAuthenticated,
    user,
  };
};
