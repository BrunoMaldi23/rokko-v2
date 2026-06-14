"use client";

import Image from "next/image";
import { useState } from "react";
import { hasSupabaseConfig, supabase } from "@/lib/supabaseClient";

type Props = {
  onLogin: () => void;
};

export default function AdminLogin({ onLogin }: Props) {
  const savedEmail =
    typeof window !== "undefined" ? localStorage.getItem("rokko-saved-email") : null;
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
      setErrorMsg("Supabase no esta configurado. Revisa .env.local");
      return;
    }

    if (loading) return;
    setLoading(true);
    setError(false);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(true);
      setErrorMsg(
        signInError.message === "Invalid login credentials"
          ? "Email o contrasena incorrectos"
          : signInError.message
      );
      setLoading(false);
      setTimeout(() => setError(false), 4000);
      return;
    }

    if (rememberMe) {
      localStorage.setItem("rokko-saved-email", email);
    } else {
      localStorage.removeItem("rokko-saved-email");
    }

    onLogin();
  }

  async function handleForgotPassword() {
    if (!supabase || !email.trim()) {
      setError(true);
      setErrorMsg("Ingresa tu email primero");
      setTimeout(() => setError(false), 3000);
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/admin` }
    );

    if (resetError) {
      setError(true);
      setErrorMsg(resetError.message);
      setTimeout(() => setError(false), 3000);
    } else {
      setError(true);
      setErrorMsg("Revisa tu bandeja de entrada para restablecer la contrasena");
      setTimeout(() => setError(false), 4000);
    }
  }

  return (
    <main className="grid min-h-screen bg-bg lg:grid-cols-[minmax(420px,0.92fr)_1.08fr]">
      <section className="relative hidden overflow-hidden bg-[#101416] text-white lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(0,144,160,0.28),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_45%)]" />
        <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="relative h-16 w-56">
            <Image
              src="/brand/rokko-navbar.png"
              alt="ROKKO Vestuario Corporativo"
              fill
              priority
              sizes="224px"
              className="object-contain object-left"
            />
          </div>

          <div className="max-w-lg">
            <p className="text-[11px] font-black uppercase tracking-[0.34em] text-accent-light">
              Administracion ROKKO
            </p>
            <h1 className="mt-4 text-5xl font-black leading-none">
              Control claro para cotizar mejor.
            </h1>
            <p className="mt-5 max-w-md text-sm font-medium leading-7 text-white/62">
              Gestiona catalogo, modelos 3D, precios y solicitudes desde un panel pensado para operar con precision.
            </p>
          </div>

          <div className="grid max-w-md grid-cols-3 gap-3">
            {["Catalogo", "Cotizaciones", "Modelos 3D"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/48">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <div className="relative h-16 w-56">
              <Image
                src="/brand/rokko-navbar.png"
                alt="ROKKO"
                fill
                priority
                sizes="224px"
                className="object-contain"
              />
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-border bg-white p-7 shadow-[0_22px_60px_rgba(45,52,54,0.12)] sm:p-9">
            <div className="mb-8">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-accent">
                Acceso privado
              </p>
              <h2 className="mt-2 text-3xl font-black text-text">Bienvenido</h2>
              <p className="mt-2 text-sm font-medium text-muted">
                Ingresa tus credenciales para continuar.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-muted">
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
                  className={`h-12 w-full rounded-xl border bg-surface-2 px-4 text-sm font-bold text-text outline-none transition focus:border-accent focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,144,160,0.12)] ${
                    error ? "border-red-300" : "border-border"
                  }`}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-muted">
                  Contrasena
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
                    className={`h-12 w-full rounded-xl border bg-surface-2 px-4 pr-12 text-sm font-bold text-text outline-none transition focus:border-accent focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,144,160,0.12)] ${
                      error ? "border-red-300" : "border-border"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((prev) => !prev)}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition hover:bg-white hover:text-accent"
                    aria-label={showPass ? "Ocultar contrasena" : "Mostrar contrasena"}
                  >
                    {showPass ? "Oc" : "Ver"}
                  </button>
                </div>
              </label>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                  {errorMsg || "Email o contrasena incorrectos"}
                </div>
              )}

              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 text-sm font-bold text-muted">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 accent-accent"
                  />
                  Recordarme
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm font-black text-accent transition hover:text-brand-dark"
                >
                  Recuperar acceso
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-13 w-full rounded-xl bg-gradient-to-r from-accent to-brand-dark px-5 py-4 text-sm font-black text-white shadow-[0_14px_30px_rgba(0,144,160,0.22)] transition hover:shadow-[0_18px_38px_rgba(0,144,160,0.28)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Verificando..." : "Ingresar al panel"}
              </button>
            </form>

            <p className="mt-8 border-t border-border pt-5 text-center text-[11px] font-bold text-muted/70">
              © {new Date().getFullYear()} ROKKO · Panel corporativo
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
