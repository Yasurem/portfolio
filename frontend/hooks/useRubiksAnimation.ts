/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/refs */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

// --- CONFIGURATION CONSTANTS ---
const CAMERA_UNFOCUSED_POS = new THREE.Vector3(0, 0, 30); 
const CAMERA_UNFOCUSED_LOOK = new THREE.Vector3(0, 0, 0); 
const CAMERA_FOCUSED_POS_OFFSET = new THREE.Vector3(0, 0, 15); 
const CAMERA_FOCUSED_LOOK_OFFSET = new THREE.Vector3(0, 0, 0); 
const RUBIKS_CUBE_SPACING = 0.76;
const FLAT_SIDE_ROTATION = new THREE.Euler(-Math.PI / 2, 0, 0);

// --- PRE-ALLOCATED VECTORS ---
const _targetPos = new THREE.Vector3();
const _idealLook = new THREE.Vector3();
const _meshWorldPos = new THREE.Vector3();
const _tempPos = new THREE.Vector3();
const _tempQuat = new THREE.Quaternion();
const _rotQuat = new THREE.Quaternion();
const _tempMat = new THREE.Matrix4();
const _tempVec3 = new THREE.Vector3();
const _axisVec = new THREE.Vector3();

interface RubiksAnimationProps {
  rubiksPieces: any[];
  rubiksRefs: React.MutableRefObject<(THREE.Mesh | null)[]>;
  heroGroupRef: React.RefObject<THREE.Group | null>;
  debrisGroupRef: React.RefObject<THREE.Group | null>;
  focusedMesh: THREE.Object3D | null;
}

