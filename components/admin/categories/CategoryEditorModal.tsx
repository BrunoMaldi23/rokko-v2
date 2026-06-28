"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { ProductCategory } from "@/types/category";

type CategoryEditorModalProps = {
  draft: Partial<ProductCategory>;
  setDraft: Dispatch<SetStateAction<Partial<ProductCategory>>>;
  normalizedDraft: Partial<ProductCategory>;
  editingId: string | null;
  saving: boolean;
  onClose: () => void;
  onSaveCategory: () => void | Promise<void>;
};

export default function CategoryEditorModal({
  draft,
  setDraft,
  normalizedDraft,
  editingId,
  saving,
  onClose,
  onSaveCategory,
}: CategoryEditorModalProps) {
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-5">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-md"
        onClick={onClose}
        aria-label="Cerrar editor"
      />

      <section className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-[#bfe8ee] bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]">
        <header className="shrink-0 border-b border-[#cfe8ee] bg-[linear-gradient(135deg,#f9feff_0%,#eefbfd_58%,#f7fdff_100%)] px-6 py-5 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[linear-gradient(135deg,#111b22_0%,#0f2630_58%,#111b22_100%)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
                Categoría
              </p>

              <h3 className="mt-1 text-[27px] font-black leading-none tracking-[-0.045em] text-[#071827] [html[data-theme='dark']_&]:text-white">
                {editingId ? "Editar categoría" : "Nueva categoría"}
              </h3>

              <p className="mt-2 text-[13px] font-bold leading-5 text-[#334155] [html[data-theme='dark']_&]:text-[#cbd5e1]">
                Define nombre, slug, código, descripción y visibilidad.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#bfe8ee] bg-white text-[#475569] transition hover:border-[#21b7c7] hover:text-[#087381] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-[#94a3b8] [html[data-theme='dark']_&]:hover:text-[#00b8c8]"
              aria-label="Cerrar"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#f4fbfd] p-6 [html[data-theme='dark']_&]:bg-[#0b1319]">
          <div className="grid gap-4 rounded-[24px] border border-[#bfe8ee] bg-white p-5 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]">
            <Field label="Nombre">
              <input
                className="admin-control"
                value={draft.label || ""}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, label: event.target.value }))
                }
                placeholder="Ej. Poleras"
              />
            </Field>

            <div className="grid grid-cols-[1fr_110px] gap-3">
              <Field label="Slug">
                <input
                  className="admin-control"
                  value={draft.slug || normalizedDraft.slug || ""}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      slug: event.target.value,
                    }))
                  }
                  placeholder="nueva-categoria"
                />
              </Field>

              <Field label="Código">
                <input
                  className="admin-control uppercase"
                  value={draft.code || ""}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      code: event.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="PL"
                  maxLength={3}
                />
              </Field>
            </div>

            <Field label="Descripción">
              <textarea
                className="admin-control min-h-[140px] resize-none"
                value={draft.description || ""}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Descripción para la card pública."
              />
            </Field>

            <label className="flex items-center justify-between rounded-2xl border border-[#bfe8ee] bg-[#f4fbfd] px-4 py-3 text-[13px] font-black text-[#071827] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-white">
              <span>
                <span className="block">Visible en sitio</span>
                <span className="mt-1 block text-[11px] font-bold text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
                  Controla si aparece en el catálogo público.
                </span>
              </span>

              <input
                type="checkbox"
                checked={draft.active ?? true}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    active: event.target.checked,
                  }))
                }
                className="h-5 w-5 accent-[#21b7c7]"
              />
            </label>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-[#cfe8ee] bg-white px-6 py-4 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-2xl border border-[#bfe8ee] bg-white px-5 text-[13px] font-black text-[#475569] transition hover:bg-[#f4fbfd] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-[#94a3b8]"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => void onSaveCategory()}
            disabled={saving}
            className="h-11 rounded-2xl bg-[#21b7c7] px-6 text-[13px] font-black text-white shadow-[0_12px_24px_rgba(33,183,199,0.2)] transition hover:-translate-y-0.5 hover:bg-[#087381] disabled:cursor-not-allowed disabled:opacity-50 [html[data-theme='dark']_&]:bg-[#00b8c8] [html[data-theme='dark']_&]:text-[#071827] [html[data-theme='dark']_&]:hover:bg-[#9eeef4]"
          >
            {saving
              ? "Guardando..."
              : editingId
                ? "Guardar cambios"
                : "Crear categoría"}
          </button>
        </footer>
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="admin-field-label">{label}</span>
      {children}
    </label>
  );
}