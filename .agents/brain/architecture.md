# System Architecture & Technical Constraints

**Purpose:** This file defines the deep technical architecture of the monorepo.

### 1. The Decoupled Stack
- **Frontend (BFF):** Next.js App Router. Uses Server Actions for data mutation and fetching.
- **Backend (Microservice):** FastAPI (Python). Currently idle. Reserved for AI RAG chatbot logic.
- **Database:** Supabase (PostgreSQL). 

### 2. Frontend Structure Rules
- **`/components`:** Strictly for declarative React UI (`.tsx`). No heavy state or animation hooks allowed here.
- **`/hooks`:** All GSAP timelines, WebGL math, and heavy logic must be extracted here (e.g. `useRubiksAnimation.ts`).
- **`/public/img`:** All static SVGs and images must live here to be served via `next/image`.

### 3. Animation & 3D (GSAP vs R3F)
- **DOM Animation:** Handled exclusively via GSAP (and `@gsap/react`).
- **WebGL Math:** Handled via Three.js. Do NOT instantiate new `THREE.Vector3` or `THREE.Quaternion` objects inside `useFrame` or animation loops; pre-allocate them to prevent garbage collection stutters.
