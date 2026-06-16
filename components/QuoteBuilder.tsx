"use client";

import Image from "next/image";
import { useEffect, useState, useCallback, useRef, useMemo, memo } from "react";
import { certificationLogos } from "@/data/catalog";
import type { Product } from "@/types/product";
import { saveQuote } from "@/lib/quotes";
import { formatRut } from "@/lib/rut";
import { formatPhone } from "@/lib/phone";
import { fetchBrandSettings, fetchCommercialSettings } from "@/lib/settings";
import { printElement } from "@/lib/print";
import {
  detectBaseGarmentType,
  getDetectedBaseModelUrl,
} from "@/lib/baseModels";

import ProductDetailPanel from "@/components/ProductDetailPanel";
import type { Canvas as FabricCanvas } from "fabric";

const colorMap: Record<string, string> = {
  amarillo: "#eab308",
  arena: "#d8c3a5",
  "azul marino": "#1e3a5f",
  "azul rey": "#1d4ed8",
  "azul royal": "#1d4ed8",
  beige: "#d8c3a5",
  blanco: "#ffffff",
  bordo: "#7f1d1d",
  burdeo: "#7f1d1d",
  café: "#6f4e37",
  camel: "#c19a6b",
  celeste: "#93c5fd",
  crudo: "#e8dcc4",
  "crudo vintage": "#d4c5a0",
  fucsia: "#d946ef",
  granate: "#7f1d1d",
  gris: "#9ca3af",
  "gris claro": "#d1d5db",
  "gris oscuro": "#4b5563",
  "gris jaspeado": "#b6bbc3",
  "gris melange": "#9ca3af",
  "gris vigore": "#6b7280",
  khaki: "#a3a380",
  lila: "#c4b5fd",
  mostaza: "#ca8a04",
  morado: "#7c3aed",
  naranja: "#ea580c",
  naranjo: "#ea580c",
  negro: "#1a1a1a",
  oliva: "#4d7c0f",
  oro: "#d4af37",
  perla: "#e5e4e2",
  petróleo: "#1e3a5f",
  plata: "#c0c0c0",
  plomo: "#6b7280",
  rojo: "#dc2626",
  rosa: "#f9a8d4",
  "rosa claro": "#f9a8d4",
  "rosa mexicano": "#ec4899",
  rosado: "#f9a8d4",
  salmón: "#fb923c",
  terracota: "#c2410c",
  turqueza: "#14b8a6",
  turquesa: "#14b8a6",
  "verde aceituna": "#4d7c0f",
  "verde botella": "#166534",
  "verde esmeralda": "#059669",
  "verde manzana": "#84cc16",
  "verde militar": "#4d7c0f",
  "verde mist": "#8fb9a8",
  "verde pino": "#166534",
  "verde seco": "#4d7c0f",
  vino: "#7f1d1d",
  violeta: "#7c3aed",
};

function normalizeColorName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getColorHex(name: string): string {
  if (!name) return "#ccc";
  const norm = normalizeColorName(name);
  if (colorMap[norm]) return colorMap[norm];
  for (const key of Object.keys(colorMap)) {
    if (normalizeColorName(key) === norm) return colorMap[key];
  }
  return "#ccc";
}

const sizes = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];

type Props = {
  initialProducts: Product[];
};

type CartItem = {
  id: number;
  product: string;
  productId: string;
  color: string;
  logo: string;
  application: string;
  logoPosition: string;
  sizes: Record<string, number>;
  totalUnits: number;
  unitPrice: number;
  subtotal: number;
};

type ClientData = {
  empresa: string;
  rut: string;
  contacto: string;
  correo: string;
  telefono: string;
  observaciones: string;
};

type ProductForm = {
  color?: string;
  logo?: string;
  application?: string;
  logoPosition?: string;
  sizes?: Record<string, number>;
};

