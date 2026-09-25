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

## 2. Skill-to-Agent Assignment Matrix

This matrix maps which skills should be assigned to which agent. The Orchestrator should reference this when dispatching tasks.

| Agent | Primary Skills | Auditor Skills |
|---|---|---|
| `frontend-ui-ux-designer` | `portfolio-nextjs-bff`, `portfolio-frontend-performance` | `portfolio-system-design-auditor` |
| `frontend-gsap-motion-designer` | `portfolio-animations`, `portfolio-frontend-performance` | — |
| `frontend-r3f-architect` | `portfolio-3d-r3f`, `portfolio-frontend-performance` | — |
| `frontend-webgl-engineer` | `portfolio-3d-r3f`, `portfolio-frontend-performance` | — |
| `backend-fastapi-architect` | `portfolio-fastapi-backend` | `portfolio-system-design-auditor` |
| `backend-supabase-specialist` | `portfolio-supabase-db` | `portfolio-system-design-auditor` |

**Cross-cutting skills** (assigned by the Orchestrator as needed):
- `portfolio-checkpointing` — Any agent performing major refactors
- `portfolio-explainer` — Any agent asked to explain changes
- `portfolio-workspace-manager` — Any agent operating in a shadow workspace

---

## 3. The Operating Workflows

### **Workflow A: The Actor-Critic (QA) Loop**
- **How it works:** When a Developer agent (e.g., `frontend-ui-ux-designer`) writes a new component, the Lead Architect concurrently spawns a QA agent to write tests for that component. They talk directly to each other in a loop until the tests pass, completely shielding the user from broken code.

### **Workflow B: Shadow Sandboxing (Branch Explorations)**
- **How it works:** When executing highly volatile experiments (like refactoring a 3D WebGL scene), the Lead Architect spawns the sub-agent in an isolated "Shadow Workspace" (`Workspace: branch`). The agent can fail, break the build, and experiment safely without polluting the main codebase.

### **Workflow C: Contract-Driven Parallel Execution**
- **How it works:** When building full-stack features, an API contract is defined first. Then, the Frontend and Backend agents are spawned *at the same time*. The Frontend agent builds the UI using mock data based on the contract, while the Backend agent builds the actual logic.

---

## 4. Escalation Protocol

When a sub-agent cannot complete its task, it **MUST** escalate using a structured JSON payload rather than silently failing or looping forever.

### Escalation Triggers
- **TTL_EXCEEDED:** The agent has hit the maximum allowed attempts (default: 5) without success.
- **BLOCKED:** The agent cannot proceed due to a missing dependency, unclear requirement, or a file outside its scope.
- **CONTEXT_OVERFLOW:** The agent's context window is filling up and it cannot absorb more code.
- **BUILD_FAILURE:** The code compiles but causes runtime errors the agent cannot diagnose.

### Required Escalation Payload
```json
{
  "status": "escalated",
  "agent": "frontend-webgl-engineer",
  "reason": "TTL_EXCEEDED",
  "attempts": 5,
  "last_error": "WebGL context lost after shader compilation on line 42",
  "files_modified": ["frontend/components/hero/shaders/cel.frag"],
  "partial_commit": "abc123f",
  "recommendation": "Consider simplifying the shader or splitting into two render passes"
}
```

### Orchestrator Response Protocol
1. If `reason` is `BLOCKED` → Check if another agent can unblock, or ask the user.
2. If `reason` is `TTL_EXCEEDED` → Freeze the workspace, present partial progress to the user, and ask for guidance.
3. If `reason` is `BUILD_FAILURE` → Spawn a QA agent to diagnose, or escalate to the user.
4. If `reason` is `CONTEXT_OVERFLOW` → Commit progress, spawn a fresh agent to continue from the checkpoint.

---

## 5. The Memory System (The Brain)
To prevent context bloat and hallucination, memory is highly fragmented using Progressive Disclosure:
- `LLM_CONTEXT.md`: A lightweight router/index at the root.
- `.agents/brain/current_focus.md`: Auto-updating short-term memory (what we just finished doing).
- `.agents/brain/art_direction.md`: Permanent aesthetic rules.
- `.agents/brain/architecture.md`: Hard tech-stack boundaries.
- `.agents/brain/vision_3d_roadmap/`: Phase-based roadmap for 3D QA infrastructure.
- `.agents/brain/ideas.md`: Backlog of future optimizations (not active).
