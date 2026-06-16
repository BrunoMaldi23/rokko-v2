# ROKKO Cotizador

Cotizador web para vestuario corporativo ROKKO. La app corre en Next.js sobre Vercel y usa Supabase para datos, autenticacion y archivos.

## Getting Started

Configura las variables:

```bash
cp .env.example .env.local
```

Completa:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
```

Luego inicia desarrollo:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Backend

Todo el backend de negocio vive en Supabase:

- Supabase Auth para el panel admin.
- Tablas para productos, cotizaciones, settings y modelos 3D.
- Supabase Storage para imagenes y modelos subidos desde el admin.

El envio de emails usa el Route Handler `app/api/send-quote` en Vercel con `RESEND_API_KEY`.

## Deploy

En Vercel, configura las mismas variables de `.env.example`. No se necesita VM, Docker, MinIO, Postgres local ni `NEXT_PUBLIC_API_URL`.

## Scripts

```bash
npm run dev
npm run build
npm run lint
```

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
