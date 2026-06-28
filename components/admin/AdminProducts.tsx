"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";
import type { ProductCategory } from "@/types/category";
import { getAdminProducts } from "@/lib/adminProducts";
import { fetchAdminCategories } from "@/lib/adminCategories";
import { fallbackProductCategories } from "@/lib/productCategories";
import ProductTable from "./products/ProductTable";
import ProductEditorModal from "./products/ProductEditorModal";

const initialProductState: Partial<Product> = {
  name: "",
  short_name: "",
  slug: "",
  category: "poleras",
  description: "",
  extract: "",
  price: 0,
  wholesale_price: null,
  wholesale_from: null,
  price_tiers: [],
  image: "",
  images: [],
  sizes: [],
  colors: [],
  color_images: {},
  composition: "",
  weight: "",
  technologies: [],
  certifications: [],
  active: true,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>(
    [],
  );

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("todas");
  const [loading, setLoading] = useState(true);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Partial<Product> | null>(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      getAdminProducts(),
      fetchAdminCategories().catch(() => fallbackProductCategories),
    ]).then(([productRows, categoryRows]) => {
      if (!mounted) return;

      setProducts(productRows);
      setProductCategories(
        categoryRows.length ? categoryRows : fallbackProductCategories,
      );
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isPanelOpen) return;

    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, [isPanelOpen]);

  const categoryOptions = useMemo(() => {
    return [
      { value: "todas", label: "Todas las categorías" },
      ...productCategories.map((item) => ({
        value: item.slug,
        label: item.label,
      })),
    ];
  }, [productCategories]);

  const categoryLabelBySlug = useMemo(() => {
    return productCategories.reduce<Record<string, string>>((acc, item) => {
      acc[item.slug] = item.label;
      return acc;
    }, {});
  }, [productCategories]);

  const filteredProducts = useMemo(() => {
    const cleanSearch = search.toLowerCase().trim();

    return products.filter((product) => {
      const matchesSearch =
        !cleanSearch ||
        product.name?.toLowerCase().includes(cleanSearch) ||
        product.short_name?.toLowerCase().includes(cleanSearch) ||
        product.slug?.toLowerCase().includes(cleanSearch);

      const matchesCategory =
        category === "todas" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const activeProducts = useMemo(() => {
    return products.filter((product) => product.active).length;
  }, [products]);

  function handleCreateClick() {
    setEditingProduct({
      ...initialProductState,
      category: productCategories[0]?.slug || initialProductState.category,
    });
    setIsPanelOpen(true);
  }

  function handleEditClick(product: Product) {
    setEditingProduct({ ...product });
    setIsPanelOpen(true);
  }

  function closePanel() {
    setIsPanelOpen(false);
    setEditingProduct(null);
  }

  function handleProductSaved(product: Product) {
    setProducts((prev) => {
      const exists = prev.some((item) => item.id === product.id);

      if (exists) {
        return prev.map((item) => (item.id === product.id ? product : item));
      }

      return [product, ...prev];
    });

    closePanel();
  }

  function handleProductUpdated(product: Product) {
    setProducts((prev) =>
      prev.map((item) => (item.id === product.id ? product : item)),
    );
  }

  function handleProductDeleted(productId: string) {
    setProducts((prev) => prev.filter((item) => item.id !== productId));

    if (editingProduct?.id === productId) {
      closePanel();
    }
  }

  return (
    <>
      <section className="animate-fade-in overflow-hidden rounded-2xl border border-[#bfe8ee] bg-[linear-gradient(180deg,#fbfeff_0%,#f3fbfd_100%)] shadow-[0_12px_30px_rgba(8,115,129,0.06)] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[linear-gradient(180deg,#111b22_0%,#0f1a22_100%)] [html[data-theme='dark']_&]:shadow-[0_18px_42px_rgba(0,0,0,0.32)]">
        <div className="border-b border-[#cfe8ee] px-5 py-4 sm:px-6 [html[data-theme='dark']_&]:border-[#243542]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
                Inventario
              </p>

              <h2 className="mt-1 text-[24px] font-black leading-tight tracking-[-0.045em] text-[#071827] [html[data-theme='dark']_&]:text-white">
                Productos publicados
              </h2>

              <p className="mt-1 text-[12px] font-bold text-[#334155] [html[data-theme='dark']_&]:text-[#cbd5e1]">
                {products.length} productos cargados, {activeProducts}{" "}
                disponibles para cotizar.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-[#bfe8ee] bg-[#f6fcfe] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319]/70">
                <Metric label="Total" value={products.length} />
                <Metric label="Activos" value={activeProducts} />
                <Metric label="Vista" value={filteredProducts.length} />
              </div>

              <button
                type="button"
                onClick={handleCreateClick}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#21b7c7] px-5 text-[13px] font-black text-white shadow-[0_12px_24px_rgba(33,183,199,0.2)] transition hover:-translate-y-0.5 hover:bg-[#087381] hover:shadow-[0_16px_30px_rgba(8,115,129,0.22)] active:translate-y-0 active:scale-[0.99] [html[data-theme='dark']_&]:bg-[#00b8c8] [html[data-theme='dark']_&]:text-[#071827] [html[data-theme='dark']_&]:hover:bg-[#9eeef4]"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.8}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Nuevo producto
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_260px]">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5-5M10 18a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por producto, nombre corto o slug..."
                className="h-11 w-full rounded-2xl border border-[#bfe8ee] bg-white px-4 pl-10 text-[13px] font-bold text-[#071827] outline-none transition placeholder:text-[#64748b] focus:border-[#21b7c7] focus:ring-4 focus:ring-[#21b7c7]/10 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-white [html[data-theme='dark']_&]:placeholder:text-[#94a3b8] [html[data-theme='dark']_&]:focus:border-[#00b8c8]"
              />
            </div>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-11 rounded-2xl border border-[#bfe8ee] bg-white px-4 text-[13px] font-black text-[#071827] outline-none transition focus:border-[#21b7c7] focus:ring-4 focus:ring-[#21b7c7]/10 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-white [html[data-theme='dark']_&]:focus:border-[#00b8c8]"
            >
              {categoryOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <ProductTable
          products={filteredProducts}
          loading={loading}
          categoryLabelBySlug={categoryLabelBySlug}
          onEdit={handleEditClick}
          onProductUpdated={handleProductUpdated}
          onProductDeleted={handleProductDeleted}
        />
      </section>

      {isPanelOpen && editingProduct && (
        <ProductEditorModal
          product={editingProduct}
          productCategories={productCategories}
          categoryLabelBySlug={categoryLabelBySlug}
          onClose={closePanel}
          onSaved={handleProductSaved}
          onDeleted={handleProductDeleted}
        />
      )}
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-[82px] border-r border-[#cfe8ee] px-4 py-2.5 text-center last:border-r-0 [html[data-theme='dark']_&]:border-[#243542]">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
        {label}
      </p>

      <p className="mt-0.5 text-[18px] font-black leading-none text-[#071827] [html[data-theme='dark']_&]:text-white">
        {value}
      </p>
    </div>
  );
}