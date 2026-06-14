"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";
import type { ProductModel } from "@/types/productModel";
import { getAdminProducts } from "@/lib/adminProducts";
import {
  createProductModel,
  deleteProductModel,
  getProductModels,
  updateProductModel,
  uploadProductModelFile,
} from "@/lib/productModels";

const categories = [
  { value: "poleras", label: "Poleras" },
  { value: "polerones", label: "Polerones" },
  { value: "parkas", label: "Parkas" },
  { value: "pantalones", label: "Pantalones" },
];

const emptyDraft = {
  name: "",
  category: "poleras",
  product_id: "",
  model_url: "",
  file_path: "",
  scale: 1,
  position_y: 0,
  rotation_y: 0,
};

export default function AdminModels3D() {
  const [models, setModels] = useState<ProductModel[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [editing, setEditing] = useState<ProductModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([getProductModels(), getAdminProducts()]).then(([modelRows, productRows]) => {
      if (!mounted) return;
      setModels(modelRows);
      setProducts(productRows);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const productsByCategory = useMemo(() => {
    return products.filter((product) => product.category === draft.category || editing?.category === product.category);
  }, [products, draft.category, editing?.category]);

  async function handleFileUpload(files?: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadProductModelFile(file);
      setDraft((prev) => ({
        ...prev,
        name: prev.name || file.name.replace(/\.[^.]+$/, ""),
        model_url: uploaded.publicUrl,
        file_path: uploaded.filePath,
      }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al subir modelo 3D.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  async function saveNewModel() {
    if (!draft.name.trim() || !draft.model_url) {
      alert("Sube un archivo y asigna un nombre al modelo.");
      return;
    }
    setSaving(true);
    try {
      const created = await createProductModel({
        ...draft,
        product_id: draft.product_id || null,
      });
      setModels((prev) => [created, ...prev]);
      setDraft(emptyDraft);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al guardar modelo 3D.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await updateProductModel(editing);
      setModels((prev) => prev.map((model) => model.id === updated.id ? updated : model));
      setEditing(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al actualizar modelo 3D.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function removeModel(model: ProductModel) {
    if (!confirm(`Eliminar modelo 3D "${model.name}"?`)) return;
    try {
      await deleteProductModel(model);
      setModels((prev) => prev.filter((item) => item.id !== model.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar modelo 3D.");
      console.error(err);
    }
  }

  function useLocalModel(model: ProductModel) {
    setDraft({
      name: model.name,
      category: model.category,
      product_id: "",
      model_url: model.model_url,
      file_path: model.file_path,
      scale: model.scale || 1,
      position_y: model.position_y || 0,
      rotation_y: model.rotation_y || 0,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const activeProducts = editing
    ? products.filter((product) => product.category === editing.category)
    : productsByCategory;

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="rounded-2xl border border-accent-soft/50 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Biblioteca 3D</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Modelos GLB / GLTF</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Sube prendas 3D reales y asocialas a productos. El cotizador las usara antes que el fallback procedural.
            </p>
          </div>
          <div className="rounded-xl border border-accent-soft bg-accent-soft px-4 py-3 text-sm font-bold text-accent">
            {models.length} modelos cargados
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Nuevo modelo</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input label="Nombre">
                <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="admin-control" placeholder="Ej. Polera manga corta" />
              </Input>
              <Input label="Categoria">
                <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value, product_id: "" })} className="admin-control">
                  {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                </select>
              </Input>
              <Input label="Producto asociado">
                <select value={draft.product_id} onChange={(e) => setDraft({ ...draft, product_id: e.target.value })} className="admin-control">
                  <option value="">Sin producto especifico</option>
                  {productsByCategory.map((product) => <option key={product.id} value={product.id}>{product.short_name || product.name}</option>)}
                </select>
              </Input>
              <Input label="Archivo GLB/GLTF">
                <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-accent-soft bg-white px-4 py-3 text-sm font-semibold text-accent hover:bg-accent-soft/30">
                  {uploading ? "Subiendo..." : draft.model_url ? "Archivo cargado" : "Subir .glb / .gltf"}
                  <input type="file" accept=".glb,.gltf,model/gltf-binary,model/gltf+json" className="sr-only" onChange={(e) => handleFileUpload(e.target.files)} disabled={uploading} />
                </label>
              </Input>
            </div>

            <CalibrationControls
              scale={draft.scale}
              positionY={draft.position_y}
              rotationY={draft.rotation_y}
              onChange={(next) => setDraft({ ...draft, ...next })}
            />

            {draft.model_url && <p className="mt-3 truncate text-xs text-slate-400">{draft.model_url}</p>}
            <button onClick={saveNewModel} disabled={saving || uploading} className="mt-5 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
              {saving ? "Guardando..." : "Guardar modelo"}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Como se usa</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-500">
              <p>1. Sube un modelo de prenda en formato GLB preferentemente.</p>
              <p>2. Asocialo a un producto para que la ficha tecnica lo cargue automaticamente.</p>
              <p>3. Ajusta escala, altura y rotacion si el modelo aparece chico, alto o girado.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-accent-soft/50 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h3 className="text-lg font-bold text-slate-900">Modelos cargados</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {loading && <p className="p-6 text-sm text-slate-400">Cargando modelos...</p>}
          {!loading && models.length === 0 && <p className="p-6 text-sm text-slate-400">No hay modelos 3D cargados.</p>}
          {models.filter((model) => model?.id && model?.model_url).map((model) => {
            const product = products.find((item) => item.id === model.product_id);
            const current = editing?.id === model.id ? editing : model;
            const isEditing = editing?.id === model.id;
            const isLocalModel = model.id?.startsWith("local-");
            return (
              <div key={model.id} className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900">{model.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{model.category} · {product ? product.short_name || product.name : isLocalModel ? "Precargado local" : "Sin producto"}</p>
                    <p className="mt-1 max-w-xl truncate text-xs text-slate-400">{model.model_url}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {isLocalModel ? (
                      <button onClick={() => useLocalModel(model)} className="rounded-xl border border-accent-soft bg-accent-soft px-4 py-2 text-xs font-bold text-accent">
                        Usar / asociar
                      </button>
                    ) : (
                      <>
                        <button onClick={() => setEditing(isEditing ? null : model)} className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold text-orange-700">
                          {isEditing ? "Cerrar" : "Editar"}
                        </button>
                        <button onClick={() => removeModel(model)} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600">
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Input label="Nombre">
                        <input value={current.name} onChange={(e) => setEditing({ ...current, name: e.target.value })} className="admin-control" />
                      </Input>
                      <Input label="Categoria">
                        <select value={current.category} onChange={(e) => setEditing({ ...current, category: e.target.value, product_id: null })} className="admin-control">
                          {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                        </select>
                      </Input>
                      <Input label="Producto">
                        <select value={current.product_id || ""} onChange={(e) => setEditing({ ...current, product_id: e.target.value || null })} className="admin-control">
                          <option value="">Sin producto</option>
                          {activeProducts.map((product) => <option key={product.id} value={product.id}>{product.short_name || product.name}</option>)}
                        </select>
                      </Input>
                    </div>
                    <CalibrationControls
                      scale={current.scale}
                      positionY={current.position_y}
                      rotationY={current.rotation_y}
                      onChange={(next) => setEditing({ ...current, ...next })}
                    />
                    <button onClick={saveEdit} disabled={saving} className="mt-4 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
                      {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CalibrationControls({
  scale,
  positionY,
  rotationY,
  onChange,
}: {
  scale: number;
  positionY: number;
  rotationY: number;
  onChange: (next: Partial<Pick<ProductModel, "scale" | "position_y" | "rotation_y">>) => void;
}) {
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-3">
      <Input label="Escala">
        <input type="number" step="0.05" value={scale} onChange={(e) => onChange({ scale: Number(e.target.value) })} className="admin-control" />
      </Input>
      <Input label="Altura Y">
        <input type="number" step="0.05" value={positionY} onChange={(e) => onChange({ position_y: Number(e.target.value) })} className="admin-control" />
      </Input>
      <Input label="Rotacion Y">
        <input type="number" step="0.1" value={rotationY} onChange={(e) => onChange({ rotation_y: Number(e.target.value) })} className="admin-control" />
      </Input>
    </div>
  );
}

function Input({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}
