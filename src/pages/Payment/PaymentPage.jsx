import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PaymentPage.module.css";
import SearchHeader from "../../components/searchHeader/SearchHeader";
import { useCart } from "../../context/CartContext";
import layoutStyles from "../../styles/Layout.module.css";
import useLockBodyScrollOnApp from "../../hooks/useLockBodyScrollOnApp";

export default function PaymentPage({
  sections,
  onSelect = () => { },
  defaultSelected = null,
}) {
  const navigate = useNavigate();
  const { dispatch, state } = useCart();

  // fallback sections (if none passed)
  const fallback = [
    {
      id: "recommended",
      title: "Recommended",
      items: [
        { id: "cod", label: "Cash on Delivery", icon: "/icons/cash.svg", action: "chev" },
        // { id: "knet", label: "KNET", icon: "/icons/cash.svg", action: "chev" },
      ],
    },
    // {
    //   id: "cards",
    //   title: "Cards",
    //   items: [
    //     { id: "add-card", label: "Add credit or debit cards", icon: "/icons/card.svg", action: "add" },
    //   ],
    // },
    // {
    //   id: "netbanking",
    //   title: "Net banking",
    //   items: [
    //     { id: "netbanking", label: "Netbanking", icon: "/icons/bank.svg", action: "add" },
    //   ],
    // },
    {
      id: "pod",
      title: "Pay On Delivery",
      items: [
        { id: "pod-cash", label: "Cash on Delivery", icon: "/icons/cash.svg", action: "chev" },
      ],
    },
  ];

  const [selected, setSelected] = useState(defaultSelected);

  // Initialize selected payment from context if available
  useEffect(() => {
    if (defaultSelected) {
      setSelected(defaultSelected);
      return;
    }
    // Find the payment method ID that matches the stored payment method label
    if (state.paymentMethod) {
      const usedSections = sections && sections.length ? sections : fallback;
      const allItems = usedSections.flatMap(sec => sec.items);
      const matchingItem = allItems.find(item => item.label === state.paymentMethod);
      if (matchingItem) {
        setSelected(matchingItem.id);
      }
    }
  }, [state.paymentMethod, defaultSelected, sections]);

  const renderItemRight = (item) => {
    if (item.action === "add") {
      return <button className={styles.addBtn}>ADD</button>;
    }
    // default chevron
    return <span className={styles.chev} aria-hidden><img src="/icons/arrow-right.svg" alt="Tag" className={styles.couponIcon} />
    </span>;
  };

  const handleSelect = (id, action, label) => {
    // for actions that are "add" we might not select as a payment method
    if (action === "add") {
      // Navigate to add-card page when user clicks on "Add credit or debit cards"
      if (id === "add-card") {
        navigate('/add-card');
        return;
      }
      // call onSelect for other add actions so parent can handle them
      onSelect(id);
      return;
    }
    setSelected(id);
    onSelect(id);

    // Set payment method in cart context and redirect to cart
    dispatch({ type: 'SET_PAYMENT_METHOD', payload: label });
    navigate('/cart');
  };
  const [searchActive, setSearchActive] = useState(true);
  const [search, setSearch] = useState("");



  const usedSections = sections && sections.length ? sections : fallback;
  useLockBodyScrollOnApp();
  return (
    <div className={layoutStyles.appWrapper}>
      <div className={layoutStyles.appContainer}>
        <SearchHeader
          title="Checkout"
          search={search}
          setSearch={setSearch}
          searchActive={searchActive}
          toggleSearch={() => setSearchActive(prev => !prev)}
        />
        {usedSections.map((sec) => (
          <div key={sec.id} className={styles.section}>

            <div className={styles.card}>
            <h4 className={styles.sectionTitle}>{sec.title}</h4>
              {sec.items.map((it, idx) => {
                const isSelected = selected === it.id;
                return (
                  <button
                    key={it.id}
                    className={`${styles.item} ${isSelected ? styles.itemSelected : ""}`}
                    onClick={() => handleSelect(it.id, it.action, it.label)}
                    aria-pressed={isSelected}
                  >
                    <div className={styles.left}>
                      <div className={styles.iconBox}>
                        {/* If your app uses inline svgs, replace img with inline svg for crisp results */}
                        <img src={it.icon} alt="" className={styles.iconImg} />
                      </div>
                      <div className={styles.labels}>
                        <span className={styles.label}>{it.label}</span>
                        {it.subtitle && <span className={styles.subtitle}>{it.subtitle}</span>}
                      </div>
                    </div>

                    <div className={styles.right}>
                      {isSelected ? (
                        <span className={styles.check}>✓</span>
                      ) : (
                        renderItemRight(it)
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
