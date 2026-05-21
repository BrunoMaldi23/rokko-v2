"use client";

export default function AdminQuotes() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-950">
          Historial de cotizaciones
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Aquí aparecerán las cotizaciones generadas cuando conectemos base de
          datos.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
        <p className="text-4xl">📄</p>
        <h3 className="mt-4 text-xl font-black text-slate-950">
          Sin cotizaciones todavía
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Cuando generes PDFs, quedarán registrados con folio, cliente, fecha,
          total y estado.
        </p>
      </div>
    </div>
  );
}