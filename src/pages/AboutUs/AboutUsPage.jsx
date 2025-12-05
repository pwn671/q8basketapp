import React, { useState } from "react";
import styles from "./AboutUsPage.module.css";
import SimpleHeader from "../../components/simpleHeader/SimpleHeader";
import { sections } from "../../data/staticData";
import useLockBodyScrollOnApp from "../../hooks/useLockBodyScrollOnApp";
import layoutStyles from "../../styles/Layout.module.css";

export default function AboutUsPage() {
    const [activeSection, setActiveSection] = useState("about");

    useLockBodyScrollOnApp();

    return (
        <div className={layoutStyles.appWrapper}>
            <div className={layoutStyles.appContainer}>
                <SimpleHeader title="About Us" />

                <div className={styles.contentArea}>
                    {sections.map((section) => {
                        const isActive = activeSection === section.id;
                        return (
                            <div
                                key={section.id}
                                className={`${styles.sectionWrapper} ${isActive ? styles.expanded : styles.collapsed}`}
                                onClick={() => setActiveSection(section.id)}
                            >
                                <div
                                    className={`${styles.sectionHeader} ${
                                        isActive ? styles.expandedHeader : styles.collapsedHeader
                                    }`}
                                >
                                    <h3>{section.title}</h3>
                                </div>
                                {isActive && (
                                    <div className={styles.sectionContent}>
                                        {section.content.map((text, idx) => (
                                            <p key={idx} className={styles.aboutText}>
                                                {text}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
