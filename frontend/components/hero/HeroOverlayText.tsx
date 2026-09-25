'use client';

import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import gsap from 'gsap';

interface HeroOverlayTextProps {
  children?: React.ReactNode;
}

export interface HeroOverlayTextRef {
  getScrollTimeline: (isDesktop?: boolean) => gsap.core.Timeline;
  getIntroTimeline: (isDesktop?: boolean) => gsap.core.Timeline;
}

const MICRO_COPY_DATA = [
  {
    id: 'sys-rdy',
    className: 'absolute top-4 md:top-8 left-4 md:left-8 text-primary z-30',
    content: '[SYS.RDY] v2.4.1',
  },
  {
    id: 'coordinates',
    className: 'absolute bottom-4 md:bottom-8 right-4 md:right-8 text-primary text-right z-30',
    content: (
      <>
        LAT: 14.5995° N <br className="md:hidden" /> <span className="hidden md:inline">| </span>LON: 120.9842° E
      </>
    ),
  },
  {
    id: 'init-seq',
    className: 'absolute bottom-4 md:bottom-8 left-4 md:left-8 text-lofi z-30',
    content: 'INIT: SEQ_01',
  },
];

const HEADING_DATA = [
  {
    id: 'first-name',
    className: 'text-white',
    text: 'Joemarc',
  },
  {
    id: 'last-name',
    className: 'text-primary ml-4 sm:ml-8 md:ml-[clamp(2rem,7vw,12rem)]',
    text: 'Castillo',
  },
];

const DESCRIPTION_DATA = [
  {
    id: 'desc-1',
    className: '',
    text: 'A Third Year Computer Science Student.',
  },
  {
    id: 'desc-2',
    className: '',
    text: 'Specializes in leading teams, engineering agentic systems, and deploying projects',
  },
  {
    id: 'desc-3',
    className: 'mb-8 md:mb-10',
    text: 'with passion, integrity, and quality.',
  },
];

const BUTTON_DATA = [
  {
    id: 'btn-init',
    className: 'bg-primary text-background hover:bg-primary/80 shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_40%,transparent)]',
    text: 'Download CV',
    href: '/src/CV_Castillo, Joemarc Jr. D. (1).pdf',
    download: true,
  },
  {
    id: 'btn-logs',
    className: 'border border-primary text-primary hover:bg-primary/10',
    text: 'View Logs',
  },
];

const HeroOverlayText = forwardRef<HeroOverlayTextRef, HeroOverlayTextProps>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);

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

      return tl;
    }
  }));

  return (
    <div ref={containerRef} className="relative flex flex-col justify-center px-4 sm:px-8 md:px-12 pointer-events-none w-full h-full overflow-hidden text-white">
      
      {/* Corner Micro-copy */}
      {MICRO_COPY_DATA.map((item) => (
        <div key={item.id} className={`micro-copy opacity-0 font-mono text-[10px] md:text-xs tracking-widest ${item.className}`}>
          {item.content}
        </div>
      ))}

      {/* Main Heading Entity */}
      <div className="hero-entity flex flex-col relative z-20 mt-12 w-full text-left mix-blend-difference">
        {HEADING_DATA.map((heading) => (
          <div key={heading.id} className="overflow-hidden">
            <h1 className={`hero-content-item [clip-path:inset(100%_0_0_0)] text-[clamp(4.5rem,15vw,18rem)] md:text-[clamp(4rem,13vw,18rem)] leading-[0.9] md:leading-[0.8] font-extrabold tracking-tighter font-heading ${heading.className}`}>
              {heading.text}
            </h1>
          </div>
        ))}
      </div>

      {/* Description Entity */}
      <div className="hero-entity mt-8 md:mt-16 ml-0 md:ml-[10vw] max-w-[90vw] md:max-w-lg z-20 mix-blend-difference">
        {DESCRIPTION_DATA.map((desc) => (
          <div key={desc.id} className="overflow-hidden">
            <div className={`hero-content-item [clip-path:inset(100%_0_0_0)] text-base md:text-xl text-gray-300 font-light tracking-wide ${desc.className}`}>
              {desc.text}
            </div>
          </div>
        ))}
      </div>

      {/* Buttons Entity */}
      <div className="hero-entity flex flex-col sm:flex-row gap-4 md:gap-6 pointer-events-auto ml-0 md:ml-[10vw] z-20">
        {BUTTON_DATA.map((btn) => (
          <div key={btn.id} className="overflow-hidden w-full sm:w-auto">
            {btn.href ? (
              <a 
                href={btn.href}
                download={btn.download}
                className={`hero-content-item [clip-path:inset(100%_0_0_0)] inline-block text-center w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-sm font-semibold tracking-widest uppercase text-xs md:text-sm transition-colors duration-300 ${btn.className}`}
              >
                {btn.text}
              </a>
            ) : (
              <button className={`hero-content-item [clip-path:inset(100%_0_0_0)] w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-sm font-semibold tracking-widest uppercase text-xs md:text-sm transition-colors duration-300 ${btn.className}`}>
                {btn.text}
              </button>
            )}
          </div>
        ))}
      </div>

    </div>
  );
});

HeroOverlayText.displayName = 'HeroOverlayText';

export default HeroOverlayText;
