'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
// import Image from 'next/image';
// import portrait from '@/components/hero/img/Portrait.svg';

import HeroBackground, { HeroBackgroundRef } from './HeroBackground';
import HeroContent, { HeroContentRef } from './HeroContent';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HeroContentRef>(null);
  const bgRef = useRef<HeroBackgroundRef>(null);

  useGSAP(() => {
    // Intro Timeline
    const introTl = gsap.timeline();
    if (textRef.current?.getIntroTimeline) {
      introTl.add(textRef.current.getIntroTimeline(), 0);
    }

    // 0. Ensure SVG transforms rotate from the exact center of the container
    // gsap.set('.split-orb-top, .split-orb-bottom', { 
    //   transformOrigin: '50% 50%',
    //   opacity: 0
    // });

    // Idle Animation: Rotate multiple overlapping segmented rings at different speeds
    // gsap.to('.idle-ring-1', { rotation: 360, transformOrigin: '50% 50%', duration: 40, repeat: -1, ease: 'none' });
    // gsap.to('.idle-ring-2', { rotation: -360, transformOrigin: '50% 50%', duration: 60, repeat: -1, ease: 'none' });
    // gsap.to('.idle-ring-3', { rotation: 360, transformOrigin: '50% 50%', duration: 25, repeat: -1, ease: 'none' });

    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=1500', 
        scrub: 1, 
        pin: true,
        invalidateOnRefresh: true,
      }
    });

    // Add child timelines at position 0 to maintain exact sequence
    if (textRef.current) masterTl.add(textRef.current.getScrollTimeline(), 0);
    if (bgRef.current) masterTl.add(bgRef.current.getScrollTimeline(), 0);

    // Hide normal math paths so the UI stays clean
    masterTl.to('.math-equations-wrapper', { opacity: 0, duration: 0.1 }, 0);
    // masterTl.to('.portrait-frame-svg', { opacity: 1, duration: 0.1 }, 0);

    // Fade in center orb (which is animated positionally by Background's timeline)
    // masterTl.set('.split-orb-top, .split-orb-bottom', { opacity: 1 }, 0.4);
    // masterTl.set('.frame-circle-top, .frame-circle-bottom', { opacity: 1 }, 0.4);

    // 4. Reveal two SVG arcs and translate the split orbs
    // masterTl.fromTo('.frame-circle-top', 
    //   { strokeDashoffset: 100 }, 
    //   { strokeDashoffset: 25, duration: 0.8, ease: 'power2.inOut' }, 
    //   0.4
    // );
    // masterTl.fromTo('.split-orb-top', 
    //   { rotation: 0 }, 
    //   { rotation: 270, duration: 0.8, ease: 'power2.inOut' }, 
    //   0.4
    // );

    // masterTl.fromTo('.frame-circle-bottom', 
    //   { strokeDashoffset: -100 }, 
    //   { strokeDashoffset: -75, duration: 0.8, ease: 'power2.inOut' }, 
    //   0.4
    // );
    // masterTl.fromTo('.split-orb-bottom', 
    //   { rotation: 0 }, 
    //   { rotation: -90, duration: 0.8, ease: 'power2.inOut' }, 
    //   0.4
    // );

    // 5. Orbs combine at the bottom (270deg), flare up, and STAY PERSISTENT
    // masterTl.to('.split-orb-top, .split-orb-bottom', { 
    //   scale: 1.8, 
    //   duration: 0.15, 
    //   ease: 'power1.out' 
    // }, 1.2);

    // Crossfade the solid drawing border into the final dashed segmented glowing border
    // masterTl.to('.frame-circle-top, .frame-circle-bottom', { opacity: 0, duration: 0.2 }, 1.2);
    // masterTl.fromTo('.idle-rings-group', { opacity: 0 }, { opacity: 1, duration: 0.2 }, 1.2);

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-background overflow-hidden flex items-center justify-center">
      <HeroBackground ref={bgRef} />
      
      <HeroContent ref={textRef}>
        {/* 
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 portrait-frame-svg" viewBox="0 0 100 100" style={{ opacity: 0 }}>
          
          <path 
            className="frame-circle-top"
            d="M 2 50 a 48 48 0 1 1 96 0 a 48 48 0 1 1 -96 0"
            fill="none" stroke="var(--color-primary)" strokeWidth="0.8" 
            pathLength="100"
            strokeDasharray="100" strokeDashoffset="100"
            strokeLinecap="round"
            style={{ opacity: 0 }}
          />
          <path 
            className="frame-circle-bottom"
            d="M 2 50 a 48 48 0 1 1 96 0 a 48 48 0 1 1 -96 0"
            fill="none" stroke="var(--color-primary)" strokeWidth="0.8" 
            pathLength="100"
            strokeDasharray="100" strokeDashoffset="-100"
            strokeLinecap="round"
            style={{ opacity: 0 }}
          />

          <g className="idle-rings-group" style={{ opacity: 0 }}>
            <g className="idle-ring-1">
              <rect width="100" height="100" fill="transparent" />
              <path 
                d="M 2 50 a 48 48 0 1 1 96 0 a 48 48 0 1 1 -96 0"
                fill="none" stroke="var(--color-primary)" strokeWidth="0.8" 
                pathLength="100"
                strokeDasharray="15 5 25 5 10 5 20 5 10 0"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 2px var(--color-primary))' }}
              />
            </g>
            <g className="idle-ring-2">
              <rect width="100" height="100" fill="transparent" />
              <path 
                d="M 2 50 a 48 48 0 1 1 96 0 a 48 48 0 1 1 -96 0"
                fill="none" stroke="var(--color-primary)" strokeWidth="0.4" 
                pathLength="100"
                strokeDasharray="2 20 5 30 3 40 0"
                strokeLinecap="round"
                opacity="0.6"
              />
            </g>
            <g className="idle-ring-3">
              <rect width="100" height="100" fill="transparent" />
              <path 
                d="M 3.5 50 a 46.5 46.5 0 1 1 93 0 a 46.5 46.5 0 1 1 -93 0"
                fill="none" stroke="var(--color-primary)" strokeWidth="0.3" 
                pathLength="100"
                strokeDasharray="10 40 10 40 0"
                strokeLinecap="round"
                opacity="0.8"
              />
            </g>
          </g>
          
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
        <div style={{ position: 'absolute', top: '4%', left: '4%', width: '92%', height: '92%', borderRadius: '50%', overflow: 'hidden', zIndex: 0 }}>
          <Image 
            src={portrait}
            alt="Portrait"
            fill
            className="portrait-img opacity-0 object-cover"
          />
        </div>
        */}
      </HeroContent>
    </div>
  );
}
