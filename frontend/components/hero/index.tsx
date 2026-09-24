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
            end: '+=2500', // Extended to accommodate the new exit animation
            scrub: 1, 
            pin: true,
          }
        });

        // Add child timelines at position 0 to maintain exact sequence
        if (textRef.current) masterTl.add(textRef.current.getScrollTimeline(isDesktop), 0);
        if (bgRef.current) masterTl.add(bgRef.current.getScrollTimeline(isDesktop), 0);

        // Hide normal math paths so the UI stays clean
        masterTl.to('.math-equations-wrapper', { opacity: 0, duration: 0.1 }, 0);

        // New Phase: The Cinematic Transition
        const exitTl = gsap.timeline();
        
        // 1. Zoom natively in WebGL
        const proxy = { zoom: 0 };
        exitTl.to(proxy, {
          zoom: 1,
          duration: 1.5,
          ease: 'power1.inOut',
          onUpdate: () => {
            (window as any).heroCameraZoom = proxy.zoom;
          }
        });
        

        // 3. Reveal the new section on the right
        exitTl.fromTo('.new-section-content', 
          { x: 100, opacity: 0 }, // Slide in from the right
          { x: 0, opacity: 1, duration: 1, ease: 'power2.out' },
          '-=1.0' // Start fading in while the camera is still panning
        );

        // Add exit sequence slightly after the text flies off
        masterTl.add(exitTl, 0.3);
      } else {
        // Mobile layout fallback - no pinning
        gsap.set('.math-equations-wrapper', { opacity: 0 }); 
      }
    });

    // Reverting matchMedia context automatically kills all timelines and ScrollTriggers created within it, preventing memory leaks on unmount.
    return () => mm.revert();
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-background overflow-hidden flex items-center justify-center">
      {/* Layer 1: Background Grid */}
      <HeroAnimatedGrid ref={bgRef} />
      
      {/* Layer 2: 3D Artifact */}
      <div className="hero-scroll-wrapper absolute inset-0 md:bottom-auto md:right-auto md:top-0 left-0 flex justify-center items-center pointer-events-auto z-10 w-full h-full overflow-hidden opacity-60 md:opacity-100" style={{ transform: 'translateZ(0)' }}>
        <div 
          id="hero-portrait-container" 
          className="hero-portrait-container w-full h-full flex justify-center items-center relative will-change-transform"
        >
           {isMounted && <Hero3DRubiks />}
        </div>
      </div>

      {/* Layer 3: Text & UI Overlay */}
      <HeroOverlayText ref={textRef} />

      {/* Layer 4: New Section Placeholder */}
      <div className="new-section-content absolute inset-0 md:left-1/2 w-full md:w-1/2 h-full flex flex-col justify-center items-start p-12 opacity-0 z-20 pointer-events-none md:pointer-events-auto">
        <h2 className="text-4xl font-bold mb-4">About Me</h2>
        <p className="text-lg text-muted-foreground">This placeholder will contain the next section's content. It fades in seamlessly as the 3D element transitions away.</p>
      </div>
    </div>
  );
}
