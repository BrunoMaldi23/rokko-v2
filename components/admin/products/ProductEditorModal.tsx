"use client";

import Image from "next/image";
import {
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import type { Product } from "@/types/product";
import type { ProductCategory } from "@/types/category";
import {
  createAdminProduct,
  deleteAdminProduct,
  updateAdminProduct,
} from "@/lib/adminProducts";
import { deleteStorageImages, uploadImage } from "@/lib/storage";
import {
  type ArrayField,
  certificationOptions,
  colorOptions,
  fabricOptions,
  formatList,
  formatMoney,
  getProductImages,
  getStableUploadId,
  serializeImages,
  sizeOptions,
  technologyOptions,
} from "./productFormUtils";

type ProductEditorModalProps = {
  product: Partial<Product>;
  productCategories: ProductCategory[];
  categoryLabelBySlug: Record<string, string>;
  onClose: () => void;
  onSaved: (product: Product) => void;
  onDeleted: (productId: string) => void;
};

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

export default function ProductEditorModal({
  product,
  productCategories,
  categoryLabelBySlug,
  onClose,
  onSaved,
  onDeleted,
}: ProductEditorModalProps) {
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>(
    product,
  );

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isNewProduct = !editingProduct.id;

  const categoryOptions = useMemo(() => {
    return productCategories.map((item) => ({
      value: item.slug,
      label: item.label,
    }));
  }, [productCategories]);

  const selectedImages = getProductImages(editingProduct);

  const selectedSizes = Array.isArray(editingProduct.sizes)
    ? editingProduct.sizes
    : [];

  const selectedColors = Array.isArray(editingProduct.colors)
    ? editingProduct.colors
    : [];

  const selectedTechnologies = Array.isArray(editingProduct.technologies)
    ? editingProduct.technologies
    : [];

  const selectedCertifications = Array.isArray(editingProduct.certifications)
    ? editingProduct.certifications
    : [];

  function updateField<K extends keyof Product>(field: K, value: Product[K]) {
    setEditingProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateTextField(field: keyof Product, value: string) {
    setEditingProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateNumberField(
    field: "price" | "wholesale_price" | "wholesale_from",
    value: string,
  ) {
    setEditingProduct((prev) => ({
      ...prev,
      [field]: value === "" ? null : Math.max(0, Number(value)),
    }));
  }

  function updateImageGallery(images: string[]) {
    const cleanImages = Array.from(
      new Set(images.map((image) => image.trim()).filter(Boolean)),
    );

    setEditingProduct((prev) => ({
      ...prev,
      image: serializeImages(cleanImages),
      images: cleanImages,
    }));
  }

  function updateImageGalleryFromText(value: string) {
    const images = value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);

    updateImageGallery(images);
  }

  async function handleImageUpload(files?: FileList | null) {
    if (!files?.length) return;

    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (imageFiles.length === 0) {
      alert("Selecciona imágenes válidas.");
      return;
    }

    const productId = getStableUploadId(editingProduct);

    try {
      setUploading(true);

      const uploadedUrls = await Promise.all(
        imageFiles.map((file) => uploadImage(file, productId)),
      );

      updateImageGallery([...selectedImages, ...uploadedUrls]);
    } catch (error) {
      console.error(error);
      alert("Error al subir imágenes.");
    } finally {
      setUploading(false);
    }
  }

  async function removeGalleryImage(imageToRemove: string) {
    updateImageGallery(
      selectedImages.filter((image) => image !== imageToRemove),
    );

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (supabaseUrl && imageToRemove.startsWith(supabaseUrl)) {
      try {
        await deleteStorageImages([imageToRemove]);
      } catch (error) {
        console.error("Error al eliminar imagen:", error);
      }
    }
  }

  function setPrimaryGalleryImage(imageToPromote: string) {
    updateImageGallery([
      imageToPromote,
      ...selectedImages.filter((image) => image !== imageToPromote),
    ]);
  }

  function toggleArrayValue(field: ArrayField, value: string) {
    setEditingProduct((prev) => {
      const current = Array.isArray(prev[field])
        ? (prev[field] as string[])
        : [];

      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];

      return {
        ...prev,
        [field]: next,
      };
    });
  }

  function updateListField(field: ArrayField, value: string) {
    const next = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    updateField(field, next as Product[typeof field]);
  }

  async function saveProduct() {
    try {
      setSaving(true);

      const payload = {
        ...initialProductState,
        ...editingProduct,
        images: getProductImages(editingProduct),
        image: serializeImages(getProductImages(editingProduct)),
      };

      if (isNewProduct) {
        const created = await createAdminProduct(payload as Omit<Product, "id">);
        onSaved(created);
      } else {
        const updated = await updateAdminProduct(payload as Product);
        onSaved(updated);
      }
    } catch (error) {
      console.error(error);
      alert("Error al guardar el producto.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = confirm(
      "¿Estás seguro de que deseas eliminar este producto?",
    );

    if (!confirmed) return;

    try {
      const deleted = await deleteAdminProduct(id);
      onDeleted(deleted.id);
    } catch (error) {
      console.error(error);
      alert("Error al eliminar el producto.");
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4">
      <button
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-md"
        onClick={onClose}
        aria-label="Cerrar editor"
      />

      <aside
        className="relative flex max-h-[96vh] w-full max-w-[1500px] flex-col overflow-hidden rounded-2xl border border-[#bfe8ee] bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]"
        role="dialog"
        aria-modal="true"
        aria-label={isNewProduct ? "Crear producto" : "Editar producto"}
      >
        <div className="border-b border-[#cfe8ee] bg-[linear-gradient(135deg,#f9feff_0%,#eefbfd_58%,#f7fdff_100%)] px-6 py-4 sm:px-7 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[linear-gradient(135deg,#111b22_0%,#0f2630_58%,#111b22_100%)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
                {isNewProduct ? "Gestión de catálogo" : "Editor de producto"}
              </p>

              <h3 className="mt-1 text-[26px] font-black tracking-[-0.045em] text-[#071827] [html[data-theme='dark']_&]:text-white">
                {isNewProduct
                  ? "Nuevo producto"
                  : editingProduct.short_name || editingProduct.name}
              </h3>

              <p className="mt-1 text-[12px] font-bold text-[#475569] [html[data-theme='dark']_&]:text-[#94a3b8]">
                Completa la ficha comercial, imágenes, precios y
                disponibilidad.
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
        </div>

        <div className="grid min-h-0 flex-1 gap-7 overflow-y-auto px-6 py-6 sm:px-7 lg:grid-cols-[380px_minmax(0,1fr)]">
          <div className="lg:sticky lg:top-0 lg:self-start">
            <div className="rounded-2xl border border-[#c7e8ee] bg-[#f4fbfd] p-4 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319]">
              <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-xl bg-white [html[data-theme='dark']_&]:bg-[#111b22]">
                <Image
                  unoptimized
                  src={selectedImages[0] || "/rokko.png"}
                  alt={editingProduct.name || ""}
                  fill
                  sizes="380px"
                  className="object-contain p-7"
                />
              </div>

              <div className="mt-4 rounded-xl border border-[#c7e8ee] bg-white px-4 py-4 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
                  Vista rápida
                </p>

                <p className="mt-1 text-[15px] font-black text-[#071827] [html[data-theme='dark']_&]:text-white">
                  {editingProduct.short_name || "Producto sin nombre"}
                </p>

                <p className="mt-1 line-clamp-3 text-[12px] font-bold leading-5 text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
                  {editingProduct.name ||
                    editingProduct.description ||
                    "Completa los datos base para identificar la prenda."}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#e6f8fb] px-2.5 py-1 text-[10px] font-black capitalize text-[#0f5f6d] [html[data-theme='dark']_&]:bg-[#00b8c8]/10 [html[data-theme='dark']_&]:text-[#00b8c8]">
                    {categoryLabelBySlug[editingProduct.category || ""] ||
                      editingProduct.category ||
                      "categoría"}
                  </span>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500 [html[data-theme='dark']_&]:bg-[#162530] [html[data-theme='dark']_&]:text-[#cbd5e1]">
                    {formatMoney(Number(editingProduct.price || 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-0 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <InputBlock label="Nombre corto">
                <input
                  value={editingProduct.short_name || ""}
                  onChange={(event) =>
                    updateTextField("short_name", event.target.value)
                  }
                  placeholder="Ej: Polera Heavy Cotton"
                  className="admin-control"
                />
              </InputBlock>

              <InputBlock label="Categoría">
                <select
                  value={
                    editingProduct.category ||
                    productCategories[0]?.slug ||
                    "poleras"
                  }
                  onChange={(event) =>
                    updateTextField("category", event.target.value)
                  }
                  className="admin-control"
                >
                  {categoryOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </InputBlock>
            </div>

            <InputBlock label="Nombre completo">
              <input
                value={editingProduct.name || ""}
                onChange={(event) => updateTextField("name", event.target.value)}
                placeholder="Ej: Polera Heavy Cotton Manga Corta"
                className="admin-control"
              />
            </InputBlock>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputBlock label="Slug">
                <input
                  value={editingProduct.slug || ""}
                  onChange={(event) =>
                    updateTextField("slug", event.target.value)
                  }
                  placeholder="ej: polera-heavy-cotton"
                  className="admin-control"
                />
              </InputBlock>

              <InputBlock label="Extracto">
                <input
                  value={editingProduct.extract || ""}
                  onChange={(event) =>
                    updateTextField("extract", event.target.value)
                  }
                  placeholder="Resumen breve del producto"
                  className="admin-control"
                />
              </InputBlock>
            </div>

            <InputBlock label="Descripción">
              <textarea
                value={editingProduct.description || ""}
                onChange={(event) =>
                  updateTextField("description", event.target.value)
                }
                rows={3}
                placeholder="Detalles del material, tallajes o especificaciones..."
                className="admin-control resize-none"
              />
            </InputBlock>

            <InputBlock label="Galería de imágenes">
              <div className="space-y-3">
                <textarea
                  value={selectedImages.join("\n")}
                  onChange={(event) =>
                    updateImageGalleryFromText(event.target.value)
                  }
                  rows={3}
                  placeholder="Pega URLs o rutas, una por línea."
                  className="admin-control resize-none"
                />

                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-[#bfe8ee] bg-white px-4 text-[12px] font-black text-[#087381] transition hover:border-[#21b7c7] hover:bg-[#f4fbfd] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-[#00b8c8]">
                    {uploading ? "Subiendo..." : "Subir imágenes"}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        handleImageUpload(event.target.files)
                      }
                    />
                  </label>

                  <p className="text-[11px] font-bold text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
                    La primera imagen será la principal.
                  </p>
                </div>

                {selectedImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-5">
                    {selectedImages.map((image, index) => (
                      <div
                        key={image}
                        className="rounded-xl border border-[#c7e8ee] bg-[#f7fcfd] p-2 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]"
                      >
                        <div className="relative h-24 overflow-hidden rounded-lg bg-white [html[data-theme='dark']_&]:bg-[#0b1319]">
                          <Image
                            unoptimized
                            src={image}
                            alt=""
                            fill
                            sizes="120px"
                            className="object-contain p-2"
                          />
                        </div>

                        <div className="mt-2 flex gap-1">
                          <button
                            type="button"
                            onClick={() => setPrimaryGalleryImage(image)}
                            className={`flex-1 rounded-lg px-2 py-1.5 text-[10px] font-black ${
                              index === 0
                                ? "bg-[#21b7c7] text-white"
                                : "bg-white text-[#64748b] hover:text-[#087381] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-[#94a3b8]"
                            }`}
                          >
                            Principal
                          </button>

                          <button
                            type="button"
                            onClick={() => removeGalleryImage(image)}
                            className="rounded-lg bg-red-50 px-2 py-1.5 text-[10px] font-black text-red-600 hover:bg-red-100 [html[data-theme='dark']_&]:bg-red-500/10 [html[data-theme='dark']_&]:text-red-300"
                          >
                            X
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </InputBlock>

            <div className="rounded-2xl border border-[#bfe8ee] bg-[#f4fbfd] p-5 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319]">
              <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
                Estructura de precios
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                <InputBlock label="Precio unitario">
                  <input
                    type="number"
                    value={editingProduct.price ?? ""}
                    onChange={(event) =>
                      updateNumberField("price", event.target.value)
                    }
                    className="admin-control"
                  />
                </InputBlock>

                <InputBlock label="Precio mayorista">
                  <input
                    type="number"
                    value={editingProduct.wholesale_price ?? ""}
                    onChange={(event) =>
                      updateNumberField(
                        "wholesale_price",
                        event.target.value,
                      )
                    }
                    className="admin-control"
                  />
                </InputBlock>

                <InputBlock label="Desde unidades">
                  <input
                    type="number"
                    value={editingProduct.wholesale_from ?? ""}
                    onChange={(event) =>
                      updateNumberField("wholesale_from", event.target.value)
                    }
                    className="admin-control"
                  />
                </InputBlock>
              </div>
            </div>

            <div className="rounded-2xl border border-[#bfe8ee] bg-white p-5 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
                Colores disponibles
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                {colorOptions.map((color) => {
                  const selected = selectedColors.includes(color.name);

                  return (
                    <button
                      key={color.name}
                      type="button"
                      title={color.name}
                      onClick={() => toggleArrayValue("colors", color.name)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 shadow-sm transition hover:scale-105 ${
                        selected
                          ? "border-[#21b7c7] ring-2 ring-[#21b7c7] ring-offset-2"
                          : "border-slate-200"
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {selected && (
                        <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.25)]" />
                      )}
                    </button>
                  );
                })}
              </div>

              <input
                value={formatList(editingProduct.colors)}
                onChange={(event) =>
                  updateListField("colors", event.target.value)
                }
                placeholder="Agregar manualmente separado por comas"
                className="admin-control mt-4"
              />
            </div>

            <div className="rounded-2xl border border-[#bfe8ee] bg-white p-5 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
                Tallas disponibles
              </p>

              <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
                {sizeOptions.map((size) => {
                  const selected = selectedSizes.includes(size);

                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleArrayValue("sizes", size)}
                      className={`rounded-xl border px-3 py-3 text-sm font-black transition ${
                        selected
                          ? "border-[#21b7c7] bg-[#e6f8fb] text-[#087381] [html[data-theme='dark']_&]:bg-[#00b8c8]/10 [html[data-theme='dark']_&]:text-[#00b8c8]"
                          : "border-slate-200 bg-slate-50 text-slate-400 hover:border-[#21b7c7] hover:bg-white [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-[#94a3b8]"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputBlock label="Composición">
                <input
                  value={editingProduct.composition || ""}
                  onChange={(event) =>
                    updateTextField("composition", event.target.value)
                  }
                  placeholder="Ej: 100% algodón"
                  className="admin-control"
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  {fabricOptions.map((fabric) => (
                    <button
                      key={fabric}
                      type="button"
                      onClick={() => updateTextField("composition", fabric)}
                      className="rounded-full border border-[#bfe8ee] bg-white px-3 py-1.5 text-[11px] font-bold text-[#475569] transition hover:border-[#21b7c7] hover:text-[#087381] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-[#94a3b8] [html[data-theme='dark']_&]:hover:text-[#00b8c8]"
                    >
                      {fabric}
                    </button>
                  ))}
                </div>
              </InputBlock>

              <InputBlock label="Gramaje / peso">
                <input
                  value={editingProduct.weight || ""}
                  onChange={(event) =>
                    updateTextField("weight", event.target.value)
                  }
                  placeholder="Ej: 180 g/m²"
                  className="admin-control"
                />
              </InputBlock>
            </div>

            <OptionGroup
              title="Tecnologías destacadas"
              options={technologyOptions}
              selected={selectedTechnologies}
              onToggle={(value) => toggleArrayValue("technologies", value)}
            />

            <input
              value={formatList(editingProduct.technologies)}
              onChange={(event) =>
                updateListField("technologies", event.target.value)
              }
              placeholder="Agregar tecnologías separadas por comas"
              className="admin-control"
            />

            <OptionGroup
              title="Certificaciones"
              options={certificationOptions}
              selected={selectedCertifications}
              onToggle={(value) => toggleArrayValue("certifications", value)}
            />

            <input
              value={formatList(editingProduct.certifications)}
              onChange={(event) =>
                updateListField("certifications", event.target.value)
              }
              placeholder="Agregar certificaciones separadas por comas"
              className="admin-control"
            />

            <label className="flex items-center justify-between rounded-2xl border border-[#bfe8ee] bg-[#f4fbfd] px-4 py-3 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319]">
              <span>
                <span className="block text-[13px] font-black text-[#071827] [html[data-theme='dark']_&]:text-white">
                  Producto activo
                </span>

                <span className="block text-[11px] font-bold text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
                  Visible para cotizar en el catálogo.
                </span>
              </span>

              <input
                type="checkbox"
                checked={editingProduct.active ?? true}
                onChange={(event) =>
                  updateField("active", event.target.checked as Product["active"])
                }
                className="h-5 w-5 accent-[#21b7c7]"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#cfe8ee] bg-white/95 px-6 py-4 shadow-[0_-12px_34px_rgba(15,23,42,0.06)] backdrop-blur sm:px-7 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]/95">
          <div>
            {!isNewProduct && editingProduct.id && (
              <button
                type="button"
                onClick={() => handleDelete(editingProduct.id!)}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-black text-red-600 transition hover:bg-red-100 [html[data-theme='dark']_&]:border-red-500/25 [html[data-theme='dark']_&]:bg-red-500/10 [html[data-theme='dark']_&]:text-red-300"
              >
                Eliminar producto
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-w-[120px] rounded-xl border border-[#bfe8ee] bg-white px-5 py-3 text-sm font-black text-[#475569] transition hover:bg-[#f4fbfd] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-[#94a3b8]"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={saveProduct}
              disabled={saving}
              className="min-w-[150px] rounded-xl bg-[#21b7c7] px-6 py-3 text-sm font-black text-white transition hover:bg-[#087381] disabled:cursor-not-allowed disabled:opacity-50 [html[data-theme='dark']_&]:bg-[#00b8c8] [html[data-theme='dark']_&]:text-[#071827] [html[data-theme='dark']_&]:hover:bg-[#9eeef4]"
            >
              {saving
                ? "Guardando..."
                : isNewProduct
                  ? "Crear producto"
                  : "Guardar cambios"}
            </button>
          </div>
        </div>
      </aside>
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
    <label className="block">
      <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.12em] text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
        {label}
      </span>

      {children}
    </label>
  );
}

function OptionGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-[#bfe8ee] bg-white p-5 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
        {title}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`rounded-full border px-3 py-2 text-xs font-black transition ${
                isSelected
                  ? "border-[#21b7c7] bg-[#e6f8fb] text-[#087381] [html[data-theme='dark']_&]:bg-[#00b8c8]/10 [html[data-theme='dark']_&]:text-[#00b8c8]"
                  : "border-slate-200 bg-slate-50 text-slate-500 hover:border-[#21b7c7] hover:bg-white [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-[#94a3b8]"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}