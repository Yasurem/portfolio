# LLM Context Index

**Purpose:** This is the entry point for the LLM Lead Architect. This file is kept intentionally small. For deep context, use `view_file` to read the specific "Brain" files located in `.agents/brain/` based on the user's request.

---

### 1. Context Brain Menu
If the user's prompt involves any of these topics, you MUST read the corresponding brain file before planning:
- **What did we just do? / What are we working on?** -> Read `.agents/brain/current_focus.md`
- **Styling, Colors, or 3D Aesthetics?** -> Read `.agents/brain/art_direction.md`
- **Folder structure, Next.js, or FastAPI rules?** -> Read `.agents/brain/architecture.md`
- **Playwright, 3D Models, Visual QA, or Storytelling architecture?** -> Read `.agents/brain/vision_3d_roadmap/master_plan.md` and `current_state.md`

### 2. Sub-Agent Roster
Do not write code yourself. Delegate to these specific personas in `.agents/agents/`:
- `frontend-ui-ux-designer` (Tailwind, a11y, layout)
- `frontend-gsap-motion-designer` (DOM animation, GSAP)
- `frontend-webgl-engineer` (Raw Three.js, shaders, draw calls)
- `frontend-r3f-architect` (React Three Fiber, hydration)
- `backend-fastapi-architect` (Python routing, Pydantic)
- `backend-supabase-specialist` (PostgreSQL, RLS)

### 3. Agentic Workflows
- **QA Testing:** Use `portfolio-qa-tester` to spawn a QA subagent to check developer code.
- **Visual 3D Testing:** Use the archived visual testing approach to spawn Playwright/Gemini-Vision loops for Three.js.
- **Sandboxing:** Use `Workspace: 'branch'` when testing experimental R3F/GSAP code.
