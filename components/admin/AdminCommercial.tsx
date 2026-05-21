"use client";

export default function AdminCommercial() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black text-slate-950">
          Configuración comercial
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Define reglas generales para descuentos, IVA y condiciones de venta.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              Descuento global manual
            </label>
            <input
              type="number"
              placeholder="Ej: 5"
              className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              Mínimo mayorista
            </label>
            <input
              type="number"
              placeholder="15"
              className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              IVA
            </label>
            <input
              type="number"
              placeholder="19"
              className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              Validez cotización
            </label>
            <input
              type="number"
              placeholder="7 días"
              className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
            Condiciones comerciales
          </label>
          <textarea
            placeholder="Ej: Valores con IVA incluido. Logo pecho incluido. Plazos sujetos a confirmación de stock."
            className="h-36 w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-cyan-400"
          />
        </div>

        <button className="mt-6 rounded-2xl bg-cyan-600 px-6 py-4 text-sm font-bold text-white hover:bg-cyan-700">
          Guardar configuración
        </button>
      </div>

      <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-black text-slate-950">
          Reglas sugeridas
        </h3>

        <div className="mt-5 space-y-3 text-sm text-slate-600">
          <p>• Precio mayorista desde 15 unidades.</p>
          <p>• Descuento global manual solo desde admin.</p>
          <p>• Logo pecho incluido en precio base.</p>
          <p>• Logos adicionales se cotizan aparte.</p>
          <p>• Stock sujeto a disponibilidad.</p>
        </div>
      </aside>
    </div>
  );
}