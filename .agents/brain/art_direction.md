# Art Direction & Styling Guidelines

**Purpose:** This file contains the aesthetic choices, visual identity, and styling rules for the portfolio to ensure LLMs do not overwrite the art style in future sessions.

### 1. 3D Aesthetics (React Three Fiber)
- **Cel-Shading:** The 3D elements (like the Rubik's Cube) must have a cel-shaded/comic-book look. Do NOT optimize this away. We achieve this using the `<Edges>` component from `@react-three/drei`.
- **Edge Props:** `<Edges scale={1.02} threshold={15} color="#0b1021" />`

### 2. UI Styling (Tailwind CSS)
- **Color Palette:** (Wait for user to define specific palette).
- **FOUC Prevention:** Hidden elements waiting for GSAP animations should be hidden using native Tailwind classes (e.g., `clip-path` or `opacity-0`), not inline GSAP `tl.set()` calls.

### 3. General Vibe
- The UI should feel mathematically precise, heavily animated, but highly performant. Do not use generic, unstyled components.
