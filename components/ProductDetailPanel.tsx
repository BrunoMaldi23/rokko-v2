"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";
import type { Product } from "@/types/product";
import { certificationLogos } from "@/data/catalog";
import { getProductPriceTiers } from "@/lib/pricing";
import MockupEditor from "@/components/MockupEditor/MockupEditor";

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
  cafe: "#6f4e37",
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
  petroleo: "#1e3a5f",
  plata: "#c0c0c0",
  plomo: "#6b7280",
  rojo: "#dc2626",
  rosa: "#f9a8d4",
  "rosa claro": "#f9a8d4",
  "rosa mexicano": "#ec4899",
  rosado: "#f9a8d4",
  salmon: "#fb923c",
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

const DEFAULT_SIZES = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];

type ProductDetailPanelProps = {
  product: Product;
  selectedColor: string;
  productImages: string[];
  galleryIndex: number;
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
  onClose: () => void;
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

function getTechLabel(tech: string): string {
  const normalized = tech
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (normalized.includes("uv")) return "UV";
  if (normalized.includes("dry")) return "DRY";
  if (normalized.includes("algodon")) return "ALG";
  if (normalized.includes("termico")) return "TH";
  if (normalized.includes("impermeable")) return "H2O";
  if (normalized.includes("antibacterial")) return "AB";
  if (normalized.includes("stretch")) return "ST";
  if (normalized.includes("respirable")) return "AIR";
  return "OK";
}

function Icon({
  type,
  className = "h-5 w-5",
}: {
  type: "close" | "shield" | "ruler" | "spark" | "upload";
  className?: string;
}) {
  const paths: Record<typeof type, string[]> = {
    close: ["M6 18 18 6M6 6l12 12"],
    shield: ["M12 3 20 7v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4Z"],
    ruler: ["M4 17 17 4l3 3L7 20l-3-3Z"],
    spark: ["M13 3 4 14h7l-1 7 9-11h-7l1-7Z"],
    upload: [
      "M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5h10.5a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0017.25 4.5H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z",
    ],
  };

  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      {paths[type].map((path) => (
        <path
          key={path}
          strokeLinecap="round"
          strokeLinejoin="round"
          d={path}
        />
      ))}
    </svg>
  );
}

