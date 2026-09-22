'use client';
import React, { useEffect, useRef, useState, forwardRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import HeroBackgroundAnimations from './HeroBackgroundAnimations';

const HeroBackground = forwardRef<HTMLDivElement>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const waveRingRef = useRef<SVGCircleElement>(null);
  
  const mousePosRef = useRef({ x: -1000, y: -1000 });
  const animStateRef = useRef({ time: 0, waveOpacity: 1, mouseOpacity: 0, isActive: true });
  
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  const waveSpeed = 200; // Define wave speed here so it can be shared

  const updateMaskOnly = () => {
    if (!gridContainerRef.current) return;
    const { x, y } = mousePosRef.current;
    const { mouseOpacity, waveOpacity, time } = animStateRef.current;
    
    // Base mask for the mouse cursor spotlight
    let finalMask = `radial-gradient(circle 350px at ${x}px ${y}px, rgba(0,0,0,${mouseOpacity}) 0%, rgba(0,0,0,0) 100%)`;
    
    const waveFront = waveSpeed * time;
    if (waveOpacity > 0 && waveFront > 0) {
      // The waveMask illuminates everything from the center (0px) up to the expanding waveFront.
      // This leaves a persistent "trail" of light revealing the entire path the wave went through.
      const waveMask = `radial-gradient(circle at 50% 50%, rgba(0,0,0,${waveOpacity}) ${Math.max(0, waveFront - 20)}px, rgba(0,0,0,0) ${waveFront + 20}px)`;
      finalMask = `${finalMask}, ${waveMask}`;
    }

    // Add exactly the same spotlight effect for the mathematical moving dots
    const mathDots = document.querySelectorAll('.math-dot');
    mathDots.forEach((dot) => {
      const cx = dot.getAttribute('cx');
      const cy = dot.getAttribute('cy');
      if (cx && cy) {
        const dotMask = `radial-gradient(circle 350px at ${cx}px ${cy}px, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)`;
        finalMask = `${finalMask}, ${dotMask}`;
      }
    });

    gridContainerRef.current.style.maskImage = finalMask;
    gridContainerRef.current.style.WebkitMaskImage = finalMask;
    gridContainerRef.current.style.maskComposite = 'add';
    gridContainerRef.current.style.WebkitMaskComposite = 'add';
  };

  useEffect(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
    
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mousePosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        
        // Manual update fallback if GSAP ticker isn't catching it for some reason
        if (!animStateRef.current.isActive) {
          updateMaskOnly(); 
        }
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    
    // Bind mask updates to the GSAP ticker so the spotlight automatically tracks the moving equations at 60fps
    gsap.ticker.add(updateMaskOnly);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      gsap.ticker.remove(updateMaskOnly);
    };
  }, []);

  useGSAP(() => {
    if (dimensions.width === 0) return;

    // Calm pulsing of the center red dot
    gsap.to('.hero-core-dot', {
      scale: 1.2, opacity: 0.8, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut'
    });
    gsap.to('.hero-core-glow', {
      scale: 1.4, opacity: 0.2, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut'
    });

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const gridSize = 40;
    
    // Generate lines radiating perfectly from the center
    const horizontalLines: { y: number; isCenter: boolean; points: number[] }[] = [];
    const verticalLines: { x: number; isCenter: boolean; points: number[] }[] = [];
    
    const hPoints = [];
    for (let x = -40; x <= dimensions.width + 40; x += 20) hPoints.push(x);
    for (let y = centerY; y < dimensions.height + 40; y += gridSize) horizontalLines.push({ y, isCenter: y === centerY, points: hPoints });
    for (let y = centerY - gridSize; y > -40; y -= gridSize) horizontalLines.push({ y, isCenter: false, points: hPoints });

    const vPoints = [];
    for (let y = -40; y <= dimensions.height + 40; y += 20) vPoints.push(y);
    for (let x = centerX; x < dimensions.width + 40; x += gridSize) verticalLines.push({ x, isCenter: x === centerX, points: vPoints });
    for (let x = centerX - gridSize; x > -40; x -= gridSize) verticalLines.push({ x, isCenter: false, points: vPoints });

    // Ensure we start with a clean state on re-render
    animStateRef.current = { time: 0, waveOpacity: 1, mouseOpacity: 0, isActive: true };

    const tl = gsap.timeline({
      onUpdate: () => {
        const { time } = animStateRef.current;
        const waveLength = 80;
        const decay = 0.003; 
        const timeDecay = Math.max(0, 1 - time / 3); 
        const waveFront = waveSpeed * time;
        
        // 1. Update visual masks (wave light and cursor)
        updateMaskOnly();
        
        // Update the visible glowing physical ring (fades out as wave hits edge)
        if (waveRingRef.current) {
          waveRingRef.current.setAttribute('r', waveFront.toString());
          const ringOpacity = Math.max(0, 1 - time / 3) * animStateRef.current.waveOpacity;
          waveRingRef.current.setAttribute('opacity', (ringOpacity * 0.7).toString());
        }

        // 2. Warp the Grid lines computationally
        // Only run the heavy math if the wave is still physically moving
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
            if (!pathRefs.current[pathIndex]) return;
            let d = `M -40 ${line.y + getDisplacement(-40, line.y)}`;
            for (let i = 1; i < line.points.length; i++) {
              const px = line.points[i];
              d += ` L ${px} ${line.y + getDisplacement(px, line.y)}`;
            }
            pathRefs.current[pathIndex]?.setAttribute('d', d);
            pathIndex++;
          });

          verticalLines.forEach((line) => {
            if (!pathRefs.current[pathIndex]) return;
            let d = `M ${line.x + getDisplacement(line.x, -40)} -40`;
            for (let i = 1; i < line.points.length; i++) {
              const py = line.points[i];
              d += ` L ${line.x + getDisplacement(line.x, py)} ${py}`;
            }
            pathRefs.current[pathIndex]?.setAttribute('d', d);
            pathIndex++;
          });
        }
      },
      onComplete: () => {
        animStateRef.current.isActive = false;
        // Make absolutely sure the ring is hidden at the end
        if (waveRingRef.current) waveRingRef.current.setAttribute('opacity', '0');
        updateMaskOnly();
      }
    });

    // Sequence 1: The physical wave expands (takes 3 seconds)
    tl.to(animStateRef.current, { time: 10, duration: 10, ease: 'power1.out' }, 0)
      // Sequence 2: The wave light fades into darkness DURING the last 1.5 seconds of the wave
      .to(animStateRef.current, { waveOpacity: 0, duration: 1.5, ease: 'power2.inOut' }, 1.5)
      // Sequence 3: Exactly when the wave finishes at 3 seconds, hand control to the mouse cursor spotlight
      .to(animStateRef.current, { mouseOpacity: 0.75, duration: 1, ease: 'power2.inOut' }, 3);

  }, [dimensions]); 

  // Pre-calculate line styles based on screen dimensions for rendering
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
      ref={(node) => {
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }} 
      className="absolute inset-0 w-full h-full flex items-center justify-center bg-black overflow-hidden"
    >
      <div ref={gridContainerRef} className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full">
          {linesToRender.map((line, i) => (
            <path
              key={i}
              ref={el => { pathRefs.current[i] = el; }}
              d="" 
              fill="none"
              stroke="#A0D8EF" 
              strokeWidth={line.isCenter ? "1.5" : "0.8"}
              opacity={line.isCenter ? "0.8" : "0.5"}
            />
          ))}

          <HeroBackgroundAnimations 
            dimensions={dimensions}
            centerX={centerX}
            centerY={centerY}
            gridSize={40}
          />

          <circle 
            ref={waveRingRef} 
            cx="50%" cy="50%" r="0" fill="none" stroke="#A0D8EF" strokeWidth="3" 
            opacity="0" style={{ filter: 'blur(3px)' }} 
          />
        </svg>
      </div>
      <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none z-10">
        <svg className="w-32 h-32 overflow-visible">
          <circle className="hero-core-glow" cx="50%" cy="50%" r="16" fill="#ff0000" style={{ filter: 'blur(12px)' }} />
          <circle className="hero-core-dot" cx="50%" cy="50%" r="6" fill="#ff3333" style={{ filter: 'blur(1.5px)' }} />
        </svg>
      </div>
    </div>
  );
});

HeroBackground.displayName = 'HeroBackground';

export default HeroBackground;
