"use client";

type Props = {
  onLogout: () => void;
};

export default function AdminDashboard({ onLogout }: Props) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.35em] text-cyan-600">
            Panel Admin
          </p>

          <h1 className="mt-3 text-5xl font-black text-slate-950">
            Gestión ROKKO
          </h1>

          <p className="mt-3 max-w-2xl text-slate-500">
            Administra productos, precios, descuentos, disponibilidad y
            cotizaciones.
          </p>
        </div>

        <button
          onClick={onLogout}
          className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:border-red-300 hover:text-red-500"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Productos</p>
          <h2 className="mt-3 text-4xl font-black text-slate-950">5</h2>
          <p className="mt-2 text-sm text-slate-500">Poleras cargadas</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Cotizaciones</p>
          <h2 className="mt-3 text-4xl font-black text-slate-950">0</h2>
          <p className="mt-2 text-sm text-slate-500">Historial pendiente</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Descuento global</p>
          <h2 className="mt-3 text-4xl font-black text-cyan-700">0%</h2>
          <p className="mt-2 text-sm text-slate-500">Configuración manual</p>
        </div>
      </div>
    </section>
  );
}