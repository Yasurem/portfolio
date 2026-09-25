---
name: portfolio-3d-r3f
description: >-
  Assign this skill to a sub-agent when implementing 3D graphics, models, and 3D handlers using React Three Fiber and Three.js in the frontend.
---

# React Three Fiber (3D) Guidelines

## Best Practices
1. **Canvas Placement**: The `<Canvas>` component from `@react-three/fiber` must be placed in a Client Component (`"use client"`). Keep the Canvas as high up in the component tree as possible (e.g., full screen background) and use HTML overlays for text, rather than nesting multiple Canvases.
2. **Model Loading**: 
   - Use `@react-three/drei`'s `useGLTF` hook to load `.gltf` or `.glb` models.
   - Always wrap 3D components that load assets in a `<Suspense>` boundary to prevent the app from crashing while assets download.
3. **Performance Optimization (The 3D Handler)**:
   - Use `useFrame` sparingly. If animating within `useFrame`, do not instantiate new objects (like `new THREE.Vector3()`) inside the loop. Declare them outside and mutate them to prevent garbage collection stutter.
   - Set `dpr={[1, 2]}` on the Canvas to cap pixel ratio on high-res screens (saves GPU).
4. **HTML Integration**: Use the `<Html>` component from `@react-three/drei` to project standard DOM elements into the 3D scene (like tooltips or labels).

## Installation Reference
If not installed, you will need:
`npm install three @react-three/fiber @react-three/drei`
`npm install -D @types/three`
