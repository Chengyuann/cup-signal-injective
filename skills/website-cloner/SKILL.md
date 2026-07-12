---
name: website-cloner
source: JCodesMore/ai-website-cloner-template adapted for this repo
purpose: Learn a target website's design system and interaction model, then rebuild an original implementation for Cup Signal without copying third-party proprietary code, brand assets, or protected media.
---

# Website Cloner Skill

Use this workflow when asked to clone, mirror, learn from, or rebuild a website.

## Safety Boundary

- Do not ship third-party proprietary source code, bundle code, logos, copy, images, video, fonts, or brand-identifying assets unless the user owns them or they are explicitly licensed for reuse.
- For third-party inspiration sites, extract and document visual/interaction principles, then implement original assets, original copy, and original component code.
- For user-owned sites, exact asset preservation is allowed if the user confirms ownership.

## Workflow

1. Pre-flight
- Verify browser automation works.
- Verify local project builds before changes.
- Create research folders under `work/research/<hostname>/` and screenshots under `outputs/`.

2. Reconnaissance
- Capture desktop and mobile screenshots when possible.
- Extract title, meta description, fonts, colors, scripts, canvas/video/img/svg counts, and global CSS.
- Sweep scroll/click/hover/responsive states. For canvas-heavy sites, record observable behavior and implementation constraints rather than expecting DOM sections.

3. Research Artifacts
Create:
- `work/research/<hostname>/DESIGN_TOKENS.md`
- `work/research/<hostname>/INTERACTION_PATTERNS.md`
- `work/research/<hostname>/PAGE_TOPOLOGY.md`
- `work/research/<hostname>/IMPLEMENTATION_PLAN.md`

4. Foundation
- Map target principles into the current repo's stack.
- Keep current product content and data model intact.
- Add original motion layers, typography rhythm, section architecture, and interactions.

5. Build
- Break work into small components/sections.
- Preserve compile-ability after each major phase.
- Prefer CSS/React/canvas written locally over copied third-party code.

6. QA
- Run build and domain-specific checks.
- Run Playwright desktop and mobile screenshots.
- Verify no stale content, broken images, console errors, or overlapping text.
- If deploying, wait for Pages and verify the live URL with cache buster.

## Active Theory Style Translation Notes

When learning from Active Theory specifically:
- Use black theatrical stage, large sparse typography, minimal fixed nav, and a custom cursor/pointer field.
- Use WebGL/canvas-like kinetic backgrounds, scanlines, particle trails, pointer-reactive nodes, and inertia.
- Use project-studio pacing: full-viewport hero, marquee/status rail, immersive work sections, strong motion transitions.
- Do not copy Active Theory assets, exact layout, exact copy, brand marks, bundle logic, or fonts. Use original Cup Signal visual language and assets.
