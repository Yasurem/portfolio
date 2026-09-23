# Portfolio Theme Guidelines

## Vibe & Aesthetic
**Dark-mode Developer Portfolio** blending a clean tech aesthetic with playful, lo-fi personal touches.
- **Core:** Deep obsidian and charcoal canvas with a subtle dark grid pattern.
- **Accents:** Glowing tech-inspired burgundy/maroon instead of traditional neon colors.
- **Feel:** Pragmatic, delivery-oriented, but warm and personalized.

## Color Palette ("Midnight Maroon & Lo-Fi")

| Role | Color Name | Hex Code | CSS Variable | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Background** | Obsidian | `#0A0A0A` | `var(--color-background)` | Primary deep canvas background. |
| **Surface** | Charcoal | `#212121` | `var(--color-charcoal)` | UI sub-elements, grid lines, cards. |
| **Primary Accent** | Burgundy Glow | `#C70039` | `var(--color-primary)` | Glowing borders, active states, key highlights. |
| **Secondary Accent** | Sand Peach | `#F5E6D3` | `var(--color-sand-peach)` | Playful lo-fi contrast for badges, secondary tags. |
| **Highlight** | Lo-Fi Lavender | `#BEB7DF` | `var(--color-lofi)` | Subtle highlights, computational animations. |
| **Text Primary** | Off-White | `#FDFDFD` | `var(--color-foreground)` | Main body and heading text. |

## Typography

- **Headings (`font-heading`):** `Outfit`
  - *Usage:* Clean, modern, rounder aesthetic for large impactful titles (H1, H2, H3).
- **Body & Accents (`font-sans`):** `Inter`
  - *Usage:* High legibility for paragraphs, technical descriptions, buttons, and UI elements.

## UI Design Patterns

1. **Glow Effects:** Use CSS `color-mix` to create dynamic shadows based on the primary color variable.
   - *Tailwind Example:* `shadow-[0_0_10px_color-mix(in_srgb,var(--color-primary)_30%,transparent)]`
2. **Subtle Grids:** Use the Charcoal color (`#212121`) for thin background grid strokes to emphasize the engineering aesthetic without overpowering the text.
3. **Image Portals:** Frame primary images (like the hero profile) in large circular portals with dashed/segmented borders glowing in the primary Burgundy color.
