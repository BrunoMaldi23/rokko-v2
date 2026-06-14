# AGENT_HANDOFF - rokko-cotizador

## Objetivo de coordinacion
Este archivo es el puente entre Codex y OpenCode para coordinar diagnostico rapido en el proyecto `rokko-cotizador`.

OpenCode: por favor lee este archivo, responde debajo de la seccion **Respuesta de OpenCode**, y si haces cambios deja un resumen breve con archivos tocados y comandos ejecutados.

## Proyecto
- Ruta: `C:\Proyectos\rokko-cotizador`
- Stack: Next.js 16.2.6, React 19.2.6, TypeScript, Three.js r184, `@react-three/fiber`, `@react-three/drei`, Supabase.
- Scripts disponibles:
  - `npm run dev`
  - `npm run build`
  - `npm run lint`

## Estado git observado
Hay muchos cambios sin commit. Tratar todo como trabajo del usuario u otro agente. No revertir nada sin confirmacion.

Archivos modificados relevantes observados:
- `components/Visualizador3D.tsx`
- `components/QuoteBuilder.tsx`
- `components/LogoEditor.tsx`
- `components/admin/AdminLayout.tsx`
- `lib/adminProducts.ts`
- `lib/garmentMap.ts`
- `lib/productModels.ts`
- `types/product.ts`
- `next.config.js`
- `package.json`

Archivos/carpetas nuevos relevantes:
- `components/FabricEditor.tsx`
- `components/FabricOverlay.tsx`
- `components/Visualizador3D.tsx`
- `components/admin/AdminModels3D.tsx`
- `components/garment/`
- `hooks/`
- `lib/antiZFight.ts`
- `lib/colorLookup.ts`
- `lib/productModels.ts`
- `lib/uvMapping.ts`
- `public/environments/`
- `public/garments/`
- `public/models/`
- `scripts/`
- `sql/006_product_models.sql`
- `sql/007_bucket_setup.sql`
- `types/productModel.ts`

## Problema principal a resolver
Error persistente en consola del navegador:

```text
Cannot read 'image.png' (this model does not support image input)
```

Contexto ya investigado:
- La cadena literal `image.png` aparentemente no aparece en el codigo ni paquetes revisados.
- Se sospecha que viene de WebGL/texture upload, no de una ruta real del proyecto.
- Candidatos: `CanvasTexture` del normal map procedural, `TextureLoader` del logo, `ContactShadows`, o alguna textura por defecto/placeholder de Three.js r184.
- `Texture.DEFAULT_IMAGE = null` en three.js r184 podria influir si algun codigo crea `new Texture()` sin imagen explicita.

## Decisiones tecnicas ya tomadas
- Los modelos GLB de productos son quads planos 2D y no sirven como prendas 3D reales.
- El visualizador debe usar `FittedGarment`, geometria procedural extraida del maniqui GLB.
- Maniqui base: `/models/mannequin.glb`.
- HDR local: `/environments/studio.hdr`.
- `ProductModelGarment` fue eliminado del flujo render.
- `GARMENT_3D_MAP` necesita recalibracion para decal/logo.

## Pedido para OpenCode
Por favor ayudar con uno de estos enfoques, idealmente en este orden:

1. Aislar el origen exacto del error `Cannot read 'image.png'` desactivando temporalmente componentes en `components/Visualizador3D.tsx`:
   - `ContactShadows`
   - `LogoDecal`
   - normal map procedural / `CanvasTexture`
   - `FittedGarment`
   - HDR `Environment`

2. Proponer o aplicar fix minimo y reversible.

3. Si el error desaparece, documentar combinacion exacta que lo causa.

4. Revisar `lib/garmentMap.ts` y sugerir estrategia de recalibracion para decal/logo sobre geometria real.

## Restricciones
- No revertir cambios existentes.
- No eliminar trabajo de otro agente sin confirmar.
- Mantener Next.js 16: revisar docs locales en `node_modules/next/dist/docs/` si se toca framework/routing/build.
- Preferir cambios pequenos y verificables.

## Comandos sugeridos
```powershell
npm run dev
npm run build
npm run lint
```

## Respuesta de OpenCode

_Pegar respuesta aqui._
