"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProductCategory } from "@/types/category";
import type { Product } from "@/types/product";
import {
  assignProductsToCategory,
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  normalizeCategoryInput,
  updateAdminCategory,
} from "@/lib/adminCategories";
import { getAdminProducts, updateAdminProduct } from "@/lib/adminProducts";
import { fallbackProductCategories } from "@/lib/productCategories";
import CategoryTable from "./categories/CategoryTable";
import CategoryProductsPanel from "./categories/CategoryProductsPanel";
import CategoryEditorModal from "./categories/CategoryEditorModal";
import CategoryProductsModal from "./categories/CategoryProductsModal";
import {
  countByCategory,
  emptyDraft,
  productTitle,
  sortCategories,
} from "./categories/categoryUtils";

export default function AdminCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [targetCategory, setTargetCategory] = useState("");
  const [draft, setDraft] = useState<Partial<ProductCategory>>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [categorySearch, setCategorySearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [viewCategory, setViewCategory] = useState<ProductCategory | null>(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      fetchAdminCategories().catch(() => fallbackProductCategories),
      getAdminProducts(),
    ])
      .then(([categoryRows, productRows]) => {
        if (!mounted) return;

        const sortedCategories = sortCategories(categoryRows);

        setCategories(sortedCategories);
        setProducts(productRows);
        setTargetCategory(sortedCategories[0]?.slug || "");

        setDraft({
          ...emptyDraft,
          sort_order: sortedCategories.length
            ? Math.max(
                ...sortedCategories.map((category) =>
                  Number(category.sort_order || 0),
                ),
              ) + 10
            : 10,
        });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isCategoryModalOpen && !viewCategory) return;

    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, [isCategoryModalOpen, viewCategory]);

  const counts = useMemo(() => countByCategory(products), [products]);

  const selectedCategory = useMemo(() => {
    return categories.find((category) => category.slug === targetCategory);
  }, [categories, targetCategory]);

  const visibleCount = useMemo(() => {
    return categories.filter((category) => category.active).length;
  }, [categories]);

  const totalAssigned = useMemo(() => {
    return categories.reduce(
      (sum, category) => sum + (counts[category.slug] || 0),
      0,
    );
  }, [categories, counts]);

  const categoryLabelBySlug = useMemo(() => {
    return categories.reduce<Record<string, string>>((acc, category) => {
      acc[category.slug] = category.label;
      return acc;
    }, {});
  }, [categories]);

  const filteredCategories = useMemo(() => {
    const q = categorySearch.toLowerCase().trim();

    return sortCategories(
      categories.filter((category) => {
        if (!q) return true;

        return `${category.label} ${category.slug} ${category.code} ${category.description}`
          .toLowerCase()
          .includes(q);
      }),
    );
  }, [categories, categorySearch]);

  const productsInCategory = useMemo(() => {
    return products
      .filter((product) => product.category === targetCategory)
      .sort((a, b) => {
        const order = Number(a.sort_order || 0) - Number(b.sort_order || 0);
        if (order !== 0) return order;

        return productTitle(a).localeCompare(productTitle(b), "es");
      });
  }, [products, targetCategory]);

  const modalProducts = useMemo(() => {
    if (!viewCategory) return [];

    return products
      .filter((product) => product.category === viewCategory.slug)
      .sort((a, b) => {
        const order = Number(a.sort_order || 0) - Number(b.sort_order || 0);
        if (order !== 0) return order;

        return productTitle(a).localeCompare(productTitle(b), "es");
      });
  }, [products, viewCategory]);

  const movableProducts = useMemo(() => {
    const q = productSearch.toLowerCase().trim();

    return products
      .filter((product) => product.category !== targetCategory)
      .filter((product) => {
        if (!q) return true;

        return `${productTitle(product)} ${product.category}`
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => productTitle(a).localeCompare(productTitle(b), "es"));
  }, [products, productSearch, targetCategory]);

  const normalizedDraft = normalizeCategoryInput(draft);

  function getNextSortOrder() {
    return categories.length
      ? Math.max(
          ...categories.map((category) => Number(category.sort_order || 0)),
        ) + 10
      : 10;
  }

  function openCreateCategory() {
    setEditingId(null);
    setDraft({
      ...emptyDraft,
      sort_order: getNextSortOrder(),
      active: true,
    });
    setIsCategoryModalOpen(true);
  }

  function openEditCategory(category: ProductCategory) {
    setEditingId(category.id || category.slug);
    setDraft(category);
    setTargetCategory(category.slug);
    setIsCategoryModalOpen(true);
  }

  function closeCategoryModal() {
    setIsCategoryModalOpen(false);
    setEditingId(null);
    setDraft({
      ...emptyDraft,
      sort_order: getNextSortOrder(),
      active: true,
    });
  }

  function selectCategory(category: ProductCategory) {
    setTargetCategory(category.slug);
    setSelectedProducts([]);
    setProductSearch("");
  }

  async function saveCategory() {
    setSaving(true);

    try {
      if (editingId) {
        const current = categories.find(
          (category) => (category.id || category.slug) === editingId,
        );

        if (!current) return;

        const updated = await updateAdminCategory({
          ...current,
          ...draft,
        } as ProductCategory);

        setCategories((prev) =>
          sortCategories(
            prev.map((item) =>
              (item.id || item.slug) === (updated.id || updated.slug)
                ? updated
                : item,
            ),
          ),
        );

        setTargetCategory(updated.slug);
      } else {
        const created = await createAdminCategory(draft);

        setCategories((prev) => sortCategories([...prev, created]));
        setTargetCategory(created.slug);
      }

      closeCategoryModal();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la categoría.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeCategory(category: ProductCategory) {
    if (!category.id) return;

    if (!confirm(`¿Eliminar categoría "${category.label}"?`)) return;

    await deleteAdminCategory(category.id);

    setCategories((prev) => prev.filter((item) => item.id !== category.id));

    if (targetCategory === category.slug) {
      const nextCategory = categories.find((item) => item.id !== category.id);
      setTargetCategory(nextCategory?.slug || "");
    }
  }

  async function moveProduct(product: Product, direction: -1 | 1) {
    const index = productsInCategory.findIndex((item) => item.id === product.id);
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= productsInCategory.length) return;

    const reordered = [...productsInCategory];
    const [moved] = reordered.splice(index, 1);

    if (!moved) return;

    reordered.splice(nextIndex, 0, moved);

    const withOrder = reordered.map((item, orderIndex) => ({
      ...item,
      sort_order: (orderIndex + 1) * 10,
    }));

    setProducts((prev) =>
      prev.map((item) => withOrder.find((row) => row.id === item.id) || item),
    );

    await Promise.all(withOrder.map((item) => updateAdminProduct(item)));
  }

  async function assignSelected() {
    if (!targetCategory || selectedProducts.length === 0) return;

    setSaving(true);

    try {
      await assignProductsToCategory(selectedProducts, targetCategory);

      const movedProducts = products
        .filter((product) => selectedProducts.includes(product.id))
        .map((product, index) => ({
          ...product,
          category: targetCategory,
          sort_order: (productsInCategory.length + index + 1) * 10,
        }));

      await Promise.all(
        movedProducts.map((product) => updateAdminProduct(product)),
      );

      setProducts((prev) =>
        prev.map(
          (product) =>
            movedProducts.find((item) => item.id === product.id) || product,
        ),
      );

      setSelectedProducts([]);
      setProductSearch("");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudieron asignar productos.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="grid h-[calc(100vh-145px)] min-h-[680px] gap-5 overflow-hidden xl:grid-cols-[minmax(0,1fr)_440px] 2xl:grid-cols-[minmax(0,1fr)_470px]">
        <section className="flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-[#bfe8ee] bg-[linear-gradient(180deg,#fbfeff_0%,#f3fbfd_100%)] shadow-[0_12px_30px_rgba(8,115,129,0.06)] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[linear-gradient(180deg,#111b22_0%,#0f1a22_100%)] [html[data-theme='dark']_&]:shadow-[0_18px_42px_rgba(0,0,0,0.32)]">
          <div className="shrink-0 border-b border-[#cfe8ee] bg-[linear-gradient(135deg,#f9feff_0%,#eefbfd_58%,#f7fdff_100%)] px-5 py-4 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[linear-gradient(135deg,#111b22_0%,#0f2630_58%,#111b22_100%)]">
            <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
                  Familias comerciales
                </p>

                <h2 className="mt-1 text-[25px] font-black leading-none tracking-[-0.045em] text-[#071827] [html[data-theme='dark']_&]:text-white">
                  Directorio de categorías
                </h2>

                <p className="mt-2 text-[13px] font-bold text-[#334155] [html[data-theme='dark']_&]:text-[#cbd5e1]">
                  Gestiona estructura, visibilidad y productos asociados.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 2xl:min-w-[320px]">
                <MetricCard label="Categorías" value={categories.length} />
                <MetricCard label="Visibles" value={visibleCount} />
                <MetricCard label="Productos" value={products.length} />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
              <div className="flex flex-wrap gap-2">
                <StatusPill label="Asignados" value={totalAssigned} />
                <StatusPill
                  label="Sin asignar"
                  value={Math.max(0, products.length - totalAssigned)}
                />
                <StatusPill
                  label="Ocultas"
                  value={categories.length - visibleCount}
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative w-full 2xl:w-[330px]">
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
                    value={categorySearch}
                    onChange={(event) => setCategorySearch(event.target.value)}
                    placeholder="Buscar categoría..."
                    className="admin-control h-11 w-full !pl-10"
                  />
                </div>

                <button
                  type="button"
                  onClick={openCreateCategory}
                  className="h-11 shrink-0 rounded-2xl bg-[#21b7c7] px-5 text-[13px] font-black text-white shadow-[0_12px_24px_rgba(33,183,199,0.2)] transition hover:-translate-y-0.5 hover:bg-[#087381] active:translate-y-0 [html[data-theme='dark']_&]:bg-[#00b8c8] [html[data-theme='dark']_&]:text-[#071827] [html[data-theme='dark']_&]:hover:bg-[#9eeef4]"
                >
                  + Nueva categoría
                </button>
              </div>
            </div>
          </div>

          <CategoryTable
            categories={filteredCategories}
            counts={counts}
            loading={loading}
            targetCategory={targetCategory}
            onSelectCategory={selectCategory}
            onViewCategory={setViewCategory}
            onEditCategory={openEditCategory}
            onRemoveCategory={removeCategory}
          />
        </section>

        <CategoryProductsPanel
          selectedCategory={selectedCategory}
          productsInCategory={productsInCategory}
          movableProducts={movableProducts}
          productSearch={productSearch}
          setProductSearch={setProductSearch}
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
          saving={saving}
          categoryLabelBySlug={categoryLabelBySlug}
          onAssignSelected={assignSelected}
          onMoveProduct={moveProduct}
        />
      </div>

      {isCategoryModalOpen && (
        <CategoryEditorModal
          draft={draft}
          setDraft={setDraft}
          normalizedDraft={normalizedDraft}
          editingId={editingId}
          saving={saving}
          onClose={closeCategoryModal}
          onSaveCategory={saveCategory}
        />
      )}

      {viewCategory && (
        <CategoryProductsModal
          category={viewCategory}
          products={modalProducts}
          onClose={() => setViewCategory(null)}
        />
      )}
    </>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#bfe8ee] bg-[#f6fcfe] px-3 py-2.5 text-center [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319]/70">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
        {label}
      </p>

      <p className="mt-1 text-[22px] font-black leading-none text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
        {value}
      </p>
    </div>
  );
}

function StatusPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#bfe8ee] bg-white px-3 py-2 text-[12px] font-black text-[#334155] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-[#cbd5e1]">
      <span>{label}</span>

      <span className="rounded-full bg-[#e6f8fb] px-2 py-0.5 text-[10px] text-[#0f5f6d] [html[data-theme='dark']_&]:bg-[#00b8c8]/10 [html[data-theme='dark']_&]:text-[#00b8c8]">
        {value}
      </span>
    </span>
  );
}