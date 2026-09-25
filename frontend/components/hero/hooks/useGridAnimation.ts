import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface AnimState {
  time: number;
  waveOpacity: number;
  mouseOpacity: number;
  isActive: boolean;
}

export function useGridAnimation(
  gridContainerRef: React.RefObject<HTMLDivElement>,
  containerRef: React.RefObject<HTMLDivElement>,
  dotPositionsRef: React.RefObject<Record<number, {x: number, y: number}>>,
  animStateRef: React.MutableRefObject<AnimState>,
  setDimensions: React.Dispatch<React.SetStateAction<{ width: number; height: number }>>
) {
  const targetMousePosRef = useRef({ x: -1000, y: -1000 });
  const currentMousePosRef = useRef({ x: -1000, y: -1000 });
  
  const waveSpeed = 200;
  const centerMask = `radial-gradient(circle 350px at 50% 50%, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)`;

  useEffect(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
    
    if (gridContainerRef.current) {
      gridContainerRef.current.style.maskComposite = 'add';
      gridContainerRef.current.style.webkitMaskComposite = 'add';
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        targetMousePosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
      }, 200);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    
    const updateMaskOnly = () => {
      if (!gridContainerRef.current) return;
      
      const tx = targetMousePosRef.current.x;
      const ty = targetMousePosRef.current.y;
      let cx = currentMousePosRef.current.x;
      let cy = currentMousePosRef.current.y;
      
      cx += (tx - cx) * 0.1;
      cy += (ty - cy) * 0.1;
      currentMousePosRef.current = { x: cx, y: cy };

      const { mouseOpacity, waveOpacity, time } = animStateRef.current;
      
      let finalMask = `radial-gradient(circle 350px at ${cx}px ${cy}px, rgba(0,0,0,${mouseOpacity}) 0%, rgba(0,0,0,0) 100%)`;
      
      const waveFront = waveSpeed * time;
      if (waveOpacity > 0 && waveFront > 0) {
        finalMask += `, radial-gradient(circle at 50% 50%, rgba(0,0,0,${waveOpacity}) ${Math.max(0, waveFront - 20)}px, rgba(0,0,0,0) ${waveFront + 20}px)`;
      }

      finalMask += `, ${centerMask}`;

      if (dotPositionsRef.current) {
        for (const id in dotPositionsRef.current) {
          const pos = dotPositionsRef.current[id];
          finalMask += `, radial-gradient(circle 350px at ${pos.x}px ${pos.y}px, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)`;
        }
      }

      gridContainerRef.current.style.maskImage = finalMask;
      gridContainerRef.current.style.webkitMaskImage = finalMask;
    };

    gsap.ticker.add(updateMaskOnly);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      gsap.ticker.remove(updateMaskOnly);
    };
  }, [setDimensions, gridContainerRef, containerRef, dotPositionsRef, animStateRef]);
}
