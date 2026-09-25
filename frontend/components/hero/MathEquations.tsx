'use client';

import React from 'react';
import ComplexMathEquation from './components/ComplexMathEquation';
import { useEquationSpawner } from './hooks/useEquationSpawner';

interface MathEquationsProps {
  dimensions: { width: number; height: number };
  centerX: number;
  centerY: number;
  gridSize: number;
  dotPositionsRef: React.MutableRefObject<Record<number, {x: number, y: number}>>;
}

export default function MathEquations({ dimensions, centerX, centerY, gridSize, dotPositionsRef }: MathEquationsProps) {
  const { activeEquations, handleComplete } = useEquationSpawner(dimensions);

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
