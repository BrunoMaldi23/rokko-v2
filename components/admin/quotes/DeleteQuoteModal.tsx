"use client";

export default function DeleteQuoteModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-[28px] border border-[#bfe8ee] bg-white p-6 shadow-[0_28px_90px_rgba(15,23,42,0.28)] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 [html[data-theme='dark']_&]:bg-red-500/10 [html[data-theme='dark']_&]:text-red-300">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M5 19h14L12 4 5 19z"
            />
          </svg>
        </div>

        <p className="text-center text-lg font-black text-[#071827] [html[data-theme='dark']_&]:text-white">
          Eliminar cotización
        </p>

        <p className="mt-2 text-center text-sm font-bold leading-5 text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
          Esta acción no se puede deshacer.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-2xl border border-[#bfe8ee] bg-white px-5 text-[13px] font-black text-[#475569] transition hover:bg-[#f4fbfd] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-[#94a3b8]"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="h-11 rounded-2xl border border-red-200 bg-red-50 px-5 text-[13px] font-black text-red-600 transition hover:bg-red-100 [html[data-theme='dark']_&]:border-red-500/25 [html[data-theme='dark']_&]:bg-red-500/10 [html[data-theme='dark']_&]:text-red-300"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}