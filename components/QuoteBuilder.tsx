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
import LogoEditor from "@/components/LogoEditor";

const colorMap: Record<string, string> = {
  amarillo: "#eab308",
  arena: "#d8c3a5",
  "azul marino": "#1e3a5f",
  "azul rey": "#1d4ed8",
  "azul royal": "#1d4ed8",
  blanco: "#ffffff",
  camel: "#c19a6b",
  celeste: "#93c5fd",
  fucsia: "#d946ef",
  granate: "#7f1d1d",
  gris: "#9ca3af",
  "gris oscuro": "#4b5563",
  "gris jaspeado": "#b6bbc3",
  "gris vigore": "#6b7280",
  morado: "#7c3aed",
  naranja: "#ea580c",
  naranjo: "#ea580c",
  negro: "#1a1a1a",
  plomo: "#6b7280",
  rojo: "#dc2626",
  "rosa claro": "#f9a8d4",
  turqueza: "#14b8a6",
  turquesa: "#14b8a6",
  "verde aceituna": "#4d7c0f",
  "verde manzana": "#84cc16",
  "verde mist": "#8fb9a8",
  "verde pino": "#166534",
};

const sizes = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];

const logoPositions = {
  "Pecho izquierdo": "left-[43%] top-[38%] w-14",
  "Pecho derecho": "right-[32%] top-[38%] w-14",
  "Pecho centro": "left-1/2 top-[39%] w-16 -translate-x-1/2",
  "Espalda alta": "left-1/2 top-[28%] w-24 -translate-x-1/2",
  "Manga izquierda": "left-[24%] top-[39%] w-12",
  "Manga derecha": "right-[24%] top-[39%] w-12",
};

type LogoPosition = keyof typeof logoPositions;

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
    new Set([...directImages, ...parsedImages, ...fallbackImage])
  ).filter(Boolean);
}

