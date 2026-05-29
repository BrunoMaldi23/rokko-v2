"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Product } from "@/types/product";
import {
  getAdminProducts,
  toggleAdminProductStatus,
  updateAdminProduct,
  createAdminProduct,
  deleteAdminProduct,
} from "@/lib/adminProducts";
import { uploadImage, deleteStorageImages, parseImageField } from "@/lib/storage";

const categories = [
  { value: "todas", label: "Todas las categorías" },
  { value: "poleras", label: "Poleras" },
  { value: "polerones", label: "Polerones" },
  { value: "parkas", label: "Parkas" },
  { value: "pantalones", label: "Pantalones" },
];

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
  image: "",
  sizes: [],
  colors: [],
  composition: "",
  weight: "",
  technologies: [],
  certifications: [],
  active: true,
};

type ArrayField = keyof Pick<Product, "sizes" | "colors" | "technologies" | "certifications">;

const sizeOptions = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];

const colorOptions = [
  { name: "amarillo", hex: "#eab308" },
  { name: "arena", hex: "#d8c3a5" },
  { name: "azul marino", hex: "#1e3a5f" },
  { name: "azul rey", hex: "#1d4ed8" },
  { name: "azul royal", hex: "#1d4ed8" },
  { name: "blanco", hex: "#ffffff" },
  { name: "camel", hex: "#c19a6b" },
  { name: "celeste", hex: "#93c5fd" },
  { name: "fucsia", hex: "#d946ef" },
  { name: "granate", hex: "#7f1d1d" },
  { name: "gris", hex: "#9ca3af" },
  { name: "gris oscuro", hex: "#4b5563" },
  { name: "gris jaspeado", hex: "#b6bbc3" },
  { name: "gris vigore", hex: "#6b7280" },
  { name: "morado", hex: "#7c3aed" },
  { name: "naranja", hex: "#ea580c" },
  { name: "naranjo", hex: "#ea580c" },
  { name: "negro", hex: "#1a1a1a" },
  { name: "plomo", hex: "#6b7280" },
  { name: "rojo", hex: "#dc2626" },
  { name: "rosa claro", hex: "#f9a8d4" },
  { name: "turqueza", hex: "#14b8a6" },
  { name: "turquesa", hex: "#14b8a6" },
  { name: "verde aceituna", hex: "#4d7c0f" },
  { name: "verde manzana", hex: "#84cc16" },
  { name: "verde mist", hex: "#8fb9a8" },
  { name: "verde pino", hex: "#166534" },
];

const technologyOptions = [
  "Antipilling",
  "Estabilidad dimensional",
  "Solidez de color por luz",
  "Proteccion UPF+",
  "Secado rapido",
  "Respirable",
];

const certificationOptions = [
  "OEKO-TEX",
  "WRAP",
  "BSCI",
  "ISO 9001",
  "Global Recycled Standard",
  "Fair Wear",
];

const fabricOptions = [
  "100% algodon",
  "80% algodon, 20% poliester",
  "65% poliester, 35% algodon",
  "100% poliester",
  "Softshell tecnico",
  "Dry-fit",
  "Polar",
  "Gabardina",
];

function getProductImages(product?: Partial<Product> | null) {
  const directImages = Array.isArray(product?.images) ? product.images : [];
  const parsedImages = parseImageField(product?.image);
  return Array.from(new Set([...directImages, ...parsedImages])).filter(Boolean);
}

function serializeImages(images: string[]) {
  const cleanImages = images.map((image) => image.trim()).filter(Boolean);

  if (cleanImages.length === 0) return "";
  if (cleanImages.length === 1) return cleanImages[0];
  return JSON.stringify(cleanImages);
}