function getProductImages(product: Product) {
  const directImages = Array.isArray(product.image) ? product.image : [];
  const imageField = product.image?.trim();
  let parsedImages: string[] = [];

  if (imageField?.startsWith("[")) {
    try {
      const parsed = JSON.parse(imageField);
      parsedImages = Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string")
        : [];
    } catch {
      parsedImages = [];
    }
  }

  const fallbackImage =
    imageField && !imageField.startsWith("[") ? [imageField] : [];

  return Array.from(
    new Set([...directImages, ...parsedImages, ...fallbackImage]),
  ).filter(Boolean);
}
export default function QuoteBuilder({ initialProducts }: Props) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [forms, setForms] = useState<Record<string, ProductForm>>({});
  const [galleryIndexes, setGalleryIndexes] = useState<Record<string, number>>(
    {},
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(0.08);
  const [showSuccess, setShowSuccess] = useState(false);
  const [savingQuote, setSavingQuote] = useState(false);
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [submittedFolio, setSubmittedFolio] = useState<string | null>(null);
  const [brand, setBrand] = useState<Record<string, any> | null>(null);
  const [commercial, setCommercial] = useState<Record<string, any> | null>(
    null,
  );
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);

  useEffect(() => {
    fetchBrandSettings().then(setBrand);
    fetchCommercialSettings().then(setCommercial);
  }, []);

  const [clientData, setClientData] = useState<ClientData>({
    empresa: "",
    rut: "",
    contacto: "",
    correo: "",
    telefono: "+56 9",
    observaciones: "",
  });

  const formsRef = useRef(forms);
  formsRef.current = forms;
  const productsRef = useRef(initialProducts);
  productsRef.current = initialProducts;

  const handleColorSelect = useCallback(
    (
      productId: string,
      color: string,
      _colorIndex: number,
      _totalImages: number,
    ) => {
      setForms((prev) => ({
        ...prev,
        [productId]: { ...(prev[productId] || {}), color },
      }));
    },
    [],
  );

  const handleGalleryNav = useCallback(
    (productId: string, nextIndex: number, totalImages: number) => {
      setGalleryIndexes((prev) => ({
        ...prev,
        [productId]: (nextIndex + totalImages) % totalImages,
      }));
    },
    [],
  );

  const handleSizeUpdate = useCallback(
    (productId: string, size: string, value: string) => {
      const quantity = Number(value) || 0;
      setForms((prev) => ({
        ...prev,
        [productId]: {
          ...(prev[productId] || {}),
          sizes: { ...(prev[productId]?.sizes || {}), [size]: quantity },
        },
      }));
    },
    [],
  );

  const handleAddToCart = useCallback((productId: string) => {
    const product = productsRef.current.find((p) => p.id === productId);
    if (!product) return;
    const form = formsRef.current[productId] || {};
    const productSizes = form.sizes || {};
    const totalUnits = Object.values(productSizes).reduce(
      (sum, qty) => sum + Number(qty || 0),
      0,
    );
    if (totalUnits <= 0) {
      alert("Debes ingresar al menos una cantidad.");
      return;
    }
    const unitPrice =
      product.wholesale_from &&
      product.wholesale_price &&
      totalUnits >= product.wholesale_from
        ? product.wholesale_price
        : product.price;
    setCart((prev) => [
      ...prev,
      {
        id: Date.now(),
        product: product.name,
        productId: product.id,
        sizes: productSizes,
        totalUnits,
        subtotal: unitPrice * totalUnits,
        color: form.color || product.colors?.[0] || "Sin color",
        unitPrice,
        logo: form.logo || "Pecho incluido",
        application: form.application || "Bordado",
        logoPosition: form.logoPosition || "Pecho izquierdo",
      },
    ]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  }, []);

  function updateForm(
    productId: string,
    field: keyof ProductForm,
    value: string,
  ) {
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

  function updateClient(field: keyof ClientData, value: string) {
    setClientData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleRutChange(value: string) {
    const formatted = formatRut(value);
    setClientData((prev) => ({ ...prev, rut: formatted }));
  }

  function handlePhoneChange(value: string) {
    const formatted = formatPhone(value);
    setClientData((prev) => ({ ...prev, telefono: formatted }));
  }

  function setGalleryIndex(
    productId: string,
    nextIndex: number,
    totalImages: number,
  ) {
    setGalleryIndexes((prev) => ({
      ...prev,
      [productId]: (nextIndex + totalImages) % totalImages,
    }));
  }

  function selectProductColor(
    product: Product,
    color: string,
    colorIndex: number,
  ) {
    updateForm(product.id, "color", color);

    const totalImages = getProductImages(product).length;
    if (totalImages > 1) {
      setGalleryIndex(
        product.id,
        Math.min(colorIndex, totalImages - 1),
        totalImages,
      );
    }
  }

  function handleLogoUpload(file?: File) {
    if (!file) return;

    if (logoPreview) URL.revokeObjectURL(logoPreview);
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
  }

  function addToCart(product: Product) {
    const form = forms[product.id] || {};
    const productSizes = form.sizes || {};

    const totalUnits = Object.values(productSizes).reduce(
      (sum, qty) => sum + Number(qty || 0),
      0,
    );

    if (totalUnits <= 0) {
      alert("Debes ingresar al menos una cantidad.");
      return;
    }

    const unitPrice =
      product.wholesale_from &&
      product.wholesale_price &&
      totalUnits >= product.wholesale_from
        ? product.wholesale_price
        : product.price;

    const newItem: CartItem = {
      id: Date.now(),
      product: product.name,
      productId: product.id,
      color: form.color || product.colors?.[0] || "Sin color",
      logo: form.logo || "Pecho incluido",
      application: form.application || "Bordado",
      logoPosition: form.logoPosition || "Pecho izquierdo",
      sizes: productSizes,
      totalUnits,
      unitPrice,
      subtotal: totalUnits * unitPrice,
    };

    setCart((prev) => [...prev, newItem]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  }

  const removeItem = useCallback((id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const openQuoteModal = useCallback(() => {
    setQuoteOpen(true);
  }, []);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.subtotal, 0),
    [cart],
  );
  const cartUnits = useMemo(
    () => cart.reduce((sum, item) => sum + item.totalUnits, 0),
    [cart],
  );
  const cartColors = useMemo(
    () => new Set(cart.map((item) => item.color)).size,
    [cart],
  );

  const handleSubmitQuote = useCallback(async () => {
    if (!clientData.empresa.trim()) {
      alert("Ingresa el nombre de la empresa o institución.");
      return;
    }

    setSavingQuote(true);
    setEmailStatus("idle");

    try {
      const result = await saveQuote({
        client_empresa: clientData.empresa,
        client_rut: clientData.rut,
        client_contacto: clientData.contacto,
        client_correo: clientData.correo,
        client_telefono: clientData.telefono,
        client_observaciones: clientData.observaciones,
        items: cart.map(({ id: _cartId, ...rest }) => rest),
        total,
      });

      if (!result) {
        alert(
          "Error al guardar. Revisa la consola (F12) y ejecuta 'NOTIFY pgrst, reload schema;' en SQL Editor.",
        );
        setSavingQuote(false);
        return;
      }

      setSubmittedFolio(result.folio);
      setEmailStatus("sending");

      const emailRes = await fetch("/api/send-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folio: result.folio,
          client_empresa: clientData.empresa,
          client_rut: clientData.rut,
          client_contacto: clientData.contacto,
          client_correo: clientData.correo,
          client_telefono: clientData.telefono,
          client_observaciones: clientData.observaciones,
          items: cart.map(({ id: _cartId, ...rest }) => rest),
          total,
          brand,
          commercial,
        }),
      });

      if (emailRes.ok) {
        setEmailStatus("sent");
      } else {
        const errText = await emailRes.text();
        console.error("send email error:", errText);
        setEmailStatus("error");
      }
    } catch (err) {
      console.error("handleSubmitQuote error:", err);
      setEmailStatus("error");
    }

    setSavingQuote(false);
  }, [clientData, cart, total, brand, commercial]);

  const resetQuote = useCallback(() => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
    setQuoteOpen(false);
    setSubmittedFolio(null);
    setClientData({
      empresa: "",
      rut: "",
      contacto: "",
      correo: "",
      telefono: "+56 9",
      observaciones: "",
    });
    setCart([]);
  }, [logoPreview]);
  return (
    <>
      {/* Success toast */}
      {showSuccess && (
        <div className="fixed bottom-6 right-6 z-[200] animate-scale-in rounded-xl bg-neutral-900 px-5 py-3.5 text-sm font-medium text-white shadow-lg shadow-neutral-900/20">
          <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-xs">
            ✓
          </span>
          Producto agregado al carrito
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          {initialProducts.length === 0 && (
            <div className="animate-fade-in-up rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 text-center shadow-sm backdrop-blur-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <svg
                  className="h-8 w-8 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-slate-950">
                No hay productos disponibles
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Revisa que Supabase tenga productos activos para esta categoría.
              </p>
            </div>
          )}

          {initialProducts.map((product, i) => {
            const selectedColor =
              forms[product.id]?.color || product.colors?.[0] || "Seleccionar";
            const galleryIndex = galleryIndexes[product.id] || 0;

            return (
              <ProductCard
                key={product.id}
                product={product}
                animationDelay={i * 80}
                selectedColor={selectedColor}
                galleryIndex={galleryIndex}
                formSizes={forms[product.id]?.sizes || {}}
                logoPreview={logoPreview}
                onColorSelect={handleColorSelect}
                onGalleryNav={handleGalleryNav}
                onSizeUpdate={handleSizeUpdate}
                onAddToCart={handleAddToCart}
                onViewDetails={setSelectedProduct}
              />
            );
          })}
        </div>

        <aside className="sticky top-28 h-fit overflow-hidden rounded-2xl border border-[#0b3137]/15 bg-[#15181b] text-white shadow-lg shadow-slate-900/10">
          <div className="relative overflow-hidden border-b border-white/[0.08] p-6">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-accent-light to-[#7dd3fc]" />
            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-accent-light">
                    Carrito
                  </p>
                  <h2 className="mt-1 text-lg font-black tracking-tight">
                    Resumen del pedido
                  </h2>
                </div>
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] ring-1 ring-white/10">
                  <svg
                    className="h-5 w-5 text-white/80"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 3h1.5l1.8 12.1a2 2 0 001.98 1.7h8.94a2 2 0 001.96-1.6l1.07-5.35H6.25M8.25 21a.75.75 0 100-1.5.75.75 0 000 1.5zm8 0a.75.75 0 100-1.5.75.75 0 000 1.5z"
                    />
                  </svg>
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-black text-white shadow-lg shadow-accent/25">
                    {cart.length}
                  </span>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-white/[0.07] p-3 ring-1 ring-white/[0.08]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">
                    Items
                  </p>
                  <p className="mt-1 text-xl font-black tracking-tight">
                    {cart.length}
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.07] p-3 ring-1 ring-white/[0.08]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">
                    Unid.
                  </p>
                  <p className="mt-1 text-xl font-black tracking-tight">
                    {cartUnits}
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.07] p-3 ring-1 ring-white/[0.08]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">
                    Colores
                  </p>
                  <p className="mt-1 text-xl font-black tracking-tight">
                    {cartColors}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-2">
            {cart.length === 0 ? (
              <div className="rounded-xl border border-dashed border-accent/25 bg-accent/[0.05] p-5 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.08]">
                  <svg
                    className="h-5 w-5 text-accent-light"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-black text-white/85">
                  Tu carrito está vacío
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-white/45">
                  Selecciona colores, tallas y agrega prendas para armar tu
                  cotización.
                </p>
              </div>
            ) : (
              <div className="scrollbar-none max-h-[340px] space-y-2 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="group rounded-xl bg-white/[0.06] p-3.5 ring-1 ring-white/[0.08] transition-all hover:bg-white/[0.09]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-black text-white/95">
                          {item.product}
                        </h3>
                        <p className="mt-0.5 text-xs font-medium text-white/40">
                          {item.color} · {item.logoPosition}
                        </p>
                        <p className="mt-1.5 text-[11px] leading-relaxed text-white/30">
                          {Object.entries(item.sizes)
                            .filter(([, qty]) => qty > 0)
                            .map(([size, qty]) => `${size}: ${qty}`)
                            .join(" · ")}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-black text-white">
                          ${item.subtotal.toLocaleString("es-CL")}
                        </p>
                        <p className="text-[11px] text-white/30">
                          {item.totalUnits} und.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="mt-2.5 w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-red-200/50 opacity-0 transition-all hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-300/80 group-hover:opacity-100"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/[0.08] px-6 py-5">
            <div className="flex items-end justify-between gap-4">
              <span className="text-sm font-semibold text-white/50">Total estimado</span>
              <strong className="text-2xl font-black tracking-tight text-white">
                ${total.toLocaleString("es-CL")}
              </strong>
            </div>
            <button
              onClick={openQuoteModal}
              disabled={cart.length === 0}
              className="mt-4 w-full rounded-xl bg-accent px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-deep active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/35 disabled:shadow-none"
            >
              Generar cotización
            </button>
          </div>
        </aside>
      </div>

      {/* ======================================================== */}
      {/* FICHA TÉCNICA SLIDE-OUT MEJORADA (MÁS COMPLETA Y TÉCNICA) */}
      {/* ======================================================== */}
      {selectedProduct && (
        <ProductDetailPanel
          key={selectedProduct.id}
          product={selectedProduct}
          selectedColor={
            forms[selectedProduct.id]?.color ||
            selectedProduct.colors?.[0] ||
            "Sin color"
          }
          productImages={(() => {
            const imgs = getProductImages(selectedProduct);
            return imgs.length > 0 ? imgs : [""];
          })()}
          galleryIndex={galleryIndexes[selectedProduct.id] || 0}
          logoPreview={logoPreview}
          logoPosition={forms[selectedProduct.id]?.logoPosition}
          logoSize={logoSize}
          fabricCanvas={fabricCanvas}
          modelUrl={(() => {
            const dbUrl = selectedProduct.model_3d_url;
            if (dbUrl) return dbUrl;
            return undefined;
          })()}
          modelScale={(() => {
            if (selectedProduct.model_3d_scale != null)
              return selectedProduct.model_3d_scale;
            return undefined;
          })()}
          modelPositionY={(() => {
            if (selectedProduct.model_3d_position_y != null)
              return selectedProduct.model_3d_position_y;
            return undefined;
          })()}
          modelRotationY={selectedProduct.model_3d_rotation_y ?? undefined}
          onColorSelect={handleColorSelect}
          onGalleryNav={handleGalleryNav}
          onLogoUpload={(file) => {
            if (logoPreview) URL.revokeObjectURL(logoPreview);
            setLogoPreview(URL.createObjectURL(file));
          }}
          onPositionChange={(label) =>
            updateForm(selectedProduct.id, "logoPosition", label)
          }
          onSizeChange={setLogoSize}
          onRemoveLogo={() => {
            if (logoPreview) URL.revokeObjectURL(logoPreview);
            setLogoPreview(null);
          }}
          onFabricCanvasReady={(c) => setFabricCanvas(c)}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      {/* ======================================================== */}
      {/* MODAL DE COTIZACIÓN — FORMULARIO + RESUMEN            */}
      {/* ======================================================== */}
      {quoteOpen && !submittedFolio && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
          <button
            className="absolute inset-0 cursor-default"
            onClick={() => setQuoteOpen(false)}
          />
          <div className="relative mt-8 mb-8 w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-100 bg-white/80 px-8 py-5 backdrop-blur-xl">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  Cotización
                </p>
                <h2 className="mt-0.5 text-xl font-semibold text-neutral-900">
                  Datos del cliente
                </h2>
              </div>
              <button
                onClick={() => setQuoteOpen(false)}
                className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-700"
              >
                Cerrar
              </button>
            </div>

            <div className="grid gap-8 p-8 lg:grid-cols-[1fr_1fr]">
              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-neutral-500">
                    Empresa / Institución *
                  </label>
                  <input
                    value={clientData.empresa}
                    onChange={(e) => updateClient("empresa", e.target.value)}
                    placeholder="Razón social"
                    className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:shadow-xs"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-neutral-500">
                      RUT
                    </label>
                    <input
                      value={clientData.rut}
                      onChange={(e) => handleRutChange(e.target.value)}
                      placeholder="12.345.678-9"
                      maxLength={12}
                      className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-neutral-500">
                      Nombre contacto
                    </label>
                    <input
                      value={clientData.contacto}
                      onChange={(e) => updateClient("contacto", e.target.value)}
                      placeholder="Nombre y apellido"
                      className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:shadow-xs"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-neutral-500">
                      Correo electrónico
                    </label>
                    <input
                      value={clientData.correo}
                      onChange={(e) => updateClient("correo", e.target.value)}
                      placeholder="correo@ejemplo.cl"
                      type="email"
                      className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-neutral-500">
                      Teléfono
                    </label>
                    <input
                      value={clientData.telefono}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="+569 1234 5678"
                      maxLength={15}
                      className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:shadow-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-neutral-500">
                    Observaciones
                  </label>
                  <textarea
                    value={clientData.observaciones}
                    onChange={(e) =>
                      updateClient("observaciones", e.target.value)
                    }
                    rows={3}
                    placeholder="Detalles adicionales, fechas estimadas, etc."
                    className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:shadow-xs"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-5">
                <p className="mb-4 text-xs font-medium text-neutral-500">
                  Resumen ({cart.length} producto{cart.length !== 1 ? "s" : ""})
                </p>
                <div className="scrollbar-none max-h-[400px] space-y-2 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg bg-white p-3.5 shadow-xs"
                    >
                      <div className="flex justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-neutral-900">
                            {item.product}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {item.color} · {item.application}
                          </p>
                          <p className="mt-0.5 text-[11px] text-neutral-300">
                            {Object.entries(item.sizes)
                              .filter(([, q]) => q > 0)
                              .map(([s, q]) => `${s}: ${q}`)
                              .join(" · ")}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-medium text-neutral-900">
                            ${item.subtotal.toLocaleString("es-CL")}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {item.totalUnits} und.
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-neutral-200 pt-4">
                  <span className="text-sm text-neutral-500">Total</span>
                  <strong className="text-xl font-semibold text-neutral-900">
                    ${total.toLocaleString("es-CL")}
                  </strong>
                </div>
                <button
                  onClick={handleSubmitQuote}
                  disabled={savingQuote}
                  className="mt-5 w-full rounded-lg bg-neutral-900 px-5 py-3.5 text-sm font-medium text-white transition-all hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-40"
                >
                  {savingQuote ? "Guardando..." : "Solicitar cotización"}
                </button>
                {emailStatus === "error" && (
                  <div className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-center text-xs font-medium text-amber-700">
                    Cotización guardada, pero el email no pudo enviarse.
                    <br />
                    Te contactaremos a la brevedad.
                  </div>
                )}
                <p className="mt-3 text-center text-xs text-neutral-400">
                  Recibirás una respuesta con los precios finales.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ======================================================== */}
      {/* FACTURA / COTIZACIÓN — OVERLAY CORPORATIVO             */}
      {/* ======================================================== */}
      {submittedFolio && (
        <>
          <div
            id="quote-invoice-wrapper"
            className="fixed inset-0 z-[120] overflow-y-auto bg-black/40 backdrop-blur-sm no-print print:static print:bg-white print:p-0"
          >
            <QuoteDocument
              brand={brand}
              commercial={commercial}
              clientData={clientData}
              cart={cart}
              total={total}
              submittedFolio={submittedFolio}
            />

            <div className="hidden mx-auto my-8 max-w-4xl rounded-2xl bg-white p-12 shadow-2xl flex flex-col justify-between min-h-[1050px] print:my-0 print:p-0 print:shadow-none print:min-h-0 print:h-auto">
              {/* ────── HEADER: LOGO + TÍTULO ────── */}
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <Image
                      src="/rokko.png"
                      alt="ROKKO"
                      width={180}
                      height={56}
                      className="object-contain object-left"
                      priority
                    />
                  </div>
                  <div className="text-right">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
                      Cotización
                    </h1>
                    <div className="mt-2 text-sm text-slate-500 space-y-0.5">
                      <p>
                        <span className="text-slate-400">
                          Orden de compra número:
                        </span>{" "}
                        <span className="font-bold text-slate-800">
                          {submittedFolio}
                        </span>
                      </p>
                      <p>
                        <span className="text-slate-400">Fecha de orden:</span>{" "}
                        <span className="font-bold text-slate-800">
                          {new Date().toLocaleDateString("es-CL", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* ────── PARTIES: DE / COBRAR A ────── */}
                <div className="mt-12 grid grid-cols-2 gap-16 border-t border-slate-100 pt-8">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                      De
                    </p>
                    <p className="text-lg font-black text-slate-900">
                      {brand?.name || "ROKKO"}
                    </p>
                    <div className="mt-1.5 space-y-0.5 text-sm text-slate-500 leading-relaxed">
                      {brand?.email && (
                        <p className="font-medium text-slate-700">
                          {brand.email}
                        </p>
                      )}
                      {brand?.phone && <p>{brand.phone}</p>}
                      {brand?.city && <p>{brand.city}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                      Cobrar a
                    </p>
                    <p className="text-lg font-black text-slate-900">
                      {clientData.empresa}
                    </p>
                    <div className="mt-1.5 space-y-0.5 text-sm text-slate-500 leading-relaxed inline-block text-left float-right">
                      {clientData.correo && (
                        <p className="font-medium text-slate-700 text-right">
                          {clientData.correo}
                        </p>
                      )}
                      {clientData.rut && (
                        <p className="text-right">RUT: {clientData.rut}</p>
                      )}
                      {clientData.contacto && (
                        <p className="text-right">
                          Att.: {clientData.contacto}
                        </p>
                      )}
                      {clientData.telefono &&
                        clientData.telefono !== "+56 9" && (
                          <p className="text-right">{clientData.telefono}</p>
                        )}
                    </div>
                  </div>
                </div>

                {/* ────── PRODUCT TABLE ────── */}
                <div className="mt-10 overflow-hidden">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-neutral-900 text-white">
                        <th className="py-3.5 pl-4 text-left text-xs font-semibold uppercase tracking-wider w-12">
                          #
                        </th>
                        <th className="py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                          Producto
                        </th>
                        <th className="py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                          Detalle
                        </th>
                        <th className="py-3.5 text-right text-xs font-semibold uppercase tracking-wider w-20">
                          Cant.
                        </th>
                        <th className="py-3.5 text-right text-xs font-semibold uppercase tracking-wider w-28">
                          P. Unitario
                        </th>
                        <th className="py-3.5 pr-4 text-right text-xs font-semibold uppercase tracking-wider w-28">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 border-b border-slate-200">
                      {cart.map((item, idx) => (
                        <tr
                          key={idx}
                          className={
                            idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                          }
                        >
                          <td className="py-4 pl-4 text-sm font-bold text-slate-400 alignment-baseline">
                            {idx + 1}
                          </td>
                          <td className="py-4 pr-4 text-sm font-bold text-slate-900 alignment-baseline max-w-[200px] break-words">
                            {item.product}
                          </td>
                          <td className="py-4 pr-4 alignment-baseline">
                            <p className="text-xs text-slate-600 font-medium">
                              {item.color} · {item.application} ·{" "}
                              {item.logoPosition}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {Object.entries(item.sizes)
                                .filter(([, q]) => q > 0)
                                .map(([s, q]) => `${s}: ${q}`)
                                .join(" · ")}
                            </p>
                          </td>
                          <td className="py-4 text-right text-sm font-semibold text-slate-700 alignment-baseline">
                            {item.totalUnits}
                          </td>
                          <td className="py-4 text-right text-sm text-slate-600 alignment-baseline">
                            ${item.unitPrice.toLocaleString("es-CL")}
                          </td>
                          <td className="py-4 pr-4 text-right text-sm font-bold text-slate-900 alignment-baseline">
                            ${item.subtotal.toLocaleString("es-CL")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ────── BOTTOM: NOTES + TOTALS ────── */}
                <div className="mt-10 grid grid-cols-12 gap-8">
                  {/* LEFT — Observaciones & Condiciones */}
                  <div className="col-span-7 space-y-6">
                    {clientData.observaciones && (
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 mb-1">
                          Observaciones
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">
                          {clientData.observaciones}
                        </p>
                      </div>
                    )}
                    {commercial?.terms && (
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 mb-1">
                          Condiciones Comerciales
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">
                          {commercial.terms}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* RIGHT — Totales */}
                  <div className="col-span-5">
                    {(() => {
                      const vatRate = commercial?.vat ?? 19;
                      const neto = Math.round(total / (1 + vatRate / 100));
                      const iva = total - neto;
                      return (
                        <div className="space-y-2.5">
                          <div className="flex justify-between text-sm px-1">
                            <span className="text-slate-500 font-medium">
                              Neto
                            </span>
                            <span className="font-bold text-slate-800">
                              ${neto.toLocaleString("es-CL")}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm px-1">
                            <span className="text-slate-500 font-medium">
                              IVA ({vatRate}%)
                            </span>
                            <span className="font-bold text-slate-800">
                              ${iva.toLocaleString("es-CL")}
                            </span>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 rounded p-4 mt-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                                Saldo adeudado
                              </span>
                              <span className="text-xl font-black text-slate-900">
                                ${total.toLocaleString("es-CL")}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* ────── FOOTER + FIRMA ────── */}
              <div className="mt-16 border-t border-slate-100 pt-8 print:mt-12">
                <div className="flex items-end justify-between">
                  <div className="max-w-md">
                    <p className="text-xs italic text-slate-400">
                      {brand?.footer ||
                        "Gracias por preferirnos. La imagen de tu empresa comienza aquí."}
                    </p>
                    <p className="mt-1.5 text-[10px] font-medium text-slate-400">
                      Cotización válida por {commercial?.validity || 7} días ·
                      Generada el {new Date().toLocaleDateString("es-CL")} a las{" "}
                      {new Date().toLocaleTimeString("es-CL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right border-b border-slate-200 pb-1 w-40 flex flex-col items-center">
                    <div className="h-10 w-32 relative opacity-85 mix-blend-multiply">
                      <svg
                        viewBox="0 0 140 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full h-full text-cyan-600"
                      >
                        <path
                          d="M10 30 Q30 5 50 25 T90 15 T130 25 M45,15 Q65,2 75,32"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          fill="none"
                        />
                      </svg>
                    </div>
                    <p className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">
                      Firma Autorizada
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ────── BOTONES — solo en pantalla ────── */}
            <div className="no-print sticky bottom-0 flex flex-wrap items-center justify-center gap-3 border-t border-neutral-100 bg-white/90 p-5 backdrop-blur-md shadow-lg">
              {emailStatus === "error" && (
                <button
                  onClick={() => {
                    setEmailStatus("sending");
                    fetch("/api/send-quote", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        folio: submittedFolio,
                        client_empresa: clientData.empresa,
                        client_rut: clientData.rut,
                        client_contacto: clientData.contacto,
                        client_correo: clientData.correo,
                        client_telefono: clientData.telefono,
                        client_observaciones: clientData.observaciones,
                        items: cart.map(({ id: _cartId, ...rest }) => rest),
                        total,
                        brand,
                        commercial,
                      }),
                    })
                      .then((r) => setEmailStatus(r.ok ? "sent" : "error"))
                      .catch(() => setEmailStatus("error"));
                  }}
                  className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 hover:bg-amber-100 transition"
                >
                  Reintentar envío
                </button>
              )}
              <button
                onClick={() => printElement("quote-invoice-wrapper")}
                className="rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-neutral-800 transition"
              >
                Imprimir / PDF
              </button>
              <button
                onClick={resetQuote}
                className="rounded-lg border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-600 hover:border-neutral-300 hover:text-neutral-800 transition"
              >
                Nueva cotización
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function QuoteDocument({
  brand,
  commercial,
  clientData,
  cart,
  total,
  submittedFolio,
}: {
  brand: Record<string, any> | null;
  commercial: Record<string, any> | null;
  clientData: ClientData;
  cart: CartItem[];
  total: number;
  submittedFolio: string | null;
}) {
  const vatRate = commercial?.vat ?? 19;
  const neto = Math.round(total / (1 + vatRate / 100));
  const iva = total - neto;
  const city = brand?.city || "Temuco";
  const quoteDate = new Date().toLocaleDateString("es-CL");
  const quoteNumber = submittedFolio || "SIN FOLIO";
  const validity = commercial?.validity || 5;
  const paymentTerms = commercial?.terms || "60% al confirmar el trabajo, saldo contra entrega.";

  // 👇 esta línea es la que probablemente falta
  const cellBorder = { border: "1px solid #000" } as const;
  const headerCell = { border: "1px solid #000", backgroundColor: "#f2f2f2" } as const;
  const tableHeaderCell = {
    border: "1px solid #000",
    backgroundColor: "#0b8fa1",
    color: "#fff",
  } as const;

  return (
    <div className="mx-auto my-8 min-h-[1123px] w-[794px] bg-white px-[38px] py-[34px] text-[11px] leading-tight text-black shadow-2xl print:my-0 print:min-h-0 print:w-full print:px-0 print:py-0 print:shadow-none">
      <div className="grid grid-cols-[210px_1fr_150px] items-start gap-6">
        <div className="pt-1">
          <Image
            src="/brand/rokko-navbar.png"
            alt="ROKKO"
            width={205}
            height={66}
            className="object-contain object-left"
            priority
          />
        </div>

        <div className="hidden">
          <h1 className="text-2xl font-black uppercase tracking-[0.08em] text-[#111827]">
            Cotizacion N° {submittedFolio}
          </h1>
          <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
            <p className="font-black text-slate-500">Fecha</p>
            <p className="font-black text-slate-500">Ciudad</p>
            <p>{quoteDate}</p>
            <p>{city}</p>
          </div>
        </div>

        <div className="hidden">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-accent">
            Vestuario corporativo profesional
          </p>
          <h1 className="mt-1 text-[21px] font-black uppercase tracking-[0.02em]">
            Cotizacion N° {quoteNumber}
          </h1>
        </div>

        <div className="pt-2 text-center">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-accent">
            Vestuario corporativo profesional
          </p>
          <h1 className="mt-1 text-[21px] font-black uppercase tracking-[0.02em]">
            Cotizacion comercial
          </h1>
          <p className="mt-1 text-[11px] font-semibold text-muted">
            Nro. {quoteNumber}
          </p>
        </div>

        <div className="grid grid-cols-[62px_1fr] self-start text-[10px]">
          <div className="px-2 py-1 font-black uppercase" style={headerCell}>
            Fecha
          </div>
          <div className="px-2 py-1 font-semibold" style={cellBorder}>
            {quoteDate}
          </div>
          <div className="px-2 py-1 font-black uppercase" style={headerCell}>
            Ciudad
          </div>
          <div className="px-2 py-1 font-semibold" style={cellBorder}>
            {city}
          </div>
        </div>
      </div>

      <div className="hidden">
        <div>
          <QuoteInfo label="Cotizacion" value={submittedFolio || "-"} />
          <QuoteInfo label="Empresa" value={clientData.empresa || "-"} />
          <QuoteInfo label="Contacto" value={clientData.contacto || "-"} />
          <QuoteInfo
            label="Telefono"
            value={
              clientData.telefono && clientData.telefono !== "+56 9"
                ? clientData.telefono
                : "-"
            }
          />
          <QuoteInfo label="Mail" value={clientData.correo || "-"} />
          <QuoteInfo
            label="Pedido"
            value={cart.map((item) => item.product).join(", ")}
          />
        </div>
        <div className="mt-3">
          <QuoteInfo
            label="Direccion / nota"
            value={clientData.observaciones || city || "-"}
          />
        </div>
      </div>

      <table className="mt-7 w-full table-fixed border-collapse text-[10.5px]">
        <tbody>
          <tr>
            <th className="w-[92px] px-2 py-1.5 text-left font-black uppercase" style={headerCell}>Cotizacion</th>
            <td className="px-2 py-1.5 font-semibold" style={cellBorder}>{quoteNumber}</td>
            <th className="w-[92px] px-2 py-1.5 text-left font-black uppercase" style={headerCell}>Empresa</th>
            <td className="px-2 py-1.5 font-semibold" style={cellBorder}>{clientData.empresa || "-"}</td>
          </tr>
          <tr>
            <th className="px-2 py-1.5 text-left font-black uppercase" style={headerCell}>Contacto</th>
            <td className="px-2 py-1.5 font-semibold" style={cellBorder}>{clientData.contacto || "-"}</td>
            <th className="px-2 py-1.5 text-left font-black uppercase" style={headerCell}>Telefono</th>
            <td className="px-2 py-1.5 font-semibold" style={cellBorder}>
              {clientData.telefono && clientData.telefono !== "+56 9" ? clientData.telefono : "-"}
            </td>
          </tr>
          <tr>
            <th className="px-2 py-1.5 text-left font-black uppercase" style={headerCell}>Mail</th>
            <td className="px-2 py-1.5 font-semibold" style={cellBorder}>{clientData.correo || "-"}</td>
            <th className="px-2 py-1.5 text-left font-black uppercase" style={headerCell}>Direccion</th>
            <td className="px-2 py-1.5 font-semibold" style={cellBorder}>{clientData.observaciones || city || "-"}</td>
          </tr>
        </tbody>
      </table>

      <div className="mt-3 grid w-[360px] grid-cols-2 text-[10.5px]">
        <QuoteField label="Abono 60%" value="SI" compact />
        <QuoteField label="Tipo Pago" value="CONTADO" compact />
      </div>

      {/* ────── TABLA DE PRODUCTOS — formato celdas/grilla ────── */}
      <table className="mt-6 w-full table-fixed border-collapse text-[10.5px]">
        <thead>
          <tr className="bg-white text-left text-[9.5px] uppercase tracking-[0.08em] text-muted">
            <th className="w-[82px] px-2 py-1.5 font-black" style={tableHeaderCell}>
              Color
            </th>
            <th className="w-[282px] px-2 py-1.5 font-black" style={tableHeaderCell}>
              Descripcion
            </th>
            <th className="w-[122px] px-2 py-1.5 font-black" style={tableHeaderCell}>
              Talla
            </th>
            <th
              className="w-[58px] px-2 py-1.5 text-right font-black"
              style={tableHeaderCell}
            >
              Cantidad
            </th>
            <th
              className="w-[90px] px-2 py-1.5 text-right font-black"
              style={tableHeaderCell}
            >
              Valor unitario
            </th>
            <th
              className="w-[92px] px-2 py-1.5 text-right font-black"
              style={tableHeaderCell}
            >
              Total neto
            </th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => {
            const sizeEntries = Object.entries(item.sizes).filter(([, q]) => q > 0);

            return (
            <tr key={item.id} className="bg-white">
              <td
                className="break-words px-2 py-1.5 align-top font-black uppercase"
                style={cellBorder}
              >
                {item.color}
              </td>
              <td className="break-words px-2 py-1.5 align-top" style={cellBorder}>
                <p className="font-black uppercase leading-4">{item.product}</p>
                <p className="mt-0.5 text-[9.5px] leading-3">
                  * Incluye logo {item.logoPosition.toLowerCase()}{" "}
                  {item.application.toLowerCase()}
                </p>
                <p className="text-[9.5px] leading-3">
                  * Producto sujeto a disponibilidad de stock y color.
                </p>
              </td>
              <td
                className="break-words px-2 py-1.5 align-top text-[9.5px] leading-4"
                style={cellBorder}
              >
                {sizeEntries.map(([s, q], index) => (
                  <span key={s} className="font-semibold">
                    {index > 0 ? " | " : ""}
                    {s}/{q}
                  </span>
                ))}
              </td>
              <td
                className="px-2 py-1.5 text-right align-top font-black"
                style={cellBorder}
              >
                {item.totalUnits}
              </td>
              <td
                className="whitespace-nowrap px-2 py-1.5 text-right align-top"
                style={cellBorder}
              >
                ${item.unitPrice.toLocaleString("es-CL")}
              </td>
              <td
                className="whitespace-nowrap px-2 py-1.5 text-right align-top font-black"
                style={cellBorder}
              >
                ${item.subtotal.toLocaleString("es-CL")}
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-5 break-inside-avoid" style={cellBorder}>
        <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em]" style={headerCell}>
          Condiciones y resumen financiero
        </div>
        <div className="grid grid-cols-[1fr_270px] items-stretch">
        <div className="min-w-0 px-3 py-3 text-[10px] leading-4" style={{ borderRight: "1px solid #000" }}>
          <div className="grid grid-cols-2 gap-x-5 gap-y-2">
            <div>
              <p className="font-black uppercase">Plazo</p>
              <p>2 semanas con diseno aprobado.</p>
            </div>
            <div>
              <p className="font-black uppercase">Pago</p>
              <p>{paymentTerms}</p>
            </div>
            <div>
              <p className="font-black uppercase">Contacto</p>
              <p>{brand?.contact || brand?.name || "ROKKO-TCO"}</p>
              {brand?.phone && <p>{brand.phone}</p>}
            </div>
            <div>
              <p className="font-black uppercase">Inicio de trabajos</p>
              <p>{brand?.name || "ROKKO-TCO"}</p>
              {brand?.email && <p>{brand.email}</p>}
            </div>
          </div>
        </div>

        {/* ────── TOTALES — caja con celdas separadas por borde ────── */}
        <div className="flex items-center p-3">
        <div className="grid grid-cols-[1fr_128px] text-[11px]">
          <div className="px-3 py-2 font-black uppercase" style={headerCell}>
            Valor neto
          </div>
          <div className="whitespace-nowrap px-3 py-2 text-right font-black" style={cellBorder}>
            ${neto.toLocaleString("es-CL")}
          </div>
          <div className="px-3 py-2 font-black uppercase" style={headerCell}>
            {vatRate}%
          </div>
          <div className="whitespace-nowrap px-3 py-2 text-right font-black" style={cellBorder}>
            ${iva.toLocaleString("es-CL")}
          </div>
          <div className="px-3 py-2 text-[13px] font-black uppercase" style={headerCell}>
            Total
          </div>
          <div className="whitespace-nowrap px-3 py-2 text-right text-[14px] font-black" style={cellBorder}>
            ${total.toLocaleString("es-CL")}
          </div>
          <div className="px-3 py-2 text-[13px] font-black uppercase" style={headerCell}>
            Total con descuento
          </div>
          <div className="whitespace-nowrap px-3 py-2 text-right text-[14px] font-black" style={cellBorder}>
            ${total.toLocaleString("es-CL")}
          </div>
        </div>
        </div>
      </div>

      <div className="px-3 py-1.5 text-[9.5px] leading-4" style={{ borderTop: "1px solid #000" }}>
        <p className="inline">
          <span className="font-black">
            Presupuesto valido por {validity} dias corridos.
          </span>
        </p>
        <p className="inline">
          {" "}
          <span className="font-black">INCLUYE:</span> montaje de logos imagen
          digital, correccion de logo para tecnica estampado o bordado. Foto
          montaje es utilizada como elemento de referencia.
        </p>
      </div>
      </div>

      <div className="mt-7 flex items-end justify-between border-t border-black/8 pt-3 text-[9px] uppercase tracking-[0.14em]">
        <p className="font-bold text-accent">ROKKO Vestuario Corporativo</p>
        <p className="font-bold">
          Documento generado para cotizacion comercial
        </p>
      </div>
    </div>
  );
}

function QuoteMeta({ label, value }: { label: string; value: string }) {
  return (
    <>
      <p className="py-1 pr-2 font-bold uppercase text-muted">{label}</p>
      <p className="py-1 font-semibold">{value || "-"}</p>
    </>
  );
}

function QuoteField({
  label,
  value,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className="grid grid-cols-[92px_1fr]">
      <p className="border border-black bg-[#f2f2f2] px-2 py-1.5 font-black uppercase">
        {label}
      </p>
      <p className="border border-black px-2 py-1.5 font-semibold">{value || "-"}</p>
    </div>
  );
}

function QuoteInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
        {label}
      </p>
      <p className="mt-0.5 font-semibold text-text">{value || "-"}</p>
    </div>
  );
}
const ProductCard = memo(function ProductCard({
  product,
  animationDelay,
  selectedColor,
  galleryIndex,
  formSizes,
  logoPreview,
  onColorSelect,
  onGalleryNav,
  onSizeUpdate,
  onAddToCart,
  onViewDetails,
}: {
  product: Product;
  animationDelay: number;
  selectedColor: string;
  galleryIndex: number;
  formSizes: Record<string, number>;
  logoPreview: string | null;
  onColorSelect: (
    productId: string,
    color: string,
    colorIndex: number,
    totalImages: number,
  ) => void;
  onGalleryNav: (
    productId: string,
    nextIndex: number,
    totalImages: number,
  ) => void;
  onSizeUpdate: (productId: string, size: string, value: string) => void;
  onAddToCart: (productId: string) => void;
  onViewDetails: (product: Product) => void;
}) {
  const allProductImages = getProductImages(product);
  const productSizes = product.sizes?.length ? product.sizes : sizes;
  const description =
    product.extract ||
    [product.composition, product.weight].filter(Boolean).join(", ") ||
    product.description;
  const pid = product.id;
  const selectedUnits = Object.values(formSizes).reduce(
    (sum, value) => sum + Number(value || 0),
    0,
  );
  const baseGarmentType = detectBaseGarmentType([
    product.category,
    product.slug,
    product.short_name,
    product.name,
  ]);
  const hasBaseModel = Boolean(
    getDetectedBaseModelUrl([
      product.category,
      product.slug,
      product.short_name,
      product.name,
    ]),
  );

  const imageEntries = useMemo(() => {
    const colors = product.colors || [];
    const ci = product.color_images;
    const colorImages = ci && typeof ci === "object" ? ci : {};

    return allProductImages.map((url) => {
      const assignedColor = Object.entries(colorImages).find(([, urls]) =>
        Array.isArray(urls) && urls.includes(url),
      )?.[0];
      const normalizedColor =
        assignedColor &&
        (colors.find(
          (color) => normalizeColorName(color) === normalizeColorName(assignedColor),
        ) ||
          assignedColor);

      return { url, color: normalizedColor || "" };
    });
  }, [product.color_images, product.colors, allProductImages]);

  const hasColorMapping = imageEntries.some((entry) => entry.color !== "");
  const displayImages = imageEntries.map((e) => e.url);
  const activeImageIndex =
    displayImages.length > 0 ? Math.min(galleryIndex, displayImages.length - 1) : 0;
  const activeImage = displayImages[activeImageIndex] || "";
  const activeGalleryColor =
    hasColorMapping && imageEntries[activeImageIndex]?.color
      ? imageEntries[activeImageIndex].color
      : selectedColor;
  const activeColorHex = getColorHex(activeGalleryColor);
  const selectedColorHex = getColorHex(selectedColor);

  const handleGallery = useCallback(
    (nextIndex: number) => {
      const total = displayImages.length;
      const clamped = (nextIndex + total) % total;
      onGalleryNav(pid, clamped, total);
      if (hasColorMapping) {
        const entryColor = imageEntries[clamped]?.color;
        if (
          entryColor &&
          normalizeColorName(entryColor) !== normalizeColorName(selectedColor)
        ) {
          const ci = (product.colors || []).findIndex(
            (color) => normalizeColorName(color) === normalizeColorName(entryColor),
          );
          if (ci >= 0) onColorSelect(pid, entryColor, ci, total);
        }
      }
    },
    [
      pid,
      displayImages.length,
      hasColorMapping,
      imageEntries,
      selectedColor,
      product.colors,
      onGalleryNav,
      onColorSelect,
    ],
  );

  const handleColorPick = useCallback(
    (color: string, colorIndex: number) => {
      onColorSelect(pid, color, colorIndex, displayImages.length);
      const mappedIndex = imageEntries.findIndex(
        (entry) => normalizeColorName(entry.color) === normalizeColorName(color),
      );
      if (mappedIndex >= 0) {
        onGalleryNav(pid, mappedIndex, displayImages.length);
        return;
      }
      if (!hasColorMapping && colorIndex < displayImages.length) {
        onGalleryNav(pid, colorIndex, displayImages.length);
      }
    },
    [
      pid,
      hasColorMapping,
      imageEntries,
      displayImages.length,
      onColorSelect,
      onGalleryNav,
    ],
  );

  function ringColor(hex: string) {
    const n = parseInt(hex.replace("#", ""), 16);
    let r = n >> 16;
    let g = (n >> 8) & 0xff;
    let b = n & 0xff;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (lum > 180) {
      r = Math.max(0, r - 50);
      g = Math.max(0, g - 50);
      b = Math.max(0, b - 50);
    } else if (lum < 50) {
      r = Math.min(255, r + 50);
      g = Math.min(255, g + 50);
      b = Math.min(255, b + 50);
    }
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
  }

  return (
    <div
      className="animate-fade-in-up group/card overflow-hidden rounded-2xl border border-[#dfe4e2] bg-gradient-to-br from-[#fbfaf7] via-[#f7f7f2] to-[#eef7f6] shadow-sm shadow-slate-900/5 transition-colors duration-200 hover:border-accent/30"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="grid gap-0 lg:grid-cols-[300px_1fr]">
        {/* ─── IMAGE ─── */}
        <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden border-r border-neutral-100 bg-white lg:aspect-auto lg:min-h-[340px]">
          <Image
            unoptimized
            src={activeImage || "/rokko.png"}
            alt={product.name}
            width={260}
            height={300}
            className="relative h-auto max-h-[84%] w-auto max-w-[84%] object-contain"
          />
          {logoPreview && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-14 h-14 opacity-30">
                <Image
                  unoptimized
                  src={logoPreview}
                  alt="Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}

          {/* Gallery nav */}
          {displayImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => handleGallery(activeImageIndex - 1)}
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-700 opacity-0 shadow-sm ring-1 ring-black/5 transition-colors duration-200 hover:bg-accent hover:text-white group-hover/card:opacity-100"
                aria-label="Imagen anterior"
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 18l-6-6 6-6"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleGallery(activeImageIndex + 1)}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-700 opacity-0 shadow-sm ring-1 ring-black/5 transition-colors duration-200 hover:bg-accent hover:text-white group-hover/card:opacity-100"
                aria-label="Imagen siguiente"
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 18l6-6-6-6"
                  />
                </svg>
              </button>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-white px-2.5 py-1.5 shadow-sm ring-1 ring-black/5">
                {displayImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => handleGallery(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${index === activeImageIndex ? "w-6" : "w-1.5 bg-neutral-300 hover:bg-neutral-400"}`}
                    style={index === activeImageIndex ? { backgroundColor: activeColorHex } : undefined}
                    aria-label={`Ver imagen ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badge */}
          {hasBaseModel && (
            <span className="absolute left-3 top-3 rounded-md bg-white px-2 py-0.5 text-[10px] font-black text-accent shadow-sm ring-1 ring-accent/10">
              3D
            </span>
          )}
        </div>

        {/* ─── CONTENT ─── */}
        <div className="flex flex-col bg-white/45 p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-accent">
                {product.short_name}
              </p>
              <h2 className="mt-1 text-lg font-black leading-snug text-neutral-950 sm:text-xl">
                {product.name}
              </h2>
              {description && (
                <p className="mt-1 text-sm leading-relaxed text-neutral-500 line-clamp-2">
                  {description}
                </p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[10px] font-bold text-neutral-500">Desde</p>
              <p className="text-lg font-black text-accent">
                ${product.price.toLocaleString("es-CL")}
              </p>
              <p className="text-[9px] text-neutral-400">IVA incl.</p>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-1">
            <span className="rounded-md border border-neutral-200 bg-white/70 px-2 py-0.5 text-[10px] font-bold text-neutral-600">
              {baseGarmentType}
            </span>
            {(product.technologies || []).slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="rounded-md border border-neutral-200 bg-white/70 px-2 py-0.5 text-[10px] font-bold text-neutral-600"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Color + Logo */}
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px]">
            <div className="rounded-xl border border-[#e3ded6] bg-white/70 p-3 shadow-sm shadow-slate-900/[0.03]">
              <label className="mb-2 flex items-center justify-between gap-2 text-[11px] font-black text-neutral-700">
                Color
                <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-[#f7f4ef] px-2 py-1 text-[10px] font-black text-neutral-700 capitalize">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: selectedColorHex }}
                  />
                  <span className="truncate">{selectedColor}</span>
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {(product.colors || []).map((color, colorIndex) => {
                  const selected =
                    normalizeColorName(selectedColor) === normalizeColorName(color);
                  const hex = getColorHex(color);
                  const rc = ringColor(hex);
                  return (
                    <button
                      key={color}
                      onClick={() => handleColorPick(color, colorIndex)}
                      title={color}
                      aria-label={`Seleccionar color ${color}`}
                      aria-pressed={selected}
                      className={`relative h-7 w-7 rounded-full transition-colors duration-200 ${selected ? "shadow-md" : "ring-1 ring-black/10"}`}
                      style={{
                        backgroundColor: hex,
                        ...(selected
                          ? {
                              outline: `2.5px solid ${rc}`,
                              outlineOffset: "3px",
                            }
                          : {}),
                      }}
                    >
                      {selected && (
                        <span className="absolute inset-1 rounded-full border border-white/80" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="rounded-xl border border-accent/15 bg-accent-soft/45 p-3 shadow-sm shadow-accent/5">
              <p className="text-[10px] font-black uppercase tracking-[0.08em] text-accent">
                Logo incluido
              </p>
              <p className="mt-1 text-xs font-semibold text-accent-deep/75">
                Pecho · Manga · Espalda
              </p>
            </div>
          </div>

          {/* Sizes */}
          <div className="mt-4 rounded-xl border border-[#ddd8d0] bg-[#fbfaf7]/80 p-3 shadow-sm shadow-slate-900/[0.03]">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="text-[11px] font-black uppercase tracking-[0.08em] text-neutral-700">
                Tallas
              </label>
              <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-black text-white shadow-sm shadow-accent/20">
                {selectedUnits} und.
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {sizes.map((size) => {
                const isAvail = productSizes.includes(size);
                const val = formSizes[size];
                return (
                  <div key={size}>
                    <label className={`mb-1 block text-center text-[10px] font-black ${isAvail ? "text-neutral-600" : "text-neutral-300"}`}>
                      {size}
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      disabled={!isAvail}
                      value={val ?? ""}
                      onChange={(e) => onSizeUpdate(pid, size, e.target.value)}
                      className={`h-9 w-full rounded-lg border text-center text-sm font-black outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/15 ${isAvail ? "border-[#d3d7d8] bg-white text-neutral-900 shadow-inner shadow-slate-900/[0.02]" : "border-neutral-100 bg-neutral-100/70 text-neutral-300"}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto grid grid-cols-[minmax(0,1fr)_112px] items-center gap-2.5 pt-4">
            <button
              onClick={() => onAddToCart(pid)}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-black text-white shadow-md shadow-accent/10 transition-colors hover:bg-accent-deep"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 5v14m7-7H5"
                />
              </svg>
              Agregar al pedido
            </button>
            <button
              onClick={() => onViewDetails(product)}
              className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-[#cfd8d9] bg-white/85 px-4 text-sm font-black text-neutral-700 shadow-sm shadow-slate-900/[0.03] transition-colors hover:border-accent/45 hover:bg-white hover:text-accent"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                />
              </svg>
              Ficha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
