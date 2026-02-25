import React from "react";
import styles from "./JhonumLogo.module.css";

export default function HzaGroupLogo() {
  return (
    <div className={styles.logoRoot}>
      <span className={styles.logoText}>HZA&nbsp;GR</span>
      <span className={styles.logoGear}>
        {/* SVG Gear as O */}
        <svg
          width="44"
          height="44"
          viewBox="0 0 54 54"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="gold" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffe066" />
              <stop offset="60%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#a67c00" />
            </radialGradient>
          </defs>
          <circle cx="27" cy="27" r="16" fill="url(#gold)" stroke="#d4af37" strokeWidth="4" />
          {/* Simple gear effect */}
          <g stroke="#d4af37" strokeWidth="3">
            <line x1="27" y1="5" x2="27" y2="17" />
            <line x1="27" y1="37" x2="27" y2="49" />
            <line x1="5" y1="27" x2="17" y2="27" />
            <line x1="37" y1="27" x2="49" y2="27" />
            <line x1="13" y1="13" x2="21" y2="21" />
            <line x1="41" y1="41" x2="33" y2="33" />
            <line x1="13" y1="41" x2="21" y2="33" />
            <line x1="41" y1="13" x2="33" y2="21" />
          </g>
        </svg>
      </span>
      <span className={styles.logoText}>UP</span>
    </div>
  );
}
