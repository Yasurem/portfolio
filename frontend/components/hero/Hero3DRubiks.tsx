/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useRubiksAnimation } from './useRubiksAnimation';
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, Edges, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';

// =========================================================================
// 🎛️ INDEPENDENT ALIGNMENT CONTROLS
// =========================================================================

// --- 1. THE HERO (Rubik's Cube) ---
const HERO_SCALE: [number, number, number] = [5, 5, 5];
const HERO_MESH_POSITION: [number, number, number] = [0, 0.76, 0]; 
const RUBIKS_CUBE_SPACING = .76; 

// --- 1.5 ALIGNMENT: THE FLAT SIDE REVEAL ---
// Since the 3D models have greebles on the front, we rotate them 180 degrees 
// on the Y-axis (Math.PI) to expose their perfectly flat backsides to the camera!
// If the flat side is the bottom, use X: -Math.PI / 2
// If the flat side is the left, use Y: Math.PI / 2
const FLAT_SIDE_ROTATION = new THREE.Euler(-Math.PI / 2, 0, 0);

// --- 2. CAMERA: UNFOCUSED (Idle State) ---
const CAMERA_UNFOCUSED_POS = new THREE.Vector3(0, 0, 30); 
const CAMERA_UNFOCUSED_LOOK = new THREE.Vector3(0, 0, 0); 

// --- 3. CAMERA: FOCUSED (When you click a piece) ---
const CAMERA_FOCUSED_POS_OFFSET = new THREE.Vector3(0, 0, 15); 
const CAMERA_FOCUSED_LOOK_OFFSET = new THREE.Vector3(0, 0, 0); 

const DEBRIS_SCALE: [number, number, number] = [1.2, 1.2, 1.2];
// =========================================================================

// =========================================================================
// 🚀 PRE-ALLOCATED VECTORS FOR GC OPTIMIZATION
// =========================================================================
const _targetPos = new THREE.Vector3();
const _idealLook = new THREE.Vector3();
const _meshWorldPos = new THREE.Vector3();
const _rotQuat = new THREE.Quaternion();
const _tempPos = new THREE.Vector3();
const _tempQuat = new THREE.Quaternion();
const _tempEuler = new THREE.Euler();
const _axes = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, 1)
];

// Rubik's Colors Palette (Extracted from Brain Illustration)
const PALETTE = ['#FF3B7C', '#FF7A00', '#88E716', '#00C3FF', '#7E8FAD', '#171B33'];

const DESKTOP_DPR: [number, number] = [1, 2];
const MOBILE_DPR: [number, number] = [1, 1.5];

export function Hero3DRubiks() {
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
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} />
      {(!isLowPerf && !isMobile) && <Environment preset="city" />}
      <React.Suspense fallback={null}>
        <Model focusedMesh={focusedMesh} setFocusedMesh={setFocusedMesh} isLowPerf={isLowPerf} isMobile={isMobile} />
      </React.Suspense>
    </Canvas>
  );
}

function Model({ focusedMesh, setFocusedMesh, isLowPerf, isMobile }: { focusedMesh: THREE.Object3D | null, setFocusedMesh: any, isLowPerf: boolean, isMobile: boolean }) {
  const { nodes } = useGLTF('/models/isometric_cubes.gltf');
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3().copy(CAMERA_UNFOCUSED_LOOK));
  
  const meshes = useMemo(() => {
    const meshList: THREE.Mesh[] = [];
    Object.values(nodes).forEach((node) => {
      if ((node as THREE.Mesh).isMesh) {
        meshList.push(node as THREE.Mesh);
      }
    });
    return meshList;
  }, [nodes]);

  // Construct the 3x3x3 Rubik's Cube with ORIGINAL geometry and scatter debris
  const { rubiksPieces, debrisPieces } = useMemo(() => {
    // CACHE OPTIMIZATION: Instead of cloning 27 materials, we pre-generate the 6 colors
    const baseMat = (meshes[0]?.material as THREE.MeshStandardMaterial) || new THREE.MeshStandardMaterial();
    const cachedMaterials = PALETTE.map(hex => {
      const mat = baseMat.clone();
      const color = new THREE.Color(hex);
      mat.color = color;
      mat.emissive = color;
      mat.emissiveIntensity = 0.15;
      mat.roughness = 1;
      mat.metalness = 0;
      return mat;
    });

    const flatCubeNames = ['Cube.006', 'Cube.005', 'Cube.004', 'Cube.002', 'Cube.016', 'Cube.012', 'Cube.027', 'Cube.036', 'Cube.020', 'Cube.039', 'Cube.047'];
    
    // Separate meshes into flats and others directly from the nodes dictionary to avoid name mismatches
    const rawFlatMeshes = flatCubeNames.map(name => nodes[name] as THREE.Mesh).filter(m => m && m.isMesh);
    const flatMeshes = rawFlatMeshes.sort(() => 0.5 - Math.random());
    const otherMeshes = meshes.filter(m => !rawFlatMeshes.includes(m)).sort(() => 0.5 - Math.random());

    const rubiks: any[] = [];
    let flatIdx = 0;
    let otherIdx = 0;

    for (let i = 0; i < 27; i++) {
      const gridSize = 3;
      const gridX = i % gridSize;
      const gridY = Math.floor((i / gridSize) % gridSize);
      const gridZ = Math.floor(i / (gridSize * gridSize));
      
      const isTarget = gridX >= 1 && gridY <= 1 && gridZ === 2;
      
      let mesh;
      if (isTarget && flatIdx < flatMeshes.length) {
        mesh = flatMeshes[flatIdx++];
      } else {
        if (otherIdx < otherMeshes.length) {
          mesh = otherMeshes[otherIdx++];
        } else {
          mesh = flatMeshes[flatIdx++];
        }
      }
      
      const offset = (gridSize * RUBIKS_CUBE_SPACING) / 2 - (RUBIKS_CUBE_SPACING / 2);
      const cx = gridX * RUBIKS_CUBE_SPACING - offset;
      const cy = gridY * RUBIKS_CUBE_SPACING - offset;
      const cz = gridZ * RUBIKS_CUBE_SPACING - offset;

      const isFlatCube = flatCubeNames.includes(mesh.name);

      rubiks.push({
        mesh,
        isFlat: isFlatCube,
        pos: new THREE.Vector3(cx, cy, cz),
        material: cachedMaterials[i % PALETTE.length]
      });
    }

    // 2. The remaining 19 cubes become the background debris
    const remainingMeshes = [...otherMeshes.slice(otherIdx), ...flatMeshes.slice(flatIdx)];
    const debris = remainingMeshes.map((mesh) => {
      const px = Math.random() * 40 - 5; 
      const py = Math.random() * 40 - 20;
      const pz = -Math.random() * 50 - 15; 

      const randRot = new THREE.Euler(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      return { mesh, pos: new THREE.Vector3(px, py, pz), rot: randRot };
    });

    return { rubiksPieces: rubiks, debrisPieces: debris };
  }, [meshes]);

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

  const handleDebrisClick = (e: any, meshRef: THREE.Object3D) => {
    e.stopPropagation(); 
    setFocusedMesh(meshRef);
  };

  const handleRubiksClick = (e: any) => {
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
              scale={DEBRIS_SCALE}
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
