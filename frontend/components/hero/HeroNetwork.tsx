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

  // GSAP ScrollTrigger Animation for the Split Layout and Math Frame Drawing
  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=1500', // Extension for the full drawing sequence
        scrub: 1, 
        pin: true,
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

    const coreOpts = { overwrite: 'auto' as const, ease: 'none', duration: 0.2 };

    // 2. Converge all dots to Top-Left of the future frame (0-0.2)
    // Frame boundaries: Top 20%, Left 60%, Width 25%, Height 60%
    tl.to('.hero-core-dot, .hero-core-glow', { x: '10vw', y: '-30vh', ...coreOpts }, 0);
    tl.to('.math-dot', { attr: { cx: '60%', cy: '20%' }, ...coreOpts }, 0);

    // 3. Draw Top Edge (0.2-0.4)
    tl.to('.hero-core-dot, .hero-core-glow', { x: '35vw', y: '-30vh', ...coreOpts }, 0.2);
    tl.to('.math-dot', { attr: { cx: '85%', cy: '20%' }, ...coreOpts }, 0.2);
    tl.to('.frame-line-top', { attr: { x2: '85%' }, ...coreOpts }, 0.2);

    // 4. Draw Right Edge (0.4-0.6)
    tl.to('.hero-core-dot, .hero-core-glow', { x: '35vw', y: '30vh', ...coreOpts }, 0.4);
    tl.to('.math-dot', { attr: { cx: '85%', cy: '80%' }, ...coreOpts }, 0.4);
    tl.to('.frame-line-right', { attr: { y2: '80%' }, ...coreOpts }, 0.4);

    // 5. Draw Bottom Edge (0.6-0.8)
    tl.to('.hero-core-dot, .hero-core-glow', { x: '10vw', y: '30vh', ...coreOpts }, 0.6);
    tl.to('.math-dot', { attr: { cx: '60%', cy: '80%' }, ...coreOpts }, 0.6);
    tl.to('.frame-line-bottom', { attr: { x2: '60%' }, ...coreOpts }, 0.6);

    // 6. Draw Left Edge (0.8-1.0)
    tl.to('.hero-core-dot, .hero-core-glow', { x: '10vw', y: '-30vh', ...coreOpts }, 0.8);
    tl.to('.math-dot', { attr: { cx: '60%', cy: '20%' }, ...coreOpts }, 0.8);
    tl.to('.frame-line-left', { attr: { y2: '20%' }, ...coreOpts }, 0.8);

    // 7. Fade in Portrait Image securely inside the frame (0.8-1.0)
    tl.to('.portrait-img', { opacity: 1, duration: 0.2, ease: 'power1.inOut' }, 0.8);

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
      <HeroBackground ref={svgRef} />
      
      {/* Drawing SVG layer (the "mathematical plot" frame) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 portrait-frame-svg" style={{ opacity: 0 }}>
         {/* Top Line */}
         <line className="frame-line-top" x1="60%" y1="20%" x2="60%" y2="20%" stroke="#ff3333" strokeWidth="2" strokeLinecap="round" style={{ filter: 'blur(0.5px)' }} />
         {/* Right Line */}
         <line className="frame-line-right" x1="85%" y1="20%" x2="85%" y2="20%" stroke="#ff3333" strokeWidth="2" strokeLinecap="round" style={{ filter: 'blur(0.5px)' }} />
         {/* Bottom Line */}
         <line className="frame-line-bottom" x1="85%" y1="80%" x2="85%" y2="80%" stroke="#ff3333" strokeWidth="2" strokeLinecap="round" style={{ filter: 'blur(0.5px)' }} />
         {/* Left Line */}
         <line className="frame-line-left" x1="60%" y1="80%" x2="60%" y2="80%" stroke="#ff3333" strokeWidth="2" strokeLinecap="round" style={{ filter: 'blur(0.5px)' }} />
      </svg>

      {/* Portrait Image Container */}
      <div className="absolute top-[20%] left-[60%] w-[25%] h-[60%] z-20 pointer-events-none">
        <Image 
          src={portrait}
          alt="Portrait"
          fill
          className="portrait-img opacity-0 object-contain"
        />
      </div>

      <HeroContent ref={textRef} />
    </div>
  );
}