export default function ProductDetailPanel({
  product,
  selectedColor,
  productImages,
  galleryIndex,
  onColorSelect,
  onGalleryNav,
  onClose,
}: ProductDetailPanelProps) {
  const productImagesLength = productImages.length;
  const currentImage = productImages[galleryIndex] || "";
  const productCode = product.id.slice(0, 8).toUpperCase();
  const productDescription =
    product.description ||
    product.extract ||
    "Prenda corporativa pensada para vestir equipos con presencia, comodidad y una terminación consistente.";

  const imageEntries = useMemo(() => {
    const colorImages =
      product.color_images && typeof product.color_images === "object"
        ? product.color_images
        : {};
    return productImages.map((url, index) => {
      const assignedColor = Object.entries(colorImages).find(
        ([, urls]) => Array.isArray(urls) && urls.includes(url),
      )?.[0];
      const normalizedColor =
        assignedColor &&
        (product.colors.find(
          (color) =>
            normalizeColorName(color) === normalizeColorName(assignedColor),
        ) ||
          assignedColor);
      return {
        url,
        color:
          normalizedColor ||
          (product.colors.length === productImagesLength
            ? product.colors[index]
            : "") ||
          "",
      };
    });
  }, [
    product.color_images,
    product.colors,
    productImages,
    productImagesLength,
  ]);

  const inferredGalleryColor =
    imageEntries[galleryIndex]?.color || selectedColor;
  const activeColor = inferredGalleryColor;
  const availableSizes =
    product.sizes && product.sizes.length > 0 ? product.sizes : DEFAULT_SIZES;
  const hasTechnologies = Boolean(
    product.technologies && product.technologies.length > 0,
  );
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const priceInfo = useMemo(() => {
    const tiers = getProductPriceTiers(product);
    return tiers.length > 0
      ? {
          base: product.price,
          wholesale: tiers[0].price,
          from: tiers[0].from,
          tiers,
        }
      : { base: product.price, wholesale: null, from: null, tiers: [] };
  }, [product]);

  const technicalStats = [
    {
      label: "Composición",
      value: product.composition || "Mezcla de alta resistencia",
    },
    { label: "Gramaje", value: product.weight || "Por confirmar" },
    { label: "Categoría", value: product.category },
  ];

  function selectColor(color: string, colorIndex: number) {
    onColorSelect(product.id, color, colorIndex, productImagesLength);
    const mappedIndex = imageEntries.findIndex(
      (entry) => normalizeColorName(entry.color) === normalizeColorName(color),
    );
    if (mappedIndex >= 0) {
      onGalleryNav(product.id, mappedIndex, productImagesLength);
    } else if (colorIndex < productImagesLength) {
      onGalleryNav(product.id, colorIndex, productImagesLength);
    }
  }

  return (
    <aside className="fixed inset-0 z-[100] grid place-items-center bg-[#2d3436]/60 p-3 backdrop-blur-md transition-all sm:p-5">
      <div className="relative flex h-[94vh] w-full max-w-[1500px] flex-col overflow-hidden rounded-2xl border border-[#dce8eb] bg-[#f3f8fa] text-[#15191a] shadow-2xl">
        {/* HEADER */}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#dce8eb] bg-white px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0b7280]" />
              <p className="text-xs font-bold uppercase tracking-wider text-[#0b7280]">
                Ficha Técnica ROKKO
              </p>
            </div>
            <h2 className="mt-0.5 truncate text-xl font-extrabold tracking-tight text-[#15191a] sm:text-2xl">
              {product.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 shrink-0 items-center gap-2 rounded-xl border border-[#dce8eb] bg-white px-3 text-sm font-semibold text-[#3f5258] shadow-sm transition-all hover:bg-[#eaf3f5] hover:text-[#15191a] sm:px-4"
          >
            <span>Cerrar</span>
            <Icon type="close" className="h-4 w-4" />
          </button>
        </header>

        {/* CONTENT REGION (Scrollable) */}
        <div className="grid flex-1 items-start gap-6 overflow-y-auto p-4 sm:p-6 lg:grid-cols-[minmax(420px,0.95fr)_minmax(0,1.25fr)] xl:grid-cols-[minmax(500px,0.95fr)_minmax(0,1.35fr)]">
          {/* MOCKUP & CONFIGURATION CONTROLS (LEFT) */}
          <section className="space-y-4">
            {currentImage ? (
              <MockupEditor
                productName={product.name}
                currentImage={currentImage}
                galleryImages={productImages}
                calibrations={product.mockup_calibrations}
                colorSelector={
                  <div>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-black uppercase tracking-[0.18em] text-[#0b7280]">
                        Color de prenda
                      </span>
                      <span className="rounded-full bg-[#e4f7fa] px-3 py-1 text-xs font-black capitalize text-[#087181]">
                        {activeColor}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.colors?.map((color, index) => {
                        const selected =
                          normalizeColorName(color) === normalizeColorName(activeColor);
                        const colorHex = getColorHex(color);
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => selectColor(color, index)}
                            className={`flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-black transition-all ${
                              selected
                                ? "border-[#0b7280] bg-[#e4f7fa] text-[#087181] shadow-sm"
                                : "border-[#dce8eb] bg-white text-[#3f5258] hover:border-[#46b9c8] hover:bg-[#f3f8fa]"
                            }`}
                          >
                            <span
                              className="h-4 w-4 shrink-0 rounded-full border border-[#dce8eb] shadow-inner"
                              style={{ backgroundColor: colorHex }}
                            />
                            <span className="capitalize">{color}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                }
              />
            ) : (
              <div className="rounded-2xl border border-[#dce8eb] bg-white p-8 text-center text-sm font-semibold text-[#3f5258] shadow-sm">
                Sin imagen de prenda para generar mockup.
              </div>
            )}

          </section>

          {/* SYSTEM ARCHITECTURE DETAILS & PRICING (RIGHT) */}
          <section className="h-fit self-start space-y-4 rounded-2xl border border-[#dce8eb] bg-white/58 p-4 shadow-inner shadow-slate-900/[0.03]">
            {/* PRICING MODULE */}
            <div className="grid items-stretch gap-4 sm:grid-cols-5">
              <div className="sm:col-span-2 flex flex-col justify-center rounded-2xl bg-[#2d3436] p-5 text-white shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#79d8e3]">
                  Precio Unitario
                </span>
                <p className="mt-1 text-3xl font-extrabold tracking-tight">
                  ${priceInfo.base.toLocaleString("es-CL")}
                </p>
                <span className="text-[11px] text-[#eaf3f5]/70 mt-1">
                  Neto + IVA Inc.
                </span>
              </div>
              <div className="sm:col-span-3 rounded-2xl border border-[#dce8eb] bg-white p-4 shadow-sm flex flex-col justify-center">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3f5258] block mb-2">
                  Escala Corporativa
                </span>
                {priceInfo.wholesale ? (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    {priceInfo.tiers.slice(0, 4).map((tier) => (
                      <div
                        key={tier.from}
                        className="flex justify-between border-b border-[#eaf3f5] pb-1"
                      >
                        <span className="text-[#3f5258] font-medium">
                          Desde {tier.from} und.
                        </span>
                        <span className="font-bold text-[#15191a]">
                          ${tier.price.toLocaleString("es-CL")}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-[#3f5258] italic">
                    Cotización personalizada por volumen
                  </p>
                )}
              </div>
            </div>

            {/* SPECIFICATION CARD */}
            <div className="space-y-4 rounded-2xl border border-[#dce8eb] bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-lg bg-[#2d3436] text-white px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
                  Cod. {productCode}
                </span>
                <span className="rounded-lg bg-[#e4f7fa] text-[#087181] px-2.5 py-1 text-xs font-bold uppercase tracking-wider capitalize">
                  {product.category}
                </span>
                <span className="rounded-lg bg-[#eaf3f5] text-[#3f5258] px-2.5 py-1 text-xs font-semibold">
                  {availableSizes.length} Tallas
                </span>
              </div>
              <p className="text-sm font-normal leading-relaxed text-[#3f5258]">
                {productDescription}
              </p>

              {/* TECHNICAL PARAMETERS ACCORDION */}
              <div className="grid gap-3 pt-2 sm:grid-cols-3">
                {technicalStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-[#dce8eb] bg-[#f3f8fa] p-3"
                  >
                    <span className="text-[10px] font-bold text-[#3f5258] block uppercase tracking-wider">
                      {stat.label}
                    </span>
                    <span className="text-xs font-extrabold text-[#15191a] block mt-0.5 truncate">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* TECHNOLOGIES & SIZES SPECIFICATION */}
            <div className="grid gap-4">
              {hasTechnologies && (
                <div className="rounded-2xl border border-[#dce8eb] bg-white p-4 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#3f5258] block mb-2.5">
                    Prestaciones Tecnológicas
                  </span>
                  <div className="space-y-1.5">
                    {product.technologies.map((tech) => (
                      <div
                        key={tech}
                        className="flex items-center gap-2.5 rounded-xl border border-[#dce8eb] bg-[#f3f8fa] p-2 text-xs"
                      >
                        <span className="flex h-5 w-8 shrink-0 items-center justify-center rounded bg-white text-[9px] font-extrabold text-[#087181] border border-[#79d8e3]">
                          {getTechLabel(tech)}
                        </span>
                        <span className="font-bold text-[#3f5258] truncate">
                          {tech}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-[#dce8eb] bg-white p-4 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3f5258] block mb-2.5">
                  Curva de Tallas Distribuidas
                </span>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {availableSizes.map((size) => (
                    <div
                      key={size}
                      className="flex h-14 items-center justify-center rounded-xl border border-[#dce8eb] bg-white text-sm font-black text-[#15191a] shadow-sm shadow-slate-900/[0.03] transition hover:border-[#46b9c8]/45 hover:bg-[#f3f8fa]"
                    >
                      {size}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* QUALITY ASSURANCE CERTIFICATIONS */}
            {certificationLogos.length > 0 && (
              <div className="rounded-2xl border border-[#dce8eb] bg-white p-4 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3f5258] block mb-3">
                  Homologación & Certificación de Calidad
                </span>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {certificationLogos.slice(0, 6).map((logo) => (
                    <div
                      key={logo}
                      className="flex h-14 items-center justify-center rounded-xl border border-[#dce8eb] bg-white p-2 shadow-sm shadow-slate-900/[0.03] transition hover:border-[#46b9c8]/45 hover:bg-[#f3f8fa]"
                    >
                      <Image
                        src={logo}
                        alt="Certificación"
                        width={72}
                        height={36}
                        className="h-auto max-h-full w-auto object-contain opacity-95 transition-all duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </aside>
  );
}
