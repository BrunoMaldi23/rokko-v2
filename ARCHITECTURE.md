# Arquitectura ROKKO

El proyecto corre como una app Next.js en Vercel y usa Supabase como backend administrado.

```text
Frontend y Route Handlers Next.js -> Vercel
Datos, auth y archivos            -> Supabase
Email transaccional               -> Resend desde app/api/send-quote
```

## Vercel

Vercel ejecuta la aplicacion Next.js:

- Home, catalogo y cotizador.
- Admin UI.
- Visualizador 3D.
- Route Handlers internos, como envio de cotizaciones por email.

Variables requeridas en Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=re_xxxxx
```

## Supabase

Supabase es la unica fuente de backend:

- Auth para acceso al panel admin.
- Tablas `products`, `quotes`, `brand_settings`, `commercial_settings` y `product_models`.
- Storage buckets `product-images` y `product-models`.

Los modelos base del visor 3D que viven en `public/models/base` se sirven desde Vercel como assets estaticos. Los modelos subidos desde el admin se guardan en Supabase Storage.

## SQL

Los scripts de `sql/` preparan policies, tablas y buckets. Se ejecutan en el SQL Editor de Supabase o con la CLI de Supabase si se usa en el futuro.

## Sin backend propio

No hay API Docker, VM, Postgres local ni MinIO en esta arquitectura. Tampoco se usa `NEXT_PUBLIC_API_URL`: cualquier dato de negocio debe cargarse desde Supabase o desde un Route Handler de Next.js cuando haga falta proteger una clave privada.
