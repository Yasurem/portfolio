---
name: portfolio-nextjs-bff
description: >-
  Use this skill when scaffolding or modifying the Next.js Frontend/BFF code.
---

# Next.js BFF Development Guidelines

## Project Structure
- `app/`: Next.js App Router layout, pages, and loading states.
- `components/`: Reusable React components (shadcn/ui or custom Tailwind components).
- `lib/`: Utility functions and shared types.
- `server/`: Next.js Server Actions that act as the Backend-For-Frontend, making requests to FastAPI or Supabase.

## Best Practices
1. **Server Components First**: Default to React Server Components (RSC) to reduce client-side JavaScript. Only use `"use client"` when interactivity (hooks, state) is necessary.
2. **Server Actions for Mutations**: Use Next.js Server Actions in the `server/` directory for data mutations. These actions should call out to FastAPI endpoints or Supabase APIs.
3. **Tailwind CSS**: Use Tailwind for all styling. Maintain a clean `tailwind.config.ts`.
4. **Environment Variables**: Never expose `NEXT_PUBLIC_` variables unless absolutely necessary. Keep secrets in the Server Actions/Server Components.

## Command Reference
- Run Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
