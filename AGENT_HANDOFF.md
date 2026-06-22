# AGENT_HANDOFF - rokko-cotizador

## Current Direction
- The project now uses garment-only 3D previews.
- Do not reintroduce the mannequin, `FittedGarment`, or `/models/mannequin.glb`.
- The desired visual result is a clean product garment GLB in the 3D lab, like the shirt-only preview.

## Stack
- Next.js 16.2.6 App Router
- React 19.2.6
- TypeScript
- Three.js r184
- `@react-three/fiber`
- `@react-three/drei`
- Supabase

## Active 3D Path
- `components/Visualizador3D.tsx`
- `lib/baseModels.ts`
- `lib/garmentMap.ts`
- `public/models/base/*.glb`

## Important Notes
- There are staged admin/API changes in the repo. Treat them as existing work and do not revert them.
- If touching Next.js routing/build behavior, read the local docs under `node_modules/next/dist/docs/`.
- Keep changes small and verifiable.

## Suggested Checks
```powershell
npm run build
npm run dev
```

## Known Follow-Ups
- Verify the garment-only 3D preview in the browser.
- Tune logo placement and size per garment type.
- Clean remaining lint/type issues after visual validation.
