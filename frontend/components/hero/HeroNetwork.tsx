'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';
import portrait from '@/components/hero/img/Portrait.svg';

import HeroBackground from './HeroBackground';
import HeroContent from './HeroContent';

gsap.registerPlugin(ScrollTrigger);

export default function HeroNetwork() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 0. Ensure SVG transforms rotate from the exact center of the container
    // We set opacity 0 initially so they don't show up before the split
    gsap.set('.split-orb-top, .split-orb-bottom', { 
      transformOrigin: '50% 50%',
      opacity: 0
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=1500', 
        scrub: 1, 
        pin: true,
        invalidateOnRefresh: true,
      }
    });

    // 1. Text splits to the left (0-0.2 timeline progress)
    tl.to('.hero-entity', {
      x: '-42vw',
      xPercent: 50,
      ease: 'power1.inOut',
      stagger: 0.05,
      duration: 0.2
    }, 0);

    // Hide normal math paths so the UI stays clean
    tl.to('.math-path', { opacity: 0, duration: 0.1 }, 0);
    tl.to('.portrait-frame-svg', { opacity: 1, duration: 0.1 }, 0);

    // 2. Converge orb to the LEFT EDGE of the portrait container (0-0.4)
    tl.to('.hero-core-dot, .hero-core-glow', { 
      x: () => {
        const pc = document.getElementById('hero-portrait-container');
        if (pc) {
          const rect = pc.getBoundingClientRect();
          // Target the exact 2% inset where the left edge of our circle frame starts
          return rect.left + (rect.width * 0.02) - (window.innerWidth / 2);
        }
        return window.innerWidth * 0.25;
      }, 
      y: () => {
        const pc = document.getElementById('hero-portrait-container');
        if (pc) {
          const rect = pc.getBoundingClientRect();
          return rect.top + rect.height / 2 - (window.innerHeight / 2);
        }
        return 0;
      }, 
      ease: 'power2.inOut', 
      duration: 0.4 
    }, 0);

    // 3. SEAMLESS HANDOFF: Use tl.set for instant visibility toggle at exactly 0.4
    tl.set('.hero-core-dot, .hero-core-glow', { opacity: 0 }, 0.4);
    tl.set('.split-orb-top, .split-orb-bottom', { opacity: 1 }, 0.4);

    // 4. Reveal two SVG arcs and translate the split orbs
    
    // Top path & orb: 270 degrees clockwise (goes from Left -> Top -> Right -> Bottom)
    // 270 degrees is 75% of the circle, so strokeDashoffset goes from 100 to 25
    tl.fromTo('.frame-circle-top', 
      { strokeDashoffset: 100 }, 
      { strokeDashoffset: 25, duration: 0.8, ease: 'power2.inOut' }, 
      0.4
    );
    tl.fromTo('.split-orb-top', 
      { rotation: 0 }, 
      { rotation: 270, duration: 0.8, ease: 'power2.inOut' }, 
      0.4
    );

    // Bottom path & orb: 90 degrees counter-clockwise (goes from Left -> Bottom)
    // 90 degrees is 25% of the circle, so strokeDashoffset goes from -100 to -75
    tl.fromTo('.frame-circle-bottom', 
      { strokeDashoffset: -100 }, 
      { strokeDashoffset: -75, duration: 0.8, ease: 'power2.inOut' }, 
      0.4
    );
    tl.fromTo('.split-orb-bottom', 
      { rotation: 0 }, 
      { rotation: -90, duration: 0.8, ease: 'power2.inOut' }, 
      0.4
    );

    // 5. Orbs combine at the bottom (270deg), flare up, and fade out (1.2-1.3)
    tl.to('.split-orb-top, .split-orb-bottom', { 
      scale: 1.8, 
      opacity: 0, 
      duration: 0.15, 
      ease: 'power1.out' 
    }, 1.2);

    // 6. Fade in Portrait Image securely inside the frame
    tl.to('.portrait-img', { opacity: 1, duration: 0.3, ease: 'power1.inOut' }, 1.3);

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-background overflow-hidden flex items-center justify-center">
      <HeroBackground ref={svgRef} />
      
      <HeroContent ref={textRef}>
        {/* We use viewBox 0 0 100 100 to ensure perfect responsive scaling.
            Using an SVG <path> instead of <circle> guarantees pathLength="100" 
            is flawlessly supported in all browsers for stroke drawing! */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 portrait-frame-svg" viewBox="0 0 100 100" style={{ opacity: 0 }}>
          
          {/* Top Arc (Clockwise 270deg). Path starts perfectly at 9 o'clock (2,50). */}
          <path 
            className="frame-circle-top"
            d="M 2 50 a 48 48 0 1 1 96 0 a 48 48 0 1 1 -96 0"
            fill="none" stroke="var(--color-primary)" strokeWidth="0.8" 
            pathLength="100"
            strokeDasharray="100" strokeDashoffset="100"
            strokeLinecap="round"
          />
          {/* Bottom Arc (Counter-Clockwise 90deg). Identical path, driven backwards by offset. */}
          <path 
            className="frame-circle-bottom"
            d="M 2 50 a 48 48 0 1 1 96 0 a 48 48 0 1 1 -96 0"
            fill="none" stroke="var(--color-primary)" strokeWidth="0.8" 
            pathLength="100"
            strokeDasharray="100" strokeDashoffset="-100"
            strokeLinecap="round"
          />
          
          {/* Split Orbs 
              We include a transparent rect to force the SVG <g> bounding box to be 100x100, 
              so gsap transformOrigin: "50% 50%" rotates exactly around the container center!
          */}
          <g className="split-orb-top">
             <rect width="100" height="100" fill="transparent" />
             <circle cx="2" cy="50" r="1.5" fill="var(--color-primary)" />
             <circle cx="2" cy="50" r="3" fill="var(--color-primary)" opacity="0.3" style={{ filter: 'blur(1px)' }} />
          </g>
          <g className="split-orb-bottom">
             <rect width="100" height="100" fill="transparent" />
             <circle cx="2" cy="50" r="1.5" fill="var(--color-primary)" />
             <circle cx="2" cy="50" r="3" fill="var(--color-primary)" opacity="0.3" style={{ filter: 'blur(1px)' }} />
          </g>
        </svg>
        <Image 
          src={portrait}
          alt="Portrait"
          fill
          className="portrait-img opacity-0 object-contain p-4 z-0"
        />
      </HeroContent>
    </div>
  );
}
