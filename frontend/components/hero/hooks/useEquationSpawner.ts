import { useState, useEffect, useRef } from 'react';
import { equations, MathEquationDef } from '../constants/equations';

export interface ActiveEquation {
  id: number;
  def: MathEquationDef;
  offsetX: number;
  offsetY: number;
  side: 'left' | 'right';
}

export function useEquationSpawner(dimensions: { width: number; height: number }) {
  const [activeEquations, setActiveEquations] = useState<ActiveEquation[]>([]);
  const idCounter = useRef(0);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    if (dimensions.width < 768) return;

    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    const spawnEquation = () => {
      setActiveEquations((prev) => {
        if (prev.length >= 2) return prev;
        
        const activeNames = prev.map(eq => eq.def.name);
        const availableEqs = equations.filter(eq => !activeNames.includes(eq.name));
        if (availableEqs.length === 0) return prev;
        const eqDef = availableEqs[Math.floor(Math.random() * availableEqs.length)];
        
        const activeSides = prev.map(eq => eq.side);
        let side: 'left' | 'right' = 'left';
        
        if (activeSides.includes('left') && !activeSides.includes('right')) side = 'right';
        else if (activeSides.includes('right') && !activeSides.includes('left')) side = 'left';
        else side = Math.random() > 0.5 ? 'left' : 'right'; 

        let offsetX = 0;
        const offsetY = (Math.random() - 0.5) * 6;

        if (side === 'right') {
          offsetX = 8 + Math.random() * 4;
        } else {
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

  return { activeEquations, handleComplete };
}
