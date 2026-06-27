"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function QuienesSomosPage() {
  return (
    <main className="min-h-[calc(100dvh-80px)] overflow-hidden bg-[#f3f7f9] font-sans text-[#071827] transition-colors duration-300 rokko-dark:bg-[#0b1319] rokko-dark:text-[#f8fafc]">
      {/* HERO SOBRE NOSOTROS */}
      <section className="relative mx-auto flex min-h-[calc(100dvh-80px)] w-full max-w-[1240px] items-center px-6 py-20 lg:py-32">
        <div className="relative z-10 grid w-full items-center gap-12 lg:grid-cols-[1fr_1fr]">
          {/* COLUMNA IZQUIERDA: TEXTO */}
          <div className="flex flex-col justify-center">
            <div>
              <p className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#b5e9ed] bg-[#e6f9fa] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#087381] rokko-dark:border-[#087381]/40 rokko-dark:bg-[#087381]/15 rokko-dark:text-[#00b8c8]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00b8c8]" />
                Quiénes somos
              </p>
            </div>

            <h1 className="max-w-[600px] text-[42px] font-black leading-[1.05] tracking-[-0.05em] text-[#071827] sm:text-[54px] lg:text-[60px] rokko-dark:text-[#f8fafc]">
              Sobre{" "}
              <span className="relative inline-block text-[#071827] rokko-dark:text-[#f8fafc]">
                nosotros
                <span className="absolute bottom-1 left-0 h-2 w-full rounded-full bg-[#00b8c8]/25 rokko-dark:bg-[#00b8c8]/35" />
              </span>
            </h1>

            <div className="mt-6 max-w-[580px] space-y-4 text-[14px] font-medium leading-relaxed text-[#637988] sm:text-[15px] rokko-dark:text-[#94a3b8]">
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
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#071827] px-6 text-[12px] font-black text-white shadow-[0_10px_24px_rgba(7,24,39,0.15)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#087381] hover:shadow-[0_14px_30px_rgba(8,115,129,0.2)] active:scale-[0.98] rokko-dark:bg-[#00b8c8] rokko-dark:text-[#071827] rokko-dark:shadow-[0_14px_34px_rgba(0,184,200,0.16)] rokko-dark:hover:bg-[#9eeef4]"
              >
                Ver catálogo
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/servicios"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-[12px] font-black text-[#071827] shadow-[0_8px_20px_rgba(7,24,39,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00b8c8] hover:bg-[#f7fcfd] hover:text-[#087381] active:scale-[0.98] rokko-dark:border-[#243542] rokko-dark:bg-[#121f2a] rokko-dark:text-[#f8fafc] rokko-dark:shadow-[0_10px_26px_rgba(0,0,0,0.24)] rokko-dark:hover:border-[#00b8c8] rokko-dark:hover:bg-[#162530] rokko-dark:hover:text-[#00b8c8]"
              >
                Servicios
              </Link>
            </div>
          </div>

          {/* COLUMNA DERECHA: ELEMENTO VISUAL */}
          <div className="relative flex min-h-[380px] items-center justify-center lg:min-h-[460px]">
            {/* CÍRCULO CONTENEDOR */}
            <div className="relative z-20 flex h-[290px] w-[290px] items-center justify-center rounded-full border border-white/90 bg-white shadow-[0_22px_50px_rgba(7,24,39,0.08)] sm:h-[320px] sm:w-[320px] rokko-dark:border-[#243542] rokko-dark:bg-[#111b22] rokko-dark:shadow-[0_28px_70px_rgba(0,0,0,0.42)]">
              <div className="absolute inset-3 rounded-full border border-[#dce7ec]/80 bg-[radial-gradient(circle_at_30%_30%,#f9ffff_0%,#eefbfc_50%,#def5f7_100%)] rokko-dark:border-[#243542] rokko-dark:bg-[radial-gradient(circle_at_30%_30%,#17303a_0%,#11212b_55%,#0b1319_100%)]" />

              <div className="absolute inset-[20px] rounded-full border border-white/60 rokko-dark:border-white/10" />

              {/* LOGO LIGHT - MÁS GRANDE */}
              <div className="relative h-[220px] w-[220px] sm:h-[250px] sm:w-[250px] rokko-dark:hidden">
                <Image
                  src="/brand/rokko-navbar.png"
                  alt="ROKKO Vestuario Corporativo"
                  fill
                  priority
                  className="object-contain"
                />
              </div>

              {/* LOGO DARK */}
              <div className="relative hidden h-[190px] w-[190px] sm:h-[220px] sm:w-[220px] rokko-dark:block">
                <Image
                  src="/brand/rokko-mark.png"
                  alt="ROKKO Vestuario Corporativo"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            </div>

            {/* ONDA DERECHA */}
            <svg
              className="absolute right-0 top-[32%] z-10 h-24 w-36 text-[#071827]/15 opacity-80 transition-transform duration-700 hover:scale-105 rokko-dark:text-[#9eeef4]/18"
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

            {/* ONDA IZQUIERDA */}
            <svg
              className="absolute left-[2%] bottom-[25%] z-10 h-20 w-32 text-[#071827]/15 opacity-80 transition-transform duration-700 hover:scale-105 rokko-dark:text-[#9eeef4]/18"
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