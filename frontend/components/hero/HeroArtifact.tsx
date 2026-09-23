'use client';

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, Edges } from '@react-three/drei';
import * as THREE from 'three';

// =========================================================================
// 🎛️ INDEPENDENT ALIGNMENT CONTROLS
// =========================================================================

// --- 1. THE HERO (Rubik's Cube) ---
const HERO_SCALE: [number, number, number] = [5, 5, 5];
const HERO_MESH_POSITION: [number, number, number] = [0, .76, 0]; 
const RUBIKS_CUBE_SPACING = .76; 

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

// Rubik's Colors Palette (Extracted from Brain Illustration)
const PALETTE = ['#FF3B7C', '#FF7A00', '#88E716', '#00C3FF', '#7E8FAD', '#171B33'];

export function HeroArtifact() {
  const [focusedMesh, setFocusedMesh] = useState<THREE.Object3D | null>(null);

  return (
    <Canvas
      camera={{ position: CAMERA_UNFOCUSED_POS.toArray(), fov: 45 }}
      style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
      onPointerMissed={() => setFocusedMesh(null)}
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} />
      <Environment preset="city" />
      <React.Suspense fallback={null}>
        <Model focusedMesh={focusedMesh} setFocusedMesh={setFocusedMesh} />
      </React.Suspense>
    </Canvas>
  );
}

