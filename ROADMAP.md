# Development Roadmap (Iterative Delivery)

This roadmap follows a "Vertical Slice" and MVP (Minimum Viable Product) philosophy. Every iteration results in a fully shippable, deployable product.

## Iteration 1: The Walking Skeleton (v0.1) - ✅ COMPLETED
**Goal:** A deployed, bare-bones application proving the decoupled architecture works.
- [x] Frontend: Next.js landing page with a basic Tailwind layout and a simple GSAP fade-in.
- [x] Backend: FastAPI health-check endpoint (`/api/health`).
- [x] Integration: Next.js Server Action fetches from FastAPI to display a "System Online" status.
- [x] DevOps: Docker compose verified; ready for initial deployment.

## Iteration 2: The Animated Experience (v0.2) - ✅ COMPLETED
**Goal:** A visually impressive static portfolio.
- [x] Frontend: GSAP ScrollTrigger implementations for project showcases.
- [x] Frontend: Cinematic GSAP motion transitions integrated.
- [x] Frontend: React Three Fiber (R3F) base canvas setup with fully working 3D Rubik's Cube.

## Iteration 3: Storybook Isolation & Component Testing - ✅ COMPLETED
**Goal:** Isolate complex components for visual testing.
- [x] Frontend: Storybook initialized.
- [x] Frontend: Stories created for `Chat.tsx` and `Hero3DRubiks`.

## Iteration 4: The AI Chatbot MVP (v0.4) - 🚧 IN PROGRESS
**Goal:** Interactive LLM assistant for visitors.
- [x] Backend: Scaffolded FastAPI streaming endpoint (`POST /api/chat/stream`).
- [x] Frontend: Chat UI component (`Chat.tsx`) with raw fetch/SSE streaming support.
- [ ] Integration: Perfect the contract-driven SSE link between Next.js and FastAPI.
- [ ] Database: Log chat histories in Supabase.

## Iteration 5: The Learning Auditor & Performance (v0.5) - 🔮 UPCOMING
**Goal:** Dynamic data tracking and WebGL telemetry.
- [ ] Frontend: `r3f-perf` + `leva` for JSON-exportable performance telemetry.
- [ ] Database: Supabase schema for `learning_sessions` and RLS policies.
- [ ] Backend: FastAPI CRUD routes for audits with Pydantic validation.
