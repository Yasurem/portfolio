'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
// import Image from 'next/image';
// import portrait from '@/components/hero/img/Portrait.svg';

import HeroAnimatedGrid, { HeroAnimatedGridRef } from './HeroAnimatedGrid';
import HeroOverlayText, { HeroOverlayTextRef } from './HeroOverlayText';
import { Hero3DRubiks } from './Hero3DRubiks';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HeroOverlayTextRef>(null);
  const bgRef = useRef<HeroAnimatedGridRef>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => setIsMounted(true));
    } else {
      setTimeout(() => setIsMounted(true), 100);
    }
  }, []);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 768px)",
      isMobile: "(max-width: 767px)"
    }, (context) => {
      const { isDesktop } = context.conditions as { isDesktop: boolean; isMobile: boolean };

      // Intro Timeline
      const introTl = gsap.timeline();
      if (textRef.current?.getIntroTimeline) {
        introTl.add(textRef.current.getIntroTimeline(isDesktop), 0);
      }

      if (isDesktop) {
        const masterTl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: '+=1500', 
            scrub: 1, 
            pin: true,
          }
        });

        // Add child timelines at position 0 to maintain exact sequence
        if (textRef.current) masterTl.add(textRef.current.getScrollTimeline(isDesktop), 0);
        if (bgRef.current) masterTl.add(bgRef.current.getScrollTimeline(isDesktop), 0);

        // Hide normal math paths so the UI stays clean
        masterTl.to('.math-equations-wrapper', { opacity: 0, duration: 0.1 }, 0);
      } else {
        // Mobile layout fallback - no pinning
        gsap.set('.math-equations-wrapper', { opacity: 0 }); 
      }
    });

    return () => mm.revert();
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-background overflow-hidden flex items-center justify-center will-change-transform" style={{ transform: 'translateZ(0)' }}>
      {/* Layer 1: Background Grid */}
      <HeroAnimatedGrid ref={bgRef} />
      
      {/* Layer 2: 3D Artifact */}
      <div className="absolute inset-0 md:bottom-auto md:right-auto md:top-0 md:left-[50vw] flex justify-center items-center pointer-events-auto z-10 w-full md:w-[50vw] h-full overflow-hidden opacity-60 md:opacity-100" style={{ transform: 'translateZ(0)' }}>
        <div 
          id="hero-portrait-container" 
          className="hero-portrait-container w-full h-full flex justify-center items-center relative will-change-transform"
        >
           {isMounted && <Hero3DRubiks />}
        </div>
      </div>

      {/* Layer 3: Text & UI Overlay */}
      <HeroOverlayText ref={textRef} />
    </div>
  );
}
