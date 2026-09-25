# Vision & 3D Storytelling Roadmap

**Purpose:** This master plan defines the architectural roadmap for integrating Agentic Visual QA, 3D Isolation, and Performance Telemetry into the portfolio's storytelling frontend. It acts as the anchor against context drift.

### Core Philosophy: "Animation IS the Architecture"
For this project, standard DOM layouts are secondary to the global GSAP timelines and React Three Fiber (R3F) canvas.

### The 4-Pillar QA Infrastructure Plan

1. **Phase 1: Component Isolation (Storybook)**
   - **Goal:** Isolate 3D R3F components and GSAP animations away from Next.js page routing.
   - **Why:** Agents cannot effectively test or iterate on a 3D cube if they have to load the entire Next.js application stack. Storybook provides a sterile environment.

2. **Phase 2: Performance Telemetry (r3f-perf & Leva)**
   - **Goal:** Expose pure mathematical telemetry (FPS, Draw Calls, GPU Memory) as JSON.
   - **Why:** Before an agent "looks" at a model, it must ensure the model doesn't crash the browser. Agents can read JSON telemetry to optimize shaders and geometries autonomously.

3. **Phase 3: Visual Actor-Critic (Playwright + Gemini Vision)**
   - **Goal:** Implement headless browser snapshots passed to multimodal vision models.
   - **Why:** Allows agents to "see" if a 3D model is clipping into text or if lighting is broken.

4. **Phase 4: Visual Regression CI/CD (Chromatic / Percy)**
   - **Goal:** Pixel-perfect differential testing on every commit.
   - **Why:** Prevents fixing an animation in the Hero section from accidentally breaking a ScrollTrigger in the Footer.
