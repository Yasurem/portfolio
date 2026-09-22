'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface HeroBackgroundAnimationsProps {
  dimensions: { width: number; height: number };
  centerX: number;
  centerY: number;
  gridSize: number;
}

type MathFunction = (x: number) => number;

interface MathEquationDef {
  name: string;
  func: MathFunction;
  derivative: MathFunction;
  range: [number, number];
  color: string;
}

const equations: MathEquationDef[] = [
  {
    name: 'Gradient Descent',
    func: (x) => (x * x) / 8,
    derivative: (x) => x / 4,
    range: [-15, 15],
    color: '#FF0000'
  },
  {
    name: 'Sigmoid Gradient',
    func: (x) => 1 / (1 + Math.exp(-x)),
    derivative: (x) => {
      const f = 1 / (1 + Math.exp(-x));
      return f * (1 - f);
    },
    range: [-10, 10],
    color: '#A0D8EF'
  },
  {
    name: 'Damped Convergence',
    func: (x) => Math.sin(x) * Math.exp(-0.2 * x),
    derivative: (x) => Math.exp(-0.2 * x) * (Math.cos(x) - 0.2 * Math.sin(x)),
    range: [-5, 15],
    color: '#800000'
  }
];

interface ActiveEquation {
  id: number;
  def: MathEquationDef;
  offsetX: number;
  offsetY: number;
}

interface ComplexMathEquationProps {
  equation: MathEquationDef;
  centerX: number;
  centerY: number;
  gridSize: number;
  offsetX: number;
  offsetY: number;
  onComplete: () => void;
}

function ComplexMathEquation(props: ComplexMathEquationProps) {
  const { equation, onComplete } = props;
  
  const groupRef = useRef<SVGGElement>(null);
  const pointRef = useRef<SVGCircleElement>(null);
  const tangentRef = useRef<SVGLineElement>(null);

  // Use a ref for props to access latest values in GSAP onUpdate without restarting animation on resize
  const propsRef = useRef(props);
  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  // Pre-calculate base path based on current context
  const d = useMemo(() => {
    const { centerX, centerY, gridSize, offsetX, offsetY } = props;
    const [minX, maxX] = equation.range;
    let pathString = '';
    const step = 0.2;
    for (let x = minX; x <= maxX; x += step) {
      const mathY = equation.func(x);
      const screenX = centerX + ((x + offsetX) * gridSize);
      const screenY = centerY - ((mathY + offsetY) * gridSize);
      if (x === minX) {
        pathString += `M ${screenX.toFixed(2)} ${screenY.toFixed(2)}`;
      } else {
        pathString += ` L ${screenX.toFixed(2)} ${screenY.toFixed(2)}`;
      }
    }
    return pathString;
  }, [equation, props.centerX, props.centerY, props.gridSize, props.offsetX, props.offsetY]);

  useGSAP(() => {
    if (!pointRef.current || !tangentRef.current || !groupRef.current) return;
    
    // Animation for fade in
    gsap.fromTo(groupRef.current, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power2.out' });

    const [minX, maxX] = equation.range;
    const obj = { val: minX };
    
    gsap.to(obj, {
      val: maxX,
      duration: 6,
      ease: "power1.inOut",
      onUpdate: () => {
        const p = propsRef.current;
        const currentX = obj.val;
        const currentY = equation.func(currentX);
        const m = equation.derivative(currentX);

        const screenX = p.centerX + ((currentX + p.offsetX) * p.gridSize);
        const screenY = p.centerY - ((currentY + p.offsetY) * p.gridSize);

        pointRef.current?.setAttribute('cx', screenX.toString());
        pointRef.current?.setAttribute('cy', screenY.toString());

        // Tangent line length logic in math units
        const dx = 1.5 / Math.sqrt(1 + m * m);
        const dy = m * dx;

        const x1 = p.centerX + ((currentX - dx + p.offsetX) * p.gridSize);
        const y1 = p.centerY - ((currentY - dy + p.offsetY) * p.gridSize);
        const x2 = p.centerX + ((currentX + dx + p.offsetX) * p.gridSize);
        const y2 = p.centerY - ((currentY + dy + p.offsetY) * p.gridSize);

        tangentRef.current?.setAttribute('x1', x1.toString());
        tangentRef.current?.setAttribute('y1', y1.toString());
        tangentRef.current?.setAttribute('x2', x2.toString());
        tangentRef.current?.setAttribute('y2', y2.toString());
      },
      onComplete: () => {
        // Fade out then call onComplete
        gsap.to(groupRef.current, {
          opacity: 0,
          duration: 1,
          ease: 'power2.in',
          onComplete: () => onComplete()
        });
      }
    });

  }, { scope: groupRef, dependencies: [equation] }); // Only re-run if equation completely changes

  return (
    <g ref={groupRef} style={{ opacity: 0 }}>
      <path d={d} fill="none" stroke={equation.color} strokeWidth="1.5" opacity={0.3} />
      <line ref={tangentRef} stroke={equation.color} strokeWidth="2" opacity={0.8} />
      <circle ref={pointRef} r="4" fill="#000" stroke={equation.color} strokeWidth="2" />
    </g>
  );
}

export default function HeroBackgroundAnimations({ dimensions, centerX, centerY, gridSize }: HeroBackgroundAnimationsProps) {
  const [activeEquations, setActiveEquations] = useState<ActiveEquation[]>([]);
  const idCounter = useRef(0);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const spawnEquation = () => {
      setActiveEquations((prev) => {
        // Strictly limit concurrency to 2 equations
        if (prev.length >= 2) return prev;
        
        const eqDef = equations[Math.floor(Math.random() * equations.length)];
        const newEq: ActiveEquation = {
          id: idCounter.current++,
          def: eqDef,
          // Random spatial offsets to prevent overlap
          offsetX: (Math.random() - 0.5) * 15,
          offsetY: (Math.random() - 0.5) * 10,
        };
        return [...prev, newEq];
      });
    };

    // Staggered spawning
    const interval = setInterval(spawnEquation, 2000);
    spawnEquation(); // Spawn first immediately
    const timeout = setTimeout(spawnEquation, 1000); // Try spawning second one after 1s

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [dimensions]);

  const handleComplete = (id: number) => {
    setActiveEquations((prev) => prev.filter((eq) => eq.id !== id));
  };

  if (dimensions.width === 0) return null;

  return (
    <g>
      {activeEquations.map((eq) => (
        <ComplexMathEquation
          key={eq.id}
          equation={eq.def}
          centerX={centerX}
          centerY={centerY}
          gridSize={gridSize}
          offsetX={eq.offsetX}
          offsetY={eq.offsetY}
          onComplete={() => handleComplete(eq.id)}
        />
      ))}
    </g>
  );
}
