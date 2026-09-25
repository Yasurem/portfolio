import * as THREE from 'three';

// =========================================================================
// 🎛️ INDEPENDENT ALIGNMENT CONTROLS
// =========================================================================

// --- 1. THE HERO (Rubik's Cube) ---
export const HERO_SCALE: [number, number, number] = [5, 5, 5];
export const HERO_MESH_POSITION: [number, number, number] = [0, 0.76, 0]; 
export const RUBIKS_CUBE_SPACING = 0.76; 

// --- 2. CAMERA: UNFOCUSED (Idle State) ---
export const CAMERA_UNFOCUSED_POS = new THREE.Vector3(0, 0, 30); 

// Rubik's Colors Palette (Extracted from Brain Illustration)
export const PALETTE = ['#FF3B7C', '#FF7A00', '#88E716', '#00C3FF', '#7E8FAD', '#171B33'];

export const DESKTOP_DPR: [number, number] = [1, 2];
export const MOBILE_DPR: [number, number] = [1, 1.5];
