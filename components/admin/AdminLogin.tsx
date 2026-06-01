"use client";

import { useState } from "react";
import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";

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
  const mounted = true;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!hasSupabaseConfig || !supabase) {
      setError(true);
      setErrorMsg("Supabase no está configurado. Revisa .env.local");
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
      setErrorMsg(signInError.message === "Invalid login credentials"
        ? "Email o contraseña incorrectos"
        : signInError.message);
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
      setErrorMsg("Revisa tu bandeja de entrada para restablecer la contraseña");
      setTimeout(() => setError(false), 4000);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #b8614a 0%, #2d3436 100%)" }}>
      <style>{`
        @keyframes fade-in { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slide-in-left { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        .gradient-text {
          background: linear-gradient(135deg, #f5e6e0 0%, #b8614a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* ═══════════════ LEFT PANEL - HERO SECTION ═══════════════ */}
      <div
        className="hidden lg:flex flex-col relative overflow-hidden"
        style={{
          width: "50%",
          background: "linear-gradient(135deg, #2d3436 0%, #1e1e1e 50%, #1e1e1e 100%)",
          position: "relative",
        }}
      >
        {/* Patrón decorativo */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23b8614a' fillOpacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }} />

        {/* Gradiente superior */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 4,
          background: "linear-gradient(90deg, #b8614a, #2d3436, #f5e6e0, #2d3436, #b8614a)",
        }} />

        {/* Logo */}
        <div style={{ padding: "48px 56px", position: "relative", zIndex: 2 }}>
          <img
            src="/rokko.png"
            alt="Rokko"
            style={{ height: 48, objectFit: "contain" }}
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              img.style.display = "none";
            }}
          />
        </div>

        {/* Contenido principal */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px", position: "relative", zIndex: 2 }}>
          <div style={{ animation: mounted ? "slide-in-left 0.6s ease-out" : "none" }}>
            <h1 style={{
              fontSize: 48,
              fontWeight: 900,
              lineHeight: 1.2,
              letterSpacing: "-0.03em",
              color: "white",
              marginBottom: 20,
            }}>
              Gestión{" "}
              <span className="gradient-text">
                profesional
              </span>
              <br />
              de vestuario
            </h1>
            <p style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
              maxWidth: 400,
            }}>
              Panel administrativo completo para gestionar catálogo, precios y cotizaciones de forma ágil y profesional.
            </p>
          </div>
        </div>

        {/* Decoración inferior */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 200,
          background: "linear-gradient(180deg, transparent, rgba(184,97,74,0.1))",
          pointerEvents: "none",
        }} />
      </div>

      {/* ═══════════════ RIGHT PANEL - LOGIN FORM ═══════════════ */}
      <div
        className="flex-1 flex flex-col justify-center items-center"
        style={{
          background: "white",
          padding: "48px",
          position: "relative",
        }}
      >
        {/* Tarjeta blanca con bordes y sombra */}
        <div
          style={{
            width: "100%",
            maxWidth: 460,
            background: "white",
            borderRadius: 32,
            padding: "48px 40px",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            border: "1px solid rgba(184,97,74,0.15)",
            animation: mounted ? "fade-in 0.6s ease-out" : "none",
          }}
        >
          {/* Logo móvil */}
          <div className="lg:hidden" style={{ textAlign: "center", marginBottom: 32 }}>
            <img
              src="/rokko.png"
              alt="Rokko"
              style={{ height: 48, objectFit: "contain", margin: "0 auto" }}
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                img.style.display = "none";
              }}
            />
          </div>

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <h2 style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#1e293b",
              letterSpacing: "-0.02em",
              marginBottom: 10,
            }}>
              Bienvenido
            </h2>
            <p style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Campo Email */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: 8,
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(false); }}
                  placeholder="admin@rokko.cl"
                  autoComplete="email"
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    border: `2px solid ${error ? "#fca5a5" : "#e2e8f0"}`,
                    borderRadius: 16,
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#0f172a",
                    background: "#f8fafc",
                    transition: "all 0.2s ease",
                    boxSizing: "border-box",
                    animation: error ? "shake 0.4s ease" : "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#b8614a";
                    e.currentTarget.style.background = "white";
                    e.currentTarget.style.boxShadow = "0 0 0 4px rgba(184,97,74,0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = error ? "#fca5a5" : "#e2e8f0";
                    e.currentTarget.style.background = "#f8fafc";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Campo Contraseña */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: 8,
                }}>
                  Contraseña
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(false); }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    style={{
                      width: "100%",
                      padding: "14px 52px 14px 18px",
                      border: `2px solid ${error ? "#fca5a5" : "#e2e8f0"}`,
                      borderRadius: 16,
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#0f172a",
                      background: "#f8fafc",
                      transition: "all 0.2s ease",
                      boxSizing: "border-box",
                      animation: error ? "shake 0.4s ease" : "none",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#b8614a";
                      e.currentTarget.style.background = "white";
                      e.currentTarget.style.boxShadow = "0 0 0 4px rgba(184,97,74,0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = error ? "#fca5a5" : "#e2e8f0";
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: "absolute",
                      right: 18,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#94a3b8",
                      display: "flex",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#b8614a"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8"; }}
                  >
                    {showPass ? (
                      <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Mensaje de error */}
              {error && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  background: "#fef2f2",
                  border: "2px solid #fecaca",
                  borderRadius: 14,
                  color: "#dc2626",
                }}>
                  <svg style={{ width: 18, height: 18, flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{errorMsg || "Email o contraseña incorrectos"}</span>
                </div>
              )}

              {/* Opciones adicionales */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 5,
                      accentColor: "#b8614a",
                      cursor: "pointer",
                    }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#475569" }}>Recordarme</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#b8614a",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#2d3436"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#b8614a"; }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "16px 0",
                  background: "linear-gradient(135deg, #b8614a 0%, #2d3436 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 16,
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  transition: "all 0.3s ease",
                  opacity: loading ? 0.8 : 1,
                  boxShadow: "0 8px 20px -6px rgba(184,97,74,0.5)",
                  marginTop: 8,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 28px -8px rgba(184,97,74,0.6)";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 20px -6px rgba(184,97,74,0.5)";
                }}
                onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.98)"; }}
                onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
              >
                {loading ? (
                  <>
                    <svg style={{ width: 20, height: 20, animation: "spin 0.8s linear infinite" }} fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Verificando...</span>
                  </>
                ) : (
                  "Ingresar al panel"
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div style={{ marginTop: 40, textAlign: "center", paddingTop: 24, borderTop: "1px solid #e2e8f0" }}>
            <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
              © {new Date().getFullYear()} Rokko · Vestuario Corporativo Profesional
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
