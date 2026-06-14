<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:session-summary -->
# Session Summary

## Goal
- Optimizar y corregir el visualizador 3D de uniformes del cotizador ROKKO, limpiar el proyecto de dead code/dependencias innecesarias, conectar modelos GLB reales a productos y reemplazar el maniquí por uno de mejor calidad.

## Constraints & Preferences
- Licencia CC0 obligatoria para assets 3D (comercial permitido sin atribución)
- Los GLBs reales de producto deben reemplazar a los quads planos/subdirectorios
- El maniquí actual (53K triángulos, sin textura) debe reemplazarse por uno más liviano y profesional
- Priorizar rendimiento web (WebGL, Next.js App Router, Tailwind CSS v4)

## Progress
### Done
- **Maniquí reemplazado**: Tripo AI (1.5MB, 53K tris) → Prototyping Mannequin by burning_barb (277KB GLB, 5,738 vértices body + 1,270 joints, 9.6K tris total, CC0). Descargado de itch.io, convertido GLTF→GLB con material blanco.
- **Y ranges recalibrados**: garment Y_min = 0.53 (waist), Y_max = 1.17 (neck) — calculados a partir del análisis de vértices del nuevo maniquí.
- **Posiciones de cámara y grupo ajustadas**: camera position [0, 0.85, 5], zoom 230, group scale 1 (sin escalado), group position [0, 0, 0].
- **Sombra reposicionada**: [0, -0.05, 0] (justo bajo los pies del nuevo maniquí).
- **HairBun reposicionado**: [0, 1.55, -0.12] (acorde a la nueva altura de cabeza).
- **GARMENT_3D_MAP recalibrado**: coordenadas de decal mapeadas del viejo Y: [-0.477, 0.473] → nuevo Y: [0, 1.708] y X: [-0.513, 0.513] → [-0.760, 0.760] con Z frontal -0.075 y Z posterior 0.165.
- **Build compila sin errores**: TypeScript, Next.js 16.2.6.

### In Progress
- **"Cannot read 'image.png'" error — PENDIENTE**: probar desactivando componentes uno por uno (ContactShadows, LogoDecal, FittedGarment) en navegador.
- **`THREE.Clock` deprecation** (10+ warnings): harmless, de OrbitControls drei 10.7.7 usando `three-stdlib` con three.js r184.

### Key Decisions
- **Prototyping Mannequin (burning_barb) elegido**: CC0 sin atribución, 9.6K tris (vs 53K anterior), 277KB GLB, diseño para prototipado de ropa.
- **Group scale 1.0**: el nuevo maniquí tiene altura natural 1.71 uds, no necesita escalado. La cámara en Y=0.85 centra el torso en el frustum.
- **Mapeo lineal de decals**: las coordenadas 2D (left/top) en mapa 2D NO se modificaron — solo las 3D del decal.

## Next Steps
1. Probar visualizador 3D en navegador — verificar que maniquí, prenda y decal se renderizan correctamente
2. Si el decal no calza, ajustar coordenadas finas en `GARMENT_3D_MAP`
3. Probar con `npm run dev`

## Critical Context
- **R3F orthographic zoom**: `visible_world_units = container_pixels / zoom`. Container min-h-[400px]. Zoom 230 → frustum ~1.74-2.61 uds (400-600px). Maniquí 1.71 uds → encaja.
- **El nuevo maniquí Y va de 0 (pies) a 1.708 (cabeza)**, no centrado en Y=0 como el anterior.
- **mannequin_joints** son 1,270 vértices (articulaciones esféricas en negro), **mannequin_body** son 5,738 vértices (cuerpo principal). Ambos reciben el mismo shader vía `onBeforeCompile`.
- **`Texture.DEFAULT_IMAGE = null`** en three.js r184 (PR #33129): puede causar "does not support image input" si código externo crea `new Texture()` sin imagen explícita.

## Relevant Files
- `components/Visualizador3D.tsx`: Y ranges, camera, group, shadow recalibrados; hairbun reposicionado (901 líneas)
- `lib/garmentMap.ts`: `GARMENT_3D_MAP` recalibrado con coordenadas mapeadas al nuevo maniquí
- `public/models/mannequin.glb`: Nuevo maniquí (277KB, 9.6K tris, CC0, material blanco)
- `public/models/mannequin.gltf`: Fuente GLTF original (para regenerar GLB si es necesario)
- `public/models/mannequin.blend`: Fuente Blender original (para editar si es necesario)
- `scripts/calc-decal-coords.mjs`: Script de cálculo de coordenadas para el mapeo de decals
<!-- END:session-summary -->
