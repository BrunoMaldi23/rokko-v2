"use client";

import Image from "next/image";
import type { ProductCategory } from "@/types/category";
import type { Product } from "@/types/product";
import { categoryCode, getProductImage, productTitle } from "./categoryUtils";

type CategoryProductsModalProps = {
  category: ProductCategory;
  products: Product[];
  onClose: () => void;
};

export default function CategoryProductsModal({
  category,
  products,
  onClose,
}: CategoryProductsModalProps) {
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-5">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-md"
        onClick={onClose}
        aria-label="Cerrar modal"
      />

      <section className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-[#bfe8ee] bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]">
        <header className="shrink-0 border-b border-[#cfe8ee] bg-[linear-gradient(135deg,#f9feff_0%,#eefbfd_58%,#f7fdff_100%)] px-6 py-5 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[linear-gradient(135deg,#111b22_0%,#0f2630_58%,#111b22_100%)]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 [html[data-theme='dark']_&]:text-emerald-300">
                Vista de categoría
              </p>

              <div className="mt-1 flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-xs font-black text-white shadow-[0_10px_22px_rgba(16,185,129,0.18)]">
                  {categoryCode(category)}
                </span>

                <div className="min-w-0">
                  <h3 className="truncate text-[26px] font-black leading-none tracking-[-0.045em] text-[#071827] [html[data-theme='dark']_&]:text-white">
                    {category.label}
                  </h3>

                  <p className="mt-1 text-[12px] font-bold text-[#475569] [html[data-theme='dark']_&]:text-[#94a3b8]">
                    {products.length} producto(s) asociados.
                  </p>
                </div>
              </div>
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

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#f4fbfd] p-5 [html[data-theme='dark']_&]:bg-[#0b1319]">
          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#bfe8ee] bg-white px-4 py-12 text-center text-[13px] font-bold text-[#64748b] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22] [html[data-theme='dark']_&]:text-[#94a3b8]">
              Esta categoría todavía no tiene productos asociados.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product, index) => (
                <article
                  key={product.id}
                  className="rounded-2xl border border-[#bfe8ee] bg-white p-3 shadow-[0_8px_22px_rgba(8,115,129,0.04)] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]"
                >
                  <div className="flex gap-3">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#c7e8ee] bg-[#f7fcfd] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319]">
                      <Image
                        unoptimized
                        src={getProductImage(product)}
                        alt={product.name || ""}
                        fill
                        sizes="80px"
                        className="object-contain p-2"
                      />
                    </div>

                    <div className="min-w-0">
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black text-emerald-700 [html[data-theme='dark']_&]:bg-emerald-500/10 [html[data-theme='dark']_&]:text-emerald-300">
                        Orden {(index + 1) * 10}
                      </span>

                      <h4 className="mt-2 line-clamp-2 text-[13px] font-black leading-5 text-[#071827] [html[data-theme='dark']_&]:text-white">
                        {productTitle(product)}
                      </h4>

                      <p className="mt-1 line-clamp-2 text-[11px] font-bold leading-4 text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
                        {product.name}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}