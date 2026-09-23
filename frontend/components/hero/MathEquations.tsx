'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface MathEquationsProps {
  dimensions: { width: number; height: number };
  centerX: number;
  centerY: number;
  gridSize: number;
  dotPositionsRef: React.MutableRefObject<Record<number, {x: number, y: number}>>;
}

type MathFunction = (x: number) => number;

interface MathEquationDef {
  name: string;
  func: MathFunction;
  derivative: MathFunction;
  range: [number, number];
  color: string;
  showTangent: boolean;
}

const equations: MathEquationDef[] = [
  {
    name: 'Gradient Descent',
    func: (x) => (x * x) / 10,
    derivative: (x) => x / 5,
    range: [-8, 8],
    color: 'var(--color-primary)',
    showTangent: true
  },
  {
    name: 'Sigmoid',
    func: (x) => 1 / (1 + Math.exp(-x)),
    derivative: (x) => {
      const f = 1 / (1 + Math.exp(-x));
      return f * (1 - f);
    },
    range: [-6, 6],
    color: 'var(--color-sand-peach)',
    showTangent: true
  },
  {
    name: 'Tanh',
    func: (x) => Math.tanh(x),
    derivative: (x) => 1 - Math.pow(Math.tanh(x), 2),
    range: [-6, 6],
    color: 'var(--color-lofi)',
    showTangent: true
  },
  {
    name: 'ReLU',
    func: (x) => Math.max(0, x),
    derivative: (x) => x > 0 ? 1 : 0,
    range: [-6, 6],
    color: 'var(--color-primary)',
    showTangent: false // Disabled for straight lines
  },
  {
    name: 'Swish',
    func: (x) => x / (1 + Math.exp(-x)),
    derivative: (x) => {
      const exp_nx = Math.exp(-x);
      return (1 + exp_nx + x * exp_nx) / Math.pow(1 + exp_nx, 2);
    },
    range: [-6, 6],
    color: 'var(--color-sand-peach)',
    showTangent: true
  },
  {
    name: 'Gaussian',
    func: (x) => 5 * Math.exp(-(x * x) / 8),
    derivative: (x) => 5 * Math.exp(-(x * x) / 8) * (-x / 4),
    range: [-8, 8],
    color: 'var(--color-lofi)',
    showTangent: false // Disabled as requested
  },
  {
    name: 'Damped Convergence',
    func: (x) => Math.sin(x) * Math.exp(-0.15 * x),
    derivative: (x) => Math.exp(-0.15 * x) * (Math.cos(x) - 0.15 * Math.sin(x)),
    range: [-2, 12],
    color: 'var(--color-primary)',
    showTangent: true
  }
];

interface ActiveEquation {
  id: number;
  def: MathEquationDef;
  offsetX: number;
  offsetY: number;
  side: 'left' | 'right';
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
  dotPositionsRef: React.MutableRefObject<Record<number, {x: number, y: number}>>;
}

