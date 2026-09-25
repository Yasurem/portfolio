'use client';
import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import MathEquations from './MathEquations';
import { useGridAnimation } from './hooks/useGridAnimation';

export interface HeroAnimatedGridRef {
  getScrollTimeline: (isDesktop?: boolean, targetSelector?: string) => gsap.core.Timeline;
}

const HeroAnimatedGrid = forwardRef<HeroAnimatedGridRef, unknown>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const waveRingRef = useRef<SVGCircleElement>(null);
  
  const animStateRef = useRef({ time: 0, waveOpacity: 1, mouseOpacity: 0, isActive: true });
  
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const dotPositionsRef = useRef<Record<number, {x: number, y: number}>>({});

  const waveSpeed = 200;

  useGridAnimation(gridContainerRef as any, containerRef as any, dotPositionsRef, animStateRef, setDimensions);

  useGSAP(() => {
    if (dimensions.width === 0) return;

    const mm = gsap.matchMedia();

    gsap.to('.hero-core-dot', {
      scale: 1.2, opacity: 0.8, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut'
    });
    gsap.to('.hero-core-glow', {
      scale: 1.4, opacity: 0.2, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut'
    });

    mm.add("(min-width: 768px)", () => {
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      const gridSize = 40;
      
      const horizontalLines: { y: number; isCenter: boolean; points: number[] }[] = [];
      const verticalLines: { x: number; isCenter: boolean; points: number[] }[] = [];
      
      const hPoints: number[] = [];
      for (let x = -40; x <= dimensions.width + 40; x += 20) hPoints.push(x);
      for (let y = centerY; y < dimensions.height + 40; y += gridSize) horizontalLines.push({ y, isCenter: y === centerY, points: hPoints });
      for (let y = centerY - gridSize; y > -40; y -= gridSize) horizontalLines.push({ y, isCenter: false, points: hPoints });

      const vPoints: number[] = [];
      for (let y = -40; y <= dimensions.height + 40; y += 20) vPoints.push(y);
      for (let x = centerX; x < dimensions.width + 40; x += gridSize) verticalLines.push({ x, isCenter: x === centerX, points: vPoints });
      for (let x = centerX - gridSize; x > -40; x -= gridSize) verticalLines.push({ x, isCenter: false, points: vPoints });

      animStateRef.current = { time: 0, waveOpacity: 1, mouseOpacity: 0, isActive: true };

      const tl = gsap.timeline({
        onUpdate: () => {
          const { time } = animStateRef.current;
          const waveLength = 80;
          const decay = 0.003; 
          const timeDecay = Math.max(0, 1 - time / 3); 
          const waveFront = waveSpeed * time;
          
          if (waveRingRef.current) {
            waveRingRef.current.setAttribute('r', waveFront.toString());
            const ringOpacity = Math.max(0, 1 - time / 3) * animStateRef.current.waveOpacity;
            waveRingRef.current.setAttribute('opacity', (ringOpacity * 2).toString());
          }

          if (time < 3.0) {
            let pathIndex = 0;
            const getDisplacement = (x: number, y: number) => {
              const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
              if (distance > waveFront) return 0;
              
              const amplitude = 40 * timeDecay * Math.exp(-distance * decay);
              const phase = (distance - waveFront) / waveLength;
              if (phase < -3) return 0; 
              
              return Math.sin(phase * Math.PI * 2) * amplitude;
            };

            horizontalLines.forEach((line) => {
              const pathEl = pathRefs.current[pathIndex];
              if (!pathEl) return;
              
              let hasSignificantDisplacement = false;
              const startDisp = getDisplacement(-40, line.y);
              if (Math.abs(startDisp) > 0.5) hasSignificantDisplacement = true;
              let d = `M -40 ${line.y + startDisp}`;
              
              for (let i = 1; i < line.points.length; i++) {
                const px = line.points[i];
                const disp = getDisplacement(px, line.y);
                if (Math.abs(disp) > 0.5) hasSignificantDisplacement = true;
                d += ` L ${px} ${line.y + disp}`;
              }
              
              if (hasSignificantDisplacement || pathEl.dataset.dirty === "true") {
                pathEl.setAttribute('d', d);
                pathEl.dataset.dirty = hasSignificantDisplacement ? "true" : "false";
              }
              pathIndex++;
            });

            verticalLines.forEach((line) => {
              const pathEl = pathRefs.current[pathIndex];
              if (!pathEl) return;
              
              let hasSignificantDisplacement = false;
              const startDisp = getDisplacement(line.x, -40);
              if (Math.abs(startDisp) > 0.5) hasSignificantDisplacement = true;
              let d = `M ${line.x + startDisp} -40`;
              
              for (let i = 1; i < line.points.length; i++) {
                const py = line.points[i];
                const disp = getDisplacement(line.x, py);
                if (Math.abs(disp) > 0.5) hasSignificantDisplacement = true;
                d += ` L ${line.x + disp} ${py}`;
              }
              
              if (hasSignificantDisplacement || pathEl.dataset.dirty === "true") {
                pathEl.setAttribute('d', d);
                pathEl.dataset.dirty = hasSignificantDisplacement ? "true" : "false";
              }
              pathIndex++;
            });
          }
        },
        onComplete: () => {
          animStateRef.current.isActive = false;
          if (waveRingRef.current) waveRingRef.current.setAttribute('opacity', '0');
        }
      });

      tl.to(animStateRef.current, { time: 10, duration: 10, ease: 'power1.out' }, 0)
        .to(animStateRef.current, { waveOpacity: 0, duration: 1.5, ease: 'power2.inOut' }, 1.5)
        .to(animStateRef.current, { mouseOpacity: 0.75, duration: 1, ease: 'power2.inOut' }, 3);
    });

    mm.add("(max-width: 767px)", () => {
      animStateRef.current.isActive = false;
      if (gridContainerRef.current) {
        gridContainerRef.current.style.maskImage = 'none';
        gridContainerRef.current.style.webkitMaskImage = 'none';
      }
      if (waveRingRef.current) waveRingRef.current.setAttribute('opacity', '0');
      
      let pathIndex = 0;
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      
      for (let y = centerY; y < dimensions.height + 40; y += 40) {
        if (pathRefs.current[pathIndex]) pathRefs.current[pathIndex]?.setAttribute('d', `M -40 ${y} L ${dimensions.width + 40} ${y}`);
        pathIndex++;
      }
      for (let y = centerY - 40; y > -40; y -= 40) {
        if (pathRefs.current[pathIndex]) pathRefs.current[pathIndex]?.setAttribute('d', `M -40 ${y} L ${dimensions.width + 40} ${y}`);
        pathIndex++;
      }
      for (let x = centerX; x < dimensions.width + 40; x += 40) {
        if (pathRefs.current[pathIndex]) pathRefs.current[pathIndex]?.setAttribute('d', `M ${x} -40 L ${x} ${dimensions.height + 40}`);
        pathIndex++;
      }
      for (let x = centerX - 40; x > -40; x -= 40) {
        if (pathRefs.current[pathIndex]) pathRefs.current[pathIndex]?.setAttribute('d', `M ${x} -40 L ${x} ${dimensions.height + 40}`);
        pathIndex++;
      }
    });

    return () => mm.revert();
  }, [dimensions]); 

  useImperativeHandle(ref, () => ({
    getScrollTimeline: (isDesktop = true, targetSelector = '#hero-portrait-container') => {
      const tl = gsap.timeline();
      
      if (!isDesktop) return tl;

      tl.to('.hero-core-svg', { 
        x: () => {
          const pc = document.querySelector(targetSelector);
          if (pc && window.innerWidth >= 768) {
            const rect = pc.getBoundingClientRect();
            return rect.left + (rect.width * 0.02) - (window.innerWidth / 2);
          }
          return 0;
        }, 
        y: () => {
          const pc = document.querySelector(targetSelector);
          if (pc && window.innerWidth >= 768) {
            const rect = pc.getBoundingClientRect();
            return rect.top + rect.height / 2 - (window.innerHeight / 2);
          }
          return 0;
        }, 
        ease: 'power2.inOut', 
        duration: 0.4 
      }, 0);

      tl.fromTo('.hero-core-svg', 
        { opacity: 1 }, 
        { opacity: 0, duration: 0.1 }, 
        0.35
      );
      
      return tl;
    }
  }));

  const linesToRender: { isCenter: boolean }[] = [];
  let centerX = 0;
  let centerY = 0;
  if (dimensions.width > 0) {
    centerX = dimensions.width / 2;
    centerY = dimensions.height / 2;
    for (let y = centerY; y < dimensions.height + 40; y += 40) linesToRender.push({ isCenter: y === centerY });
    for (let y = centerY - 40; y > -40; y -= 40) linesToRender.push({ isCenter: false });
    for (let x = centerX; x < dimensions.width + 40; x += 40) linesToRender.push({ isCenter: x === centerX });
    for (let x = centerX - 40; x > -40; x -= 40) linesToRender.push({ isCenter: false });
  }

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full flex items-center justify-center bg-transparent overflow-hidden"
    >
      <div className="absolute inset-0 z-0 opacity-30 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
      <div ref={gridContainerRef} className="absolute inset-0 pointer-events-none z-0">
        <svg className="w-full h-full">
          {linesToRender.map((line, i) => (
            <path
              key={i}
              ref={el => { pathRefs.current[i] = el; }}
              d="" 
              fill="none"
              stroke="color-mix(in srgb, var(--color-charcoal) 80%, white)" 
              strokeWidth={line.isCenter ? "1.5" : "1"}
              opacity={line.isCenter ? "0.4" : "0.15"}
            />
          ))}

          <g className="math-equations-wrapper">
            <MathEquations 
              dimensions={dimensions}
              centerX={centerX}
              centerY={centerY}
              gridSize={40}
              dotPositionsRef={dotPositionsRef}
            />
          </g>

          <circle 
            ref={waveRingRef} 
            cx="50%" cy="50%" r="0" fill="none" stroke="var(--color-primary)" strokeWidth="2" 
            opacity="0" style={{ filter: 'blur(2px)' }} 
          />
        </svg>
      </div>
      <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none z-10">
        <svg className="w-32 h-32 overflow-visible hero-core-svg">
          <circle className="hero-core-glow" cx="50%" cy="50%" r="16" fill="var(--color-primary)" style={{ filter: 'blur(12px)' }} />
          <circle className="hero-core-dot" cx="50%" cy="50%" r="6" fill="var(--color-primary)" style={{ filter: 'blur(1.5px)' }} />
        </svg>
      </div>
    </div>
  );
});

HeroAnimatedGrid.displayName = 'HeroAnimatedGrid';

export default HeroAnimatedGrid;
