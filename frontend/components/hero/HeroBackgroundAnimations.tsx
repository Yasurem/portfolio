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
    func: (x) => (x * x) / 10,
    derivative: (x) => x / 5,
    range: [-15, 15],
    color: '#FF4136'
  },
  {
    name: 'Sigmoid',
    func: (x) => 1 / (1 + Math.exp(-x)),
    derivative: (x) => {
      const f = 1 / (1 + Math.exp(-x));
      return f * (1 - f);
    },
    range: [-10, 10],
    color: '#0074D9'
  },
  {
    name: 'Tanh',
    func: (x) => Math.tanh(x),
    derivative: (x) => 1 - Math.pow(Math.tanh(x), 2),
    range: [-10, 10],
    color: '#FF851B'
  },
  {
    name: 'ReLU',
    func: (x) => Math.max(0, x),
    derivative: (x) => x > 0 ? 1 : 0,
    range: [-10, 10],
    color: '#2ECC40'
  },
  {
    name: 'Swish',
    func: (x) => x / (1 + Math.exp(-x)),
    derivative: (x) => {
      const exp_nx = Math.exp(-x);
      return (1 + exp_nx + x * exp_nx) / Math.pow(1 + exp_nx, 2);
    },
    range: [-10, 10],
    color: '#B10DC9'
  },
  {
    name: 'Gaussian',
    func: (x) => 5 * Math.exp(-(x * x) / 8),
    derivative: (x) => 5 * Math.exp(-(x * x) / 8) * (-x / 4),
    range: [-15, 15],
    color: '#FFDC00'
  },
  {
    name: 'Damped Convergence',
    func: (x) => Math.sin(x) * Math.exp(-0.15 * x),
    derivative: (x) => Math.exp(-0.15 * x) * (Math.cos(x) - 0.15 * Math.sin(x)),
    range: [-5, 20],
    color: '#39CCCC'
  }
];

interface ActiveEquation {
  id: number;
  def: MathEquationDef;
  offsetX: number;
  offsetY: number;
  quadrant: number;
}

interface ComplexMathEquationProps {
  id: number;
  equation: MathEquationDef;
  centerX: number;
  centerY: number;
  gridSize: number;
  offsetX: number;
  offsetY: number;
  onComplete: () => void;
}

