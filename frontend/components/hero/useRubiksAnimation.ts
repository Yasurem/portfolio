import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

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

  const solveState = useRef({
    isSolving: false,
    hasSolved: false,
    solveStartTime: 0,
    isScrambling: false,
    scrambleStartTime: 0
  });

  useFrame((state, delta) => {
    const clock = state.clock;
    const zoom = (window as any).heroCameraZoom || 0;

    // --- 1. STATE TRIGGERS ---
    if (zoom > 0.33 && !solveState.current.hasSolved && !solveState.current.isSolving) {
      solveState.current.isSolving = true;
      solveState.current.solveStartTime = clock.elapsedTime;
    }

    if (zoom < 0.25 && solveState.current.hasSolved && !solveState.current.isScrambling) {
      solveState.current.isScrambling = true;
      solveState.current.scrambleStartTime = clock.elapsedTime;
    }

    const isHyperSolving = solveState.current.isSolving;
    const isHyperScrambling = solveState.current.isScrambling;
    
    const timeSinceSolveStart = clock.elapsedTime - solveState.current.solveStartTime;
    const timeSinceScrambleStart = clock.elapsedTime - solveState.current.scrambleStartTime;

    // --- 2. END HYPER-SOLVE ---
    if (isHyperSolving && timeSinceSolveStart > 1.5 && !animState.current.isAnimating) {
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
    }

    // --- 3. END HYPER-SCRAMBLE ---
    if (isHyperScrambling && timeSinceScrambleStart > 1.5 && !animState.current.isAnimating) {
      solveState.current.isScrambling = false;
      solveState.current.hasSolved = false; 
      
      rubiksPieces.forEach((piece, i) => {
        const mesh = rubiksRefs.current[i];
        if (mesh) {
          mesh.material = piece.material;
          mesh.rotation.set(0, 0, 0);
        }
      });
    }

    const isFrantic = solveState.current.isSolving || solveState.current.isScrambling;

    // --- 4. BACKGROUND ROTATIONS & ALIGNMENT ---
    if (heroGroupRef.current) {
      if (zoom > 0.33 && !isFrantic) {
        heroGroupRef.current.rotation.y = THREE.MathUtils.lerp(heroGroupRef.current.rotation.y, 0, 0.1);
        heroGroupRef.current.rotation.x = THREE.MathUtils.lerp(heroGroupRef.current.rotation.x, 0, 0.1);
      } else {
        heroGroupRef.current.rotation.y += delta * (isFrantic ? 2.0 : 0.2);
        heroGroupRef.current.rotation.x = Math.sin(clock.elapsedTime * (isFrantic ? 10 : 0.5)) * 0.1;
      }
    }

    if (debrisGroupRef.current) {
      debrisGroupRef.current.rotation.y += delta * 0.05;
      debrisGroupRef.current.position.y = Math.sin(clock.elapsedTime * 0.2) * 2;
    }

    // --- 5. IDLE / FRANTIC SLICE ANIMATION ---
    const anim = animState.current;
    if (!anim.isAnimating) {
      const shouldTriggerIdle = zoom < 0.1 && (clock.elapsedTime - anim.lastAnimTime > 2.0 + Math.random());
      
      if (isFrantic || shouldTriggerIdle) {
        const axisIdx = Math.floor(Math.random() * 3);
        const axis = _axes[axisIdx];
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
      const speed = isFrantic ? 15.0 : 2.5; 
      anim.progress += delta * speed;
      const t = Math.min(anim.progress, 1.0);
      
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
        
        for (let j = 0; j < anim.activeIndices.length; j++) {
          const meshIdx = anim.activeIndices[j];
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
      }
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
