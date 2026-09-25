/* eslint-disable react-hooks/purity */
'use client';

import { useRubiksAnimation } from '../../hooks/useRubiksAnimation';
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { useGLTF, Environment, PerformanceMonitor, Edges } from '@react-three/drei';
import * as THREE from 'three';

// import { Perf } from 'r3f-perf';

import {
  HERO_SCALE,
  HERO_MESH_POSITION,
  CAMERA_UNFOCUSED_POS,
  DESKTOP_DPR,
  MOBILE_DPR
} from './constants';
import { useRubiksGeometry } from './hooks/useRubiksGeometry';

export function Hero3DRubiks({ showPerf = false }: { showPerf?: boolean }) {
  const [focusedMesh, setFocusedMesh] = useState<THREE.Object3D | null>(null);
  const [dpr, setDpr] = useState<number | [number, number]>(DESKTOP_DPR);
  const [isLowPerf, setIsLowPerf] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setDpr(prev => {
        const next = mobile ? MOBILE_DPR : DESKTOP_DPR;
        return prev === next ? prev : next;
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Canvas
      camera={{ position: CAMERA_UNFOCUSED_POS.toArray(), fov: 45 }}
      style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
      onPointerMissed={() => setFocusedMesh(null)}
      dpr={dpr}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <PerformanceMonitor 
        onDecline={() => { setIsLowPerf(true); setDpr([1, 1]); }} 
        onIncline={() => setIsLowPerf(false)} 
      />
      {showPerf && null}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} />
      {(!isLowPerf && !isMobile) && <Environment preset="city" />}
      <React.Suspense fallback={null}>
        <Model focusedMesh={focusedMesh} setFocusedMesh={setFocusedMesh} isLowPerf={isLowPerf} isMobile={isMobile} />
      </React.Suspense>
    </Canvas>
  );
}

interface ModelProps {
  focusedMesh: THREE.Object3D | null;
  setFocusedMesh: React.Dispatch<React.SetStateAction<THREE.Object3D | null>>;
  isLowPerf: boolean;
  isMobile: boolean;
}

function Model({ focusedMesh, setFocusedMesh, isLowPerf, isMobile }: ModelProps) {
  const { nodes } = useGLTF('/models/isometric_cubes.gltf');
  
  const meshes = useMemo(() => {
    const meshList: THREE.Mesh[] = [];
    Object.values(nodes).forEach((node) => {
      if ((node as THREE.Mesh).isMesh) {
        meshList.push(node as THREE.Mesh);
      }
    });
    return meshList;
  }, [nodes]);

  const { rubiksPieces, debrisPieces } = useRubiksGeometry(meshes, nodes);

  // Clean up dynamically created materials to prevent WebGL memory leaks
  useEffect(() => {
    return () => {
      rubiksPieces.forEach((piece) => {
        if (piece.material && typeof piece.material.dispose === 'function') {
          piece.material.dispose();
        }
      });
    };
  }, [rubiksPieces]);

  const heroGroupRef = useRef<THREE.Group>(null);
  const debrisGroupRef = useRef<THREE.Group>(null);
  const rubiksRefs = useRef<(THREE.Mesh | null)[]>([]);

  useRubiksAnimation({
    rubiksPieces,
    rubiksRefs,
    heroGroupRef,
    debrisGroupRef,
    focusedMesh
  });

  const handleDebrisClick = (e: ThreeEvent<MouseEvent>, meshRef: THREE.Object3D) => {
    e.stopPropagation(); 
    setFocusedMesh(meshRef);
  };

  const handleRubiksClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (heroGroupRef.current) {
      setFocusedMesh(heroGroupRef.current);
    }
  };

  return (
    <group>
      {/* 1. Main Hero Artifact (The Rubik's Cube) */}
      <group 
        ref={heroGroupRef}
        position={HERO_MESH_POSITION}
        scale={HERO_SCALE}
        onClick={handleRubiksClick}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'auto' }}
      >
        {rubiksPieces.map((piece, i) => (
          <mesh
            key={`rubik-${i}`}
            ref={(el) => {
              rubiksRefs.current[i] = el;
            }}
            geometry={piece.mesh.geometry}
            material={piece.material}
            position={piece.pos}
            scale={piece.mesh.scale}
          >
            <Edges scale={1.02} threshold={15} color="#0b1021" />
          </mesh>
        ))}
      </group>

      {/* 2. Background Debris Field */}
      {(!isLowPerf && !isMobile) && (
        <group ref={debrisGroupRef}>
          {debrisPieces.map((piece, i) => (
            <mesh
              key={`debris-${i}`}
              geometry={piece.mesh.geometry}
              material={piece.mesh.material}
              position={piece.pos}
              rotation={piece.rot}
              scale={[1.2, 1.2, 1.2]}
              onClick={(e) => handleDebrisClick(e, e.object)}
              onPointerOver={() => { document.body.style.cursor = 'crosshair' }}
              onPointerOut={() => { document.body.style.cursor = 'auto' }}
            >
              <Edges scale={1.02} threshold={15} color="#0b1021" />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

useGLTF.preload('/models/isometric_cubes.gltf');
