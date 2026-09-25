# Current Project Focus & Short-Term Memory

**Purpose:** This file acts as the short-term memory between LLM sessions. It is updated by the Lead Architect at the end of every major task.

### Last Completed Task
- **Multi-Agent Workflow Restructuring:** Audited and overhauled the entire `.agents/` infrastructure. Fixed inconsistent agent directory structure, deduplicated agent definitions vs skill files, added file scope boundaries, removed phantom dependencies (Anime.js, Framer Motion), added escalation protocol, and created a skill-to-agent assignment matrix.
- **Architecture & Multi-Agent Rules:** Implemented enforced JSON Protocols for sub-agent communication and Time-to-Live caps for shadow workspaces.
- **Chatbot MVP (Contract-Driven):** Drafted and approved the `api_contract.md` for Next.js -> FastAPI communication.
- **Frontend:** Implemented `Chat.tsx` utilizing raw `fetch` and `TextDecoder` to cleanly process Server-Sent Events (SSE). Hooked it up to `page.tsx`.
- **Backend:** Scaffolded the FastAPI streaming endpoint (`POST /api/chat/stream`) with mocked SSE streaming and CORS configured for `localhost:3000`.
- **UI Update:** Replaced the 'Initialize Sequence' button in the 3D Hero (`HeroOverlayText.tsx`) with a functional 'Download CV' link pointing to `/src/CV_Castillo, Joemarc Jr. D. (1).pdf`.
- **Architectural Pivot:** Officially established the "Storytelling / Frontend-First" architecture. Created `.agents/brain/vision_3d_roadmap/` to anchor Phase 1 (Storybook) through Phase 4 (Visual QA).

### Current Phase (Vision & 3D Roadmap)
- We are currently executing **Phase 2: Performance Telemetry** (`r3f-perf` + `leva`).
- Phase 1 (Storybook Isolation) is complete — Storybook is initialized and stories exist for `Chat.tsx` and `Hero3DRubiks`.
- Next milestone: Set up Playwright snapshot scripts (Phase 3).

### Next Steps
- Complete `r3f-perf` and `leva` integration for JSON-exportable performance telemetry.
- Establish the global animation infrastructure (master GSAP timelines, global R3F `<Canvas>`, ScrollTrigger wrappers) and perfect the Rubik's cube 3D motion transitions.
- Once the frontend motion architecture is solid, resume backend LLM integration and database state.
