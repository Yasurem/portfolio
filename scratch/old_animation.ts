import { useRef } from 'react';
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
const _rotQuat = new THREE.Quaternion();
const _tempPos = new THREE.Vector3();
const _tempQuat = new THREE.Quaternion();
const _tempEuler = new THREE.Euler();
const _axes = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, 1)
];

interface RubiksAnimationProps {
  rubiksPieces: any[];
  rubiksRefs: React.MutableRefObject<(THREE.Mesh | null)[]>;
  heroGroupRef: React.RefObject<THREE.Group>;
  debrisGroupRef: React.RefObject<THREE.Group>;
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

  // Grouping helpers
  const getMeshesByAxis = (axis: 'x' | 'y' | 'z', logicalPos: number) => {
    const indices: number[] = [];
    for (let i = 0; i < 27; i++) {
      const mesh = rubiksRefs.current[i];
      if (!mesh) continue;
      const posVal = mesh.position[axis];
      const lp = Math.round(posVal / RUBIKS_CUBE_SPACING);
      if (lp === logicalPos) {
        indices.push(i);
      }
    }
    return indices;
  };

  const snapMeshes = (indices: number[]) => {
    for (const meshIdx of indices) {
      const mesh = rubiksRefs.current[meshIdx];
      if (!mesh) continue;
      mesh.position.x = Math.round(mesh.position.x / RUBIKS_CUBE_SPACING) * RUBIKS_CUBE_SPACING;
      mesh.position.y = Math.round(mesh.position.y / RUBIKS_CUBE_SPACING) * RUBIKS_CUBE_SPACING;
      mesh.position.z = Math.round(mesh.position.z / RUBIKS_CUBE_SPACING) * RUBIKS_CUBE_SPACING;
      
      const PI_2 = Math.PI / 2;
      _tempEuler.setFromQuaternion(mesh.quaternion);
      _tempEuler.x = Math.round(_tempEuler.x / PI_2) * PI_2;
      _tempEuler.y = Math.round(_tempEuler.y / PI_2) * PI_2;
      _tempEuler.z = Math.round(_tempEuler.z / PI_2) * PI_2;
      mesh.quaternion.setFromEuler(_tempEuler);
    }
  };

  const applyRotation = (indices: number[], startPositions: THREE.Vector3[], startQuaternions: THREE.Quaternion[], axisVec: THREE.Vector3, currentAngle: number) => {
    _rotQuat.setFromAxisAngle(axisVec, currentAngle);
    for (let j = 0; j < indices.length; j++) {
      const meshIdx = indices[j];
      const mesh = rubiksRefs.current[meshIdx];
      if (!mesh) continue;
      
      _tempPos.copy(startPositions[j]).applyQuaternion(_rotQuat);
      mesh.position.copy(_tempPos);
      
      _tempQuat.copy(_rotQuat).multiply(startQuaternions[j]);
      mesh.quaternion.copy(_tempQuat);
    }
  };

  const runSolveAnimation = () => {
    if (tlRef.current) tlRef.current.kill();

    const slices = [
      getMeshesByAxis('y', 1),   // Top
      getMeshesByAxis('y', 0),   // Middle
      getMeshesByAxis('y', -1)   // Bottom
    ];

    const sliceProxies = slices.map(() => ({ angle: 0 }));
    
    const startStates = slices.map(indices => {
      return indices.map(idx => {
        const mesh = rubiksRefs.current[idx]!;
        return {
          pos: mesh.position.clone(),
          quat: mesh.quaternion.clone()
        };
      });
    });

    const yAxis = new THREE.Vector3(0, 1, 0);
    const targetAngle = -Math.PI / 2;

    const tl = gsap.timeline({
      onComplete: () => {
        slices.forEach(indices => snapMeshes(indices));
        resolveSolveState();
      }
    });

    tlRef.current = tl;

    tl.to(sliceProxies, {
      angle: targetAngle,
      duration: 0.8,
      ease: "power3.inOut",
      stagger: 0.15,
      onUpdate: function() {
        sliceProxies.forEach((proxy, idx) => {
          const indices = slices[idx];
          const states = startStates[idx];
          const posArr = states.map(s => s.pos);
          const quatArr = states.map(s => s.quat);
          applyRotation(indices, posArr, quatArr, yAxis, proxy.angle);
        });
      }
    });
  };

