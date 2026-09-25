import React, { useMemo, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { MathEquationDef } from '../constants/equations';

export interface ComplexMathEquationProps {
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

export default function ComplexMathEquation(props: ComplexMathEquationProps) {
  const { id, equation, centerX, centerY, gridSize, offsetX, offsetY, onComplete, dotPositionsRef } = props;
  
  const groupRef = useRef<SVGGElement>(null);
  const pathGroupRef = useRef<SVGGElement>(null);
  const tangentRef = useRef<SVGLineElement>(null);
  const pointRef = useRef<SVGCircleElement>(null);

  const d = useMemo(() => {
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
  }, [equation, centerX, centerY, gridSize, offsetX, offsetY]);

  useGSAP(() => {
    if (!groupRef.current || !pathGroupRef.current || !pointRef.current) return;
    if (equation.showTangent && !tangentRef.current) return;
    
    const [minX, maxX] = equation.range;
    const startScreenX = centerX;
    const startScreenY = centerY;
    
    gsap.set(pointRef.current, { attr: { cx: startScreenX, cy: startScreenY } });
    gsap.set(pathGroupRef.current, { opacity: 0 });
    gsap.set(groupRef.current, { opacity: 1 });

    const initialMathY = equation.func(minX);
    
    if (equation.showTangent && tangentRef.current) {
      const mInitial = equation.derivative(minX);
      const dx = 1.5 / Math.sqrt(1 + mInitial * mInitial);
      const dy = mInitial * dx;
      const x1 = centerX + ((minX - dx + offsetX) * gridSize);
      const y1 = centerY - ((initialMathY - dy + offsetY) * gridSize);
      const x2 = centerX + ((minX + dx + offsetX) * gridSize);
      const y2 = centerY - ((initialMathY + dy + offsetY) * gridSize);
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
            delete dotPositionsRef.current[id];
            onComplete();
          }
        });
      }
    });

    const targetScreenX = centerX + ((minX + offsetX) * gridSize);
    const targetScreenY = centerY - ((initialMathY + offsetY) * gridSize);

    const pos = { x: startScreenX, y: startScreenY };
    tl.to(pos, {
      x: targetScreenX,
      y: targetScreenY,
      duration: 0.8,
      ease: 'power3.out',
      onUpdate: () => {
        pointRef.current?.setAttribute('cx', pos.x.toString());
        pointRef.current?.setAttribute('cy', pos.y.toString());
        
        if (!dotPositionsRef.current[id]) {
          dotPositionsRef.current[id] = { x: pos.x, y: pos.y };
        } else {
          dotPositionsRef.current[id].x = pos.x;
          dotPositionsRef.current[id].y = pos.y;
        }
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
        const currentX = obj.val;
        const currentY = equation.func(currentX);

        const screenX = centerX + ((currentX + offsetX) * gridSize);
        const screenY = centerY - ((currentY + offsetY) * gridSize);
        pointRef.current?.setAttribute('cx', screenX.toString());
        pointRef.current?.setAttribute('cy', screenY.toString());

        if (!dotPositionsRef.current[id]) {
          dotPositionsRef.current[id] = { x: screenX, y: screenY };
        } else {
          dotPositionsRef.current[id].x = screenX;
          dotPositionsRef.current[id].y = screenY;
        }

        if (equation.showTangent && tangentRef.current) {
          const m = equation.derivative(currentX);
          const currentDx = 1.5 / Math.sqrt(1 + m * m);
          const currentDy = m * currentDx;

          const curX1 = centerX + ((currentX - currentDx + offsetX) * gridSize);
          const curY1 = centerY - ((currentY - currentDy + offsetY) * gridSize);
          const curX2 = centerX + ((currentX + currentDx + offsetX) * gridSize);
          const curY2 = centerY - ((currentY + currentDy + offsetY) * gridSize);

          tangentRef.current.setAttribute('x1', curX1.toString());
          tangentRef.current.setAttribute('y1', curY1.toString());
          tangentRef.current.setAttribute('x2', curX2.toString());
          tangentRef.current.setAttribute('y2', curY2.toString());
        }
      }
    });

    return () => {
      delete dotPositionsRef.current[id];
    };
  }, { scope: groupRef, dependencies: [equation, centerX, centerY, gridSize, offsetX, offsetY] });

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