function ComplexMathEquation(props: ComplexMathEquationProps) {
  const { id, equation, onComplete } = props;
  
  const groupRef = useRef<SVGGElement>(null);
  const dotGroupRef = useRef<SVGGElement>(null);
  const pathGroupRef = useRef<SVGGElement>(null);
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
    if (!dotGroupRef.current || !tangentRef.current || !groupRef.current || !pathGroupRef.current) return;
    
    const [minX, maxX] = equation.range;
    
    // Set initial position of the dot to exactly the center of the screen
    const startScreenX = propsRef.current.centerX;
    const startScreenY = propsRef.current.centerY;
    
    gsap.set(dotGroupRef.current, { x: startScreenX, y: startScreenY });
    gsap.set(pathGroupRef.current, { opacity: 0 });
    gsap.set(groupRef.current, { opacity: 1 });

    // Calculate tangent initial coords to prevent flash
    const p = propsRef.current;
    const initialMathY = equation.func(minX);
    const mInitial = equation.derivative(minX);
    const dx = 1.5 / Math.sqrt(1 + mInitial * mInitial);
    const dy = mInitial * dx;

    const x1 = p.centerX + ((minX - dx + p.offsetX) * p.gridSize);
    const y1 = p.centerY - ((initialMathY - dy + p.offsetY) * p.gridSize);
    const x2 = p.centerX + ((minX + dx + p.offsetX) * p.gridSize);
    const y2 = p.centerY - ((initialMathY + dy + p.offsetY) * p.gridSize);

    tangentRef.current?.setAttribute('x1', x1.toString());
    tangentRef.current?.setAttribute('y1', y1.toString());
    tangentRef.current?.setAttribute('x2', x2.toString());
    tangentRef.current?.setAttribute('y2', y2.toString());

    const tl = gsap.timeline({
      onComplete: () => {
        // Fade out entire group then call onComplete
        gsap.to(groupRef.current, {
          opacity: 0,
          duration: 1,
          ease: 'power2.in',
          onComplete: () => onComplete()
        });
      }
    });

    const targetScreenX = p.centerX + ((minX + p.offsetX) * p.gridSize);
    const targetScreenY = p.centerY - ((initialMathY + p.offsetY) * p.gridSize);

    // 1. Splitting from center
    tl.to(dotGroupRef.current, {
      x: targetScreenX,
      y: targetScreenY,
      duration: 0.8,
      ease: 'power3.out'
    });

    // 2. Fade in path & tangent
    tl.to(pathGroupRef.current, {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out'
    }, "-=0.3");

    // 3. Move along curve
    const obj = { val: minX };
    tl.to(obj, {
      val: maxX,
      duration: 6,
      ease: "power1.inOut",
      onUpdate: () => {
        const currP = propsRef.current;
        const currentX = obj.val;
        const currentY = equation.func(currentX);
        const m = equation.derivative(currentX);

        const screenX = currP.centerX + ((currentX + currP.offsetX) * currP.gridSize);
        const screenY = currP.centerY - ((currentY + currP.offsetY) * currP.gridSize);

        gsap.set(dotGroupRef.current, { x: screenX, y: screenY });

        // Tangent line length logic in math units
        const currentDx = 1.5 / Math.sqrt(1 + m * m);
        const currentDy = m * currentDx;

        const curX1 = currP.centerX + ((currentX - currentDx + currP.offsetX) * currP.gridSize);
        const curY1 = currP.centerY - ((currentY - currentDy + currP.offsetY) * currP.gridSize);
        const curX2 = currP.centerX + ((currentX + currentDx + currP.offsetX) * currP.gridSize);
        const curY2 = currP.centerY - ((currentY + currentDy + currP.offsetY) * currP.gridSize);

        tangentRef.current?.setAttribute('x1', curX1.toString());
        tangentRef.current?.setAttribute('y1', curY1.toString());
        tangentRef.current?.setAttribute('x2', curX2.toString());
        tangentRef.current?.setAttribute('y2', curY2.toString());
      }
    });

  }, { scope: groupRef, dependencies: [equation] });

  return (
    <g ref={groupRef} style={{ opacity: 0 }}>
      <defs>
        <radialGradient id={`glow-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff3333" stopOpacity={0.6} />
          <stop offset="100%" stopColor="#ff3333" stopOpacity={0} />
        </radialGradient>
      </defs>
      
      <g ref={pathGroupRef}>
        <path d={d} fill="none" stroke={equation.color} strokeWidth="1.5" opacity={0.3} />
        <line ref={tangentRef} stroke={equation.color} strokeWidth="2" opacity={0.8} />
      </g>
      
      <g ref={dotGroupRef}>
        <circle r="40" fill={`url(#glow-${id})`} />
        <circle r="4" fill="#ff3333" />
      </g>
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
        
        const usedQuadrants = prev.map(eq => eq.quadrant);
        const availableQuadrants = [1, 2, 3, 4].filter(q => !usedQuadrants.includes(q));
        if (availableQuadrants.length === 0) return prev;

        const quadrant = availableQuadrants[Math.floor(Math.random() * availableQuadrants.length)];
        
        let offsetX = 0;
        let offsetY = 0;
        
        const xRand = 5 + Math.random() * 8; // 5 to 13
        const yRand = 5 + Math.random() * 6; // 5 to 11

        switch (quadrant) {
          case 1:
            offsetX = xRand;
            offsetY = yRand;
            break;
          case 2:
            offsetX = -xRand;
            offsetY = yRand;
            break;
          case 3:
            offsetX = -xRand;
            offsetY = -yRand;
            break;
          case 4:
            offsetX = xRand;
            offsetY = -yRand;
            break;
        }

        const eqDef = equations[Math.floor(Math.random() * equations.length)];
        const newEq: ActiveEquation = {
          id: idCounter.current++,
          def: eqDef,
          offsetX,
          offsetY,
          quadrant
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
          id={eq.id}
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
