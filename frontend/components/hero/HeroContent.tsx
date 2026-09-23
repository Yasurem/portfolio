'use client';

import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { HeroArtifact } from './HeroArtifact';

interface HeroContentProps {
  children?: React.ReactNode;
}

export interface HeroContentRef {
  getScrollTimeline: () => gsap.core.Timeline;
  getIntroTimeline: () => gsap.core.Timeline;
}

const HeroContent = forwardRef<HeroContentRef, HeroContentProps>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    // Defer heavy WebGL compilation until after the initial page paint
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => setIsMounted(true));
    } else {
      setTimeout(() => setIsMounted(true), 100);
    }
  }, []);

  useGSAP(() => {
    // Empty scope as animations moved to getIntroTimeline
  }, { scope: containerRef });

  useImperativeHandle(ref, () => ({
    getScrollTimeline: () => {
      const tl = gsap.timeline();
      
      tl.to('.hero-entity', {
        x: '-5vw',
        ease: 'power1.inOut',
        stagger: 0.05,
        duration: 0.2
      }, 0);

      // tl.to('.portrait-img', { 
      //   opacity: 1, 
      //   duration: 0.3, 
      //   ease: 'power1.inOut' 
      // }, 1.3);

      return tl;
    },
    getIntroTimeline: () => {
      const tl = gsap.timeline();
      
      // Initial state
      tl.set('.hero-content-item', { clipPath: 'inset(100% 0 0 0)' });
      tl.set('.hero-portrait-container', { scale: 1.05, opacity: 0 });
      
      // Phase 2 (250ms)
      tl.to('.hero-content-item', {
        clipPath: 'inset(0% 0 0 0)',
        duration: 1.5,
        ease: 'power3.out',
        stagger: 0.15
      }, 0.25);

      tl.to('.micro-copy', {
        opacity: 1,
        duration: 1,
        ease: 'power2.out',
        stagger: 0.1
      }, 0.25);

      // Phase 3 (When Phase 2 is ~70% done)
      // Duration is 1.5s, 70% of 1.5s is 1.05s
      tl.to('.hero-portrait-container', {
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: 'power3.out'
      }, 0.25 + 1.05);

      return tl;
    }
  }));

  return (
    <div ref={containerRef} className="relative z-10 flex flex-col justify-center px-4 md:px-12 pointer-events-none w-full h-full overflow-hidden text-white">
      
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
      <div className="hero-entity flex flex-col relative z-20 mt-12 w-full text-left will-change-transform">
        <div className="overflow-hidden">
          <h1 className="hero-content-item text-[clamp(4rem,13vw,18rem)] leading-[0.8] font-extrabold tracking-tighter font-heading text-white will-change-transform">
            Joemarc
          </h1>
        </div>
        <div className="overflow-hidden">
          <h1 className="hero-content-item text-[clamp(4rem,13vw,18rem)] leading-[0.8] font-extrabold tracking-tighter font-heading text-primary ml-[clamp(2rem,7vw,12rem)] will-change-transform">
            Castillo
          </h1>
        </div>
      </div>

      {/* Description Entity - Asymmetrical placement */}
      <div className="hero-entity mt-16 ml-[10vw] max-w-lg z-20 will-change-transform">
        <div className="overflow-hidden">
          <div className="hero-content-item text-lg md:text-xl text-gray-300 font-light tracking-wide will-change-transform">
            A Third Year Computer Science Student.
          </div>
        </div>
        <div className="overflow-hidden">
          <div className="hero-content-item text-lg md:text-xl text-gray-300 font-light tracking-wide will-change-transform">
            Specializes in leading teams, engineering agentic systems, and deploying projects
          </div>
        </div>
        <div className="overflow-hidden">
          <div className="hero-content-item text-lg md:text-xl text-gray-300 font-light tracking-wide mb-10 will-change-transform">
            with passion, integrity, and quality.
          </div>
        </div>
      </div>

      {/* Buttons Entity */}
      <div className="hero-entity flex gap-6 pointer-events-auto ml-[10vw] z-20 will-change-transform">
        <div className="overflow-hidden">
          <button className="hero-content-item px-8 py-4 bg-primary text-background rounded-sm font-semibold tracking-widest uppercase text-sm hover:bg-primary/80 transition-colors duration-300 shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_40%,transparent)] will-change-transform">
            Initialize Sequence
          </button>
        </div>
        <div className="overflow-hidden">
          <button className="hero-content-item px-8 py-4 border border-primary text-primary rounded-sm font-semibold tracking-widest uppercase text-sm hover:bg-primary/10 transition-colors duration-300 will-change-transform">
            View Logs
          </button>
        </div>
      </div>

      {/* Right Side Portrait / Artifact Container */}
      <div className="absolute right-0 top-0 flex justify-center items-center pointer-events-auto z-0 w-[50vw] h-[100vh] overflow-hidden">
        <div 
          id="hero-portrait-container" 
          className="hero-portrait-container w-full h-full flex justify-center items-center relative will-change-transform"
        >
           {isMounted && <HeroArtifact />}
           {props.children}
        </div>
      </div>

    </div>
  );
});

HeroContent.displayName = 'HeroContent';

export default HeroContent;
