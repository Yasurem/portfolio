# Development Roadmap (Iterative Delivery)

This roadmap follows a "Vertical Slice" and MVP (Minimum Viable Product) philosophy. Every iteration results in a fully shippable, deployable product.

## Iteration 1: The Walking Skeleton (v0.1)
**Goal:** A deployed, bare-bones application proving the decoupled architecture works.
- [ ] Frontend: Next.js landing page with a basic Tailwind layout and a simple GSAP fade-in.
- [ ] Backend: FastAPI health-check endpoint (`/api/health`).
- [ ] Integration: Next.js Server Action fetches from FastAPI to display a "System Online" status.
- [ ] DevOps: Docker compose verified; ready for initial deployment.

## Iteration 2: The Animated Experience (v0.2)
**Goal:** A visually impressive static portfolio.
- [ ] Frontend: GSAP ScrollTrigger implementations for project showcases.
- [ ] Frontend: Anime.js micro-interactions on buttons/links.
- [ ] Frontend: React Three Fiber (R3F) base canvas setup with a placeholder 3D object.

## Iteration 3: The Learning Auditor (v0.3)
**Goal:** Dynamic data tracking using the database.
- [ ] Database: Supabase schema for `learning_sessions` and RLS policies.
- [ ] Backend: FastAPI CRUD routes for audits with Pydantic validation.
- [ ] Frontend: Server Actions to fetch/mutate data and an animated dashboard to display stats.

## Iteration 4: The AI Chatbot (v0.4)
**Goal:** Interactive LLM assistant for visitors.
- [ ] Backend: Integrate LLM API in FastAPI with streaming capabilities.
- [ ] Frontend: Chat UI component with streaming text support.
- [ ] Database: Log chat histories in Supabase.
