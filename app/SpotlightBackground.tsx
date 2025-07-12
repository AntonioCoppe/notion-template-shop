"use client";

import React, { useEffect, useRef } from "react";

interface SpotlightBackgroundProps {
  spotlightColor?: string;
}

const SpotlightBackground: React.FC<SpotlightBackgroundProps> = ({
  spotlightColor = "rgba(0,0,0,0.15)"
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const x = e.clientX;
      const y = e.clientY;
      ref.current.style.setProperty("--spotlight-x", `${x}px`);
      ref.current.style.setProperty("--spotlight-y", `${y}px`);
      ref.current.style.setProperty("--spotlight-color", spotlightColor);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [spotlightColor]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        width: "100vw",
        height: "100vh",
        background: "radial-gradient(circle at var(--spotlight-x, 50vw) var(--spotlight-y, 50vh), var(--spotlight-color, rgba(0,229,255,0.2)), transparent 15%)",
        transition: "background 0.3s",
      }}
    />
  );
};

export default SpotlightBackground; 