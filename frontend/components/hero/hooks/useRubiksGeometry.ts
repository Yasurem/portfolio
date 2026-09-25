import { useMemo } from 'react';
import * as THREE from 'three';
import { PALETTE, RUBIKS_CUBE_SPACING } from '../constants';

export interface RubiksPiece {
  mesh: THREE.Mesh;
  isFlat: boolean;
  pos: THREE.Vector3;
  material: THREE.Material;
}

export interface DebrisPiece {
  mesh: THREE.Mesh;
  pos: THREE.Vector3;
  rot: THREE.Euler;
}

export function useRubiksGeometry(meshes: THREE.Mesh[], nodes: { [name: string]: THREE.Object3D }) {
  return useMemo(() => {
    // Deterministic random generator for consistent rendering between SSR and client
    let seed = 12345;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

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
    const flatMeshes = rawFlatMeshes.sort(() => 0.5 - random());
    const otherMeshes = meshes.filter(m => !rawFlatMeshes.includes(m)).sort(() => 0.5 - random());

    const rubiks: RubiksPiece[] = [];
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
    const debris: DebrisPiece[] = remainingMeshes.map((mesh) => {
      const px = random() * 40 - 5; 
      const py = random() * 40 - 20;
      const pz = -random() * 50 - 15; 

      const randRot = new THREE.Euler(
        random() * Math.PI * 2,
        random() * Math.PI * 2,
        random() * Math.PI * 2
      );

      return { mesh, pos: new THREE.Vector3(px, py, pz), rot: randRot };
    });

    return { rubiksPieces: rubiks, debrisPieces: debris };
  }, [meshes, nodes]);
}
