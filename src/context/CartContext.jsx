import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useSelector } from "react-redux";

// Get cart key based on user ID
const getCartKey = (userId) => `cart_${userId || 'guest'}`;
const getCheckoutKey = (userId) => `checkout_${userId || 'guest'}`;

// Initialize cart based on current user
const getInitialState = () => {
  const authState = JSON.parse(localStorage.getItem("persist:auth") || "{}");
  const user = authState.user ? JSON.parse(authState.user) : null;
  const cartKey = getCartKey(user?.id);
  const checkoutKey = getCheckoutKey(user?.id);

  // Load persisted checkout state (address and payment)
  const persistedCheckout = JSON.parse(localStorage.getItem(checkoutKey) || "{}");

  return {
    items: JSON.parse(localStorage.getItem(cartKey)) || [],
    userId: user?.id || null,
    appliedCoupon: null, // load if you want from storage later
    paymentMethod: persistedCheckout.paymentMethod || null, // selected payment method
    selectedLocationId: persistedCheckout.selectedLocationId || null, // selected address location ID
    selectedAddress: persistedCheckout.selectedAddress || null, // full address object
  };
};


function cartReducer(state, action) {
  let updatedItems;
  const cartKey = getCartKey(state.userId);
  const checkoutKey = getCheckoutKey(state.userId);

  switch (action.type) {
    case "ADD_ITEM": {
      const exists = state.items.find((i) => i.id === action.payload.id);
      if (exists) {
        updatedItems = state.items.map((i) =>
          i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        updatedItems = [...state.items, { ...action.payload, quantity: 1 }];
      }
      localStorage.setItem(cartKey, JSON.stringify(updatedItems));
      return { ...state, items: updatedItems };
    }

    case "REMOVE_ITEM": {
      updatedItems = state.items
        .map((i) =>
          i.id === action.payload ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0);
      localStorage.setItem(cartKey, JSON.stringify(updatedItems));
      return { ...state, items: updatedItems };
    }

    case "UPDATE_QUANTITY": {
      updatedItems = state.items.map((i) =>
        i.id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i
      );
      localStorage.setItem(cartKey, JSON.stringify(updatedItems));
      return { ...state, items: updatedItems };
    }

    case "CLEAR_CART": {
      localStorage.removeItem(cartKey);
      localStorage.removeItem(checkoutKey);
      return { 
        ...state, 
        items: [], 
        appliedCoupon: null, 
        paymentMethod: null,
        selectedLocationId: null,
        selectedAddress: null
      };
    }

    case "SWITCH_USER": {
      const newCartKey = getCartKey(action.payload.userId);
      const newCheckoutKey = getCheckoutKey(action.payload.userId);
      const newItems = JSON.parse(localStorage.getItem(newCartKey)) || [];
      const persistedCheckout = JSON.parse(localStorage.getItem(newCheckoutKey) || "{}");
      return {
        ...state,
        items: newItems,
        userId: action.payload.userId,
        appliedCoupon: null, // reset when switching users
        paymentMethod: persistedCheckout.paymentMethod || null,
        selectedLocationId: persistedCheckout.selectedLocationId || null,
        selectedAddress: persistedCheckout.selectedAddress || null,
      };
    }

    case "APPLY_COUPON": {
      return { ...state, appliedCoupon: action.payload };
    }

    case "REMOVE_COUPON": {
      return { ...state, appliedCoupon: null };
    }

    case "SET_PAYMENT_METHOD": {
      const updatedState = { ...state, paymentMethod: action.payload };
      // Persist checkout state
      localStorage.setItem(checkoutKey, JSON.stringify({
        paymentMethod: updatedState.paymentMethod,
        selectedLocationId: updatedState.selectedLocationId,
        selectedAddress: updatedState.selectedAddress,
      }));
      return updatedState;
    }

    case "SET_SELECTED_ADDRESS": {
      const updatedState = {
        ...state,
        selectedLocationId: action.payload.locationId,
        selectedAddress: action.payload.address,
      };
      // Persist checkout state
      localStorage.setItem(checkoutKey, JSON.stringify({
        paymentMethod: updatedState.paymentMethod,
        selectedLocationId: updatedState.selectedLocationId,
        selectedAddress: updatedState.selectedAddress,
      }));
      return updatedState;
    }

    case "CLEAR_CHECKOUT": {
      localStorage.removeItem(checkoutKey);
      return {
        ...state,
        paymentMethod: null,
        selectedLocationId: null,
        selectedAddress: null,
      };
    }

    default:
      return state;
  }
}


const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, getInitialState());
  const authState = useSelector((state) => state.auth);

  // Watch for auth changes and switch cart accordingly
  useEffect(() => {
    const currentUserId = authState.user?.id || null;
    if (currentUserId !== state.userId) {
      dispatch({
        type: "SWITCH_USER",
        payload: { userId: currentUserId }
      });
    }
  }, [authState.user?.id, state.userId]);

  // Clear cart when user logs out
  useEffect(() => {
    if (!authState.isAuthenticated && state.userId) {
      dispatch({ type: "CLEAR_CART" });
    }
  }, [authState.isAuthenticated, state.userId]);

  // Derived values
  const itemsCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  let discount = 0;
  if (state.appliedCoupon) {
    // Example: percentage vs flat
    if (state.appliedCoupon.type === 0) {
      discount = state.appliedCoupon.price; // flat discount
    } else if (state.appliedCoupon.type === 1) {
      discount = (subtotal * state.appliedCoupon.price) / 100; // percent
    }
  }

  const totalPrice = subtotal - discount;

  return (
    <CartContext.Provider
    value={{
      state,
      dispatch,
      itemsCount,
      subtotal,
      totalPrice,
      discount,
    }}
  >
    {children}
  </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
