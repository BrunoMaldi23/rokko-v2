<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:session-summary -->
# Session Summary

## Goal
- Finish the ROKKO uniform quote app, with the 3D preview focused on attractive garment-only GLB rendering.
- Keep the project lean by removing mannequin/fallback/dead-code paths that are no longer part of the product direction.

## Current 3D Direction
- The mannequin has been intentionally removed.
- The visualizer should render product/base garment GLBs only.
- `ProductGLB` is the active 3D path in `components/Visualizador3D.tsx`.
- `FittedGarment`, procedural mannequin extraction, `mannequin.glb`, `ThreePatch`, debug mannequin flags, and legacy model-viewer code have been removed.

## Relevant 3D Files
- `components/Visualizador3D.tsx`: garment-only Three/R3F visualizer.
- `lib/baseModels.ts`: maps detected garment types to `/models/base/*.glb`.
- `lib/garmentMap.ts`: decal/logo placement labels and base coordinates.
- `public/models/base/*.glb`: active static garment models.

## Validation Notes
- Production build was confirmed before cleanup with Next.js 16.2.6.
- After cleanup, run:
  - `npm run build`
  - local visual check in browser via `npm run dev`
- `npm run lint` currently has unrelated legacy/type issues in admin/API and other components; do not assume visualizer cleanup alone will make lint fully green.

## Remaining Work
1. Validate garment-only 3D locally after cleanup.
2. Fine tune logo/decal placement per garment type in `GARMENT_3D_MAP` and `fitDecalCoordsToMesh`.
3. Continue admin/API lint cleanup and type hardening.
4. Choose one package manager and clean lockfile/install state.
<!-- END:session-summary -->
