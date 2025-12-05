import React, { useState, useEffect } from "react";
import Header from "../../components/header/Header";
import NavBar from "../../components/navbar/NavBar";
import styles from "./Category.module.css";
import LargeCategoryCard from "../../components/largecategorycard/LargeCategoryCard";
import config from "../../config/env";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../hooks/useAuth";
import addressService from "../../services/addressService";
import useLockBodyScrollOnApp from '../../hooks/useLockBodyScrollOnApp';
import layoutStyles from "../../styles/Layout.module.css";

export default function Category() {
  const { state: cartState } = useCart(); // Get selected address from cart context
  const { token, user } = useAuth();
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BASE_URL = config.API_BASE_URL;

  // Helper function to truncate address to 10 characters
  const truncateAddress = (address) => {
    if (!address) return address;
    return address.length > 10 ? address.substring(0, 10) + '...' : address;
  };

  // Fetch default address (only if no address is selected)
  useEffect(() => {
    const fetchDefaultAddress = async () => {
      // If address is already selected in cart context, don't fetch default
      if (cartState.selectedAddress) {
        setDefaultAddress(null);
        return;
      }

      if (!token || !user) {
        setDefaultAddress(null);
        return;
      }

      setLoadingAddress(true);
      try {
        const result = await addressService.fetchAddresses(token);
        
        if (result.success && result.data && result.data.length > 0) {
          // Find default address (is_default === 1 or true)
          const defaultAddr = result.data.find(addr => addr.is_default === 1 || addr.is_default === true);
          if (defaultAddr) {
            const addressText = `${defaultAddr.address}${defaultAddr.apartment_building ? `, ${defaultAddr.apartment_building}` : ''}`;
            setDefaultAddress(addressText);
          } else {
            // If no default, use first address
            const firstAddr = result.data[0];
            const addressText = `${firstAddr.address}${firstAddr.apartment_building ? `, ${firstAddr.apartment_building}` : ''}`;
            setDefaultAddress(addressText);
          }
        } else {
          setDefaultAddress(null);
        }
      } catch (err) {
        console.error("Error fetching default address:", err);
        setDefaultAddress(null);
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchDefaultAddress();
  }, [token, user, cartState.selectedAddress]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/front/categories`);
        const data = await res.json();
        if (data.status) {
          setCategories(data.data);
        } else {
          throw new Error("Failed to load categories");
        }
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useLockBodyScrollOnApp();
  return (
    <div className={layoutStyles.appWrapper}>
      <div className={layoutStyles.appContainer}>
        {/* Reuse Header */}
        <Header 
          location={truncateAddress(
            cartState.selectedAddress
              ? `${cartState.selectedAddress.address}${cartState.selectedAddress.apartment_building ? `, ${cartState.selectedAddress.apartment_building}` : ''}`
              : loadingAddress
              ? "Loading address..."
              : defaultAddress
              ? defaultAddress
              : "Select address"
          )} 
          search={search} 
          setSearch={setSearch} 
        />

        {/* Category Body */}
        <section className={styles.categoriesSection} aria-label="Categories">
          <div className={styles.sectionHeader}>
            <h4 tabIndex={0}>Categories</h4>
          </div>

          <ul className={styles.categoriesList} role="list">
            {categories.map(({ id, name, image }) => (
              <LargeCategoryCard key={id} id={id} name={name} image={image} />
            ))}
          </ul>

          {loading && <p>Loading categories...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </section>
      </div>

      {/* Bottom Nav */}
      <NavBar />
    </div>
  );
}