  const resolveSolveState = () => {
    solveState.current.isSolving = false;
    solveState.current.hasSolved = true;
    
    const frontMat = rubiksPieces[0].material; 
    
    const targetMeshes: THREE.Mesh[] = [];
    const nonTargetFlatMeshes: THREE.Mesh[] = [];
    
    rubiksPieces.forEach((piece, i) => {
      const mesh = rubiksRefs.current[i];
      if (!mesh) return;
      const posX = Math.round(mesh.position.x / RUBIKS_CUBE_SPACING);
      const posY = Math.round(mesh.position.y / RUBIKS_CUBE_SPACING);
      const posZ = Math.round(mesh.position.z / RUBIKS_CUBE_SPACING);
      
      if (posX >= 0 && posY <= 0 && posZ === 1) {
        targetMeshes.push(mesh);
      } else if (piece.isFlat) {
        nonTargetFlatMeshes.push(mesh);
      }
    });

    let flatSwapIdx = 0;
    targetMeshes.forEach(targetMesh => {
      const isTargetAlreadyFlat = rubiksPieces.find(p => p.mesh === targetMesh)?.isFlat;
      if (!isTargetAlreadyFlat && flatSwapIdx < nonTargetFlatMeshes.length) {
        const flatMesh = nonTargetFlatMeshes[flatSwapIdx++];
        const tempPos = targetMesh.position.clone();
        targetMesh.position.copy(flatMesh.position);
        flatMesh.position.copy(tempPos);
        const tempQuat = targetMesh.quaternion.clone();
        targetMesh.quaternion.copy(flatMesh.quaternion);
        flatMesh.quaternion.copy(tempQuat);
      }
    });

    rubiksPieces.forEach((piece, i) => {
      const mesh = rubiksRefs.current[i];
      if (!mesh) return;
      const posX = Math.round(mesh.position.x / RUBIKS_CUBE_SPACING);
      const posY = Math.round(mesh.position.y / RUBIKS_CUBE_SPACING);
      const posZ = Math.round(mesh.position.z / RUBIKS_CUBE_SPACING);
      
      if (posX >= 0 && posY <= 0 && posZ === 1) {
        mesh.material = frontMat;
        mesh.rotation.copy(FLAT_SIDE_ROTATION);
      }
    });
  };

  const runScrambleAnimation = () => {
    if (tlRef.current) tlRef.current.kill();

    solveState.current.hasSolved = false;
    
    rubiksPieces.forEach((piece, i) => {
      const mesh = rubiksRefs.current[i];
      if (mesh) {
        mesh.material = piece.material;
      }
    });

    const slices = [
      getMeshesByAxis('x', -1),  // Left
      getMeshesByAxis('x', 0),   // Center
      getMeshesByAxis('x', 1)    // Right
    ];

    const sliceProxies = slices.map(() => ({ angle: 0 }));
    const randomAngles = slices.map(() => {
      const multipliers = [Math.PI / 2, Math.PI, -Math.PI / 2];
      return multipliers[Math.floor(Math.random() * multipliers.length)];
    });
    
    const startStates = slices.map(indices => {
      return indices.map(idx => {
        const mesh = rubiksRefs.current[idx]!;
        return {
          pos: mesh.position.clone(),
          quat: mesh.quaternion.clone()
        };
      });
    });

    const xAxis = new THREE.Vector3(1, 0, 0);

    const tl = gsap.timeline({
      onComplete: () => {
        slices.forEach(indices => snapMeshes(indices));
        solveState.current.isScrambling = false;
      }
    });

    tlRef.current = tl;

    tl.to(sliceProxies, {
      angle: (idx) => randomAngles[idx],
      duration: 0.8,
      ease: "power3.inOut",
      stagger: {
        each: 0.15,
        from: "center"
      },
      onUpdate: function() {
        sliceProxies.forEach((proxy, idx) => {
          const indices = slices[idx];
          const states = startStates[idx];
          const posArr = states.map(s => s.pos);
          const quatArr = states.map(s => s.quat);
          applyRotation(indices, posArr, quatArr, xAxis, proxy.angle);
        });
      }
    });
  };

  useFrame((state, delta) => {
    const clock = state.clock;
    const zoom = (window as any).heroCameraZoom || 0;

    // --- 1. STATE TRIGGERS ---
    if (zoom > 0.33 && !solveState.current.hasSolved && !solveState.current.isSolving) {
      solveState.current.isSolving = true;
      solveState.current.isScrambling = false;
      runSolveAnimation();
    }

    if (zoom < 0.25 && solveState.current.hasSolved && !solveState.current.isScrambling) {
      solveState.current.isScrambling = true;
      solveState.current.isSolving = false;
      runScrambleAnimation();
    }

    // --- 4. BACKGROUND ROTATIONS & ALIGNMENT ---
    if (heroGroupRef.current) {
      if (zoom > 0.33) {
        heroGroupRef.current.rotation.y = THREE.MathUtils.lerp(heroGroupRef.current.rotation.y, 0, 0.1);
        heroGroupRef.current.rotation.x = THREE.MathUtils.lerp(heroGroupRef.current.rotation.x, 0, 0.1);
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
