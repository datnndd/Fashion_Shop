import React from 'react';
import styles from './About.module.css';

const About = () => {
  return (
    <div className={styles.about}>
      {/* Header Section */}
      <section className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Essentials.<br />Refined.</h1>
        </div>
      </section>

      {/* Story Section */}
      <section className={styles.story}>
        <div className="container">
          <div className={styles.grid}>
            <div className={styles.imageWrapper}>
              {/* Using a placeholder since we don't have a specific asset. In production, this would be a high-quality brand image. */}
              <div className={styles.placeholderImage}></div>
            </div>
            <div className={styles.content}>
              <h2 className={styles.subtitle}>Our Philosophy</h2>
              <p>
                Basic Color was founded on a simple premise: clarity brings calm. In a world full of noise and visual clutter, we create clothing that acts as a canvas for your life.
              </p>
              <p>
                We believe that the most expressive color is the one that lets you shine. Our monochromatic collections are designed to be effortless, timeless, and endlessly versatile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={styles.values}>
        <div className="container">
          <div className={styles.valueGrid}>
            <div className={styles.valueItem}>
              <h3>01. Quality</h3>
              <p>We source only the finest sustainable cottons and blends. Fabric that feels good against your skin and stands the test of time.</p>
            </div>
            <div className={styles.valueItem}>
              <h3>02. Simplicity</h3>
              <p>No logos. No unnecessary details. Just perfect cuts and precise stitching. We strip away the non-essential to reveal the essential.</p>
            </div>
            <div className={styles.valueItem}>
              <h3>03. Sustainability</h3>
              <p>We believe in slow fashion. Our pieces are made to last, reducing waste and encouraging a more conscious way of consuming.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
