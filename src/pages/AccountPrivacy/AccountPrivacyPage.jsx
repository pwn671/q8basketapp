import React, { useState } from "react";
import styles from "./AccountPrivacyPage.module.css";
import SimpleHeader from "../../components/simpleHeader/SimpleHeader";
import layoutStyles from "../../styles/Layout.module.css";
import useLockBodyScrollOnApp from "../../hooks/useLockBodyScrollOnApp";

export default function AccountPrivacyPage() {
    const [expanded, setExpanded] = useState(false);

    const textContent = `
        We value your privacy and are committed to protecting your personal information.
        This policy outlines how your data is collected, used, and stored in accordance with
        data protection regulations. Your personal details are never shared with third-party
        vendors without your explicit consent. You have the right to access, update, or delete
        your account information at any time. All transactions on our platform are encrypted
        and processed securely. If you have any concerns about your data privacy or how we
        handle your information, please reach out to our support team. This policy is subject
        to periodic updates. Please review it regularly.
    `;

    const visibleText = textContent.split(" ").slice(0, 70).join(" ") + "...";

    useLockBodyScrollOnApp();
    return (
            <div className={layoutStyles.appWrapper}>
            <div className={layoutStyles.appContainer}>
                <SimpleHeader title="Account Privacy" />

                <div className={styles.contentBox}>
                    <h3 className={styles.title}>Account Privacy and Policy</h3>
                    <p className={styles.text}>
                        {expanded ? textContent : visibleText}
                    </p>

                    {!expanded ? (
                        <p className={styles.readMoreBtn} onClick={() => setExpanded(true)}>
                            Read More
                        </p>
                    ) : <p className={styles.readMoreBtn} onClick={() => setExpanded(false)}>
                        Read Less
                    </p>
                    }

                    <div className={styles.deleteItem}>
                        <img src="/icons/delete.svg" alt="Location" className={styles.deleteIcon} />
                        <div className={styles.deleteInfo}>
                            <div className={styles.deleteMeta}>
                                <h6 className={styles.deleteTitle}>Request to Delete Account</h6>
                            </div>
                            <p className={styles.subHeading}>Request to closure of your account</p>
                        </div>
                        <img src="/icons/arrow-right.svg" alt="Location" className={styles.deleteIcon} />
                    </div>
                </div>
            </div>
        </div>
    );
}
