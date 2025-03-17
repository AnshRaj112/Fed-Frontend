import React from "react";
import { FaBrain, FaLightbulb, FaTrophy } from "react-icons/fa";
import styles from "./styles/LiveInsights.module.scss";

const PixelHackSection = () => {
  return (
    <section className={styles.pixelHackSection}>
      <h2 className={styles.topic}>Why Join <span>PixelHack?</span></h2>
      <div className={styles.featuresContainer}>
        
        <div className={styles.featureCard}>
          <FaBrain className={styles.icon} />
          <h3>Design Thinking Workshops</h3>
          <p>Learn rapid ideation, wireframing, and problem structuring with hands-on sessions.</p>
        </div>
        
        <div className={styles.featureCard}>
          <FaLightbulb className={styles.icon} />
          <h3>Facilitation from KIIT-TBI</h3>
          <p>Get insights from industry experts to shape your AI-driven ideas.</p>
        </div>
        
        <div className={styles.featureCard}>
          <FaTrophy className={styles.icon} />
          <h3>Exciting Prizes & More</h3>
          <p>Compete for cash prizes, certificates, and exclusive learning opportunities.</p>
        </div>
        
      </div>
    </section>
  );
};

export default PixelHackSection;