export function useRubiksAnimation({
  rubiksPieces,
  rubiksRefs,
  heroGroupRef,
  debrisGroupRef,
  focusedMesh
}: RubiksAnimationProps) {
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3().copy(CAMERA_UNFOCUSED_LOOK));

  const solveState = useRef({
    isSolving: false,
    hasSolved: false,
    isScrambling: false,
  });

  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Maintain logical coords (-1, 0, 1) for each mesh piece
  const logicalCoords = useRef<THREE.Vector3[]>([]);
  const initializedCoords = useRef(false);
  
  // Pre-allocate arrays for animations to prevent GC stutter
  const solveStartQuats = useRef<THREE.Quaternion[]>([]);
  const solveTargetQuats = useRef<THREE.Quaternion[]>([]);
  const scrambleStartQuats = useRef<THREE.Quaternion[]>([]);
  const scrambleStartPoss = useRef<THREE.Vector3[]>([]);
  const rotationProxies = useRef<{t: number}[]>([]);
  
  // Initialize pre-allocated arrays once
  useMemo(() => {
    for (let i = 0; i < 27; i++) {
      logicalCoords.current.push(new THREE.Vector3());
      solveStartQuats.current.push(new THREE.Quaternion());
      solveTargetQuats.current.push(new THREE.Quaternion());
      scrambleStartQuats.current.push(new THREE.Quaternion());
      scrambleStartPoss.current.push(new THREE.Vector3());
      rotationProxies.current.push({ t: 0 });
    }
  }, []);

  // Ensure timeline is killed on component unmount
  useEffect(() => {
    return () => {
      if (tlRef.current) {
        tlRef.current.kill();
        tlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!initializedCoords.current && rubiksRefs.current[0]) {
      for (let i = 0; i < 27; i++) {
        const mesh = rubiksRefs.current[i];
        if (mesh) {
          logicalCoords.current[i].set(
            Math.round(mesh.position.x / RUBIKS_CUBE_SPACING),
            Math.round(mesh.position.y / RUBIKS_CUBE_SPACING),
            Math.round(mesh.position.z / RUBIKS_CUBE_SPACING)
          );
        }
      }
      initializedCoords.current = true;
    }
  }, [rubiksRefs]);

  const updateMeshPositions = (multiplier: number) => {
    for (let i = 0; i < 27; i++) {
      const mesh = rubiksRefs.current[i];
      if (!mesh) continue;
      const loc = logicalCoords.current[i];
      mesh.position.set(
        loc.x * RUBIKS_CUBE_SPACING * multiplier,
        loc.y * RUBIKS_CUBE_SPACING * multiplier,
        loc.z * RUBIKS_CUBE_SPACING * multiplier
      );
    }
  };

  const snapMeshes = (indices: number[]) => {
    for (let i = 0; i < indices.length; i++) {
      const meshIdx = indices[i];
      const mesh = rubiksRefs.current[meshIdx];
      if (!mesh) continue;
      mesh.position.x = Math.round(mesh.position.x / RUBIKS_CUBE_SPACING) * RUBIKS_CUBE_SPACING;
      mesh.position.y = Math.round(mesh.position.y / RUBIKS_CUBE_SPACING) * RUBIKS_CUBE_SPACING;
      mesh.position.z = Math.round(mesh.position.z / RUBIKS_CUBE_SPACING) * RUBIKS_CUBE_SPACING;
      
      // Use Matrix4 rounding to perfectly snap orthogonal rotations (fixes Euler Gimbal lock drift)
      _tempMat.makeRotationFromQuaternion(mesh.quaternion);
      const e = _tempMat.elements;
      for (let k = 0; k < 16; k++) {
        e[k] = Math.round(e[k]);
      }
      mesh.quaternion.setFromRotationMatrix(_tempMat);
      mesh.quaternion.normalize();
    }
  };

  const applyRotation = (indices: number[], axisVec: THREE.Vector3, currentAngle: number) => {
    _rotQuat.setFromAxisAngle(axisVec, currentAngle);
    for (let j = 0; j < indices.length; j++) {
      const meshIdx = indices[j];
      const mesh = rubiksRefs.current[meshIdx];
      if (!mesh) continue;
      
      _tempPos.copy(scrambleStartPoss.current[j]).applyQuaternion(_rotQuat);
      mesh.position.copy(_tempPos);
      
      _tempQuat.copy(_rotQuat).multiply(scrambleStartQuats.current[j]);
      mesh.quaternion.copy(_tempQuat);
    }
  };

  const runSolveAnimation = () => {
    solveState.current.hasSolved = true;
    solveState.current.isSolving = true;
    solveState.current.isScrambling = false;

    if (tlRef.current) {
      tlRef.current.progress(1);
      tlRef.current.kill();
    }

    // First ensure pieces are perfectly snapped before Option B floating assembly solve
    const allIndices = [];
    for (let i = 0; i < 27; i++) allIndices.push(i);
    snapMeshes(allIndices);

    // 1. Identify target slots and non-target flat pieces
    const targetIndices: number[] = [];
    const nonTargetFlatIndices: number[] = [];
    
    // Update logical coords safely before solve
    for (let i = 0; i < 27; i++) {
      const mesh = rubiksRefs.current[i];
      if (mesh) {
        logicalCoords.current[i].set(
          Math.round(mesh.position.x / RUBIKS_CUBE_SPACING),
          Math.round(mesh.position.y / RUBIKS_CUBE_SPACING),
          Math.round(mesh.position.z / RUBIKS_CUBE_SPACING)
        );
      }
      
      const loc = logicalCoords.current[i];
      if (loc.x >= 0 && loc.y <= 0 && loc.z === 1) {
        targetIndices.push(i);
      } else if (rubiksPieces[i].isFlat) {
        nonTargetFlatIndices.push(i);
      }
    }

    // 2. Instantly swap logical positions and physical assignments for the solved pattern
    let flatSwapIdx = 0;
    for (let i = 0; i < targetIndices.length; i++) {
      const tIdx = targetIndices[i];
      const isTargetFlat = rubiksPieces[tIdx].isFlat;
      if (!isTargetFlat && flatSwapIdx < nonTargetFlatIndices.length) {
        const fIdx = nonTargetFlatIndices[flatSwapIdx++];
        
        _tempVec3.copy(logicalCoords.current[tIdx]);
        logicalCoords.current[tIdx].copy(logicalCoords.current[fIdx]);
        logicalCoords.current[fIdx].copy(_tempVec3);

        const tMesh = rubiksRefs.current[tIdx];
        const fMesh = rubiksRefs.current[fIdx];
        if (tMesh && fMesh) {
          _tempPos.copy(tMesh.position);
          tMesh.position.copy(fMesh.position);
          fMesh.position.copy(_tempPos);
          
          _tempQuat.copy(tMesh.quaternion);
          tMesh.quaternion.copy(fMesh.quaternion);
          fMesh.quaternion.copy(_tempQuat);
        }
      }
    }

    // 3. Setup proxies
    const spacingProxy = { multiplier: 1.0 };
    for (let i = 0; i < 27; i++) {
      rotationProxies.current[i].t = 0;
    }

    const frontMat = rubiksPieces[0].material;
    
    for (let i = 0; i < 27; i++) {
      const mesh = rubiksRefs.current[i];
      if (!mesh) {
        solveStartQuats.current[i].identity();
        solveTargetQuats.current[i].identity();
        continue;
      }
      
      solveStartQuats.current[i].copy(mesh.quaternion);
      const loc = logicalCoords.current[i];
      
      if (loc.x >= 0 && loc.y <= 0 && loc.z === 1) {
        solveTargetQuats.current[i].setFromEuler(FLAT_SIDE_ROTATION);
        mesh.material = frontMat; // Reveal solved texture targeting logic
      } else {
        solveTargetQuats.current[i].identity(); // Sets quaternion to (0,0,0,1)
      }
    }

    const tl = gsap.timeline({
      onComplete: () => {
        solveState.current.isSolving = false;
        updateMeshPositions(1.0);
        for(let i=0; i<27; i++){
          const mesh = rubiksRefs.current[i];
          if(mesh) mesh.quaternion.copy(solveTargetQuats.current[i]);
        }
      }
    });
    tlRef.current = tl;

    // Phase 1: Explode
    tl.to(spacingProxy, {
      multiplier: 1.3,
      duration: 0.6,
      ease: "expo.out",
      onUpdate: () => updateMeshPositions(spacingProxy.multiplier)
    });

    // Phase 2: Mid-Air Reorientation
    tl.to(rotationProxies.current, {
      t: 1.0,
      duration: 0.6,
      ease: "power3.inOut",
      onUpdate: () => {
        for (let i = 0; i < 27; i++) {
          const mesh = rubiksRefs.current[i];
          if (mesh) {
            mesh.quaternion.slerpQuaternions(solveStartQuats.current[i], solveTargetQuats.current[i], rotationProxies.current[i].t);
          }
        }
      }
    }, "<0.2");

    // Phase 3: Implode & Snap
    tl.to(spacingProxy, {
      multiplier: 1.0,
      duration: 0.8,
      ease: "back.out(1.7)",
      onUpdate: () => updateMeshPositions(spacingProxy.multiplier)
    }, ">-0.2");
  };

  const runScrambleAnimation = () => {
    solveState.current.hasSolved = false;
    solveState.current.isScrambling = true;
    solveState.current.isSolving = false;

    if (tlRef.current) {
      tlRef.current.progress(1);
      tlRef.current.kill();
    }
    
    // Reset materials back to original random scatter states
    for (let i = 0; i < 27; i++) {
      const mesh = rubiksRefs.current[i];
      if (mesh) {
        mesh.material = rubiksPieces[i].material;
      }
    }

    // SCENE 1 IDLE: Infinite smooth slicing animation
    const axes = ['x', 'y', 'z'] as const;
    const randomAxis = axes[Math.floor(Math.random() * 3)];
    const randomSlice = Math.floor(Math.random() * 3) - 1; 
    const randomAngle = (Math.random() > 0.5 ? 1 : -1) * (Math.PI / 2);

    const sliceIndices: number[] = [];
    for (let i = 0; i < 27; i++) {
      const mesh = rubiksRefs.current[i];
      if (!mesh) continue;
      const posVal = mesh.position[randomAxis];
      const logicalPos = Math.round(posVal / RUBIKS_CUBE_SPACING);
      if (logicalPos === randomSlice) {
        sliceIndices.push(i);
      }
    }

    const proxy = { angle: 0 };
    for (let i = 0; i < sliceIndices.length; i++) {
      const idx = sliceIndices[i];
      scrambleStartQuats.current[i].copy(rubiksRefs.current[idx]!.quaternion);
      scrambleStartPoss.current[i].copy(rubiksRefs.current[idx]!.position);
    }
    _axisVec.set(0, 0, 0);
    _axisVec[randomAxis] = 1;

    const tl = gsap.timeline({
      onComplete: () => {
        snapMeshes(sliceIndices); // Lock cleanly to grid to prevent drift
        if (solveState.current.isScrambling) {
          runScrambleAnimation(); // Loop recursively for an infinite idle animation
        }
      }
    });
    tlRef.current = tl;

    tl.to(proxy, {
      angle: randomAngle,
      duration: 0.75, // Smooth, deliberate twist speed
      ease: "power2.inOut",
      onUpdate: () => applyRotation(sliceIndices, _axisVec, proxy.angle)
    });
  };

  useFrame((state, delta) => {
    const clock = state.clock;
    
    // Safely get zoom level handling undefined window
    let zoom = 0;
    if (typeof window !== 'undefined' && 'heroCameraZoom' in window) {
      zoom = (window as any).heroCameraZoom || 0;
    }

    // Safely setup logical coords if missed during initial React mount cycle
    if (!initializedCoords.current && rubiksRefs.current[0]) {
      for (let i = 0; i < 27; i++) {
        const mesh = rubiksRefs.current[i];
        if (mesh) {
          logicalCoords.current[i].set(
            Math.round(mesh.position.x / RUBIKS_CUBE_SPACING),
            Math.round(mesh.position.y / RUBIKS_CUBE_SPACING),
            Math.round(mesh.position.z / RUBIKS_CUBE_SPACING)
          );
        }
      }
      initializedCoords.current = true;
    }

    // --- 1. STATE TRIGGERS ---
    if (zoom > 0.33 && !solveState.current.hasSolved && !solveState.current.isSolving) {
      runSolveAnimation();
    }

    if (zoom < 0.25 && solveState.current.hasSolved && !solveState.current.isScrambling) {
      runScrambleAnimation();
    }

    // Initialize infinite idle animation on first load
    if (zoom < 0.25 && !solveState.current.hasSolved && !solveState.current.isScrambling && !solveState.current.isSolving) {
       runScrambleAnimation();
    }

    // --- 4. BACKGROUND ROTATIONS & ALIGNMENT ---
    if (heroGroupRef.current) {
      if (zoom > 0.33) {
        _tempQuat.identity();
        heroGroupRef.current.quaternion.slerp(_tempQuat, 0.1);
      } else {
        heroGroupRef.current.rotation.y += delta * 0.2;
        heroGroupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.5) * 0.1;
      }
    }

    if (debrisGroupRef.current) {
      debrisGroupRef.current.rotation.y += delta * 0.05;
      debrisGroupRef.current.position.y = Math.sin(clock.elapsedTime * 0.2) * 2;
    }

    // --- 6. CAMERA DOLLY ---
    if (focusedMesh) {
      focusedMesh.getWorldPosition(_meshWorldPos);
      _idealLook.copy(_meshWorldPos).add(CAMERA_FOCUSED_LOOK_OFFSET);
      _targetPos.copy(_meshWorldPos).add(CAMERA_FOCUSED_POS_OFFSET); 
    } else {
      _targetPos.copy(CAMERA_UNFOCUSED_POS);
      _idealLook.copy(CAMERA_UNFOCUSED_LOOK);
      _targetPos.z -= zoom * 15; 
      
      const startX = -10;
      const endX = 10;
      const panOffset = startX + (zoom * (endX - startX)); 
      
      _targetPos.x += panOffset;
      _idealLook.x += panOffset;
    }

    camera.position.lerp(_targetPos, 0.04);
    lookTarget.current.lerp(_idealLook, 0.04);
    camera.lookAt(lookTarget.current);
  });
}
