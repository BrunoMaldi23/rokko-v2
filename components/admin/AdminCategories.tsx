"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
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

const emptyDraft: Partial<ProductCategory> = {
  label: "",
  slug: "",
  description: "",
  code: "",
  sort_order: 0,
  active: true,
};

type SideTab = "products" | "form";

function productTitle(product: Product) {
  return product.short_name || product.name;
}

function countByCategory(products: Product[]) {
  return products.reduce<Record<string, number>>((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [targetCategory, setTargetCategory] = useState("");
  const [draft, setDraft] = useState<Partial<ProductCategory>>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sideTab, setSideTab] = useState<SideTab>("products");
  const [categorySearch, setCategorySearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    let mounted = true;

    Promise.all([
      fetchAdminCategories().catch(() => fallbackProductCategories),
      getAdminProducts(),
    ])
      .then(([categoryRows, productRows]) => {
        if (!mounted) return;

        const sortedCategories = [...categoryRows].sort(
          (a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0),
        );

        setCategories(sortedCategories);
        setProducts(productRows);
        setTargetCategory(sortedCategories[0]?.slug || "");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const counts = useMemo(() => countByCategory(products), [products]);

  const selectedCategory = categories.find(
    (category) => category.slug === targetCategory,
  );

  const visibleCount = categories.filter((category) => category.active).length;

  const totalAssigned = useMemo(() => {
    return categories.reduce(
      (sum, category) => sum + (counts[category.slug] || 0),
      0,
    );
  }, [categories, counts]);

  const filteredCategories = useMemo(() => {
    const q = categorySearch.toLowerCase().trim();

    return categories
      .filter((category) => {
        if (!q) return true;

        return `${category.label} ${category.slug} ${category.code} ${category.description}`
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
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

  function resetDraft() {
    setEditingId(null);
    setDraft({
      ...emptyDraft,
      sort_order: categories.length
        ? Math.max(
            ...categories.map((category) => Number(category.sort_order || 0)),
          ) + 10
        : 10,
    });
    setSideTab("form");
  }

  function selectCategory(category: ProductCategory) {
    setTargetCategory(category.slug);
    setSelectedProducts([]);
    setProductSearch("");
    setSideTab("products");
  }

  function editCategory(category: ProductCategory) {
    setEditingId(category.id || category.slug);
    setDraft(category);
    setTargetCategory(category.slug);
    setSideTab("form");
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
          prev
            .map((item) => (item.id === updated.id ? updated : item))
            .sort((a, b) => a.sort_order - b.sort_order),
        );

        setTargetCategory(updated.slug);
      } else {
        const created = await createAdminCategory(draft);

        setCategories((prev) =>
          [...prev, created].sort((a, b) => a.sort_order - b.sort_order),
        );

        setTargetCategory(created.slug);
      }

      setEditingId(null);
      setDraft(emptyDraft);
      setSideTab("products");
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

  async function toggleCategory(category: ProductCategory) {
    const updated = await updateAdminCategory({
      ...category,
      active: !category.active,
    });

    setCategories((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
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
    <div className="grid h-[calc(100vh-150px)] min-h-[620px] gap-5 overflow-hidden xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-[var(--adm-border-default)] bg-[var(--adm-bg-surface)] shadow-[var(--adm-shadow-panel)]">
        <div className="shrink-0 border-b border-[var(--adm-border-default)] bg-[linear-gradient(135deg,var(--adm-bg-surface)_0%,var(--adm-bg-surface-hover)_100%)] px-5 py-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <p className="admin-eyebrow text-[11px] font-black uppercase tracking-[0.18em]">
                Familias comerciales
              </p>

              <h2 className="mt-1 text-[25px] font-black leading-none tracking-[-0.04em] text-[var(--adm-text-heading)]">
                Directorio de categorías
              </h2>

              <p className="mt-2 text-sm font-semibold text-[var(--adm-text-secondary)]">
                Gestiona estructura, visibilidad, orden y productos asociados.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 xl:min-w-[310px]">
              <MetricCard label="Categorías" value={categories.length} />
              <MetricCard label="Visibles" value={visibleCount} />
              <MetricCard label="Productos" value={products.length} />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
              <div className="relative w-full sm:w-[320px]">
                <svg
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--adm-teal-500)]"
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
                  className="admin-control h-11 w-full rounded-2xl !pl-10 pr-4 text-sm font-semibold outline-none"
                />
              </div>

              <button
                type="button"
                onClick={resetDraft}
                className="h-11 shrink-0 rounded-2xl bg-[var(--adm-teal-500)] px-5 text-sm font-black text-white shadow-[0_14px_28px_rgba(32,184,199,0.2)] transition hover:bg-[var(--adm-teal-700)]"
              >
                + Nueva categoría
              </button>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--adm-bg-surface-hover)] p-4">
          {loading ? (
            <div className="flex h-full min-h-[240px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--adm-bg-badge-visible)] border-t-[var(--adm-teal-500)]" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <EmptyState message="No hay categorías para mostrar." />
          ) : (
            <div className="overflow-hidden rounded-[24px] border border-[var(--adm-border-default)] bg-[var(--adm-bg-surface)]">
              <div className="grid grid-cols-[minmax(260px,1fr)_90px_70px_90px_174px] items-center border-b border-[var(--adm-border-default)] bg-[var(--adm-bg-surface-hover)] px-4 py-3">
                <TableHead>Categoría</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead align="right">Acciones</TableHead>
              </div>

              <div className="divide-y divide-[var(--adm-border-default)]">
                {filteredCategories.map((category, index) => {
                  const selected = category.slug === targetCategory;
                  const count = counts[category.slug] || 0;

                  return (
                    <article
                      key={category.slug}
                      onClick={() => selectCategory(category)}
                      className={`grid cursor-pointer grid-cols-[minmax(260px,1fr)_90px_70px_90px_174px] items-center px-4 py-3 transition ${
                        selected
                          ? "bg-[var(--adm-bg-badge-visible)]"
                          : "hover:bg-[var(--adm-bg-surface-hover)]"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--adm-teal-500)] text-xs font-black text-white shadow-[0_10px_22px_rgba(32,184,199,0.16)]">
                          {category.code ||
                            category.label.slice(0, 2).toUpperCase()}
                        </span>

                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-2">
                            <h3 className="truncate text-sm font-black text-[var(--adm-text-primary)]">
                              {category.label}
                            </h3>

                            {selected && (
                              <span className="rounded-full bg-[var(--adm-teal-500)] px-2 py-0.5 text-[10px] font-black text-white">
                                Activa
                              </span>
                            )}
                          </div>

                          <p className="mt-0.5 truncate font-mono text-[11px] text-[var(--adm-text-secondary)]">
                            /{category.slug}
                          </p>

                          <p className="mt-1 line-clamp-1 text-xs font-semibold text-[var(--adm-text-secondary)]">
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
                              ? "border-[var(--adm-teal-500)]/25 bg-[var(--adm-bg-badge-visible)] text-[var(--adm-text-badge-visible)]"
                              : "border-[var(--adm-border-default)] bg-[var(--adm-bg-surface-hover)] text-[var(--adm-text-secondary)]"
                          }`}
                        >
                          {category.active ? "Visible" : "Oculta"}
                        </span>
                      </div>

                      <div
                        className="flex justify-end gap-1.5"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <ActionButton onClick={() => editCategory(category)}>
                          Editar
                        </ActionButton>

                        <ActionButton
                          onClick={() => void toggleCategory(category)}
                        >
                          {category.active ? "Ocultar" : "Mostrar"}
                        </ActionButton>

                        <ActionButton
                          danger
                          onClick={() => void removeCategory(category)}
                        >
                          Eliminar
                        </ActionButton>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      <aside className="flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-[var(--adm-border-default)] bg-[var(--adm-bg-surface)] shadow-[var(--adm-shadow-panel)]">
        <div className="shrink-0 border-b border-[var(--adm-border-default)] bg-[linear-gradient(135deg,var(--adm-bg-surface)_0%,var(--adm-bg-surface-hover)_100%)] px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="admin-eyebrow text-[11px] font-black uppercase tracking-[0.18em]">
                Panel de categoría
              </p>

              <h3 className="mt-1 truncate text-[23px] font-black leading-none tracking-[-0.04em] text-[var(--adm-text-heading)]">
                {sideTab === "form"
                  ? editingId
                    ? "Editar categoría"
                    : "Crear categoría"
                  : selectedCategory?.label || "Productos"}
              </h3>

              <p className="mt-2 text-sm font-semibold leading-5 text-[var(--adm-text-secondary)]">
                {sideTab === "form"
                  ? "Define datos visibles en el catálogo."
                  : `${productsInCategory.length} productos asociados.`}
              </p>
            </div>

            {selectedCategory && sideTab === "products" && (
              <span className="shrink-0 rounded-full border border-[var(--adm-teal-500)]/25 bg-[var(--adm-bg-badge-visible)] px-3 py-1.5 text-xs font-black text-[var(--adm-text-badge-visible)]">
                {selectedCategory.code}
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-[var(--adm-border-default)] bg-[var(--adm-bg-surface)] p-1">
            <SideTabButton
              active={sideTab === "products"}
              onClick={() => setSideTab("products")}
            >
              Productos
            </SideTabButton>

            <SideTabButton active={sideTab === "form"} onClick={resetDraft}>
              Datos
            </SideTabButton>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {sideTab === "form" && (
            <div className="grid gap-4">
              <Field label="Nombre">
                <input
                  className="admin-control h-11 w-full rounded-2xl px-4 text-sm font-semibold outline-none"
                  value={draft.label || ""}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, label: event.target.value }))
                  }
                  placeholder="Ej. Poleras"
                />
              </Field>

              <div className="grid grid-cols-[1fr_90px] gap-3">
                <Field label="Slug">
                  <input
                    className="admin-control h-11 w-full rounded-2xl px-4 text-sm font-semibold outline-none"
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
                    className="admin-control h-11 w-full rounded-2xl px-4 text-sm font-semibold uppercase outline-none"
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
                  className="admin-control min-h-24 w-full resize-none rounded-2xl px-4 py-3 text-sm font-semibold outline-none"
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

              <label className="flex items-center justify-between rounded-2xl border border-[var(--adm-border-default)] bg-[var(--adm-bg-surface-hover)] px-4 py-3 text-sm font-black text-[var(--adm-text-primary)]">
                <span>Visible en sitio</span>

                <input
                  type="checkbox"
                  checked={draft.active ?? true}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      active: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-[var(--adm-teal-500)]"
                />
              </label>
            </div>
          )}

          {sideTab === "products" && (
            <div className="grid gap-4">
              <div className="rounded-[22px] border border-[var(--adm-border-default)] bg-[var(--adm-bg-surface-hover)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="admin-eyebrow text-[11px] font-black uppercase tracking-[0.16em]">
                      Orden público
                    </p>

                    <p className="mt-1 text-xs font-semibold leading-5 text-[var(--adm-text-secondary)]">
                      Ajusta el orden visual de esta familia.
                    </p>
                  </div>

                  <span className="rounded-2xl bg-[var(--adm-bg-surface)] px-3 py-2 text-sm font-black text-[var(--adm-text-primary)]">
                    {productsInCategory.length}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {productsInCategory.length === 0 ? (
                  <EmptyState message="Esta categoría todavía no tiene productos." />
                ) : (
                  productsInCategory.map((product, index) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--adm-border-default)] bg-[var(--adm-bg-surface)] px-3 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--adm-bg-badge-visible)] text-xs font-black text-[var(--adm-text-badge-visible)]">
                          {index + 1}
                        </span>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-[var(--adm-text-primary)]">
                            {productTitle(product)}
                          </p>

                          <p className="mt-0.5 text-xs font-semibold text-[var(--adm-text-secondary)]">
                            Orden {(index + 1) * 10}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-1">
                        <MiniIconButton
                          label="Subir"
                          disabled={index === 0}
                          onClick={() => void moveProduct(product, -1)}
                        >
                          ↑
                        </MiniIconButton>

                        <MiniIconButton
                          label="Bajar"
                          disabled={index === productsInCategory.length - 1}
                          onClick={() => void moveProduct(product, 1)}
                        >
                          ↓
                        </MiniIconButton>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-[var(--adm-border-default)] pt-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="admin-eyebrow text-[11px] font-black uppercase tracking-[0.16em]">
                      Asignar productos
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[var(--adm-text-secondary)]">
                      Mueve productos desde otras categorías.
                    </p>
                  </div>

                  <span className="rounded-full bg-[var(--adm-bg-badge-visible)] px-3 py-1 text-xs font-black text-[var(--adm-text-badge-visible)]">
                    {selectedProducts.length}
                  </span>
                </div>

                <div className="relative mb-3">
                  <svg
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--adm-teal-500)]"
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
                    className="admin-control h-10 w-full rounded-2xl !pl-10 pr-4 text-sm font-semibold outline-none"
                  />
                </div>

                <div className="max-h-[190px] space-y-2 overflow-y-auto pr-1">
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
                              ? "border-[var(--adm-teal-500)] bg-[var(--adm-bg-badge-visible)] text-[var(--adm-text-badge-visible)]"
                              : "border-[var(--adm-border-default)] bg-[var(--adm-bg-surface)] text-[var(--adm-text-primary)] hover:border-[var(--adm-teal-300)] hover:bg-[var(--adm-bg-surface-hover)]"
                          }`}
                        >
                          <span className="block truncate text-sm font-black">
                            {productTitle(product)}
                          </span>

                          <span className="mt-1 block truncate text-xs font-semibold text-[var(--adm-text-secondary)]">
                            /{product.category}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-[var(--adm-border-default)] bg-[var(--adm-bg-surface-hover)] p-4">
          {sideTab === "form" ? (
            <button
              type="button"
              onClick={() => void saveCategory()}
              disabled={saving}
              className="h-11 w-full rounded-2xl bg-[var(--adm-teal-500)] text-sm font-black text-white shadow-[0_14px_28px_rgba(32,184,199,0.2)] transition hover:bg-[var(--adm-teal-700)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Guardando..."
                : editingId
                  ? "Guardar categoría"
                  : "Crear categoría"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void assignSelected()}
              disabled={selectedProducts.length === 0 || saving}
              className="h-11 w-full rounded-2xl bg-[var(--adm-teal-500)] text-sm font-black text-white shadow-[0_14px_28px_rgba(32,184,199,0.2)] transition hover:bg-[var(--adm-teal-700)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Asignando..."
                : selectedProducts.length
                  ? `Asignar ${selectedProducts.length} producto(s)`
                  : "Selecciona productos"}
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[var(--adm-border-default)] bg-[var(--adm-bg-surface-hover)] px-3 py-2.5">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--adm-text-muted)]">
        {label}
      </p>

      <p className="mt-1 text-xl font-black leading-none text-[var(--adm-teal-500)]">
        {value}
      </p>
    </div>
  );
}

function StatusPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--adm-border-default)] bg-[var(--adm-bg-surface)] px-3 py-2 text-xs font-black text-[var(--adm-text-secondary)]">
      <span>{label}</span>

      <span className="rounded-full bg-[var(--adm-bg-badge-visible)] px-2 py-0.5 text-[10px] text-[var(--adm-text-badge-visible)]">
        {value}
      </span>
    </span>
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
      className={`text-[10px] font-black uppercase tracking-[0.14em] text-[var(--adm-text-muted)] ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </p>
  );
}

function TableValue({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm font-black text-[var(--adm-text-primary)]">
      {children}
    </p>
  );
}

function ActionButton({
  children,
  danger = false,
  onClick,
}: {
  children: ReactNode;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2 text-xs font-black transition ${
        danger
          ? "border border-[var(--adm-error)]/25 bg-[var(--adm-error-bg)] text-[var(--adm-error-dark)] hover:border-[var(--adm-error)]"
          : "border border-[var(--adm-teal-500)]/20 bg-[var(--adm-bg-badge-visible)] text-[var(--adm-text-badge-visible)] hover:border-[var(--adm-teal-500)]"
      }`}
    >
      {children}
    </button>
  );
}

function SideTabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-xl text-sm font-black transition ${
        active
          ? "bg-[var(--adm-teal-500)] text-white shadow-[0_10px_22px_rgba(32,184,199,0.18)]"
          : "text-[var(--adm-text-secondary)] hover:bg-[var(--adm-bg-surface-hover)] hover:text-[var(--adm-text-primary)]"
      }`}
    >
      {children}
    </button>
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
      className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--adm-border-default)] bg-[var(--adm-bg-surface-hover)] text-sm font-black text-[var(--adm-text-secondary)] transition hover:border-[var(--adm-teal-300)] hover:text-[var(--adm-teal-500)] disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--adm-border-default)] bg-[var(--adm-bg-surface)] px-4 py-6 text-center text-sm font-semibold text-[var(--adm-text-secondary)]">
      {message}
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
      <span className="mb-2 block text-xs font-semibold tracking-wide text-[var(--adm-text-secondary)]">
        {label}
      </span>

      {children}
    </label>
  );
}