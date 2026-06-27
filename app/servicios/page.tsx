"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  CheckCircle2,
  FileCheck2,
  Layers3,
  PenTool,
  Shirt,
  Sparkles,
} from "lucide-react";

const services = [
  {
    title: "Bordado corporativo",
    desc: "Aplicación durable para logos y cargos en prendas de uso diario o terreno.",
    icon: Shirt,
  },
  {
    title: "Estampado textil",
    desc: "Personalización versátil para logos, nombres, áreas o diseños especiales.",
    icon: Layers3,
  },
  {
    title: "Vectorización de logo",
    desc: "Preparación de archivos para lograr bordados y estampados nítidos.",
    icon: PenTool,
  },
  {
    title: "Asesoría de vestuario",
    desc: "Selección de prendas según rubro, clima, uso, presupuesto e imagen.",
    icon: Sparkles,
  },
  {
    title: "Cotización por volumen",
    desc: "Pedidos por tallas, colores, cantidades y descuentos comerciales.",
    icon: BadgeDollarSign,
  },
  {
    title: "Revisión previa",
    desc: "Validación de información antes de producir para reducir errores.",
    icon: FileCheck2,
  },
];

const steps = [
  ["01", "Selecciona", "Elige líneas y prendas desde el catálogo."],
  ["02", "Personaliza", "Define logo, color, tallas y aplicación."],
  ["03", "Cotiza", "Recibe una solicitud ordenada por volumen."],
  ["04", "Confirma", "Aprobamos detalles y coordinamos despacho."],
];

export default function ServiciosPage() {
  return (
    <main className="min-h-[calc(100dvh-80px)] bg-[#f4f7f9] font-sans text-[#071827] pb-20">
      
      {/* SECCIÓN 1: QUÉ HACEMOS */}
      <section className="relative mx-auto w-full max-w-[1200px] px-6 py-12 lg:py-16">
        <div className="pointer-events-none absolute -left-16 top-10 h-48 w-48 rounded-full bg-[#00b8c8]/5 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-20 h-56 w-56 rounded-full bg-[#087381]/5 blur-3xl" />

        <div className="relative z-10">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            
            {/* COLUMNA IZQUIERDA (STICKY) */}
            <div className="lg:sticky lg:top-28 pt-4">
              <p className="inline-flex items-center gap-2 rounded-full bg-[#087381]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#087381]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00b8c8]" />
                Qué hacemos
              </p>

              <h1 className="mt-5 max-w-[460px] text-[36px] font-black leading-[1.1] tracking-[-0.04em] text-[#071827] sm:text-[44px]">
                Personalización textil con{" "}
                <span className="relative inline-block text-[#087381]">
                  flujo comercial claro.
                  <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-[#00b8c8]/30" />
                </span>
              </h1>

              <p className="mt-5 max-w-[420px] text-[13px] font-medium leading-relaxed text-slate-500">
                Servicios pensados para ordenar la información antes de producir
                y reducir errores en tallas, logos, cantidades y aplicaciones.
              </p>

              <div className="mt-8 flex items-start gap-3 border-t border-slate-200 pt-6">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#087381]/10 text-[#087381]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
                <p className="max-w-[360px] text-[11px] font-bold leading-normal text-slate-400">
                  Cada servicio está pensado para que compras, marketing y
                  operaciones trabajen con la misma información.
                </p>
              </div>

              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 text-[12px] font-black text-[#087381] transition-all duration-200 hover:gap-3 hover:text-[#071827]"
              >
                Ver catálogo de prendas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* GRILLA DE SERVICIOS */}
            <div className="grid gap-4 sm:grid-cols-2">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <article
                    key={service.title}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-[0_12px_30px_rgba(7,24,39,0.03)] border border-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_40px_rgba(7,24,39,0.06)] min-h-[170px]"
                  >
                    <div>
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00b8c8]/10 text-[#00b8c8] transition-colors duration-200 group-hover:bg-[#071827] group-hover:text-white">
                        <Icon className="h-4 w-4" />
                      </span>

                      <h2 className="mt-4 text-[16px] font-black tracking-tight text-[#071827]">
                        {service.title}
                      </h2>

                      <p className="mt-2 text-[12px] font-medium leading-relaxed text-slate-400">
                        {service.desc}
                      </p>
                    </div>

                    {/* Línea decorativa absoluta corregida */}
                    <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-[#00b8c8] scale-x-0 transition-transform duration-300 group-hover:scale-x-100 origin-left" />
                  </article>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* SECCIÓN 2: CÓMO FUNCIONA */}
      <section className="relative mx-auto w-full max-w-[1200px] px-6 py-4">
        <div className="relative z-10 border-t border-slate-200 pt-16">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            
            {/* COLUMNA IZQUIERDA */}
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-[#087381]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#087381]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00b8c8]" />
                Cómo funciona
              </p>

              <h2 className="mt-5 max-w-[450px] text-[36px] font-black leading-[1.1] tracking-[-0.04em] text-[#071827] sm:text-[44px]">
                De la selección al despacho.
              </h2>

              <p className="mt-4 max-w-[420px] text-[13px] font-medium leading-relaxed text-slate-500">
                Un flujo simple para que cada solicitud avance con información
                clara, validada y lista para coordinar producción.
              </p>

              <Link
                href="/"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#071827] px-6 text-[12px] font-black text-white shadow-[0_10px_24px_rgba(7,24,39,0.15)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#087381] hover:shadow-[0_14px_30px_rgba(8,115,129,0.2)] active:scale-[0.98]"
              >
                Comenzar cotización
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* GRILLA DE PASOS */}
            <div>
              <div className="grid gap-4 sm:grid-cols-2">
                {steps.map(([step, title, desc]) => (
                  <article
                    key={step}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-[0_12px_30px_rgba(7,24,39,0.03)] border border-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_40px_rgba(7,24,39,0.06)] min-h-[160px]"
                  >
                    <div>
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00b8c8]/10 font-mono text-[11px] font-black tracking-wider text-[#00b8c8] transition-colors duration-200 group-hover:bg-[#071827] group-hover:text-white">
                        {step}
                      </span>

                      <h3 className="mt-4 text-[16px] font-black tracking-tight text-[#071827]">
                        {title}
                      </h3>

                      <p className="mt-2 text-[12px] font-medium leading-relaxed text-slate-400">
                        {desc}
                      </p>
                    </div>

                    {/* Línea decorativa absoluta corregida */}
                    <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-[#00b8c8] scale-x-0 transition-transform duration-300 group-hover:scale-x-100 origin-left" />
                  </article>
                ))}
              </div>

              <div className="mt-8 flex items-start gap-3 border-t border-slate-200 pt-6">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#087381]/10 text-[#087381]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
                <p className="max-w-[720px] text-[11px] font-bold leading-normal text-slate-400">
                  Pensado para compras, marketing y operaciones que necesitan
                  revisar información clara antes de avanzar con la producción.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}