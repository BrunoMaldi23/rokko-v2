"use client";

import Image from "next/image";
import { useState } from "react";
import { hasSupabaseConfig, supabase } from "@/lib/supabaseClient";

type Props = {
  onLogin: () => void;
};

export default function AdminLogin({ onLogin }: Props) {
  const savedEmail =
    typeof window !== "undefined"
      ? localStorage.getItem("rokko-saved-email")
      : null;

  const [email, setEmail] = useState(savedEmail || "");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(Boolean(savedEmail));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!hasSupabaseConfig || !supabase) {
      setError(true);
      setErrorMsg(
        "Supabase no está configurado. Revisa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      );
      return;
    }

    if (loading) return;

    setLoading(true);
    setError(false);
    setErrorMsg("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(true);
      setErrorMsg(
        signInError.message === "Invalid login credentials"
          ? "Email o contraseña incorrectos."
          : signInError.message,
      );
      setLoading(false);

      setTimeout(() => {
        setError(false);
      }, 4500);

      return;
    }

    if (rememberMe) {
      localStorage.setItem("rokko-saved-email", email.trim());
    } else {
      localStorage.removeItem("rokko-saved-email");
    }

    onLogin();
  }

  async function handleForgotPassword() {
    if (!supabase || !email.trim()) {
      setError(true);
      setErrorMsg("Ingresa tu email primero para recuperar el acceso.");

      setTimeout(() => {
        setError(false);
      }, 3500);

      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/admin`,
      },
    );

    if (resetError) {
      setError(true);
      setErrorMsg(resetError.message);

      setTimeout(() => {
        setError(false);
      }, 3500);

      return;
    }

    setError(true);
    setErrorMsg("Revisa tu bandeja de entrada para restablecer la contraseña.");

    setTimeout(() => {
      setError(false);
    }, 4500);
  }

  return (
    <main className="grid min-h-screen bg-[#f4f7f9] lg:grid-cols-[0.95fr_1.05fr]">
      <section className="relative hidden overflow-hidden bg-[#101820] text-white lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(32,184,199,0.26),transparent_32%),radial-gradient(circle_at_80%_72%,rgba(103,213,223,0.12),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_42%)]" />

        <div className="absolute inset-0 opacity-[0.10] [background-image:linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:34px_34px]" />

        <div className="relative flex h-full min-h-screen flex-col justify-between p-12 xl:p-14">
          <div className="relative h-36 w-80">
            <div className="absolute left-0 top-2 h-32 w-32 rounded-[2rem] bg-white/[0.04] blur-sm" />

            <Image
              src="/brand/rokko-mark.png"
              alt="ROKKO Vestuario Corporativo"
              fill
              priority
              sizes="320px"
              className="relative object-contain object-left"
            />
          </div>

          <div className="max-w-xl">
            <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#67d5df]">
              Administración ROKKO
            </div>

            <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.06em] xl:text-6xl">
              Control claro para cotizar mejor.
            </h1>

            <p className="mt-6 max-w-md text-sm font-medium leading-7 text-white/62">
              Gestiona catálogo, categorías, precios y solicitudes desde un
              panel diseñado para operar con precisión.
            </p>

            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
              {[
                {
                  label: "Catálogo",
                  value: "Productos",
                },
                {
                  label: "Precios",
                  value: "Mayorista",
                },
                {
                  label: "Solicitudes",
                  value: "Cotizaciones",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
                    {item.label}
                  </p>

                  <p className="mt-2 text-sm font-black text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-6 text-xs font-bold text-white/42">
            <span>Panel corporativo</span>
            <span>Acceso privado</span>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[460px]">
          <div className="mb-8 flex justify-center lg:hidden">
            <div className="relative h-28 w-72">
              <Image
                src="/brand/rokko-mark.png"
                alt="ROKKO"
                fill
                priority
                sizes="288px"
                className="object-contain"
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#dce8ee] bg-white p-7 shadow-[0_28px_80px_rgba(17,27,40,0.10)] sm:p-9">
            <div className="mb-8">
              <div className="mb-4 inline-flex rounded-full bg-[#e8fafc] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#128896]">
                Acceso privado
              </div>

              <h2 className="text-3xl font-black tracking-[-0.045em] text-[#182635]">
                Bienvenido
              </h2>

              <p className="mt-2 text-sm font-semibold leading-6 text-[#6b7c8f]">
                Ingresa tus credenciales para continuar al panel administrativo.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#6b7c8f]">
                  Email
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(false);
                  }}
                  placeholder="admin@rokko.cl"
                  autoComplete="email"
                  className={`h-12 w-full rounded-2xl border bg-[#f0f6f8] px-4 text-sm font-bold text-[#243447] outline-none transition placeholder:text-[#9aabba] focus:border-[#20b8c7] focus:bg-white focus:shadow-[0_0_0_4px_rgba(32,184,199,0.14)] ${
                    error ? "border-red-300" : "border-[#dce8ee]"
                  }`}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#6b7c8f]">
                  Contraseña
                </span>

                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(false);
                    }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`h-12 w-full rounded-2xl border bg-[#f0f6f8] px-4 pr-12 text-sm font-bold text-[#243447] outline-none transition placeholder:text-[#9aabba] focus:border-[#20b8c7] focus:bg-white focus:shadow-[0_0_0_4px_rgba(32,184,199,0.14)] ${
                      error ? "border-red-300" : "border-[#dce8ee]"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPass((prev) => !prev)}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-[#6b7c8f] transition hover:bg-white hover:text-[#128896]"
                    aria-label={
                      showPass ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPass ? (
                      <svg
                        className="h-[18px] w-[18px]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12a11.72 11.72 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A10.83 10.83 0 0 1 12 4c5 0 9.27 3.11 11 8a11.72 11.72 0 0 1-2.16 3.19" />
                        <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
                        <path d="M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg
                        className="h-[18px] w-[18px]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </label>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-700">
                  {errorMsg || "Email o contraseña incorrectos."}
                </div>
              )}

              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 text-sm font-bold text-[#6b7c8f]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 accent-[#20b8c7]"
                  />

                  <span>Recordarme</span>
                </label>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm font-black text-[#128896] transition hover:text-[#0a5360]"
                >
                  Recuperar acceso
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#20b8c7] px-5 text-sm font-black text-white shadow-lg shadow-[#20b8c7]/20 transition hover:-translate-y-0.5 hover:bg-[#128896] hover:shadow-xl hover:shadow-[#128896]/20 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Verificando...
                  </>
                ) : (
                  "Ingresar al panel"
                )}
              </button>
            </form>

            <div className="mt-7 rounded-2xl border border-[#dce8ee] bg-[#f8fcfd] px-4 py-3">
              <p className="text-center text-[11px] font-bold leading-5 text-[#6b7c8f]">
                Acceso reservado para usuarios autorizados de ROKKO.
              </p>
            </div>

            <p className="mt-6 text-center text-[11px] font-bold text-[#9aabba]">
              © {new Date().getFullYear()} ROKKO · Panel corporativo
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}