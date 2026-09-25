---
name: portfolio-animations
description: >-
  Assign this skill to a sub-agent when implementing GSAP animations and scroll-linked effects in the Next.js frontend.
---

# Animation Guidelines (GSAP in React)

## General Strategy
- **GSAP** is the **exclusive** animation library for this project. Use it for complex timelines, ScrollTrigger animations, overarching page transitions, micro-interactions, and SVG path tracing.
- Do **NOT** introduce Anime.js, Framer Motion, React Spring, or any other animation library.

## GSAP + React Best Practices
1. **Always use `@gsap/react`**: Use the `useGSAP()` hook instead of `useEffect()` for GSAP animations. This handles React 18 Strict Mode cleanup automatically.
2. **Scoping**: Always pass a `ref` scope to `useGSAP({ scope: containerRef })` to limit selector queries to the component, preventing clashes across the app.
3. **FOUC (Flash of Unstyled Content)**: For elements that animate in on load, set them to `visibility: hidden` or `opacity: 0` in Tailwind first, then let GSAP reveal them.

## Code Example
```tsx
"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function AnimatedSection() {
  const container = useRef(null);

  useGSAP(() => {
    gsap.from(".box", { y: 100, opacity: 0, stagger: 0.1 });
  }, { scope: container });

  return (
    <div ref={container}>
      <div className="box invisible">Box 1</div>
      <div className="box invisible">Box 2</div>
    </div>
  );
}
```
