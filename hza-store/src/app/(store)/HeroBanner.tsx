"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./HeroBanner.module.css";
import heroImg from "@/components/layout/image/e-commerce.png";

export function HeroBanner() {
  const [animate, setAnimate] = useState(false);
  const [showBtns, setShowBtns] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
    setTimeout(() => setShowBtns(true), 700);
  }, []);

  return (
    <section ref={bannerRef} className={styles.hero}>
      {/* Animated gradient background overlay */}
      <div className={styles.animatedBg} />
      {/* Radial glow behind text */}
      <div className={styles.glow} />
      
      <div className={styles.mainContainer}>
        {/* Left Content */}
        <div className={styles.heroContent}>
          <h1 className={styles.heading + " " + (animate ? styles.headingVisible : "")}>
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

        {/* Right Image Box */}
        <div className={styles.imageBox + " " + (animate ? styles.fadeUp : "") + " " + styles.delay2}>
          <div className={styles.heroImageWrapper}>
            <Image
              src={heroImg}
              alt="Quality E-commerce Products"
              placeholder="blur"
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 580px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
