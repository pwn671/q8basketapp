import React, { useState } from "react";
import styles from "./AddCardPage.module.css";
import SearchHeader from "../../components/searchHeader/SearchHeader";

export default function AddCardPage({
    sections,
    onSelect = () => { },
    defaultSelected = null,
}) {
    const [selected, setSelected] = useState(defaultSelected);


    const renderItemRight = (item) => {
        if (item.action === "add") {
            return <button className={styles.addBtn}>ADD</button>;
        }
        // default chevron
        return <span className={styles.chev} aria-hidden><img src="/icons/arrow-right.svg" alt="Tag" className={styles.couponIcon} />
        </span>;
    };


    const [searchActive, setSearchActive] = useState(true);
    const [search, setSearch] = useState("");




    return (
        <div className={styles.pageWrapper}>
            <div className={styles.pageInner}>
                <SearchHeader
                    title="Checkout"
                    search={search}
                    setSearch={setSearch}
                    searchActive={searchActive}
                    toggleSearch={() => setSearchActive(prev => !prev)}
                />
                <div className={styles.section}>

                    <div className={styles.card}>
                        <h4 className={styles.sectionTitle}>Name on card</h4>
                        <input
                            type="text"
                            className={styles.inputLine}
                        />

                        <h4 className={styles.sectionTitle}>Card Number</h4>
                        <input
                            type="text"
                            className={styles.inputLine}
                        />

                        <h4 className={styles.sectionTitle}>Expiry Date (MM/YY)</h4>
                        <input
                            type="text"
                            className={styles.inputLine}
                        />



                        <div className={styles.labels}>
                            <span className={styles.label}>Nickname for Card</span>
                        </div>
                        <div className={styles.btn}>
                            <button className={styles.addBtn}>Personal</button>
                            <button className={styles.addBtn}>Business</button>

                            <button className={styles.addBtn}>Others</button>
                        </div>


                    </div>
                </div>
                <div className={styles.paymentBar}>


                    <button
                        className={styles.placeBtn}
                        onClick={() => onPlaceOrder(total + 6)}
                    >

                        <div className={styles.placeText}>Place Order</div>
                    </button>
                </div>

            </div>
        </div>
    );
}
