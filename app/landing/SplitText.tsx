"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface SplitTextProps {
  text: string;
  className?: string;
  duration?: number; // total duration of the animation
  delay?: number;    // delay between each word
}

const SplitText: React.FC<SplitTextProps> = ({ text, className = '', duration = 0.7, delay = 0.08 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const words = containerRef.current.querySelectorAll('.split-word');
    gsap.fromTo(
      words,
      { y: 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: delay,
        duration,
        ease: 'power3.out',
      }
    );
  }, [text, duration, delay]);

  return (
    <div ref={containerRef} className={className} style={{ display: 'inline-block', overflow: 'hidden' }}>
      {text.split(' ').map((word, i) => (
        <span
          key={i}
          className="split-word"
          style={{ display: 'inline-block', opacity: 0, marginRight: '0.25em' }}
        >
          {word}
        </span>
      ))}
    </div>
  );
};

export default SplitText; 