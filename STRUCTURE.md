# Portfolio Project Structure

This document outlines the current file and directory structure of the Portfolio monorepo, which follows domain-driven design and BFF (Backend-for-Frontend) architecture.

```text
Portfolio/
├── .agents/                          # Antigravity Agent Configurations
│   └── skills/                       # Project-specific AI skills/runbooks
│       ├── portfolio-animations/
│       ├── portfolio-architecture/
│       ├── portfolio-fastapi-backend/
│       ├── portfolio-nextjs-bff/
│       └── portfolio-supabase-db/
├── backend/                          # FastAPI Python Microservice
│   ├── .env.example                  # Backend secrets template
│   ├── .gitignore
│   ├── Dockerfile                    # Backend container instructions
│   ├── main.py                       # FastAPI entry point
│   ├── requirements.txt              # Python dependencies
│   ├── api/                          # Route handlers (e.g., /audits)
│   ├── core/                         # Config, security, and app setup
│   ├── models/                       # Pydantic validation schemas
│   ├── services/                     # Business logic & Supabase client calls
│   └── venv/                         # Local Python virtual environment
├── frontend/                         # Next.js React Frontend
│   ├── .env.example                  # Frontend secrets template
│   ├── .gitignore
│   ├── Dockerfile                    # Frontend container instructions
│   ├── components/                   # Reusable React components
│   │   ├── animations/               # GSAP / Anime.js isolated components
│   │   └── ui/                       # Stateless Tailwind UI components
│   ├── app/                          # Next.js App Router (Pages & Layouts)
│   ├── lib/                          # Shared utilities
│   ├── server/                       # Next.js Server Actions (The BFF Layer)
│   ├── types/                        # TypeScript interfaces
│   ├── next.config.ts                # Next.js configuration
│   ├── package.json                  # Node dependencies
│   ├── tailwind.config.ts            # Tailwind CSS configuration
│   └── tsconfig.json                 # TypeScript configuration
├── supabase/                         # Database & Auth Configuration
│   └── config.toml                   # Local Supabase settings
├── docker-compose.yml                # Monorepo service orchestration
├── STRUCTURE.md                      # This file
├── ROADMAP.md                        # Project execution plan
└── AUDIT_LOG.md                      # Chronological log of changes
```
