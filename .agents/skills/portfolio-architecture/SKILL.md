---
name: portfolio-architecture
description: >-
  Use this skill to understand the high-level architecture of the Portfolio project.
  It details how Next.js (BFF), FastAPI (Backend), and Supabase (DB) interact.
---

# Portfolio Project Architecture

This document describes the architectural layout of the Portfolio website.

## Tech Stack Overview
1. **Frontend & BFF**: Next.js (App Router, Server Actions)
2. **Backend**: FastAPI (Python)
3. **Database & Auth**: Supabase (PostgreSQL, Storage, Auth)

## Data Flow
- **Client (Browser)** -> communicates with -> **Next.js (BFF)**
- **Next.js (BFF)** -> communicates with -> **FastAPI** (for complex logic, data processing) or **Supabase** (for direct UI-driven CRUD if safe)
- **FastAPI** -> communicates with -> **Supabase** (Database operations, admin tasks)

## Guidelines
- Keep complex business logic out of the Next.js frontend. Push it to FastAPI.
- Use Next.js mainly for UI routing, SSR/SSG, styling (Tailwind), and orchestration.
- Supabase should act as the single source of truth. Use Row Level Security (RLS) extensively.
- For AI or compute-heavy tasks, always rely on the FastAPI microservice.
