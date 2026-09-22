---
name: portfolio-frontend-performance
description: >-
  Use this skill to ensure highly animated or 3D frontend components remain highly performant.
---

# Frontend Performance Guidelines

For a highly animated Next.js portfolio, preventing layout thrashing and main-thread blocking is critical.

## 1. Dynamic Imports
Always lazy-load heavy animation libraries or 3D components if they aren't above the fold.
```tsx
import dynamic from 'next/dynamic'
// Load 3D Canvas only on client, and only when needed
const Scene = dynamic(() => import('@/components/animations/Scene'), { ssr: false })
```

## 2. Image Optimization
- Never use standard `<img>` tags. Always use `next/image` (`<Image />`).
- Prioritize LCP (Largest Contentful Paint) images by adding the `priority` prop.

## 3. Animation Performance
- **CSS / GSAP**: Only animate `transform` and `opacity`. Animating `width`, `height`, `top`, or `left` triggers layout recalculations (reflows) which kill frame rates.
- **Will-Change**: Use the CSS `will-change: transform` property on elements that are about to be heavily animated, but remove it once the animation completes to free up GPU memory.

## 4. Web Fonts
- Use `next/font` (e.g., `next/font/google` or `next/font/local`) to automatically self-host fonts and prevent layout shifts (CLS).
