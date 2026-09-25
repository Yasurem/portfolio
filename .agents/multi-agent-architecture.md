# Multi-Agent Architecture & Workflow Structure

This document outlines the hierarchy, personas, and operating procedures of the Antigravity multi-agent system used in this monorepo.

## 1. The Hierarchy (Chain of Command)

### **The User (You)**
- **Role:** Product Owner & Visionary.
- **Function:** Defines high-level goals, approves architectural plans, and provides art direction.

### **The Lead Architect (The Primary LLM)**
- **Role:** Orchestrator & Project Manager.
- **Brain/Memory:** Guided strictly by `GEMINI.md` and the `.agents/brain/` context files.
- **Function:** NEVER writes code for complex tasks. Receives user requests, formulates a technical plan, selects the right sub-agents, dispatches tasks, and synthesizes the final output.

### **The Sub-Agents (The Execution Team)**
- **Location:** Defined in `.agents/agents/`
- **Function:** Domain-specific experts that run concurrently in the background to write, test, and refactor code. 
- **The Current Roster:**
  - `frontend-ui-ux-designer` (Tailwind, A11y, Layouts)
  - `frontend-gsap-motion-designer` (DOM Animations, ScrollTriggers)
  - `frontend-webgl-engineer` (Raw Three.js, Shaders, WebGL)
  - `frontend-r3f-architect` (React Three Fiber, Hydration, State)
  - `backend-fastapi-architect` (Python API, Pydantic)
  - `backend-supabase-specialist` (Postgres, RLS, pgvector)

---

## 2. The Operating Workflows

### **Workflow A: The Actor-Critic (QA) Loop**
- **How it works:** When a Developer agent (e.g., `frontend-ui-ux-designer`) writes a new component, the Lead Architect concurrently spawns a QA agent to write tests for that component. They talk directly to each other in a loop until the tests pass, completely shielding the user from broken code.

### **Workflow B: Shadow Sandboxing (Branch Explorations)**
- **How it works:** When executing highly volatile experiments (like refactoring a 3D WebGL scene), the Lead Architect spawns the sub-agent in an isolated "Shadow Workspace" (`Workspace: branch`). The agent can fail, break the build, and experiment safely without polluting the main codebase.

### **Workflow C: Contract-Driven Parallel Execution**
- **How it works:** When building full-stack features, an API contract is defined first. Then, the Frontend and Backend agents are spawned *at the same time*. The Frontend agent builds the UI using mock data based on the contract, while the Backend agent builds the actual database logic.

---

## 3. The Memory System (The Brain)
To prevent context bloat and hallucination, memory is highly fragmented using Progressive Disclosure:
- `LLM_CONTEXT.md`: A lightweight router/index at the root.
- `.agents/brain/current_focus.md`: Auto-updating short-term memory (what we just finished doing).
- `.agents/brain/art_direction.md`: Permanent aesthetic rules.
- `.agents/brain/architecture.md`: Hard tech-stack boundaries.