function Model({ focusedMesh, setFocusedMesh }: { focusedMesh: THREE.Object3D | null, setFocusedMesh: any }) {
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
    const shuffled = [...meshes].sort(() => 0.5 - Math.random());
    
    // 1. 27 original pieces for the Rubik's Cube
    const rubiks = shuffled.slice(0, 27).map((mesh, i) => {
      const gridSize = 3;
      const offset = (gridSize * RUBIKS_CUBE_SPACING) / 2 - (RUBIKS_CUBE_SPACING / 2);
      
      const cx = (i % gridSize) * RUBIKS_CUBE_SPACING - offset;
      const cy = Math.floor((i / gridSize) % gridSize) * RUBIKS_CUBE_SPACING - offset;
      const cz = Math.floor(i / (gridSize * gridSize)) * RUBIKS_CUBE_SPACING - offset;

      // Clone material to apply a color tint without affecting other pieces/debris
      const coloredMat = (mesh.material as THREE.MeshStandardMaterial).clone();
      const faceColor = new THREE.Color(PALETTE[i % PALETTE.length]);
      
      coloredMat.color = faceColor;
      
      // Add subtle emissive lift and make it completely matte (soft)
      coloredMat.emissive = faceColor;
      coloredMat.emissiveIntensity = .15; 
      coloredMat.roughness = 1; 
      coloredMat.metalness = 0;

      return { 
        mesh, 
        pos: new THREE.Vector3(cx, cy, cz),
        material: coloredMat
      };
    });

    // 2. The remaining 19 cubes become the background debris
    const debris = shuffled.slice(27).map((mesh) => {
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

  const heroGroupRef = useRef<THREE.Group>(null);
  const debrisGroupRef = useRef<THREE.Group>(null);
  const rubiksRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Track state for the Rubik's idle slice animation
  const animState = useRef({
    isAnimating: false,
    progress: 0,
    axis: new THREE.Vector3(),
    angle: 0,
    activeIndices: [] as number[],
    startPositions: Array.from({ length: 9 }, () => new THREE.Vector3()),
    startQuaternions: Array.from({ length: 9 }, () => new THREE.Quaternion()),
    lastAnimTime: 0
  });

  useFrame((state, delta) => {
    const clock = state.clock;

    // Background Rotations
    if (heroGroupRef.current) {
      heroGroupRef.current.rotation.y += delta * 0.2;
      heroGroupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.5) * 0.1;
    }

    if (debrisGroupRef.current) {
      debrisGroupRef.current.rotation.y += delta * 0.05;
      debrisGroupRef.current.position.y = Math.sin(clock.elapsedTime * 0.2) * 2;
    }

    // --- Idle Rubik's Slice Animation ---
    const anim = animState.current;
    if (!anim.isAnimating) {
      if (clock.elapsedTime - anim.lastAnimTime > 2.0 + Math.random()) {
        const axes = [
          new THREE.Vector3(1, 0, 0),
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(0, 0, 1)
        ];
        const axisIdx = Math.floor(Math.random() * 3);
        const axis = axes[axisIdx];
        const logicalAxis = ['x', 'y', 'z'][axisIdx] as 'x' | 'y' | 'z';
        
        const sliceIndex = Math.floor(Math.random() * 3) - 1; 
        
        anim.activeIndices = [];
        let idx = 0;
        
        for (let i = 0; i < 27; i++) {
          const mesh = rubiksRefs.current[i];
          if (!mesh) continue;
          
          const posVal = mesh.position[logicalAxis];
          const logicalPos = Math.round(posVal / RUBIKS_CUBE_SPACING);
          
          if (logicalPos === sliceIndex) {
            anim.activeIndices.push(i);
            anim.startPositions[idx].copy(mesh.position);
            anim.startQuaternions[idx].copy(mesh.quaternion);
            idx++;
          }
        }
        
        if (anim.activeIndices.length > 0) {
          anim.isAnimating = true;
          anim.progress = 0;
          anim.axis.copy(axis);
          anim.angle = (Math.random() > 0.5 ? 1 : -1) * (Math.PI / 2);
        }
      }
    } else {
      const speed = 2.5; 
      anim.progress += delta * speed;
      const t = Math.min(anim.progress, 1.0);
      
      // easeInOutSine
      const ease = -(Math.cos(Math.PI * t) - 1) / 2;
      const currentAngle = anim.angle * ease;
      
      _rotQuat.setFromAxisAngle(anim.axis, currentAngle);
      
      for (let j = 0; j < anim.activeIndices.length; j++) {
        const meshIdx = anim.activeIndices[j];
        const mesh = rubiksRefs.current[meshIdx];
        if (!mesh) continue;
        
        _tempPos.copy(anim.startPositions[j]).applyQuaternion(_rotQuat);
        mesh.position.copy(_tempPos);
        
        _tempQuat.copy(_rotQuat).multiply(anim.startQuaternions[j]);
        mesh.quaternion.copy(_tempQuat);
      }
      
      if (t >= 1.0) {
        anim.isAnimating = false;
        anim.lastAnimTime = clock.elapsedTime;
        
        // Snap to exact values to prevent drift
        for (let j = 0; j < anim.activeIndices.length; j++) {
          const meshIdx = anim.activeIndices[j];
          const mesh = rubiksRefs.current[meshIdx];
          if (!mesh) continue;
          
          mesh.position.x = Math.round(mesh.position.x / RUBIKS_CUBE_SPACING) * RUBIKS_CUBE_SPACING;
          mesh.position.y = Math.round(mesh.position.y / RUBIKS_CUBE_SPACING) * RUBIKS_CUBE_SPACING;
          mesh.position.z = Math.round(mesh.position.z / RUBIKS_CUBE_SPACING) * RUBIKS_CUBE_SPACING;
        }
      }
    }

    // --- Camera Tracking Logic ---
    if (focusedMesh) {
      focusedMesh.getWorldPosition(_meshWorldPos);
      
      _idealLook.copy(_meshWorldPos).add(CAMERA_FOCUSED_LOOK_OFFSET);
      _targetPos.copy(_meshWorldPos).add(CAMERA_FOCUSED_POS_OFFSET); 
    } else {
      _targetPos.copy(CAMERA_UNFOCUSED_POS); 
      _idealLook.copy(CAMERA_UNFOCUSED_LOOK);
    }

    camera.position.lerp(_targetPos, 0.04);
    lookTarget.current.lerp(_idealLook, 0.04);
    camera.lookAt(lookTarget.current);
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
    </group>
  );
}

useGLTF.preload('/models/isometric_cubes.gltf');
