'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface HeroBackgroundAnimationsProps {
  dimensions: { width: number; height: number };
  centerX: number;
  centerY: number;
  gridSize: number;
}

type MathFunction = (x: number) => number;

interface AnimatedPath {
  id: number;
  d: string;
  color: string;
}

const colors = ['#FF0000', '#800000', '#A0D8EF'];

// Define math formulas (Neural Networks, Linear Algebra, Calculus)
const mathFunctions: { func: MathFunction; range: [number, number] }[] = [
  { func: (x) => 1 / (1 + Math.exp(-x)), range: [-10, 10] }, // Sigmoid
  { func: (x) => Math.max(0, x), range: [-10, 10] }, // ReLU
  { func: (x) => Math.sin(x), range: [-10, 10] }, // Sine wave
  { func: (x) => (x * x) / 5, range: [-10, 10] }, // Parabola (scaled for grid)
  { func: (x) => Math.cos(x), range: [-10, 10] }, // Cosine wave
  { func: (x) => Math.tanh(x), range: [-10, 10] } // Tanh
];

export default function HeroBackgroundAnimations({ dimensions, centerX, centerY, gridSize }: HeroBackgroundAnimationsProps) {
  const containerRef = useRef<SVGGElement>(null);
  const [paths, setPaths] = useState<AnimatedPath[]>([]);
  const pathIdCounter = useRef(0);

  useGSAP(() => {
    // Select newly added paths that haven't been animated yet
    const newPathElements = containerRef.current?.querySelectorAll('.math-path:not(.animated)');
    
    newPathElements?.forEach((el) => {
      el.classList.add('animated');
      const length = (el as SVGPathElement).getTotalLength();
      
      // Setup initial state: path hidden by dashoffset
      gsap.set(el, { 
        strokeDasharray: length, 
        strokeDashoffset: length, 
        opacity: 0.5 
      });
      
      // Animate drawing, then fade out
      const tl = gsap.timeline();
      tl.to(el, {
        strokeDashoffset: 0,
        duration: 2.5,
        ease: 'power2.inOut',
      })
      .to(el, {
        opacity: 0,
        duration: 1.5,
        ease: 'power2.inOut',
        delay: 2, // Stay visible for a short time before fading
      });
    });
  }, { dependencies: [paths], scope: containerRef });

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const spawnInterval = setInterval(() => {
      const funcDef = mathFunctions[Math.floor(Math.random() * mathFunctions.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // Add random spatial offsets so formulas appear in different locations
      const offsetX = (Math.random() - 0.5) * 20;
      const offsetY = (Math.random() - 0.5) * 10;
      
      let d = '';
      const step = 0.2;
      const [minX, maxX] = funcDef.range;
      
      // Generate SVG path string matching the math unit mapped to the screen pixel grid
      for (let x = minX; x <= maxX; x += step) {
        const mathY = funcDef.func(x);
        
        const screenX = centerX + ((x + offsetX) * gridSize);
        const screenY = centerY - ((mathY + offsetY) * gridSize);
        
        if (x === minX) {
          d += `M ${screenX.toFixed(2)} ${screenY.toFixed(2)}`;
        } else {
          d += ` L ${screenX.toFixed(2)} ${screenY.toFixed(2)}`;
        }
      }
      
      const newPath: AnimatedPath = {
        id: pathIdCounter.current++,
        d,
        color
      };
      
      setPaths((prev) => {
        const newPaths = [...prev, newPath];
        // Keep array small to avoid DOM bloat, older elements are already transparent
        if (newPaths.length > 8) return newPaths.slice(newPaths.length - 8);
        return newPaths;
      });
      
    }, 2000); // Spawn a new math equation every 2 seconds

    return () => clearInterval(spawnInterval);
  }, [dimensions, centerX, centerY, gridSize]);

  if (dimensions.width === 0) return null;

  return (
    <g ref={containerRef}>
      {paths.map((path) => (
        <path
          key={path.id}
          className="math-path"
          d={path.d}
          fill="none"
          stroke={path.color}
          strokeWidth="1.5"
          style={{ opacity: 0 }} // Starts invisible to prevent FOUC, GSAP takes over
        />
      ))}
    </g>
  );
}
