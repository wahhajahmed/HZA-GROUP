"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./HeroBanner.module.css";

export function HeroBanner() {
  const [animate, setAnimate] = useState(false);
  const [showBtns, setShowBtns] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
    setTimeout(() => setShowBtns(true), 700);
  }, []);

  return (
    <section ref={bannerRef} className={styles.hero + " " + styles.heroMinHeight}>
      {/* Animated gradient background overlay */}
      <div className={styles.animatedBg} />
      {/* Radial glow behind text */}
      <div className={styles.glow} />
      {/* Abstract right-side blob */}
      <div className={styles.blobRight} />
      <div className={styles.heroContent}>
        <h1 className={styles.heading + " " + (animate ? styles.headingVisible : "")}
            aria-label="Shop Quality Products Online">
          <span className={styles.headingLine + " " + (animate ? styles.fadeUp : "") + " " + styles.delay1}>
            Shop Quality
          </span>
          <span className={styles.headingLine + " " + (animate ? styles.fadeUp : "") + " " + styles.delay2}>
            <span className={styles.gradientText}>Products</span> Online
          </span>
        </h1>
        <p className={styles.subheading + " " + (animate ? styles.fadeUp : "") + " " + styles.delay3}>
          Discover thousands of products with fast delivery across Pakistan. Cash on delivery available.
        </p>
        <div className={styles.heroBtns + (showBtns ? " " + styles.fadeUp : "") + " " + styles.delay4}>
          <Link href="/categories" className={styles.btnPrimary}>
            Shop Now <ArrowRight className="h-5 w-5 inline ml-1" />
          </Link>
          <Link href="/about" className={styles.btnSecondary}>
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}