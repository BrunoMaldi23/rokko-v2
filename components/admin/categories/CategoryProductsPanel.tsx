"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { ProductCategory } from "@/types/category";
import type { Product } from "@/types/product";
import { categoryCode, productTitle } from "./categoryUtils";

type CategoryProductsPanelProps = {
  selectedCategory?: ProductCategory;
  productsInCategory: Product[];
  movableProducts: Product[];
  productSearch: string;
  setProductSearch: Dispatch<SetStateAction<string>>;
  selectedProducts: string[];
  setSelectedProducts: Dispatch<SetStateAction<string[]>>;
  saving: boolean;
  categoryLabelBySlug: Record<string, string>;
  onAssignSelected: () => void | Promise<void>;
  onMoveProduct: (product: Product, direction: -1 | 1) => void | Promise<void>;
};

export default function CategoryProductsPanel({
  selectedCategory,
  productsInCategory,
  movableProducts,
  productSearch,
  setProductSearch,
  selectedProducts,
  setSelectedProducts,
  saving,
  categoryLabelBySlug,
  onAssignSelected,
  onMoveProduct,
}: CategoryProductsPanelProps) {
  return (
    <aside className="flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-[#bfe8ee] bg-[linear-gradient(180deg,#fbfeff_0%,#f3fbfd_100%)] shadow-[0_12px_30px_rgba(8,115,129,0.06)] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[linear-gradient(180deg,#111b22_0%,#0f1a22_100%)] [html[data-theme='dark']_&]:shadow-[0_18px_42px_rgba(0,0,0,0.32)]">
      <div className="shrink-0 border-b border-[#cfe8ee] bg-[linear-gradient(135deg,#f9feff_0%,#eefbfd_58%,#f7fdff_100%)] px-5 py-4 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[linear-gradient(135deg,#111b22_0%,#0f2630_58%,#111b22_100%)]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
              Prendas asociadas
            </p>

            <h3 className="mt-1 truncate text-[24px] font-black leading-none tracking-[-0.045em] text-[#071827] [html[data-theme='dark']_&]:text-white">
              {selectedCategory?.label || "Selecciona categoría"}
            </h3>

            <p className="mt-2 text-[12px] font-bold leading-5 text-[#334155] [html[data-theme='dark']_&]:text-[#cbd5e1]">
              Ordena prendas y recategoriza productos.
            </p>
          </div>

          {selectedCategory && (
            <span className="shrink-0 rounded-full border border-[#21b7c7]/35 bg-[#e6f8fb] px-3 py-1.5 text-[12px] font-black text-[#087381] [html[data-theme='dark']_&]:border-[#00b8c8]/30 [html[data-theme='dark']_&]:bg-[#00b8c8]/10 [html[data-theme='dark']_&]:text-[#00b8c8]">
              {categoryCode(selectedCategory)}
            </span>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="grid gap-4">
          <section className="rounded-[24px] border border-[#bfe8ee] bg-white p-4 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
                  Orden público
                </p>

                <p className="mt-1 text-[12px] font-bold leading-5 text-[#334155] [html[data-theme='dark']_&]:text-[#cbd5e1]">
                  Define el orden visible en el catálogo.
                </p>
              </div>

              <span className="rounded-2xl bg-[#e6f8fb] px-3 py-2 text-[14px] font-black text-[#087381] [html[data-theme='dark']_&]:bg-[#00b8c8]/10 [html[data-theme='dark']_&]:text-[#00b8c8]">
                {productsInCategory.length}
              </span>
            </div>

            <div className="max-h-[310px] space-y-2 overflow-y-auto pr-1">
              {productsInCategory.length === 0 ? (
                <EmptyState message="Esta categoría todavía no tiene productos." />
              ) : (
                productsInCategory.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[#bfe8ee] bg-[#f7fcfd] px-3 py-3 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#e6f8fb] text-[12px] font-black text-[#087381] [html[data-theme='dark']_&]:bg-[#00b8c8]/10 [html[data-theme='dark']_&]:text-[#00b8c8]">
                        {index + 1}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-black text-[#071827] [html[data-theme='dark']_&]:text-white">
                          {productTitle(product)}
                        </p>

                        <p className="mt-0.5 text-[11px] font-bold text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
                          Orden {(index + 1) * 10}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <MiniIconButton
                        label="Subir"
                        disabled={index === 0}
                        onClick={() => void onMoveProduct(product, -1)}
                      >
                        ↑
                      </MiniIconButton>

                      <MiniIconButton
                        label="Bajar"
                        disabled={index === productsInCategory.length - 1}
                        onClick={() => void onMoveProduct(product, 1)}
                      >
                        ↓
                      </MiniIconButton>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[24px] border border-[#bfe8ee] bg-white p-4 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
                  Recategorizar prendas
                </p>

                <p className="mt-1 text-[12px] font-bold text-[#334155] [html[data-theme='dark']_&]:text-[#cbd5e1]">
                  Mueve productos hacia esta categoría.
                </p>
              </div>

              <span className="rounded-full bg-[#e6f8fb] px-3 py-1 text-[12px] font-black text-[#087381] [html[data-theme='dark']_&]:bg-[#00b8c8]/10 [html[data-theme='dark']_&]:text-[#00b8c8]">
                {selectedProducts.length}
              </span>
            </div>

            <div className="relative mb-3">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0ea5b7]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>

              <input
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
                placeholder="Buscar producto..."
                className="admin-control h-10 !pl-10"
              />
            </div>

            <div className="max-h-[235px] space-y-2 overflow-y-auto pr-1">
              {movableProducts.length === 0 ? (
                <EmptyState message="No hay productos disponibles para mover." />
              ) : (
                movableProducts.map((product) => {
                  const selected = selectedProducts.includes(product.id);

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() =>
                        setSelectedProducts((prev) =>
                          selected
                            ? prev.filter((id) => id !== product.id)
                            : [...prev, product.id],
                        )
                      }
                      className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                        selected
                          ? "border-[#21b7c7] bg-[#e6f8fb] text-[#087381] [html[data-theme='dark']_&]:border-[#00b8c8]/30 [html[data-theme='dark']_&]:bg-[#00b8c8]/10 [html[data-theme='dark']_&]:text-[#00b8c8]"
                          : "border-[#bfe8ee] bg-[#f7fcfd] text-[#071827] hover:border-[#21b7c7] hover:bg-[#f4fbfd] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-white [html[data-theme='dark']_&]:hover:bg-[#14242e]"
                      }`}
                    >
                      <span className="block truncate text-[13px] font-black">
                        {productTitle(product)}
                      </span>

                      <span className="mt-1 block truncate text-[11px] font-bold text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
                        /
                        {categoryLabelBySlug[product.category] ||
                          product.category}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="shrink-0 border-t border-[#cfe8ee] bg-[#f4fbfd] p-4 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319]">
        <button
          type="button"
          onClick={() => void onAssignSelected()}
          disabled={selectedProducts.length === 0 || saving || !selectedCategory}
          className="h-11 w-full rounded-2xl bg-[#21b7c7] text-[13px] font-black text-white shadow-[0_12px_24px_rgba(33,183,199,0.2)] transition hover:-translate-y-0.5 hover:bg-[#087381] disabled:cursor-not-allowed disabled:opacity-50 [html[data-theme='dark']_&]:bg-[#00b8c8] [html[data-theme='dark']_&]:text-[#071827] [html[data-theme='dark']_&]:hover:bg-[#9eeef4]"
        >
          {saving
            ? "Asignando..."
            : selectedProducts.length && selectedCategory
              ? `Asignar a ${selectedCategory.label}`
              : "Selecciona productos"}
        </button>
      </div>
    </aside>
  );
}

function MiniIconButton({
  label,
  disabled,
  children,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#bfe8ee] bg-white text-[13px] font-black text-[#475569] transition hover:border-[#21b7c7] hover:text-[#087381] disabled:cursor-not-allowed disabled:opacity-35 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22] [html[data-theme='dark']_&]:text-[#94a3b8] [html[data-theme='dark']_&]:hover:text-[#00b8c8]"
    >
      {children}
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#bfe8ee] bg-white px-4 py-6 text-center text-[13px] font-bold text-[#64748b] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22] [html[data-theme='dark']_&]:text-[#94a3b8]">
      {message}
    </div>
  );
}