function ComplexMathEquation(props: ComplexMathEquationProps) {
  const { id, equation, onComplete } = props;
  
  const groupRef = useRef<SVGGElement>(null);
  const pathGroupRef = useRef<SVGGElement>(null);
  const tangentRef = useRef<SVGLineElement>(null);
  const pointRef = useRef<SVGCircleElement>(null);

  const propsRef = useRef(props);
  useEffect(() => {
    propsRef.current = props;
  }, [props]);

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
    if (!groupRef.current || !pathGroupRef.current || !pointRef.current) return;
    if (equation.showTangent && !tangentRef.current) return;
    
    const [minX, maxX] = equation.range;
    const startScreenX = propsRef.current.centerX;
    const startScreenY = propsRef.current.centerY;
    
    gsap.set(pointRef.current, { attr: { cx: startScreenX, cy: startScreenY } });
    gsap.set(pathGroupRef.current, { opacity: 0 });
    gsap.set(groupRef.current, { opacity: 1 });

    const p = propsRef.current;
    const initialMathY = equation.func(minX);
    
    if (equation.showTangent && tangentRef.current) {
      const mInitial = equation.derivative(minX);
      const dx = 1.5 / Math.sqrt(1 + mInitial * mInitial);
      const dy = mInitial * dx;
      const x1 = p.centerX + ((minX - dx + p.offsetX) * p.gridSize);
      const y1 = p.centerY - ((initialMathY - dy + p.offsetY) * p.gridSize);
      const x2 = p.centerX + ((minX + dx + p.offsetX) * p.gridSize);
      const y2 = p.centerY - ((initialMathY + dy + p.offsetY) * p.gridSize);
      tangentRef.current.setAttribute('x1', x1.toString());
      tangentRef.current.setAttribute('y1', y1.toString());
      tangentRef.current.setAttribute('x2', x2.toString());
      tangentRef.current.setAttribute('y2', y2.toString());
    }

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(groupRef.current, {
          opacity: 0,
          duration: 1,
          ease: 'power2.in',
          onComplete: () => {
            delete propsRef.current.dotPositionsRef.current[id];
            onComplete();
          }
        });
      }
    });

    const targetScreenX = p.centerX + ((minX + p.offsetX) * p.gridSize);
    const targetScreenY = p.centerY - ((initialMathY + p.offsetY) * p.gridSize);

    const pos = { x: startScreenX, y: startScreenY };
    tl.to(pos, {
      x: targetScreenX,
      y: targetScreenY,
      duration: 0.8,
      ease: 'power3.out',
      onUpdate: () => {
        pointRef.current?.setAttribute('cx', pos.x.toString());
        pointRef.current?.setAttribute('cy', pos.y.toString());
        propsRef.current.dotPositionsRef.current[id] = { x: pos.x, y: pos.y };
      }
    });

    tl.to(pathGroupRef.current, {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out'
    }, "-=0.3");

    const obj = { val: minX };
    tl.to(obj, {
      val: maxX,
      duration: 6,
      ease: "power1.inOut",
      onUpdate: () => {
        const currP = propsRef.current;
        const currentX = obj.val;
        const currentY = equation.func(currentX);

        const screenX = currP.centerX + ((currentX + currP.offsetX) * currP.gridSize);
        const screenY = currP.centerY - ((currentY + currP.offsetY) * currP.gridSize);
        pointRef.current?.setAttribute('cx', screenX.toString());
        pointRef.current?.setAttribute('cy', screenY.toString());

        currP.dotPositionsRef.current[id] = { x: screenX, y: screenY };

        if (equation.showTangent && tangentRef.current) {
          const m = equation.derivative(currentX);
          const currentDx = 1.5 / Math.sqrt(1 + m * m);
          const currentDy = m * currentDx;

          const curX1 = currP.centerX + ((currentX - currentDx + currP.offsetX) * currP.gridSize);
          const curY1 = currP.centerY - ((currentY - currentDy + currP.offsetY) * currP.gridSize);
          const curX2 = currP.centerX + ((currentX + currentDx + currP.offsetX) * currP.gridSize);
          const curY2 = currP.centerY - ((currentY + currentDy + currP.offsetY) * currP.gridSize);

          tangentRef.current.setAttribute('x1', curX1.toString());
          tangentRef.current.setAttribute('y1', curY1.toString());
          tangentRef.current.setAttribute('x2', curX2.toString());
          tangentRef.current.setAttribute('y2', curY2.toString());
        }
      }
    });

    return () => {
      delete propsRef.current.dotPositionsRef.current[id];
    };
  }, { scope: groupRef, dependencies: [equation] });

  return (
    <g ref={groupRef} style={{ opacity: 0 }}>
      <g ref={pathGroupRef}>
        <path className="math-path" d={d} fill="none" stroke={equation.color} strokeWidth="1.5" opacity={0.3} />
        {equation.showTangent && <line className="math-path" ref={tangentRef} stroke={equation.color} strokeWidth="2" opacity={0.8} />}
      </g>
      <circle ref={pointRef} className="math-dot" r="4" fill="var(--color-primary)" />
    </g>
  );
}

export default function MathEquations({ dimensions, centerX, centerY, gridSize, dotPositionsRef }: MathEquationsProps) {
  const [activeEquations, setActiveEquations] = useState<ActiveEquation[]>([]);
  const idCounter = useRef(0);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    const spawnEquation = () => {
      setActiveEquations((prev) => {
        if (prev.length >= 2) return prev;
        
        // 1. Prevent duplicate equations from spawning simultaneously
        const activeNames = prev.map(eq => eq.def.name);
        const availableEqs = equations.filter(eq => !activeNames.includes(eq.name));
        if (availableEqs.length === 0) return prev;
        const eqDef = availableEqs[Math.floor(Math.random() * availableEqs.length)];
        
        // 2. Strict Hemisphere Isolation (Left vs Right)
        const activeSides = prev.map(eq => eq.side);
        let side: 'left' | 'right' = 'left';
        
        if (activeSides.includes('left') && !activeSides.includes('right')) side = 'right';
        else if (activeSides.includes('right') && !activeSides.includes('left')) side = 'left';
        else side = Math.random() > 0.5 ? 'left' : 'right'; 

        // 3. Exact Screen Placement (Hemisphere Centering)
        let offsetX = 0;
        let offsetY = (Math.random() - 0.5) * 6; // Keep Y closer to the vertical center

        if (side === 'right') {
          // Right Hemisphere: spawn between +8 and +12 units (approx 320px to 480px right of center)
          offsetX = 8 + Math.random() * 4;
        } else {
          // Left Hemisphere: spawn between -8 and -12 units (approx -320px to -480px left of center)
          offsetX = -8 - Math.random() * 4;
        }

        const newEq: ActiveEquation = {
          id: idCounter.current++,
          def: eqDef,
          offsetX,
          offsetY,
          side
        };
        return [...prev, newEq];
      });
    };

    const startSpawning = () => {
      spawnEquation(); 
      timeout = setTimeout(spawnEquation, 1000); 
      interval = setInterval(spawnEquation, 2000); 
    };

    const initialDelay = setTimeout(startSpawning, 3000);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [dimensions]);

  const handleComplete = (id: number) => {
    setActiveEquations((prev) => prev.filter((eq) => eq.id !== id));
  };

  if (dimensions.width === 0) return null;

  return (
    <g className="math-equations-wrapper">
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
          dotPositionsRef={dotPositionsRef}
        />
      ))}
    </g>
  );
}
