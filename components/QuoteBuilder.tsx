"use client";

import Image from "next/image";
import { useState } from "react";
import { certificationLogos, products, Product } from "@/data/catalog";

const sizes = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];

type CartItem = {
  id: number;
  product: string;
  color: string;
  logo: string;
  sizes: Record<string, number>;
  totalUnits: number;
  unitPrice: number;
  subtotal: number;
};

export default function QuoteBuilder() {
  const poleras = products.filter((product) => product.category === "poleras");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [forms, setForms] = useState<Record<string, any>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  function updateForm(productId: string, field: string, value: any) {
    setForms((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  }

  function updateSize(productId: string, size: string, value: string) {
    const quantity = Number(value) || 0;

    setForms((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        sizes: {
          ...prev[productId]?.sizes,
          [size]: quantity,
        },
      },
    }));
  }

  function addToCart(product: Product) {
    const form = forms[product.id] || {};
    const productSizes = form.sizes || {};

    const totalUnits = Object.values(productSizes).reduce(
      (sum: number, qty: any) => sum + Number(qty || 0),
      0
    );

    if (totalUnits <= 0) {
      alert("Debes ingresar al menos una cantidad.");
      return;
    }

    const unitPrice =
      product.wholesaleFrom &&
      product.wholesalePrice &&
      totalUnits >= product.wholesaleFrom
        ? product.wholesalePrice
        : product.price;

    const newItem: CartItem = {
      id: Date.now(),
      product: product.name,
      color: form.color || product.colors[0],
      logo: form.logo || "Pecho incluido",
      sizes: productSizes,
      totalUnits,
      unitPrice,
      subtotal: totalUnits * unitPrice,
    };

    setCart((prev) => [...prev, newItem]);
  }

  function removeItem(id: number) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {poleras.map((product) => (
            <div
              key={product.id}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="grid gap-6 md:grid-cols-[180px_1fr]">
                <div className="flex h-56 items-center justify-center rounded-[1.5rem] bg-slate-50 p-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={220}
                    height={220}
                    className="h-auto max-h-full w-auto object-contain"
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-700">
                        {product.shortName}
                      </p>

                      <h2 className="mt-2 text-3xl font-black text-slate-950">
                        {product.name}
                      </h2>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        {product.description}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                        Desde
                      </p>

                      <p className="text-2xl font-black text-cyan-700">
                        ${product.price.toLocaleString("es-CL")}
                      </p>

                      <p className="text-xs text-slate-400">IVA incluido</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {product.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                        Color
                      </label>

                      <select
                        onChange={(e) =>
                          updateForm(product.id, "color", e.target.value)
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-cyan-400"
                      >
                        {product.colors.map((color) => (
                          <option key={color}>{color}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                        Logo incluido
                      </label>

                      <select
                        onChange={(e) =>
                          updateForm(product.id, "logo", e.target.value)
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-cyan-400"
                      >
                        <option>Pecho incluido</option>
                        <option>Pecho + espalda</option>
                        <option>Pecho + brazo</option>
                        <option>2 brazos</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                    {sizes.map((size) => (
                      <div key={size}>
                        <label className="mb-2 block text-xs font-black text-slate-700">
                          {size}
                        </label>

                        <input
                          type="number"
                          min={0}
                          placeholder="0"
                          disabled={!product.sizes.includes(size)}
                          onChange={(e) =>
                            updateSize(product.id, size, e.target.value)
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-cyan-400 disabled:bg-slate-100 disabled:text-slate-300"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => addToCart(product)}
                      className="rounded-full bg-slate-950 px-7 py-4 text-sm font-bold text-white transition hover:bg-cyan-700"
                    >
                      Agregar al pedido
                    </button>

                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="rounded-full border border-slate-300 bg-white px-7 py-4 text-sm font-bold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700"
                    >
                      Ver ficha técnica
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="sticky top-28 h-fit rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-cyan-600">
            Pedido actual
          </p>

          <div className="mt-8 space-y-4">
            {cart.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-5">
                <h3 className="font-black text-slate-950">Sin productos</h3>

                <p className="mt-2 text-sm text-slate-500">
                  Agrega prendas para comenzar la cotización.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex justify-between gap-4">
                    <div>
                      <h3 className="font-black text-slate-950">
                        {item.product}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {item.color} · {item.logo}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {Object.entries(item.sizes)
                          .filter(([, qty]) => qty > 0)
                          .map(([size, qty]) => `${size}: ${qty}`)
                          .join(" · ")}
                      </p>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-sm font-bold text-red-500"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-4 flex justify-between text-sm">
                    <span>{item.totalUnits} unidades</span>

                    <strong>${item.subtotal.toLocaleString("es-CL")}</strong>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-10 border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Total</span>

              <strong className="text-3xl font-black text-slate-950">
                ${total.toLocaleString("es-CL")}
              </strong>
            </div>

            <button className="mt-6 w-full rounded-2xl bg-cyan-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-cyan-700">
              Generar cotización
            </button>
          </div>
        </aside>
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/40 backdrop-blur-sm">
          <button
            className="absolute inset-0 cursor-default"
            onClick={() => setSelectedProduct(null)}
            aria-label="Cerrar ficha"
          />

          <aside className="relative h-full w-full max-w-3xl overflow-y-auto bg-white p-8 shadow-2xl">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute right-6 top-6 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:border-cyan-400 hover:text-cyan-700"
            >
              Cerrar
            </button>

            <p className="mt-10 text-xs font-black uppercase tracking-[0.35em] text-cyan-700">
              Ficha técnica
            </p>

            <h2 className="mt-3 text-4xl font-black text-slate-950">
              {selectedProduct.name}
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-600">
              {selectedProduct.extract}
            </p>

            <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <h4 className="text-xs font-black uppercase tracking-[0.35em] text-slate-500">
                Personalización corporativa
              </h4>

              <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-6">
                <div className="relative mx-auto flex h-[420px] max-w-md items-center justify-center overflow-hidden rounded-[24px] bg-slate-50">
                  <Image
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    width={380}
                    height={380}
                    className="h-auto max-h-[380px] w-auto object-contain"
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Cargar logo
                  </label>

                  <input
                    type="file"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Aplicación
                  </label>

                  <select className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-cyan-400">
                    <option>Bordado</option>
                    <option>Estampado</option>
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Ubicación del logo
                </label>

                <select className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-cyan-400">
                  <option>Pecho izquierdo</option>
                  <option>Pecho derecho</option>
                  <option>Pecho centro</option>
                  <option>Espalda alta</option>
                  <option>Manga izquierda</option>
                  <option>Manga derecha</option>
                </select>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {selectedProduct.technologies.map((tech) => (
                <div
                  key={tech}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-700"
                >
                  {tech}
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-slate-200 p-6">
              <h3 className="font-black text-slate-950">Composición</h3>

              <p className="mt-2 text-sm text-slate-600">
                {selectedProduct.composition}
              </p>

              <p className="mt-2 text-sm text-slate-600">
                Gramaje: {selectedProduct.weight}
              </p>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 p-6">
              <h3 className="font-black text-slate-950">Colores disponibles</h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {selectedProduct.colors.map((color) => (
                  <span
                    key={color}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 p-6">
              <h3 className="font-black text-slate-950">Tallas disponibles</h3>

              <p className="mt-2 text-sm text-slate-600">
                {selectedProduct.sizes.join(" · ")}
              </p>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 p-6">
              <h3 className="font-black text-slate-950">
                Certificaciones y estándares
              </h3>

              <div className="mt-5 grid grid-cols-3 gap-4">
                {certificationLogos.slice(0, 6).map((logo) => (
                  <div
                    key={logo}
                    className="flex h-16 items-center justify-center rounded-2xl bg-slate-50 p-3"
                  >
                    <Image
                      src={logo}
                      alt="Certificación"
                      width={120}
                      height={60}
                      className="h-auto max-h-full w-auto object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}