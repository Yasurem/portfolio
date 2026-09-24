'use client';

import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface HeroOverlayTextProps {
  children?: React.ReactNode;
}

export interface HeroOverlayTextRef {
  getScrollTimeline: (isDesktop?: boolean) => gsap.core.Timeline;
  getIntroTimeline: (isDesktop?: boolean) => gsap.core.Timeline;
}

const HeroOverlayText = forwardRef<HeroOverlayTextRef, HeroOverlayTextProps>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Empty scope as animations moved to getIntroTimeline
  }, { scope: containerRef });

  useImperativeHandle(ref, () => ({
    getScrollTimeline: (isDesktop = true) => {
      const tl = gsap.timeline();
      
      if (!isDesktop) return tl;

      tl.to('.hero-entity', {
        x: '-100vw', // Fly completely off-screen
        ease: 'power2.in',
        stagger: 0.05,
        duration: 0.2 // Very fast
      }, 0);

      return tl;
    },
    getIntroTimeline: (isDesktop = true) => {
      const tl = gsap.timeline();
      
      // Initial state
      tl.set('.hero-content-item', { clipPath: 'inset(100% 0 0 0)' });
      tl.set('.hero-portrait-container', { scale: 1.05, opacity: 0 });
      
      // Phase 2 (250ms)
      tl.to('.hero-content-item', {
        clipPath: 'inset(0% 0 0 0)',
        duration: isDesktop ? 1.5 : 1.0,
        ease: 'power3.out',
        stagger: isDesktop ? 0.15 : 0.05
      }, 0.25);

      tl.to('.micro-copy', {
        opacity: 1,
        duration: 1,
        ease: 'power2.out',
        stagger: 0.1
      }, 0.25);

      // Phase 3 (When Phase 2 is ~70% done)
      tl.to('.hero-portrait-container', {
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: 'power3.out'
      }, 0.25 + (isDesktop ? 1.05 : 0.7));

      return tl;
    }
  }));

  return (
    <div ref={containerRef} className="relative flex flex-col justify-center px-4 sm:px-8 md:px-12 pointer-events-none w-full h-full overflow-hidden text-white">
      
      {/* Corner Micro-copy */}
      <div className="absolute top-4 md:top-8 left-4 md:left-8 micro-copy opacity-0 font-mono text-[10px] md:text-xs text-primary tracking-widest z-30">
        [SYS.RDY] v2.4.1
      </div>
      <div className="absolute bottom-4 md:bottom-8 right-4 md:right-8 micro-copy opacity-0 font-mono text-[10px] md:text-xs text-primary tracking-widest text-right z-30">
        LAT: 14.5995° N <br className="md:hidden" /> <span className="hidden md:inline">| </span>LON: 120.9842° E
      </div>
      <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 micro-copy opacity-0 font-mono text-[10px] md:text-xs text-lofi tracking-widest z-30">
        INIT: SEQ_01
      </div>

      {/* Main Heading Entity */}
      <div className="hero-entity flex flex-col relative z-20 mt-12 w-full text-left mix-blend-difference will-change-transform">
        <div className="overflow-hidden">
          <h1 className="hero-content-item text-[clamp(4.5rem,15vw,18rem)] md:text-[clamp(4rem,13vw,18rem)] leading-[0.9] md:leading-[0.8] font-extrabold tracking-tighter font-heading text-white will-change-transform">
            Joemarc
          </h1>
        </div>
        <div className="overflow-hidden">
          <h1 className="hero-content-item text-[clamp(4.5rem,15vw,18rem)] md:text-[clamp(4rem,13vw,18rem)] leading-[0.9] md:leading-[0.8] font-extrabold tracking-tighter font-heading text-primary ml-4 sm:ml-8 md:ml-[clamp(2rem,7vw,12rem)] will-change-transform">
            Castillo
          </h1>
        </div>
      </div>

      {/* Description Entity */}
      <div className="hero-entity mt-8 md:mt-16 ml-0 md:ml-[10vw] max-w-[90vw] md:max-w-lg z-20 mix-blend-difference will-change-transform">
        <div className="overflow-hidden">
          <div className="hero-content-item text-base md:text-xl text-gray-300 font-light tracking-wide will-change-transform">
            A Third Year Computer Science Student.
          </div>
        </div>
        <div className="overflow-hidden">
          <div className="hero-content-item text-base md:text-xl text-gray-300 font-light tracking-wide will-change-transform">
            Specializes in leading teams, engineering agentic systems, and deploying projects
          </div>
        </div>
        <div className="overflow-hidden">
          <div className="hero-content-item text-base md:text-xl text-gray-300 font-light tracking-wide mb-8 md:mb-10 will-change-transform">
            with passion, integrity, and quality.
          </div>
        </div>
      </div>

      {/* Buttons Entity */}
      <div className="hero-entity flex flex-col sm:flex-row gap-4 md:gap-6 pointer-events-auto ml-0 md:ml-[10vw] z-20 will-change-transform">
        <div className="overflow-hidden w-full sm:w-auto">
          <button className="hero-content-item w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-primary text-background rounded-sm font-semibold tracking-widest uppercase text-xs md:text-sm hover:bg-primary/80 transition-colors duration-300 shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_40%,transparent)] will-change-transform">
            Initialize Sequence
          </button>
        </div>
        <div className="overflow-hidden w-full sm:w-auto">
          <button className="hero-content-item w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 border border-primary text-primary rounded-sm font-semibold tracking-widest uppercase text-xs md:text-sm hover:bg-primary/10 transition-colors duration-300 will-change-transform">
            View Logs
          </button>
        </div>
      </div>

    </div>
  );
});

HeroOverlayText.displayName = 'HeroOverlayText';

export default HeroOverlayText;
