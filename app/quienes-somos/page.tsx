"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function QuienesSomosPage() {
  return (
    <main className="min-h-[calc(100dvh-80px)] overflow-hidden bg-[#f3f7f9] font-sans text-[#071827]">
      {/* HERO SOBRE NOSOTROS */}
      <section className="relative mx-auto flex min-h-[calc(100dvh-80px)] w-full max-w-[1240px] items-center px-6 py-20 lg:py-32">
        {/* Fondos suaves premium */}
        <div className="pointer-events-none absolute -left-16 top-4 h-64 w-64 rounded-full bg-[#dff6f8]/60 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-10 h-72 w-72 rounded-full bg-[#d8f7fb]/50 blur-3xl" />
        <div className="pointer-events-none absolute left-[45%] top-[35%] h-64 w-64 rounded-full bg-[#f0ddff]/40 blur-3xl" />

        <div className="relative z-10 grid w-full items-center gap-12 lg:grid-cols-[1fr_1fr]">
          
          {/* COLUMNA IZQUIERDA: TEXTO */}
          <div className="flex flex-col justify-center">
            <div>
              <p className="mb-6 inline-flex items-center gap-2.5 rounded-full bg-[#e6f9fa] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#087381]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00b8c8]" />
                Quiénes somos
              </p>
            </div>

            <h1 className="max-w-[600px] text-[42px] font-black leading-[1.05] tracking-[-0.05em] text-[#071827] sm:text-[54px] lg:text-[60px]">
              Sobre{" "}
              <span className="relative inline-block text-[#071827]">
                nosotros
                <span className="absolute bottom-1 left-0 h-2 w-full rounded-full bg-[#00b8c8]/25" />
              </span>
            </h1>

            <div className="mt-6 max-w-[580px] space-y-4 text-[14px] font-medium leading-relaxed text-slate-500 sm:text-[15px]">
              <p>
                ROKKO nace para acompañar a empresas que necesitan uniformes
                corporativos con una imagen clara, profesional y consistente.
                Nuestro foco está en simplificar la elección de prendas, ordenar
                la información y facilitar una cotización más precisa.
              </p>
              <p>
                Trabajamos con una mirada práctica: entender qué necesita cada
                equipo, cuidar la presentación de marca y proponer soluciones que
                funcionen tanto en oficina como en terreno.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#071827] px-6 text-[12px] font-black text-white shadow-[0_10px_24px_rgba(7,24,39,0.15)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#087381] hover:shadow-[0_14px_30px_rgba(8,115,129,0.2)] active:scale-[0.98]"
              >
                Ver catálogo
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/servicios"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-[12px] font-black text-[#071827] shadow-[0_8px_20px_rgba(7,24,39,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00b8c8] hover:bg-[#f7fcfd] hover:text-[#087381] active:scale-[0.98]"
              >
                Servicios
              </Link>
            </div>
          </div>

          {/* COLUMNA DERECHA: ELEMENTO VISUAL */}
          <div className="relative flex min-h-[380px] items-center justify-center lg:min-h-[460px]">
            {/* Fondo orgánico/blob decorativo sobrio */}
            <div className="absolute left-[15%] top-[12%] h-[280px] w-[380px] rounded-[44%_56%_48%_52%/58%_42%_58%_42%] bg-[#dff6f8]/70 mix-blend-multiply filter blur-sm" />
            <div className="absolute right-[5%] top-[5%] h-44 w-44 rounded-full bg-[#d8f7fb]/60 blur-2xl" />
            <div className="absolute bottom-[5%] left-[5%] h-40 w-40 rounded-full bg-[#eef8fb]/80 blur-2xl" />

            {/* Círculo contenedor del Logo (Optimizado el padding interno) */}
            <div className="relative z-20 flex h-[290px] w-[290px] items-center justify-center rounded-full border border-white/90 bg-white shadow-[0_22px_50px_rgba(7,24,39,0.08)] sm:h-[320px] sm:w-[320px]">
              <div className="absolute inset-3 rounded-full border border-[#dce7ec]/80 bg-[radial-gradient(circle_at_30%_30%,#f9ffff_0%,#eefbfc_50%,#def5f7_100%)]" />
              <div className="absolute inset-[20px] rounded-full border border-white/60" />

              {/* Contenedor controlado de la imagen */}
              <div className="relative h-[160px] w-[160px] sm:h-[185px] sm:w-[185px]">
                <Image
                  src="/brand/rokko-navbar.png"
                  alt="ROKKO Vestuario Corporativo"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            </div>

            {/* Onda Vectorial Derecha */}
            <svg
              className="absolute right-0 top-[32%] z-10 h-24 w-36 text-[#071827]/15 opacity-80 transition-transform duration-700 hover:scale-105"
              viewBox="0 0 200 120"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 60C45 5 75 110 105 55C130 10 160 35 188 18"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>

            {/* Onda Vectorial Izquierda */}
            <svg
              className="absolute left-[2%] bottom-[25%] z-10 h-20 w-32 text-[#071827]/15 opacity-80 transition-transform duration-700 hover:scale-105"
              viewBox="0 0 180 100"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 70C40 20 75 30 90 60C105 92 140 80 170 25"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

        </div>
      </section>
    </main>
  );
}