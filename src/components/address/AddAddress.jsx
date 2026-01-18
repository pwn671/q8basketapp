import React, { useState, useEffect } from "react";
import styles from "./AddAddress.module.css";
import { useNavigate } from "react-router-dom";
export default function AddAddress({ show, onClose, onApply }) {
    const [selected, setSelected] = useState();
    const navigate = useNavigate();

    // useEffect(() => {
    //     if (show) {
    //         setSelected(defaultValue);
    //     }
    // }, [show, defaultValue]);

    if (!show) return null;
    return (
        <div className={styles.overlay} onClick={onClose}>
            <button className={styles.closeBtn} onClick={onClose}>
                ✕
            </button>

            <div className={styles.bottomSheet} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3 className={styles.heading}>Where do you want us to deliver this order ?</h3>
                    <h6 className={styles.addressTitle}>Add New Address</h6>
                    <p>This will help us to find the nearest store</p>
                </div>
                <div className={styles.addressItem}>
                    <div className={styles.addressInfo}>
                        <div className={styles.addressMeta}>


                        </div>
                    </div>
                </div>
                <button
                    className={styles.placeBtn}
                    onClick={() => navigate("/address-picker", { state: { from: '/my-address' } })}
                >
                    <div className={styles.placeText}>Search for location</div>
                </button>

                <button
                    className={styles.farBtn}
                    onClick={() => navigate("/search-location", { state: { from: '/my-address' } })}
                >
                    <div className={styles.placeText}>Use current location</div>
                </button>


            </div>
        </div>
    );
}