function formatImagesForInput(product?: Partial<Product> | null) {
  return getProductImages(product).join("\n");
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("todas");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estados para el CRUD (Creación, Edición y Eliminación)
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const isNewProduct = !editingProduct?.id;

  useEffect(() => {
    let mounted = true;
    getAdminProducts().then((data) => {
      if (!mounted) return;
      setProducts(data);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchText = search.toLowerCase();
      const matchesSearch =
        product.name?.toLowerCase().includes(searchText) ||
        product.short_name?.toLowerCase().includes(searchText);
      const matchesCategory = category === "todas" || product.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const activeProducts = useMemo(
    () => products.filter((product) => product.active).length,
    [products]
  );

  // Abrir panel para Crear
  function handleCreateClick() {
    setEditingProduct({ ...initialProductState });
    setIsPanelOpen(true);
  }

  // Abrir panel para Editar
  function handleEditClick(product: Product) {
    setEditingProduct({ ...product });
    setIsPanelOpen(true);
  }

  async function toggleActive(product: Product) {
    try {
      const updated = await toggleAdminProductStatus(product.id, !product.active);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err) {
      alert("Error al actualizar el estado.");
      console.error(err);
    }
  }

  function updateField(field: keyof Product, value: string) {
    if (!editingProduct) return;
    const numeric = ["price", "wholesale_price", "wholesale_from"];
    setEditingProduct({
      ...editingProduct,
      [field]: numeric.includes(field) ? (value === "" ? null : Number(value)) : value,
    });
  }

  function updateListField(field: ArrayField, value: string) {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      [field]: value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });
  }

  function formatList(value: unknown) {
    return Array.isArray(value) ? value.join(", ") : "";
  }

  function getArrayValue(field: ArrayField) {
    const value = editingProduct?.[field];
    return Array.isArray(value) ? value : [];
  }

  function toggleArrayValue(field: ArrayField, value: string) {
    if (!editingProduct) return;

    const current = getArrayValue(field);
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    setEditingProduct({
      ...editingProduct,
      [field]: next,
    });
  }

  function setNumberValue(field: "price" | "wholesale_price" | "wholesale_from", value: number) {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      [field]: Math.max(0, value),
    });
  }

  function stepNumberValue(field: "price" | "wholesale_price" | "wholesale_from", step: number) {
    const current = Number(editingProduct?.[field] || 0);
    setNumberValue(field, current + step);
  }

  function updateImageGallery(images: string[]) {
    if (!editingProduct) return;
    const cleanImages = Array.from(new Set(images.map((image) => image.trim()).filter(Boolean)));

    setEditingProduct({
      ...editingProduct,
      image: serializeImages(cleanImages),
      images: cleanImages,
    });
  }

  function updateImageGalleryFromText(value: string) {
    updateImageGallery(
      value
        .split(/\n|,/)
        .map((image) => image.trim())
        .filter(Boolean)
    );
  }

  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(files?: FileList | null) {
    if (!files?.length || !editingProduct) return;
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (imageFiles.length === 0) {
      alert("Selecciona imagenes validas para el producto.");
      return;
    }
    const productId = editingProduct.id || `temp-${Date.now()}`;
    setUploading(true);
    try {
      const uploadedUrls = await Promise.all(
        imageFiles.map((file) => uploadImage(file, productId))
      );
      updateImageGallery([...getProductImages(editingProduct), ...uploadedUrls]);
    } catch (err) {
      alert("Error al subir imagenes. Revisa la consola.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  async function removeGalleryImage(imageToRemove: string) {
    updateImageGallery(
      getProductImages(editingProduct).filter((image) => image !== imageToRemove)
    );
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && imageToRemove.startsWith(supabaseUrl)) {
      try {
        await deleteStorageImages([imageToRemove]);
      } catch (err) {
        console.error("Error al eliminar imagen de Storage:", err);
      }
    }
  }

  function setPrimaryGalleryImage(imageToPromote: string) {
    const images = getProductImages(editingProduct);
    updateImageGallery([
      imageToPromote,
      ...images.filter((image) => image !== imageToPromote),
    ]);
  }

  // Guardar (Soporta Crear y Editar)
  async function saveProduct() {
    if (!editingProduct) return;
    try {
      setSaving(true);
      if (isNewProduct) {
        const created = await createAdminProduct(editingProduct as Omit<Product, "id">);
        setProducts((prev) => [created, ...prev]);
      } else {
        const updated = await updateAdminProduct(editingProduct as Product);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      }
      setIsPanelOpen(false);
      setEditingProduct(null);
    } catch (err) {
      alert("Error al guardar el producto.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  // Eliminar producto
  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto de forma permanente?")) return;
    try {
      const deleted = await deleteAdminProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== deleted.id));
      setIsPanelOpen(false);
      setEditingProduct(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al eliminar el producto.";
      alert(message);
      console.error(err);
    }
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-cyan-100/50 bg-white shadow-sm shadow-slate-100/50 animate-fade-in">
        {/* CABECERA DE LA TABLA */}
        <div className="border-b border-slate-100 bg-white px-5 py-6 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-cyan-600">
                Inventario
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Productos publicados</h2>
              <p className="mt-1 text-sm text-slate-500">
                {products.length} productos cargados, {activeProducts} disponibles para cotizar.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 self-end md:self-auto">
              {/* Bloque de Métricas (Inspirado en image_d77835.png) */}
              <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-cyan-100/30 bg-[#f4fafd]/50">
                <Metric label="Total" value={products.length} />
                <Metric label="Activos" value={activeProducts} />
                <Metric label="Vista" value={filteredProducts.length} />
              </div>
              
              {/* Botón Añadir Producto (CRUD) */}
              <button
                onClick={handleCreateClick}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-cyan-600 hover:shadow-lg hover:shadow-cyan-500/10 active:scale-[0.98]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Nuevo producto
              </button>
            </div>
          </div>

          {/* FILTROS Y BÚSQUEDA */}
          <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_260px]">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5-5M10 18a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por producto o nombre corto..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-cyan-500/50 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all duration-200 focus:border-cyan-500/50 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
            >
              {categories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CONTENEDOR DE LA TABLA */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-slate-50/70 border-b border-slate-100">
              <tr>
                {["Producto", "Categoria", "Precio", "Mayorista", "Estado", "Acciones"].map((header) => (
                  <th
                    key={header}
                    className={`px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ${
                      header === "Acciones" ? "text-right" : ""
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-medium">
                    <span className="inline-flex items-center gap-3">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-100 border-t-cyan-500" />
                      Cargando catálogo de productos...
                    </span>
                  </td>
                </tr>
              )}

              {!loading &&
                filteredProducts.map((product) => (
                  <tr key={product.id} className="transition-colors duration-150 hover:bg-[#f4fafd]/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white p-1 shadow-sm shadow-slate-100">
                          <Image
                            unoptimized
                            src={getProductImages(product)[0] || "/rokko.png"}
                            alt={product.name || ""}
                            width={48}
                            height={48}
                            className="h-auto max-h-full w-auto object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">{product.short_name}</p>
                          <p className="mt-0.5 truncate text-xs text-slate-400">
                            {product.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-600">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ${product.price?.toLocaleString("es-CL")}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-400">
                      {product.wholesale_price
                        ? `$${product.wholesale_price.toLocaleString("es-CL")}`
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(product)}
                        className={`inline-flex min-w-[80px] items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-200 ${
                          product.active
                            ? "bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-200/30"
                            : "bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-200/40"
                        }`}
                      >
                        {product.active ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-700 transition-colors hover:bg-orange-100"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-sm font-medium text-slate-400">
                    Ningún producto coincide con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* COMPONENTE CRUD: PANEL LATERAL SLIDE-OVER (CREAR / EDITAR) */}
      {isPanelOpen && editingProduct && (
        <div className="fixed inset-0 z-[120]">
          {/* Backdrop */}
          <button
            className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
            onClick={() => setIsPanelOpen(false)}
            aria-label="Cerrar editor"
          />

          <aside className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white shadow-2xl animate-slide-over">
            {/* Cabecera del Panel */}
            <div className="border-b border-slate-100 bg-[#f4fafd]/40 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-cyan-600">
                    {isNewProduct ? "Gestión de catálogo" : "Editor de producto"}
                  </p>
                  <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    {isNewProduct ? "Nuevo Producto" : editingProduct.short_name}
                  </h3>
                </div>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-colors hover:text-cyan-600 hover:border-cyan-200"
                  aria-label="Cerrar"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Cuerpo del Formulario */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Vista previa de imagen */}
              <div className="mb-6 flex h-48 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/50 p-6 shadow-inner">
                <Image
                  unoptimized
                  src={getProductImages(editingProduct)[0] || "/rokko.png"}
                  alt={editingProduct.name || ""}
                  width={140}
                  height={140}
                  className="h-auto max-h-full w-auto object-contain"
                />
              </div>

              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputBlock label="Nombre corto">
                    <input
                      value={editingProduct.short_name || ""}
                      onChange={(e) => updateField("short_name", e.target.value)}
                      placeholder="Ej. Heavy Cotton MC"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-cyan-500/50 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                    />
                  </InputBlock>

                  <InputBlock label="Categoría">
                    <select
                      value={editingProduct.category || "poleras"}
                      onChange={(e) => updateField("category", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-cyan-500/50 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                    >
                      {categories
                        .filter((item) => item.value !== "todas")
                        .map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                    </select>
                  </InputBlock>
                </div>

                <InputBlock label="Nombre completo de exhibición">
                  <input
                    value={editingProduct.name || ""}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Ej. Polera Heavy Cotton Manga Corta"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-cyan-500/50 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                  />
                </InputBlock>

                <InputBlock label="Descripción o Glosa">
                  <textarea
                    value={editingProduct.description || ""}
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={3}
                    placeholder="Detalles sobre el material, tallajes o especificaciones base del producto..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-cyan-500/50 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                  />
                </InputBlock>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InputBlock label="Slug">
                    <input
                      value={editingProduct.slug || ""}
                      onChange={(e) => updateField("slug", e.target.value)}
                      placeholder="ej. heavy-cotton-mc"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-cyan-500/50 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                    />
                  </InputBlock>

                  <InputBlock label="Extracto">
                    <input
                      value={editingProduct.extract || ""}
                      onChange={(e) => updateField("extract", e.target.value)}
                      placeholder="Resumen breve del producto"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-cyan-500/50 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                    />
                  </InputBlock>
                </div>

                <InputBlock label="Galeria de imagenes del producto">
                  <div className="grid gap-3">
                    <textarea
                      value={formatImagesForInput(editingProduct)}
                      onChange={(e) => updateImageGalleryFromText(e.target.value)}
                      rows={3}
                      placeholder="Pega URLs o rutas, una por linea. Tambien puedes cargar varias imagenes desde tu equipo."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-cyan-500/50 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-xs font-semibold text-cyan-700 transition-colors hover:bg-cyan-100 disabled:opacity-50 disabled:cursor-not-allowed">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                        </svg>
                        {uploading ? "Subiendo..." : "Cargar varias desde mi equipo"}
                        <input
                          type="file"
                          multiple
                          accept="image/png,image/jpeg,image/webp"
                          onChange={(e) => handleImageUpload(e.target.files)}
                          className="sr-only"
                          disabled={uploading}
                        />
                      </label>
                      {getProductImages(editingProduct).length > 0 && (
                        <button
                          type="button"
                          onClick={() => updateImageGallery([])}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          Quitar todas
                        </button>
                      )}
                    </div>
                    {getProductImages(editingProduct).length > 0 && (
                      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                        {getProductImages(editingProduct).map((image, index) => (
                          <div
                            key={`${image}-${index}`}
                            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2"
                          >
                            <div className="flex h-24 items-center justify-center">
                              <Image
                                unoptimized
                                src={image}
                                alt={`Imagen ${index + 1}`}
                                width={96}
                                height={96}
                                className="h-auto max-h-full w-auto object-contain"
                              />
                            </div>
                            <div className="mt-2 flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setPrimaryGalleryImage(image)}
                                className={`flex-1 rounded-lg px-2 py-1.5 text-[10px] font-bold transition-colors ${
                                  index === 0
                                    ? "bg-cyan-500 text-white"
                                    : "bg-white text-slate-500 hover:text-cyan-700"
                                }`}
                              >
                                {index === 0 ? "Principal" : "Principal"}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(image)}
                                className="rounded-lg bg-white px-2 py-1.5 text-[10px] font-bold text-red-500 transition-colors hover:bg-red-50"
                              >
                                X
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-[11px] leading-5 text-slate-400">
                      La primera imagen queda como principal. Si hay varias, se guardan en el campo image como una lista compatible con el carrusel del cotizador.
                    </p>
                  </div>
                </InputBlock>

                {/* Sección de Precios */}
                <div className="rounded-2xl border border-cyan-100/30 bg-[#f4fafd]/40 p-5">
                  <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-cyan-600">
                    Estructura de precios (CLP)
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <InputBlock label="Unitario">
                      <input
                        type="number"
                        value={editingProduct.price ?? ""}
                        onChange={(e) => updateField("price", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10"
                      />
                    </InputBlock>
                    <InputBlock label="P. Mayorista">
                      <input
                        type="number"
                        value={editingProduct.wholesale_price ?? ""}
                        onChange={(e) => updateField("wholesale_price", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10"
                      />
                    </InputBlock>
                    <InputBlock label="Min. Unidades">
                      <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
                        <button
                          type="button"
                          onClick={() => stepNumberValue("wholesale_from", -1)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100"
                          aria-label="Bajar cantidad minima"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={editingProduct.wholesale_from ?? ""}
                          onChange={(e) => updateField("wholesale_from", e.target.value)}
                          className="min-w-0 flex-1 bg-transparent px-2 text-center text-sm font-semibold text-slate-800 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => stepNumberValue("wholesale_from", 1)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100"
                          aria-label="Subir cantidad minima"
                        >
                          +
                        </button>
                      </div>
                    </InputBlock>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-600">
                    Colores disponibles
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {colorOptions.map((color) => {
                      const selected = getArrayValue("colors").includes(color.name);
                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => toggleArrayValue("colors", color.name)}
                          title={color.name}
                          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 shadow-sm transition-all hover:scale-105 ${
                            selected
                              ? "border-cyan-400 ring-2 ring-cyan-300 ring-offset-2"
                              : "border-slate-200 hover:border-cyan-200"
                          }`}
                          style={{ backgroundColor: color.hex }}
                          aria-label={`Seleccionar color ${color.name}`}
                        >
                          {selected && (
                            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_0_2px_white]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {formatList(editingProduct.colors) || "Sin colores seleccionados"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-600">
                    Tallas disponibles
                  </p>
                  <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {sizeOptions.map((size) => {
                      const selected = getArrayValue("sizes").includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleArrayValue("sizes", size)}
                          className={`rounded-xl border px-3 py-3 text-sm font-bold transition-all ${
                            selected
                              ? "border-cyan-400 bg-cyan-50 text-cyan-700 shadow-sm shadow-cyan-100"
                              : "border-slate-200 bg-slate-50 text-slate-400 hover:border-cyan-200 hover:bg-white"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InputBlock label="Tipo de tela / composicion">
                    <input
                      value={editingProduct.composition || ""}
                      onChange={(e) => updateField("composition", e.target.value)}
                      placeholder="Ej. 80% algodon, 180 g/m2"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-cyan-500/50 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {fabricOptions.map((fabric) => {
                        const selected = editingProduct.composition === fabric;
                        return (
                          <button
                            key={fabric}
                            type="button"
                            onClick={() => updateField("composition", fabric)}
                            className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                              selected
                                ? "border-cyan-300 bg-cyan-50 text-cyan-700"
                                : "border-slate-200 bg-white text-slate-500 hover:border-cyan-200 hover:text-cyan-700"
                            }`}
                          >
                            {fabric}
                          </button>
                        );
                      })}
                    </div>
                  </InputBlock>

                  <InputBlock label="Gramaje / peso">
                    <input
                      value={editingProduct.weight || ""}
                      onChange={(e) => updateField("weight", e.target.value)}
                      placeholder="Ej. 180 g/m2"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-cyan-500/50 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                    />
                  </InputBlock>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-600">
                    Tecnologias destacadas
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {technologyOptions.map((tech) => {
                      const selected = getArrayValue("technologies").includes(tech);
                      return (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => toggleArrayValue("technologies", tech)}
                          className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                            selected
                              ? "border-cyan-300 bg-cyan-50 text-cyan-700"
                              : "border-slate-200 bg-slate-50 text-slate-500 hover:border-cyan-200 hover:bg-white"
                          }`}
                        >
                          {tech}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    value={formatList(editingProduct.technologies)}
                    onChange={(e) => updateListField("technologies", e.target.value)}
                    placeholder="Agregar manualmente separado por comas"
                    className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs text-slate-700 outline-none transition-all focus:border-cyan-500/50 focus:bg-white"
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-600">
                    Certificaciones
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {certificationOptions.map((certification) => {
                      const selected = getArrayValue("certifications").includes(certification);
                      return (
                        <button
                          key={certification}
                          type="button"
                          onClick={() => toggleArrayValue("certifications", certification)}
                          className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                            selected
                              ? "border-cyan-300 bg-cyan-50 text-cyan-700"
                              : "border-slate-200 bg-slate-50 text-slate-500 hover:border-cyan-200 hover:bg-white"
                          }`}
                        >
                          {certification}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    value={formatList(editingProduct.certifications)}
                    onChange={(e) => updateListField("certifications", e.target.value)}
                    placeholder="Agregar manualmente separado por comas"
                    className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs text-slate-700 outline-none transition-all focus:border-cyan-500/50 focus:bg-white"
                  />
                </div>

                <label className="flex items-center justify-between rounded-2xl border border-cyan-100/40 bg-[#f4fafd]/40 px-4 py-3">
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">Producto activo</span>
                    <span className="block text-xs text-slate-500">Visible para cotizar en el catalogo.</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={editingProduct.active ?? true}
                    onChange={(e) =>
                      setEditingProduct((prev) =>
                        prev ? { ...prev, active: e.target.checked } : prev
                      )
                    }
                    className="h-5 w-5 accent-cyan-500"
                  />
                </label>
              </div>
            </div>

            {/* Footer de Acciones Integradas */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4">
              <div>
                {!isNewProduct && (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingProduct.id!)}
                    className="rounded-xl border border-red-200 bg-white px-4 py-3 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50/60"
                  >
                    Eliminar producto
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPanelOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveProduct}
                  disabled={saving}
                  className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Guardando..." : isNewProduct ? "Crear producto" : "Guardar cambios"}
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-[76px] px-4 py-2.5 text-center sm:min-w-[88px]">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-600/80">{label}</p>
      <p className="mt-0.5 text-base font-extrabold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

function InputBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="block">
      <span className="mb-2 block text-xs font-semibold tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </div>
  );
}
