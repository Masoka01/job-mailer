---
version: "alpha"
name: "Retro-Futurism"
description: "Retro-futuristic (cyberpunk/vaporwave) interface with neon colors (blue, pink, cyan), deep black background, 80s aesthetic, CRT scanlines, glitch effects, neon glow text/borders, monospace fonts, geometric patterns. Ideal for landing pages, saas. AI-ready template."
colors:
  primary: "#0080FF"
  secondary: "#FF006E"
  tertiary: "#00FFFF"
  neutral: "#1A1A2E"
  surface: "#5D34D0"
  accent: "#C0C0C0"
typography:
  h1:
    fontFamily: monospace
    fontSize: 2.25rem
    fontWeight: 700
  body-md:
    fontFamily: monospace
    fontSize: 1rem
    fontWeight: 400
  label-caps:
    fontFamily: monospace
    fontSize: 0.75rem
    fontWeight: 500
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    padding: 12px
---

## Overview

Retro-futuristic (cyberpunk/vaporwave) interface with neon colors (blue, pink, cyan), deep black background, 80s aesthetic, CRT scanlines, glitch effects, neon glow text/borders, monospace fonts, geometric patterns. Ideal for landing pages, saas. AI-ready template. Retro-futurism didn't start as a design trend. It started as a feeling — that electric hum of Vangelis synths over rain-soaked Los Angeles in Blade Runner, the light-cycle grids of Tron. These films didn't just imagine the future; they built an aesthetic language that refused to die. For decades it lived in the margins, in VHS cover art and forgotten arcade cabinets.

Then synthwave happened. Musicians like Kavinsky and Perturbator weren't just making music — they were art-directing an entire visual movement. Album covers became mood boards. The neon grids, the chrome type, the sunset gradients — suddenly designers had a shared vocabulary that felt both familiar and impossibly cool.

Stranger Things blew the door wide open in 2016. What had been a niche nostalgia play became mainstream visual language overnight. But here's what matters: it stuck. Unlike most nostalgia cycles that burn hot and vanish, retro-futurism evolved into a legitimate design system. Designers learned to extract the principles — the contrast, the glow, the geometry — without requiring a DeLorean in every hero image.

- Density: 5/10 — Balanced
- Variance: 8/10 — Expressive
- Motion: 4/10 — Subtle

- **Style:** Nostalgic, Neon, Futuristic, Retro
- **Keywords:** Vintage sci-fi, 80s aesthetic, neon glow, geometric patterns, CRT scanlines, pixel art, cyberpunk, synthwave
- **Era:** 1980s Retro
- **Light/Dark:** ✓ Full / ✓ Dark focused

## Colors

- **Neon Blue** (#0080FF) — Accent highlight, links and focus states
- **Hot Pink** (#FF006E) — Primary text color
- **Cyan** (#00FFFF) — Accent highlight, links and focus states
- **Deep Black** (#1A1A2E) — Dark surface, primary background
- **Purple** (#5D34D0) — Accent color, emphasis elements
- **Metallic Silver** (#C0C0C0) — Extended palette, decorative use
- **Gold** (#FFD700) — Premium accent, decorative highlights
- **80s Pink** (#FF10F0) — Primary text color


## Typography

- **Display / Hero:** monospace — Weight 700, tight tracking, used for headline impact
- **Body:** monospace — Weight 400, 16px/1.6 line-height, max 72ch per line
- **UI Labels / Captions:** monospace — 0.875rem, weight 500, slight letter-spacing
- **Monospace:** monospace — Used for code, metadata, and technical values

Scale:
- Hero: clamp(2.5rem, 5vw, 4rem)
- H1: 2.25rem
- H2: 1.5rem
- Body: 1rem / 1.6
- Small: 0.875rem


## Layout

- **Grid:** CSS Grid primary. Max-width containment: 1280px centered with 1.5rem side padding.
- **Spacing rhythm:** Balanced. Base unit: 0.5rem (8px).
- **Section vertical gaps:** clamp(4rem, 8vw, 8rem).
- **Hero layout:** Asymmetric composition.
- **Feature sections:** Asymmetric grid with varied card sizes. No 3-equal-columns.
- **Mobile collapse:** All multi-column layouts collapse below 768px. No horizontal overflow.
- **z-index contract:** base (0) / sticky-nav (100) / overlay (200) / modal (300) / toast (500).


## Elevation & Depth

CRT scanlines (::before overlay), neon glow (text-shadow+box-shadow), glitch effects (skew/offset keyframes)

- **Physics:** Ease-out curves, 200-300ms duration. Smooth and predictable.
- **Entry animations:** Fade + translate-Y (16px → 0) over 420ms ease-out. Staggered cascades for lists: 80ms between items.
- **Hover states:** Subtle color shift + shadow adjustment over 200ms.
- **Page transitions:** Fade only (200ms).
- **Performance:** Only transform and opacity animated. No layout-triggering properties.


## Shapes

Base corner radius: 8px. See rounded tokens in front matter for the full scale.


## Components

- **Primary Button:** Subtly rounded (0.5rem) shape. Accent color fill. Hover: 8% darken + subtle lift shadow. Active: -1px translate tactile press. Font weight 600. No outer glows.
- **Secondary / Ghost Button:** Outline variant. 1.5px border in muted color. Text in primary color. Hover: subtle background fill.
- **Cards:** Subtly rounded (0.5rem) corners. Surface background. Subtle shadow (0 2px 12px rgba(0,0,0,0.06)). 1px border stroke.
- **Inputs:** Label above input. 1px border stroke. Focus ring: 2px accent color offset 2px. Error text below in semantic red. No floating labels.
- **Navigation:** Primary surface background. Active item: accent color indicator. Font weight 500 when active.
- **Skeletons:** Shimmer animation matching component dimensions. No circular spinners.
- **Empty States:** Icon-based composition with descriptive text and action button.


## Do's and Don'ts

- No emojis in UI — use icon system only (Lucide, Heroicons)
- No pure white (#FFFFFF) backgrounds — use off-white or dark surfaces
- No oversaturated accent colors (saturation cap: 80%)
- No 3-column equal-width feature layouts — use zig-zag or asymmetric grid
- No `h-screen` — use `min-h-[100dvh]`
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen"
- No broken external image links — use picsum.photos or inline SVG
- No generic lorem ipsum in demos

- Do Neon colors used
- Do CRT scanlines effect
- Do Glitch animations active
- Do Monospace font
- Do Deep black background
- Do Glow effects applied
- Do 80s patterns present


## Use Case

Landing pages, SaaS

<!-- Source: https://designmd.app/library/retro-futurism · designmd.app -->
