"use client";

import Image from "next/image";
import type { Product } from "@/types/product";
import {
  deleteAdminProduct,
  toggleAdminProductStatus,
} from "@/lib/adminProducts";
import { formatMoney, getProductImages } from "./productFormUtils";

type ProductTableProps = {
  products: Product[];
  loading: boolean;
  categoryLabelBySlug: Record<string, string>;
  onEdit: (product: Product) => void;
  onProductUpdated: (product: Product) => void;
  onProductDeleted: (productId: string) => void;
};

export default function ProductTable({
  products,
  loading,
  categoryLabelBySlug,
  onEdit,
  onProductUpdated,
  onProductDeleted,
}: ProductTableProps) {
  async function toggleActive(product: Product) {
    try {
      const updated = await toggleAdminProductStatus(
        product.id,
        !product.active,
      );

      onProductUpdated(updated);
    } catch (error) {
      console.error(error);
      alert("Error al actualizar el estado.");
    }
  }

  async function handleDelete(id: string) {
    const confirmed = confirm(
      "¿Estás seguro de que deseas eliminar este producto?",
    );

    if (!confirmed) return;

    try {
      const deleted = await deleteAdminProduct(id);
      onProductDeleted(deleted.id);
    } catch (error) {
      console.error(error);
      alert("Error al eliminar el producto.");
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] text-left text-sm">
        <thead className="border-b border-[#cfe8ee] bg-[#eaf8fb] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#162530]">
          <tr>
            {[
              "Producto",
              "Categoría",
              "Precio",
              "Mayorista",
              "Estado",
              "Acciones",
            ].map((header) => (
              <th
                key={header}
                className={`px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#0f5f6d] [html[data-theme='dark']_&]:text-[#00b8c8] ${
                  header === "Acciones" ? "text-right" : ""
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-[#d5e9ee] bg-white [html[data-theme='dark']_&]:divide-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]">
          {loading && (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-16 text-center text-[13px] font-black text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]"
              >
                <span className="inline-flex items-center gap-3">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#bfe8ee] border-t-[#21b7c7]" />
                  Cargando catálogo de productos...
                </span>
              </td>
            </tr>
          )}

          {!loading &&
            products.map((product) => (
              <tr
                key={product.id}
                className="transition-colors duration-150 hover:bg-[#f4fbfd] [html[data-theme='dark']_&]:hover:bg-[#14242e]"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#c7e8ee] bg-white shadow-sm [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319]">
                      <Image
                        unoptimized
                        src={getProductImages(product)[0] || "/rokko.png"}
                        alt={product.name || ""}
                        fill
                        sizes="44px"
                        className="object-contain p-1.5"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-black text-[#071827] [html[data-theme='dark']_&]:text-white">
                        {product.short_name || product.name}
                      </p>

                      <p className="mt-0.5 max-w-[320px] truncate text-[11px] font-bold text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
                        {product.name}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-3">
                  <span className="inline-flex rounded-full bg-[#e6f8fb] px-2.5 py-1 text-[10px] font-black capitalize text-[#0f5f6d] [html[data-theme='dark']_&]:bg-[#00b8c8]/10 [html[data-theme='dark']_&]:text-[#00b8c8]">
                    {categoryLabelBySlug[product.category] ||
                      product.category}
                  </span>
                </td>

                <td className="px-5 py-3 text-[13px] font-black text-[#071827] [html[data-theme='dark']_&]:text-white">
                  {formatMoney(product.price)}
                </td>

                <td className="px-5 py-3 text-[13px] font-black text-[#475569] [html[data-theme='dark']_&]:text-[#cbd5e1]">
                  {formatMoney(product.wholesale_price)}
                </td>

                <td className="px-5 py-3">
                  <button
                    type="button"
                    onClick={() => toggleActive(product)}
                    className={`inline-flex min-w-[82px] items-center justify-center rounded-full px-3 py-1.5 text-[11px] font-black transition ${
                      product.active
                        ? "border border-[#21b7c7]/40 bg-[#e6f8fb] text-[#087381] hover:bg-[#dff7fa] [html[data-theme='dark']_&]:border-[#00b8c8]/30 [html[data-theme='dark']_&]:bg-[#00b8c8]/10 [html[data-theme='dark']_&]:text-[#00b8c8]"
                        : "border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-[#94a3b8]"
                    }`}
                  >
                    {product.active ? "Activo" : "Inactivo"}
                  </button>
                </td>

                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-[11px] font-black text-amber-700 transition hover:bg-amber-100 [html[data-theme='dark']_&]:border-amber-500/25 [html[data-theme='dark']_&]:bg-amber-500/10 [html[data-theme='dark']_&]:text-amber-300"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-[11px] font-black text-red-600 transition hover:bg-red-100 [html[data-theme='dark']_&]:border-red-500/25 [html[data-theme='dark']_&]:bg-red-500/10 [html[data-theme='dark']_&]:text-red-300"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}

          {!loading && products.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-16 text-center text-[13px] font-black text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]"
              >
                Ningún producto coincide con los filtros aplicados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}