"use client";

export default function AdminOverview() {
  return (
    <div className="grid gap-5 md:grid-cols-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-slate-500">Productos activos</p>
        <h2 className="mt-3 text-4xl font-black text-slate-950">5</h2>
        <p className="mt-2 text-sm text-slate-500">Catálogo inicial poleras</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-slate-500">Cotizaciones</p>
        <h2 className="mt-3 text-4xl font-black text-slate-950">0</h2>
        <p className="mt-2 text-sm text-slate-500">Historial pendiente</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-slate-500">Descuento global</p>
        <h2 className="mt-3 text-4xl font-black text-cyan-700">0%</h2>
        <p className="mt-2 text-sm text-slate-500">Manual admin</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-slate-500">Categorías</p>
        <h2 className="mt-3 text-4xl font-black text-slate-950">4</h2>
        <p className="mt-2 text-sm text-slate-500">Poleras, parkas y más</p>
      </div>
    </div>
  );
}