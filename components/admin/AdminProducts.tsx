"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { products as catalogProducts, Product } from "@/data/catalog";

type EditableProduct = Product & {
  active: boolean;
};

export default function AdminProducts() {
  const [products, setProducts] = useState<EditableProduct[]>(
    catalogProducts.map((product) => ({
      ...product,
      active: true,
    }))
  );

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("todas");
  const [editingProduct, setEditingProduct] = useState<EditableProduct | null>(
    null
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.shortName.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "todas" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  function toggleActive(productId: string) {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, active: !product.active }
          : product
      )
    );
  }

  function updateEditingProduct(field: keyof EditableProduct, value: string) {
    if (!editingProduct) return;

    setEditingProduct({
      ...editingProduct,
      [field]:
        field === "price" ||
        field === "wholesalePrice" ||
        field === "wholesaleFrom"
          ? Number(value)
          : value,
    });
  }

  function saveProduct() {
    if (!editingProduct) return;

    setProducts((prev) =>
      prev.map((product) =>
        product.id === editingProduct.id ? editingProduct : product
      )
    );

    setEditingProduct(null);
  }

  return (
    <>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-950">
              Gestión de productos
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Edita precios, estado comercial, categoría y disponibilidad.
            </p>
          </div>

          <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-700">
            + Nuevo producto
          </button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-[1fr_220px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-cyan-400"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-cyan-400"
          >
            <option value="todas">Todas las categorías</option>
            <option value="poleras">Poleras</option>
            <option value="polerones">Polerones</option>
            <option value="parkas">Parkas</option>
            <option value="pantalones">Pantalones</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-5 py-4">Producto</th>
                <th className="px-5 py-4">Categoría</th>
                <th className="px-5 py-4">Precio</th>
                <th className="px-5 py-4">Mayorista</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 p-2">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={56}
                          height={56}
                          className="h-auto max-h-full w-auto object-contain"
                        />
                      </div>

                      <div>
                        <p className="font-black text-slate-950">
                          {product.shortName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {product.name}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 capitalize text-slate-500">
                    {product.category}
                  </td>

                  <td className="px-5 py-4 font-bold text-slate-700">
                    ${product.price.toLocaleString("es-CL")}
                  </td>

                  <td className="px-5 py-4 text-slate-500">
                    {product.wholesalePrice
                      ? `$${product.wholesalePrice.toLocaleString("es-CL")}`
                      : "-"}
                  </td>

                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggleActive(product.id)}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        product.active
                          ? "bg-cyan-50 text-cyan-700"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {product.active ? "Activo" : "Inactivo"}
                    </button>
                  </td>

                  <td className="px-5 py-4">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="text-sm font-bold text-cyan-700 hover:text-cyan-900"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    No se encontraron productos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 z-[120] flex justify-end bg-slate-950/40 backdrop-blur-sm">
          <button
            className="absolute inset-0 cursor-default"
            onClick={() => setEditingProduct(null)}
            aria-label="Cerrar editor"
          />

          <aside className="relative h-full w-full max-w-xl overflow-y-auto bg-white p-8 shadow-2xl">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute right-6 top-6 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:border-cyan-400 hover:text-cyan-700"
            >
              Cerrar
            </button>

            <p className="mt-10 text-xs font-black uppercase tracking-[0.35em] text-cyan-700">
              Editar producto
            </p>

            <h2 className="mt-3 text-4xl font-black text-slate-950">
              {editingProduct.shortName}
            </h2>

            <div className="mt-8 flex h-64 items-center justify-center rounded-[2rem] bg-slate-50 p-6">
              <Image
                src={editingProduct.image}
                alt={editingProduct.name}
                width={260}
                height={260}
                className="h-auto max-h-full w-auto object-contain"
              />
            </div>

            <div className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Nombre corto
                </label>
                <input
                  value={editingProduct.shortName}
                  onChange={(e) =>
                    updateEditingProduct("shortName", e.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Nombre completo
                </label>
                <input
                  value={editingProduct.name}
                  onChange={(e) =>
                    updateEditingProduct("name", e.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Descripción
                </label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) =>
                    updateEditingProduct("description", e.target.value)
                  }
                  className="h-28 w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    Precio
                  </label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) =>
                      updateEditingProduct("price", e.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    Mayorista
                  </label>
                  <input
                    type="number"
                    value={editingProduct.wholesalePrice || 0}
                    onChange={(e) =>
                      updateEditingProduct("wholesalePrice", e.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    Desde
                  </label>
                  <input
                    type="number"
                    value={editingProduct.wholesaleFrom || 0}
                    onChange={(e) =>
                      updateEditingProduct("wholesaleFrom", e.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <button
                onClick={saveProduct}
                className="w-full rounded-2xl bg-cyan-600 px-6 py-4 text-sm font-bold text-white hover:bg-cyan-700"
              >
                Guardar cambios
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}