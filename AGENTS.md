<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:session-summary -->
# Session Summary

## Goal
- Finish the ROKKO uniform quote app with a lean catalog, quote flow, contact flow, and technical product sheet.
- Keep the project free of removed 3D/model-preview paths.

## Current Product Direction
- The app no longer uses 3D previews or GLB/GLTF assets.
- Product detail should stay as a technical sheet using product images, colors, sizes, prices, technologies, and certifications.
- Do not reintroduce model uploads, product-model buckets, Three.js/R3F/Fabric visualizers, or static garment model assets.

## Relevant Product Files
- `components/QuoteBuilder.tsx`: catalog cards, cart, quote modal, and technical sheet entry point.
- `components/ProductDetailPanel.tsx`: technical sheet without 3D.
- `components/admin/AdminProducts.tsx`: product catalog management.
- `app/contacto/page.tsx`: public contact flow.

## Validation Notes
- After changes, run:
  - `npm run build`
- `npm run lint` currently has unrelated legacy/type issues in admin/API and other components; do not assume visualizer cleanup alone will make lint fully green.

## Remaining Work
1. Improve technical sheet content layout.
2. Add category management in admin.
3. Continue admin/API lint cleanup and type hardening.
4. Choose one package manager and clean lockfile/install state.
<!-- END:session-summary -->
