"use client";

export default function AdminBranding() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black text-slate-950">
          Branding y datos empresa
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Datos que después usaremos en la cotización PDF.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <input
            placeholder="Nombre comercial"
            className="rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-cyan-400"
          />

          <input
            placeholder="Teléfono"
            className="rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-cyan-400"
          />

          <input
            placeholder="Correo"
            className="rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-cyan-400"
          />

          <input
            placeholder="Ciudad / tienda"
            className="rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-cyan-400"
          />
        </div>

        <textarea
          placeholder="Mensaje pie de cotización"
          className="mt-5 h-32 w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-cyan-400"
        />

        <button className="mt-6 rounded-2xl bg-cyan-600 px-6 py-4 text-sm font-bold text-white hover:bg-cyan-700">
          Guardar branding
        </button>
      </div>

      <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-black text-slate-950">Vista previa</h3>

        <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            ROKKO
          </p>
          <h4 className="mt-2 text-2xl font-black">Cotización comercial</h4>
          <p className="mt-3 text-sm text-slate-300">
            Vestuario corporativo profesional.
          </p>
        </div>
      </aside>
    </div>
  );
}