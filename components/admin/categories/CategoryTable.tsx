"use client";

import type { ReactNode } from "react";
import type { ProductCategory } from "@/types/category";
import { categoryCode } from "./categoryUtils";

type CategoryTableProps = {
  categories: ProductCategory[];
  counts: Record<string, number>;
  loading: boolean;
  targetCategory: string;
  onSelectCategory: (category: ProductCategory) => void;
  onViewCategory: (category: ProductCategory) => void;
  onEditCategory: (category: ProductCategory) => void;
  onRemoveCategory: (category: ProductCategory) => void | Promise<void>;
};

export default function CategoryTable({
  categories,
  counts,
  loading,
  targetCategory,
  onSelectCategory,
  onViewCategory,
  onEditCategory,
  onRemoveCategory,
}: CategoryTableProps) {
  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-[#f4fbfd] p-4 [html[data-theme='dark']_&]:bg-[#0b1319]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#dff7fa] border-t-[#21b7c7] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:border-t-[#00b8c8]" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-0 flex-1 bg-[#f4fbfd] p-4 [html[data-theme='dark']_&]:bg-[#0b1319]">
        <EmptyState message="No hay categorías para mostrar." />
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#f4fbfd] p-4 [html[data-theme='dark']_&]:bg-[#0b1319]">
      <div className="overflow-hidden rounded-[24px] border border-[#bfe8ee] bg-white [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]">
        <div className="grid grid-cols-[minmax(260px,1fr)_82px_72px_88px_220px] items-center border-b border-[#cfe8ee] bg-[#eaf8fb] px-4 py-3 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#162530]">
          <TableHead>Categoría</TableHead>
          <TableHead>Productos</TableHead>
          <TableHead>Orden</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead align="right">Acciones</TableHead>
        </div>

        <div className="divide-y divide-[#d5e9ee] [html[data-theme='dark']_&]:divide-[#243542]">
          {categories.map((category, index) => {
            const selected = category.slug === targetCategory;
            const count = counts[category.slug] || 0;

            return (
              <article
                key={category.id || category.slug}
                onClick={() => onSelectCategory(category)}
                className={`grid cursor-pointer grid-cols-[minmax(260px,1fr)_82px_72px_88px_220px] items-center px-4 py-3 transition ${
                  selected
                    ? "bg-[#dff7fa] [html[data-theme='dark']_&]:bg-[#00b8c8]/10"
                    : "hover:bg-[#f4fbfd] [html[data-theme='dark']_&]:hover:bg-[#14242e]"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#21b7c7] text-xs font-black text-white shadow-[0_10px_22px_rgba(32,184,199,0.16)] [html[data-theme='dark']_&]:bg-[#00b8c8] [html[data-theme='dark']_&]:text-[#071827]">
                    {categoryCode(category)}
                  </span>

                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <h3 className="truncate text-[13px] font-black text-[#071827] [html[data-theme='dark']_&]:text-white">
                        {category.label}
                      </h3>

                      {selected && (
                        <span className="rounded-full bg-[#21b7c7] px-2 py-0.5 text-[9px] font-black text-white [html[data-theme='dark']_&]:bg-[#00b8c8] [html[data-theme='dark']_&]:text-[#071827]">
                          Activa
                        </span>
                      )}
                    </div>

                    <p className="mt-0.5 truncate font-mono text-[11px] font-bold text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
                      /{category.slug}
                    </p>

                    <p className="mt-1 line-clamp-1 text-[12px] font-bold text-[#334155] [html[data-theme='dark']_&]:text-[#cbd5e1]">
                      {category.description ||
                        "Sin descripción para la card pública."}
                    </p>
                  </div>
                </div>

                <TableValue>{count}</TableValue>
                <TableValue>{index + 1}</TableValue>

                <div>
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black ${
                      category.active
                        ? "border-[#21b7c7]/40 bg-[#e6f8fb] text-[#087381] [html[data-theme='dark']_&]:border-[#00b8c8]/30 [html[data-theme='dark']_&]:bg-[#00b8c8]/10 [html[data-theme='dark']_&]:text-[#00b8c8]"
                        : "border-slate-200 bg-slate-50 text-slate-500 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-[#94a3b8]"
                    }`}
                  >
                    {category.active ? "Visible" : "Oculta"}
                  </span>
                </div>

                <div
                  className="flex justify-end gap-1.5"
                  onClick={(event) => event.stopPropagation()}
                >
                  <ActionButton
                    variant="view"
                    onClick={() => onViewCategory(category)}
                  >
                    Ver
                  </ActionButton>

                  <ActionButton
                    variant="edit"
                    onClick={() => onEditCategory(category)}
                  >
                    Editar
                  </ActionButton>

                  <ActionButton
                    variant="delete"
                    onClick={() => void onRemoveCategory(category)}
                  >
                    Eliminar
                  </ActionButton>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TableHead({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <p
      className={`text-[10px] font-black uppercase tracking-[0.16em] text-[#0f5f6d] [html[data-theme='dark']_&]:text-[#00b8c8] ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </p>
  );
}

function TableValue({ children }: { children: ReactNode }) {
  return (
    <p className="text-[13px] font-black text-[#071827] [html[data-theme='dark']_&]:text-white">
      {children}
    </p>
  );
}

function ActionButton({
  children,
  variant,
  onClick,
}: {
  children: ReactNode;
  variant: "view" | "edit" | "delete";
  onClick: () => void;
}) {
  const styles = {
    view: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 [html[data-theme='dark']_&]:border-emerald-500/25 [html[data-theme='dark']_&]:bg-emerald-500/10 [html[data-theme='dark']_&]:text-emerald-300",
    edit: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 [html[data-theme='dark']_&]:border-amber-500/25 [html[data-theme='dark']_&]:bg-amber-500/10 [html[data-theme='dark']_&]:text-amber-300",
    delete:
      "border-red-200 bg-red-50 text-red-600 hover:bg-red-100 [html[data-theme='dark']_&]:border-red-500/25 [html[data-theme='dark']_&]:bg-red-500/10 [html[data-theme='dark']_&]:text-red-300",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3.5 py-2 text-[11px] font-black transition ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#bfe8ee] bg-white px-4 py-8 text-center text-[13px] font-bold text-[#64748b] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22] [html[data-theme='dark']_&]:text-[#94a3b8]">
      {message}
    </div>
  );
}