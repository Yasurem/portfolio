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
    // Reveal text using clip-path instead of simple translate
    gsap.set('.hero-content-item', { clipPath: 'inset(100% 0 0 0)' });
    
    gsap.to('.hero-content-item', {
      clipPath: 'inset(0% 0 0 0)',
      duration: 1.5,
      ease: 'expo.out',
      delay: 2.3,
      stagger: 0.15
    });

    gsap.to('.micro-copy', {
      opacity: 1,
      duration: 1,
      ease: 'power2.out',
      delay: 2.8,
      stagger: 0.1
    });

  }, { scope: containerRef });

  useImperativeHandle(ref, () => ({
    getScrollTimeline: () => {
      const tl = gsap.timeline();
      
      tl.to('.hero-entity', {
        x: '-20vw',
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
    <div ref={containerRef} className="relative z-10 flex flex-col justify-center px-4 md:px-12 pointer-events-none w-full h-full overflow-hidden mix-blend-difference text-white">
      
      {/* Corner Micro-copy */}
      <div className="absolute top-8 left-8 micro-copy opacity-0 font-mono text-xs text-primary tracking-widest">
        [SYS.RDY] v2.4.1
      </div>
      <div className="absolute bottom-8 right-8 micro-copy opacity-0 font-mono text-xs text-primary tracking-widest">
        LAT: 14.5995° N | LON: 120.9842° E
      </div>
      <div className="absolute bottom-8 left-8 micro-copy opacity-0 font-mono text-xs text-lofi tracking-widest">
        INIT: SEQ_01
      </div>

      {/* Main Heading Entity - Massive and Overlapping */}
      <div className="hero-entity flex flex-col relative z-20 mt-12 w-full text-left">
        <div className="overflow-hidden">
          <h1 className="hero-content-item text-[12vw] leading-[0.8] font-extrabold tracking-tighter font-heading text-white mix-blend-difference">
            Joemarc
          </h1>
        </div>
        <div className="overflow-hidden">
          <h1 className="hero-content-item text-[12vw] leading-[0.8] font-extrabold tracking-tighter font-heading text-primary mix-blend-difference ml-[8vw]">
            Castillo
          </h1>
        </div>
      </div>

      {/* Description Entity - Asymmetrical placement */}
      <div className="hero-entity mt-16 ml-[10vw] max-w-lg z-20">
        <div className="overflow-hidden">
          <div className="hero-content-item text-lg md:text-xl text-gray-300 font-light tracking-wide mix-blend-difference">
            Initializing advanced vector sequences.
          </div>
        </div>
        <div className="overflow-hidden">
          <div className="hero-content-item text-lg md:text-xl text-gray-300 font-light tracking-wide mix-blend-difference">
            Building digital experiences with precision,
          </div>
        </div>
        <div className="overflow-hidden">
          <div className="hero-content-item text-lg md:text-xl text-gray-300 font-light tracking-wide mb-10 mix-blend-difference">
            performance, and aesthetic clarity.
          </div>
        </div>
      </div>

      {/* Buttons Entity */}
      <div className="hero-entity flex gap-6 pointer-events-auto ml-[10vw] z-20">
        <div className="overflow-hidden">
          <button className="hero-content-item px-8 py-4 bg-primary text-background rounded-sm font-semibold tracking-widest uppercase text-sm hover:bg-primary/80 transition-colors duration-300 shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_40%,transparent)]">
            Initialize Sequence
          </button>
        </div>
        <div className="overflow-hidden">
          <button className="hero-content-item px-8 py-4 border border-primary text-primary rounded-sm font-semibold tracking-widest uppercase text-sm hover:bg-primary/10 transition-colors duration-300">
            View Logs
          </button>
        </div>
      </div>

      {/* Right Side Portrait - Pushed back to allow overlap */}
      <div className="absolute right-[5vw] top-1/2 -translate-y-1/2 flex justify-center items-center pointer-events-none z-0">
        <div 
          id="hero-portrait-container" 
          className="hero-portrait-container w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full border border-dashed border-primary/30 flex justify-center items-center overflow-hidden relative mix-blend-luminosity opacity-80"
        >
           {props.children}
        </div>
      </div>

    </div>
  );
});

HeroContent.displayName = 'HeroContent';

export default HeroContent;