export default function QuoteBuilder({ initialProducts }: Props) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [forms, setForms] = useState<Record<string, ProductForm>>({});
  const [galleryIndexes, setGalleryIndexes] = useState<Record<string, number>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoCustomPos, setLogoCustomPos] = useState<{ left: number; top: number; scaleX: number; scaleY: number } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [savingQuote, setSavingQuote] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [submittedFolio, setSubmittedFolio] = useState<string | null>(null);
  const [brand, setBrand] = useState<Record<string, any> | null>(null);
  const [commercial, setCommercial] = useState<Record<string, any> | null>(null);

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

  const handleColorSelect = useCallback((productId: string, color: string, _colorIndex: number, totalImages: number) => {
    setForms((prev) => ({
      ...prev,
      [productId]: { ...(prev[productId] || {}), color },
    }));
    if (totalImages > 1) {
      setGalleryIndexes((prev) => ({
        ...prev,
        [productId]: 0,
      }));
    }
  }, []);

  const handleGalleryNav = useCallback((productId: string, nextIndex: number, totalImages: number) => {
    setGalleryIndexes((prev) => ({
      ...prev,
      [productId]: (nextIndex + totalImages) % totalImages,
    }));
  }, []);

  const handleFormUpdate = useCallback((productId: string, field: string, value: string) => {
    setForms((prev) => ({
      ...prev,
      [productId]: { ...(prev[productId] || {}), [field]: value },
    }));
  }, []);

  const handleSizeUpdate = useCallback((productId: string, size: string, value: string) => {
    const quantity = Number(value) || 0;
    setForms((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        sizes: { ...(prev[productId]?.sizes || {}), [size]: quantity },
      },
    }));
  }, []);

  const handleAddToCart = useCallback((productId: string) => {
    const product = productsRef.current.find((p) => p.id === productId);
    if (!product) return;
    const form = formsRef.current[productId] || {};
    const productSizes = form.sizes || {};
    const totalUnits = Object.values(productSizes).reduce((sum, qty) => sum + Number(qty || 0), 0);
    if (totalUnits <= 0) {
      alert("Debes ingresar al menos una cantidad.");
      return;
    }
    const unitPrice =
      product.wholesale_from && product.wholesale_price && totalUnits >= product.wholesale_from
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

  function updateForm(productId: string, field: keyof ProductForm, value: string) {
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

  function setGalleryIndex(productId: string, nextIndex: number, totalImages: number) {
    setGalleryIndexes((prev) => ({
      ...prev,
      [productId]: (nextIndex + totalImages) % totalImages,
    }));
  }

  function selectProductColor(product: Product, color: string, colorIndex: number) {
    updateForm(product.id, "color", color);

    const totalImages = getProductImages(product).length;
    if (totalImages > 1) {
      setGalleryIndex(product.id, Math.min(colorIndex, totalImages - 1), totalImages);
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
      0
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

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.subtotal, 0), [cart]);

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
        alert("Error al guardar. Revisa la consola (F12) y ejecuta 'NOTIFY pgrst, reload schema;' en SQL Editor.");
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
        <div className="fixed bottom-6 right-6 z-[200] animate-scale-in rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/25">
          <span className="mr-2">✓</span>
          Producto agregado al pedido
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {initialProducts.length === 0 && (
            <div className="animate-fade-in-up rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 text-center shadow-sm backdrop-blur-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
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
            const selectedColor = forms[product.id]?.color || product.colors?.[0] || "Seleccionar";
            const formLogo = forms[product.id]?.logo;
            const galleryIndex = galleryIndexes[product.id] || 0;

            return (
              <ProductCard
                key={product.id}
                product={product}
                animationDelay={i * 80}
                selectedColor={selectedColor}
                galleryIndex={galleryIndex}
                formLogo={formLogo}
                onColorSelect={handleColorSelect}
                onGalleryNav={handleGalleryNav}
                onFormUpdate={handleFormUpdate}
                onSizeUpdate={handleSizeUpdate}
                onAddToCart={handleAddToCart}
                onViewDetails={setSelectedProduct}
              />
            );
          })}
        </div>

        {/* Cart sidebar */}
        <aside className="sticky top-28 h-fit rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-cyan-700">Pedido actual</p>
            {cart.length > 0 && (
              <span className="rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-black text-cyan-700">{cart.length}</span>
            )}
          </div>

          <div className="mt-8 space-y-4">
            {cart.length === 0 ? (
              <div className="rounded-2xl bg-slate-50/80 p-6 text-center">
                <h3 className="font-black text-slate-950">Sin productos</h3>
                <p className="mt-1 text-sm text-slate-500">Agrega prendas para comenzar la cotización.</p>
              </div>
            ) : (
              <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="group rounded-2xl bg-slate-50/80 p-5 transition-all hover:bg-slate-100">
                    <div className="flex justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-black text-slate-950">{item.product}</h3>
                        <p className="mt-1 text-sm text-slate-500">{item.color}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {Object.entries(item.sizes)
                            .filter(([, qty]) => qty > 0)
                            .map(([size, qty]) => `${size}: ${qty}`)
                            .join(" · ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">${item.subtotal.toLocaleString("es-CL")}</p>
                        <p className="text-xs text-slate-400">{item.totalUnits} und.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="mt-3 w-full rounded-xl bg-white/80 px-3 py-2 text-xs font-bold text-red-500 opacity-0 shadow-sm backdrop-blur-sm transition-all hover:bg-red-50 group-hover:opacity-100"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-slate-200/80 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Total</span>
              <strong className="text-3xl font-black text-slate-950">${total.toLocaleString("es-CL")}</strong>
            </div>
            <button
              onClick={openQuoteModal}
              disabled={cart.length === 0}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 px-6 py-4 text-sm font-bold text-white shadow-sm shadow-cyan-500/20 transition-all hover:from-cyan-700 hover:to-cyan-600 hover:shadow-lg hover:shadow-cyan-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/40 backdrop-blur-sm transition-all">
          <button
            className="absolute inset-0 cursor-default"
            onClick={() => setSelectedProduct(null)}
            aria-label="Cerrar ficha"
          />

          <aside className="relative h-full w-full max-w-3xl overflow-y-auto border-l border-slate-200 bg-slate-50 shadow-2xl transition-all">
            {/* Header Fijo */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-8 py-5 backdrop-blur-md">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-600">Documento Técnico</span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">Especificaciones de Producto</h2>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-black text-slate-600 shadow-sm transition-all hover:border-red-200 hover:text-red-600"
              >
                Cerrar Ficha
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Sección Principal Asimétrica */}
              <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
                {/* Bloque Izquierdo: Título y Textos */}
                <div className="flex flex-col justify-between rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <div>
                    <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      ID: {selectedProduct.id.slice(0, 8).toUpperCase()}
                    </span>
                    <h3 className="mt-3 text-3xl font-black leading-tight text-slate-950">
                      {selectedProduct.name}
                    </h3>
                    <p className="mt-4 text-sm font-medium leading-relaxed text-slate-500">
                      {selectedProduct.description || selectedProduct.extract || "No hay una descripción extendida registrada para esta prenda corporativa."}
                    </p>
                  </div>

                  {/* Badges de Atributos Críticos del Producto */}
                  <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Garantía</p>
                        <p className="text-xs font-black text-slate-700">Filtro UV / Rokko</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v6a2 2 0 012-2m14-6V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Categoría</p>
                        <p className="text-xs font-black text-slate-700">{selectedProduct.short_name || "Prenda"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bloque Derecho: Atributos de Composición y Gramaje */}
                <div className="grid gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Composición Material</span>
                    <p className="mt-2 text-sm font-black text-slate-800">
                      {selectedProduct.composition || "Mezcla estándar de alta resistencia"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Gramaje / Densidad</span>
                    <p className="mt-2 text-sm font-black text-slate-800">
                      {selectedProduct.weight || "No especificado"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Escala de Precios</span>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-cyan-700">${selectedProduct.price.toLocaleString("es-CL")}</span>
                      <span className="text-[10px] font-bold text-slate-400">Base Neto</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulador / Configuración de Logotipo Corporativo */}
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Posiciona tu Logo en la Prenda</h4>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">Sube tu logo y arrastra sobre la prenda para ubicarlo. Puedes redimensionarlo con las esquinas.</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-[1fr_220px]">
                  <LogoEditor
                    productImageUrl={
                      (() => {
                        const pid = selectedProduct.id;
                        const selectedColor = forms[pid]?.color || selectedProduct.colors?.[0] || "";
                        const colorImgs = selectedProduct.color_images?.[selectedColor];
                        const imgs = colorImgs && colorImgs.length > 0 ? colorImgs : getProductImages(selectedProduct);
                        return imgs[galleryIndexes[pid] || 0] || "";
                      })()
                    }
                    logoSrc={logoPreview}
                    onLogoUpload={(file) => {
                      if (logoPreview) URL.revokeObjectURL(logoPreview);
                      setLogoPreview(URL.createObjectURL(file));
                    }}
                    onPositionChange={(pos) => setLogoCustomPos(pos)}
                    activePosition={forms[selectedProduct.id]?.logoPosition || "Pecho izquierdo"}
                    onActivePositionChange={(label) => updateForm(selectedProduct.id, "logoPosition", label)}
                  />

                  <div className="flex flex-col justify-center space-y-4">
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Técnica Recomendada</label>
                      <select
                        value={forms[selectedProduct.id]?.application || "Bordado"}
                        onChange={(e) => updateForm(selectedProduct.id, "application", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-cyan-400"
                      >
                        <option>Bordado</option>
                        <option>Estampado</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tecnologías del Textil */}
              {selectedProduct.technologies && selectedProduct.technologies.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 mb-3">Propiedades y Tecnologías</h4>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {selectedProduct.technologies.map((tech) => (
                      <div key={tech} className="rounded-xl border border-slate-200 bg-white p-3.5 text-center shadow-sm">
                        <p className="text-xs font-black text-slate-800">{tech}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Colores y Muestrarios Disponibles */}
              {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <h4 className="text-sm font-black text-slate-900">Variaciones de Color Disponibles</h4>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedProduct.colors.map((color) => {
                      const hex = colorMap[color.toLowerCase()] || "#ccc";
                      return (
                        <div key={color} className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">
                          <span className="h-4 w-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: hex }} />
                          {color}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Curva de Tallas Permitidas */}
              {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <h4 className="text-sm font-black text-slate-900 mb-3">Curva de Talles de Manufactura</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map((size) => (
                      <span key={size} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 font-black text-xs text-white">
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Certificaciones Internacionales / Estándares */}
              {certificationLogos.length > 0 && (
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <h4 className="text-sm font-black text-slate-900">Certificaciones y Homologaciones</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Esta prenda cumple con las siguientes normas y controles internacionales de calidad industrial:</p>
                  <div className="mt-5 grid grid-cols-3 gap-4">
                    {certificationLogos.slice(0, 6).map((logo) => (
                      <div key={logo} className="flex h-16 items-center justify-center rounded-2xl bg-slate-50 p-3 border border-slate-100">
                        <Image src={logo} alt="Certificación" width={120} height={60} className="h-auto max-h-full w-auto object-contain" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DE COTIZACIÓN — SOLO FORMULARIO DE CLIENTE      */}
      {/* ======================================================== */}
      {quoteOpen && !submittedFolio && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <button className="absolute inset-0 cursor-default" onClick={() => setQuoteOpen(false)} />
          <div className="relative mt-8 mb-8 w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-white/80 px-8 py-5 backdrop-blur-xl">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-700">Generar cotización</p>
                <h2 className="mt-1 text-3xl font-black text-slate-950">Datos del cliente</h2>
              </div>
              <button
                onClick={() => setQuoteOpen(false)}
                className="rounded-full border border-slate-200/80 bg-white/80 px-5 py-2 text-sm font-bold text-slate-600"
              >
                Cerrar
              </button>
            </div>

            <div className="grid gap-8 p-8 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6">
                <div className="grid gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Empresa / Institución *</label>
                    <input
                      value={clientData.empresa}
                      onChange={(e) => updateClient("empresa", e.target.value)}
                      placeholder="Razón social"
                      className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-4 outline-none transition-all focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.15em] text-slate-500">RUT</label>
                    <input
                      value={clientData.rut}
                      onChange={(e) => handleRutChange(e.target.value)}
                      placeholder="12.345.678-9"
                      maxLength={12}
                      className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-4 outline-none transition-all focus:border-cyan-400"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Nombre contacto</label>
                      <input
                        value={clientData.contacto}
                        onChange={(e) => updateClient("contacto", e.target.value)}
                        placeholder="Nombre y apellido"
                        className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-4 outline-none transition-all focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Correo electrónico</label>
                      <input
                        value={clientData.correo}
                        onChange={(e) => updateClient("correo", e.target.value)}
                        placeholder="correo@ejemplo.cl"
                        type="email"
                        className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-4 outline-none transition-all focus:border-cyan-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Teléfono</label>
                    <input
                      value={clientData.telefono}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="+569 1234 5678"
                      maxLength={15}
                      className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-4 outline-none transition-all focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Observaciones</label>
                    <textarea
                      value={clientData.observaciones}
                      onChange={(e) => updateClient("observaciones", e.target.value)}
                      rows={3}
                      placeholder="Detalles adicionales, fechas estimadas, etc."
                      className="w-full resize-none rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-4 outline-none transition-all focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-6">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                  Resumen del pedido ({cart.length} producto{cart.length !== 1 ? "s" : ""})
                </p>
                <div className="max-h-[400px] space-y-3 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-slate-50/80 p-4">
                      <div className="flex justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900">{item.product}</p>
                          <p className="text-xs text-slate-500">{item.color} · {item.application}</p>
                          <p className="text-xs text-slate-400">
                            {Object.entries(item.sizes).filter(([, q]) => q > 0).map(([s, q]) => `${s}: ${q}`).join(" · ")}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-slate-900">${item.subtotal.toLocaleString("es-CL")}</p>
                          <p className="text-xs text-slate-400">{item.totalUnits} und.</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-slate-200/80 pt-4">
                  <span className="text-sm text-slate-500">Total</span>
                  <strong className="text-2xl font-black text-slate-950">${total.toLocaleString("es-CL")}</strong>
                </div>
                <button
                  onClick={handleSubmitQuote}
                  disabled={savingQuote}
                  className="mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 px-6 py-4 text-sm font-bold text-white shadow-sm transition-all hover:from-cyan-700 hover:to-cyan-600 active:scale-[0.98] disabled:opacity-50"
                >
                  {savingQuote ? "Guardando..." : "Solicitar cotización"}
                </button>
                {emailStatus === "error" && (
                  <div className="mt-3 rounded-xl bg-amber-50 p-3 text-center text-xs font-medium text-amber-700">
                    Cotización guardada, pero el email no pudo enviarse.
                    <br />Te contactaremos a la brevedad.
                  </div>
                )}
                <p className="mt-3 text-center text-xs text-slate-400">
                  Recibirás una respuesta a la brevedad con los precios finales.
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
            className="fixed inset-0 z-[120] overflow-y-auto bg-slate-900/40 backdrop-blur-sm no-print print:static print:bg-white print:p-0"
          >
            <div className="mx-auto my-8 max-w-4xl bg-white p-12 shadow-2xl flex flex-col justify-between min-h-[1050px] print:my-0 print:p-0 print:shadow-none print:min-h-0 print:h-auto">

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
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Cotización</h1>
                    <div className="mt-2 text-sm text-slate-500 space-y-0.5">
                      <p><span className="text-slate-400">Orden de compra número:</span> <span className="font-bold text-slate-800">{submittedFolio}</span></p>
                      <p><span className="text-slate-400">Fecha de orden:</span> <span className="font-bold text-slate-800">{new Date().toLocaleDateString("es-CL", { year: "numeric", month: "long", day: "numeric" })}</span></p>
                    </div>
                  </div>
                </div>

                {/* ────── PARTIES: DE / COBRAR A ────── */}
                <div className="mt-12 grid grid-cols-2 gap-16 border-t border-slate-100 pt-8">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">De</p>
                    <p className="text-lg font-black text-slate-900">{brand?.name || "ROKKO"}</p>
                    <div className="mt-1.5 space-y-0.5 text-sm text-slate-500 leading-relaxed">
                      {brand?.email && <p className="font-medium text-slate-700">{brand.email}</p>}
                      {brand?.phone && <p>{brand.phone}</p>}
                      {brand?.city && <p>{brand.city}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Cobrar a</p>
                    <p className="text-lg font-black text-slate-900">{clientData.empresa}</p>
                    <div className="mt-1.5 space-y-0.5 text-sm text-slate-500 leading-relaxed inline-block text-left float-right">
                      {clientData.correo && <p className="font-medium text-slate-700 text-right">{clientData.correo}</p>}
                      {clientData.rut && <p className="text-right">RUT: {clientData.rut}</p>}
                      {clientData.contacto && <p className="text-right">Att.: {clientData.contacto}</p>}
                      {clientData.telefono && clientData.telefono !== "+56 9" && <p className="text-right">{clientData.telefono}</p>}
                    </div>
                  </div>
                </div>

                {/* ────── PRODUCT TABLE ────── */}
                <div className="mt-10 overflow-hidden">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-cyan-600 text-white">
                        <th className="py-3.5 pl-4 text-left text-xs font-bold uppercase tracking-wider w-12">#</th>
                        <th className="py-3.5 text-left text-xs font-bold uppercase tracking-wider">Producto</th>
                        <th className="py-3.5 text-left text-xs font-bold uppercase tracking-wider">Detalle</th>
                        <th className="py-3.5 text-right text-xs font-bold uppercase tracking-wider w-20">Cant.</th>
                        <th className="py-3.5 text-right text-xs font-bold uppercase tracking-wider w-28">P. Unitario</th>
                        <th className="py-3.5 pr-4 text-right text-xs font-bold uppercase tracking-wider w-28">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 border-b border-slate-200">
                      {cart.map((item, idx) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                        >
                          <td className="py-4 pl-4 text-sm font-bold text-slate-400 alignment-baseline">{idx + 1}</td>
                          <td className="py-4 pr-4 text-sm font-bold text-slate-900 alignment-baseline max-w-[200px] break-words">{item.product}</td>
                          <td className="py-4 pr-4 alignment-baseline">
                            <p className="text-xs text-slate-600 font-medium">{item.color} · {item.application} · {item.logoPosition}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {Object.entries(item.sizes).filter(([, q]) => q > 0).map(([s, q]) => `${s}: ${q}`).join(" · ")}
                            </p>
                          </td>
                          <td className="py-4 text-right text-sm font-semibold text-slate-700 alignment-baseline">{item.totalUnits}</td>
                          <td className="py-4 text-right text-sm text-slate-600 alignment-baseline">${item.unitPrice.toLocaleString("es-CL")}</td>
                          <td className="py-4 pr-4 text-right text-sm font-bold text-slate-900 alignment-baseline">${item.subtotal.toLocaleString("es-CL")}</td>
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
                        <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 mb-1">Observaciones</p>
                        <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">{clientData.observaciones}</p>
                      </div>
                    )}
                    {commercial?.terms && (
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 mb-1">Condiciones Comerciales</p>
                        <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">{commercial.terms}</p>
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
                            <span className="text-slate-500 font-medium">Neto</span>
                            <span className="font-bold text-slate-800">${neto.toLocaleString("es-CL")}</span>
                          </div>
                          <div className="flex justify-between text-sm px-1">
                            <span className="text-slate-500 font-medium">IVA ({vatRate}%)</span>
                            <span className="font-bold text-slate-800">${iva.toLocaleString("es-CL")}</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 rounded p-4 mt-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Saldo adeudado</span>
                              <span className="text-xl font-black text-slate-900">${total.toLocaleString("es-CL")}</span>
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
                    <p className="text-xs italic text-slate-400">{brand?.footer || "Gracias por preferirnos. La imagen de tu empresa comienza aquí."}</p>
                    <p className="mt-1.5 text-[10px] font-medium text-slate-400">
                      Cotización válida por {commercial?.validity || 7} días · Generada el {new Date().toLocaleDateString("es-CL")} a las {new Date().toLocaleTimeString("es-CL", { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right border-b border-slate-200 pb-1 w-40 flex flex-col items-center">
                    <div className="h-10 w-32 relative opacity-85 mix-blend-multiply">
                      <svg viewBox="0 0 140 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-cyan-600">
                        <path d="M10 30 Q30 5 50 25 T90 15 T130 25 M45,15 Q65,2 75,32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                      </svg>
                    </div>
                    <p className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Firma Autorizada</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ────── BOTONES — solo en pantalla ────── */}
            <div className="no-print sticky bottom-0 flex flex-wrap items-center justify-center gap-3 border-t border-slate-200 bg-white/90 p-6 backdrop-blur-md shadow-xl">
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
                  className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-700 hover:bg-amber-100 transition"
                >
                  Reintentar envío email
                </button>
              )}
              <button
                onClick={() => printElement("quote-invoice-wrapper")}
                className="rounded-xl bg-cyan-600 px-8 py-4 text-sm font-black text-white shadow-lg shadow-cyan-600/20 hover:bg-cyan-700 transition"
              >
                Imprimir / PDF
              </button>
              <button
                onClick={resetQuote}
                className="rounded-xl border border-slate-200 bg-white px-8 py-4 text-sm font-bold text-slate-600 hover:border-cyan-300 hover:text-cyan-700 transition"
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

const ProductCard = memo(function ProductCard({
  product,
  animationDelay,
  selectedColor,
  galleryIndex,
  formLogo,
  onColorSelect,
  onGalleryNav,
  onFormUpdate,
  onSizeUpdate,
  onAddToCart,
  onViewDetails,
}: {
  product: Product;
  animationDelay: number;
  selectedColor: string;
  galleryIndex: number;
  formLogo: string | undefined;
  onColorSelect: (productId: string, color: string, colorIndex: number, totalImages: number) => void;
  onGalleryNav: (productId: string, nextIndex: number, totalImages: number) => void;
  onFormUpdate: (productId: string, field: string, value: string) => void;
  onSizeUpdate: (productId: string, size: string, value: string) => void;
  onAddToCart: (productId: string) => void;
  onViewDetails: (product: Product) => void;
}) {
  const allProductImages = getProductImages(product);
  const colorImages = product.color_images?.[selectedColor];
  const productImages = colorImages && colorImages.length > 0 ? colorImages : allProductImages;
  const productSizes = product.sizes?.length ? product.sizes : sizes;
  const description = product.extract || [product.composition, product.weight].filter(Boolean).join(", ") || product.description;
  const activeImageIndex = Math.min(galleryIndex, productImages.length - 1);
  const activeImage = productImages[activeImageIndex] || "";
  const pid = product.id;

  return (
    <div
      className="animate-fade-in-up rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition-all hover:border-cyan-200 hover:shadow-[0_16px_42px_rgba(8,145,178,0.12)]"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="grid gap-5 md:grid-cols-[150px_1fr]">
        <div className="group relative flex h-44 items-center justify-center overflow-hidden rounded-[1.25rem] border border-slate-100 bg-slate-50 p-4 shadow-inner">
          <Image unoptimized src={activeImage} alt={product.name} width={170} height={170} className="h-auto max-h-full w-auto object-contain drop-shadow-sm" />
          {productImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => onGalleryNav(pid, activeImageIndex - 1, productImages.length)}
                className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-slate-700 opacity-0 shadow-sm transition-all hover:border-cyan-200 hover:text-cyan-700 group-hover:opacity-100"
                aria-label="Imagen anterior"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => onGalleryNav(pid, activeImageIndex + 1, productImages.length)}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-slate-700 opacity-0 shadow-sm transition-all hover:border-cyan-200 hover:text-cyan-700 group-hover:opacity-100"
                aria-label="Imagen siguiente"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                </svg>
              </button>
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-white/85 px-2 py-1 shadow-sm">
                {productImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => onGalleryNav(pid, index, productImages.length)}
                    className={`h-1.5 rounded-full transition-all ${index === activeImageIndex ? "w-5 bg-cyan-500" : "w-1.5 bg-slate-300 hover:bg-slate-400"}`}
                    aria-label={`Ver imagen ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-cyan-700">{product.short_name}</p>
              <h2 className="mt-2 max-w-xl text-2xl font-black leading-tight text-slate-950 sm:text-3xl">{product.name}</h2>
              {description && <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{description}</p>}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Desde</p>
              <p className="text-2xl font-black leading-none text-cyan-700">${product.price.toLocaleString("es-CL")}</p>
              <p className="mt-1 text-[11px] font-semibold text-slate-400">IVA incluido</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {(product.technologies || []).slice(0, 4).map((tech) => (
              <span key={tech} className="rounded-full bg-cyan-50 px-3 py-1 text-[11px] font-black text-cyan-700">{tech}</span>
            ))}
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-[1fr_200px]">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.28em] text-slate-500">
                Color: <span className="text-cyan-700">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {(product.colors || []).map((color, colorIndex) => {
                  const selected = selectedColor === color;
                  const hex = colorMap[color.toLowerCase()] || "#ccc";
                  return (
                    <button
                      key={color}
                      onClick={() => onColorSelect(pid, color, colorIndex, productImages.length)}
                      title={color}
                      className={`h-8 w-8 rounded-full border shadow-sm transition-all hover:scale-105 ${selected ? "border-white ring-2 ring-cyan-400 ring-offset-2" : "border-slate-300"}`}
                      style={{ backgroundColor: hex }}
                    />
                  );
                })}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">Logo incluido</label>
              <select
                value={formLogo || "Pecho incluido"}
                onChange={(e) => onFormUpdate(pid, "logo", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/10"
              >
                <option>Pecho incluido</option>
                <option>Pecho + espalda</option>
                <option>Pecho + brazo</option>
                <option>2 brazos</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-3 block text-xs font-black uppercase tracking-[0.28em] text-slate-500">Cantidades por talla</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {sizes.map((size) => {
                const isAvail = productSizes.includes(size);
                return (
                  <div key={size}>
                    <label className="mb-1.5 block text-center text-xs font-bold text-slate-500">{size}</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      disabled={!isAvail}
                      onChange={(e) => onSizeUpdate(pid, size, e.target.value)}
                      className={`h-10 w-full rounded-xl border px-2 text-center text-sm outline-none transition-all focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/10 ${isAvail ? "border-slate-200 bg-white text-slate-700" : "border-slate-100 bg-slate-50 text-slate-300"}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onAddToCart(pid)}
              className="rounded-full bg-slate-950 px-7 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-cyan-700 hover:shadow-lg hover:shadow-cyan-700/25 active:scale-95"
            >
              Agregar al pedido
            </button>
            <button
              onClick={() => onViewDetails(product)}
              className="rounded-full border border-slate-300 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 transition-all hover:border-cyan-400 hover:text-cyan-700 hover:shadow-md"
            >
              Ver ficha técnica
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});