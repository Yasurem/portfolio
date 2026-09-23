'use client';

import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface HeroContentProps {
  children?: React.ReactNode;
}

export interface HeroContentRef {
  getScrollTimeline: () => gsap.core.Timeline;
}

const HeroContent = forwardRef<HeroContentRef, HeroContentProps>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.to('.hero-content-item', {
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: 'expo.out',
      delay: 2.3,
      stagger: 0.15
    });
  }, { scope: containerRef });

  useImperativeHandle(ref, () => ({
    getScrollTimeline: () => {
      const tl = gsap.timeline();
      
      tl.to('.hero-entity', {
        x: '-42vw',
        xPercent: 50,
        ease: 'power1.inOut',
        stagger: 0.05,
        duration: 0.2
      }, 0);

      tl.to('.portrait-img', { 
        opacity: 1, 
        duration: 0.3, 
        ease: 'power1.inOut' 
      }, 1.3);

      return tl;
    }
  }));

  return (
    <div ref={containerRef} className="relative z-10 flex flex-col items-center justify-center px-4 md:px-8 pointer-events-none w-full h-full overflow-hidden">
      
      {/* Main Heading Entity */}
      <div className="hero-entity hero-content-item text-center opacity-0 translate-y-10 w-max">
        <h1 className="text-6xl md:text-8xl font-extrabold text-foreground mb-6 tracking-tighter font-heading">
          Joemarc <span className="text-primary drop-shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_50%,transparent)]">Castillo</span>
        </h1>
      </div>

      {/* Description Entity */}
      <div className="hero-entity hero-content-item text-center opacity-0 translate-y-10 w-max text-lg md:text-xl text-lofi font-light tracking-wide">
        Initializing advanced vector sequences.
      </div>
      <div className="hero-entity hero-content-item text-center opacity-0 translate-y-10 w-max text-lg md:text-xl text-lofi font-light tracking-wide">
        Building digital experiences with precision,
      </div>
      <div className="hero-entity hero-content-item text-center opacity-0 translate-y-10 w-max text-lg md:text-xl text-lofi font-light tracking-wide mb-10">
        performance, and aesthetic clarity.
      </div>

      {/* Buttons Entity */}
      <div className="hero-entity hero-content-item flex gap-6 pointer-events-auto opacity-0 translate-y-10 w-max">
        <button className="px-8 py-4 bg-primary text-foreground rounded-sm font-semibold tracking-widest uppercase text-sm hover:bg-primary/80 transition-colors duration-300 shadow-[0_0_10px_color-mix(in_srgb,var(--color-primary)_30%,transparent)]">
          Initialize Sequence
        </button>
        <button className="px-8 py-4 border border-primary text-primary rounded-sm font-semibold tracking-widest uppercase text-sm hover:bg-primary/10 transition-colors duration-300 shadow-[0_0_10px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]">
          View Logs
        </button>
      </div>

      {/* Right Side Portrait Placeholder for Final Layout */}
      <div className="absolute right-[5vw] top-1/2 -translate-y-1/2 flex justify-center items-center pointer-events-none">
        <div 
          id="hero-portrait-container" 
          className="hero-portrait-container w-50 h-50 md:w-[20vw] md:h-[20vw] lg:w-[30rem] lg:h-[30rem] rounded-full border-4 border-dashed border-transparent flex justify-center items-center overflow-hidden relative"
        >
           {props.children}
        </div>
      </div>

    </div>
  );
});

HeroContent.displayName = 'HeroContent';

export default HeroContent;
