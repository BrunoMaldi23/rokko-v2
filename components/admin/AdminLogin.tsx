"use client";

import { useState } from "react";

type Props = {
  onLogin: () => void;
};

export default function AdminLogin({ onLogin }: Props) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (user === "admin" && password === "rokko123") {
      sessionStorage.setItem("rokko-admin", "true");
      onLogin();
      return;
    }

    alert("Credenciales incorrectas");
  }

  return (
    <section className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm"
      >
        <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-600">
          ROKKO ADMIN
        </p>

        <h1 className="mt-3 text-4xl font-black text-slate-950">
          Iniciar sesión
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Acceso privado al panel de administración.
        </p>

        <div className="mt-8 space-y-5">
          <input
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="Usuario"
            className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-cyan-400"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-cyan-400"
          />

          <button className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold text-white hover:bg-cyan-700">
            Ingresar al panel
          </button>
        </div>
      </form>
    </section>
  );
}