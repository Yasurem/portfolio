'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import HeroBackground from './HeroBackground';
import HeroContent from './HeroContent';

gsap.registerPlugin(ScrollTrigger);

export default function HeroNetwork() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);

  // GSAP ScrollTrigger Animation for the Split Layout
  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=1000', // Scroll distance
        scrub: 1, // Smooth scrub
        pin: true,
      }
    });

    // Animate each entity to the left side independently.
    // CSS Math Trick: By calculating `-50vw` (moving it to the left edge of the screen) 
    // + `50%` (half of its own width, pushing it back so its left edge aligns at 0) 
    // + `8vw` (our desired left margin), 
    // we flawlessly left-align all elements regardless of their varying widths without them going off-screen.
    tl.to('.hero-entity', {
      x: '-42vw',
      xPercent: 50,
      ease: 'power2.inOut',
      stagger: 0.1, // They break apart and shift left smoothly at slightly different times
    }, 0);
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
      <HeroBackground ref={svgRef} />
      <HeroContent ref={textRef} />
    </div>
  );
}
