"use client";

import Image from "next/image";
import { useMemo } from "react";
import type { Product } from "@/types/product";
import { certificationLogos } from "@/data/catalog";
import Visualizador3D from "@/components/Visualizador3D";
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
  logoPreview: string | null;
  logoPosition?: string;
  logoSize: number;
  fabricCanvas: FabricCanvas | null;
  modelUrl?: string;
  modelScale?: number;
  modelPositionY?: number;
  modelRotationY?: number;
  onColorSelect: (
    productId: string,
    color: string,
    colorIndex: number,
    totalImages: number,
  ) => void;
  onGalleryNav: (productId: string, nextIndex: number, totalImages: number) => void;
  onLogoUpload: (file: File) => void;
  onPositionChange: (label: string) => void;
  onSizeChange: (size: number) => void;
  onRemoveLogo: () => void;
  onFabricCanvasReady: (canvas: FabricCanvas) => void;
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
  const normalized = tech.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
  type: "close" | "left" | "right" | "shield" | "box" | "palette" | "ruler" | "spark" | "reset";
  className?: string;
}) {
  const paths: Record<typeof type, string[]> = {
    close: ["M6 18 18 6M6 6l12 12"],
    left: ["m15 19-7-7 7-7"],
    right: ["m9 5 7 7-7 7"],
    shield: ["M12 3 20 7v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4Z", "m9 12 2 2 4-5"],
    box: ["M21 8 12 3 3 8l9 5 9-5Z", "M3 8v8l9 5 9-5V8", "M12 13v8"],
    palette: ["M12 3a9 9 0 0 0 0 18h1.5a1.5 1.5 0 0 0 0-3H12a1.5 1.5 0 0 1 0-3h2a7 7 0 0 0 7-7c0-2.8-3.7-5-9-5Z", "M7.5 10h.01M10 7h.01M14 7h.01M16.5 10h.01"],
    ruler: ["M4 17 17 4l3 3L7 20l-3-3Z", "m14 7 3 3M11 10l2 2M8 13l2 2"],
    spark: ["M13 3 4 14h7l-1 7 9-11h-7l1-7Z"],
    reset: ["M4 7v5h5", "M20 17a8 8 0 0 1-13.7 4.9L4 20", "M4 12a8 8 0 0 1 13.7-4.9L20 9"],
  };

  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      {paths[type].map((path) => (
        <path key={path} strokeLinecap="round" strokeLinejoin="round" d={path} />
      ))}
    </svg>
  );
}

export default function ProductDetailPanel({
  product,
  selectedColor,
  productImages,
  galleryIndex,
  logoPreview,
  logoPosition,
  logoSize,
  fabricCanvas,
  modelUrl,
  modelScale,
  modelPositionY,
  modelRotationY,
  onColorSelect,
  onGalleryNav,
  onLogoUpload,
  onPositionChange,
  onSizeChange,
  onRemoveLogo,
  onFabricCanvasReady,
  onClose,
}: ProductDetailPanelProps) {
  const productImagesLength = productImages.length;
  const currentImage = productImages[galleryIndex] || "";
  const productCode = product.id.slice(0, 8).toUpperCase();
  const productDescription =
    product.description ||
    product.extract ||
    "Prenda corporativa pensada para vestir equipos con presencia, comodidad y una terminacion consistente.";
  const imageEntries = useMemo(() => {
    const colorImages =
      product.color_images && typeof product.color_images === "object"
        ? product.color_images
        : {};

    return productImages.map((url, index) => {
      const assignedColor = Object.entries(colorImages).find(([, urls]) =>
        Array.isArray(urls) && urls.includes(url),
      )?.[0];
      const normalizedColor =
        assignedColor &&
        (product.colors.find(
          (color) => normalizeColorName(color) === normalizeColorName(assignedColor),
        ) ||
          assignedColor);

      return {
        url,
        color:
          normalizedColor ||
          (product.colors.length === productImagesLength ? product.colors[index] : "") ||
          "",
      };
    });
  }, [product.color_images, product.colors, productImages, productImagesLength]);

  const inferredGalleryColor = imageEntries[galleryIndex]?.color || selectedColor;
  const modelColor = inferredGalleryColor;
  const availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes : DEFAULT_SIZES;

  const priceInfo = useMemo(() => {
    if (product.wholesale_from && product.wholesale_price) {
      return {
        base: product.price,
        wholesale: product.wholesale_price,
        from: product.wholesale_from,
      };
    }
    return {
      base: product.price,
      wholesale: null,
      from: null,
    };
  }, [product]);

  const technicalStats = [
    { label: "Composicion", value: product.composition || "Mezcla de alta resistencia" },
    { label: "Gramaje", value: product.weight || "Por confirmar" },
    { label: "Categoria", value: product.category },
    { label: "Color activo", value: selectedColor || "Sin color" },
  ];

  function navigateGallery(nextIndex: number) {
    if (!productImagesLength) return;
    const normalizedIndex = (nextIndex + productImagesLength) % productImagesLength;
    onGalleryNav(product.id, normalizedIndex, productImagesLength);
    const nextColor = imageEntries[normalizedIndex]?.color;
    if (nextColor && normalizeColorName(nextColor) !== normalizeColorName(selectedColor)) {
      const colorIndex = product.colors.findIndex(
        (color) => normalizeColorName(color) === normalizeColorName(nextColor),
      );
      onColorSelect(product.id, nextColor, Math.max(colorIndex, 0), productImagesLength);
    }
  }

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
    <aside className="fixed inset-0 z-[100] overflow-hidden bg-neutral-950/80 backdrop-blur-sm">
      <div className="h-full overflow-y-auto bg-[#f6f1ea] text-[#181512]">
        <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f6f1ea]/92 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8b5e3c]">Ficha tecnica ROKKO</p>
              <h2 className="truncate text-lg font-black sm:text-2xl">{product.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-xs font-black uppercase tracking-[0.14em] text-[#181512] shadow-sm transition hover:border-[#bd7b2f]/40 hover:text-[#9a5a16]"
              aria-label="Cerrar ficha tecnica"
            >
              <span className="hidden sm:inline">Cerrar</span>
              <Icon type="close" className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="mx-auto grid max-w-7xl items-start gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:px-8">
          <section className="space-y-5">
            <div className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm lg:h-[520px]">
              <div className="relative h-[420px] bg-white sm:h-[500px] lg:h-full">
                {currentImage ? (
                  <Image
                    src={currentImage}
                    alt={product.name}
                    fill
                    className="object-contain object-center"
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-8 text-center text-sm font-semibold text-white/70">
                    Sin imagen disponible
                  </div>
                )}
                <div className="absolute inset-x-3 bottom-3 rounded-lg border border-white/20 bg-black/62 p-3 text-white backdrop-blur-md">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/55">Color seleccionado</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className="h-4 w-4 rounded-full border border-white/50"
                          style={{ backgroundColor: getColorHex(selectedColor) }}
                        />
                        <p className="truncate text-sm font-black">{selectedColor}</p>
                      </div>
                    </div>
                    {productImagesLength > 1 && (
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => navigateGallery(galleryIndex - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 transition hover:bg-white/20"
                          aria-label="Imagen anterior"
                        >
                          <Icon type="left" className="h-4 w-4" />
                        </button>
                        <span className="min-w-11 text-center text-xs font-black">
                          {galleryIndex + 1}/{productImagesLength}
                        </span>
                        <button
                          onClick={() => navigateGallery(galleryIndex + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 transition hover:bg-white/20"
                          aria-label="Imagen siguiente"
                        >
                          <Icon type="right" className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-[#181512] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                  Cod. {productCode}
                </span>
                <span className="rounded-md border border-[#bd7b2f]/25 bg-[#fff7ec] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#8b5e3c]">
                  {product.category}
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-black leading-none tracking-normal sm:text-4xl">{product.name}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#655b50]">{productDescription}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="min-h-24 rounded-lg border border-black/10 bg-[#181512] p-4 text-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">Precio base</p>
                  <p className="mt-1 text-3xl font-black">${priceInfo.base.toLocaleString("es-CL")}</p>
                </div>
                <div className="min-h-24 rounded-lg border border-black/10 bg-[#f6f1ea] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8b5e3c]">Mayorista</p>
                  {priceInfo.wholesale ? (
                    <p className="mt-1 text-2xl font-black">
                      ${priceInfo.wholesale.toLocaleString("es-CL")}
                      <span className="ml-2 text-xs font-bold text-[#655b50]">desde {priceInfo.from} und.</span>
                    </p>
                  ) : (
                    <p className="mt-2 text-sm font-bold text-[#655b50]">Disponible por cotizacion</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {technicalStats.map((stat) => (
                <div key={stat.label} className="min-h-20 rounded-lg border border-black/10 bg-white p-4 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8b5e3c]">{stat.label}</p>
                  <p className="mt-2 text-sm font-black text-[#181512]">{stat.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <div className="rounded-lg border border-black/10 bg-white p-3 text-[#181512] shadow-sm lg:min-h-[520px]">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3 px-2 pt-1">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8b5e3c]">Laboratorio visual</p>
                  <h3 className="text-xl font-black">Simulador 3D aplicado</h3>
                </div>
                <button
                  onClick={onRemoveLogo}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-black/10 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#655b50] transition hover:border-[#bd7b2f]/40 hover:text-[#9a5a16]"
                >
                  <Icon type="reset" className="h-4 w-4" />
                  Reset
                </button>
              </div>
              {product.colors && product.colors.length > 0 && (
                <div className="mb-3 rounded-lg border border-black/10 bg-[#f6f1ea] p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8b5e3c]">Color 3D</p>
                    <p className="truncate text-xs font-black text-[#181512]">{modelColor}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color, index) => {
                      const selected = normalizeColorName(color) === normalizeColorName(modelColor);
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => selectColor(color, index)}
                          title={color}
                          className={`flex h-9 min-w-9 items-center gap-2 rounded-lg border bg-white px-2.5 text-xs font-black transition ${
                            selected
                              ? "border-[#bd7b2f] text-[#181512] shadow-sm ring-2 ring-[#bd7b2f]/20"
                              : "border-black/10 text-[#655b50] hover:border-[#bd7b2f]/40"
                          }`}
                        >
                          <span
                            className="h-4 w-4 rounded-full border border-black/15"
                            style={{ backgroundColor: getColorHex(color) }}
                          />
                          <span className="hidden sm:inline">{color}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="overflow-hidden rounded-lg border border-black/10 bg-[#f7f2ea]">
                <Visualizador3D
                  productImageUrl={currentImage}
                  imageAlreadyColorMatched={false}
                  productName={product.name}
                  productShortName={product.short_name}
                  productCategory={product.category || product.slug}
                  garmentColor={getColorHex(modelColor)}
                  logoSrc={logoPreview}
                  onLogoUpload={onLogoUpload}
                  activePosition={logoPosition || "Pecho centro"}
                  onPositionChange={onPositionChange}
                  logoSize={logoSize}
                  onSizeChange={onSizeChange}
                  onRemoveLogo={onRemoveLogo}
                  fabricCanvas={fabricCanvas}
                  onFabricCanvasReady={onFabricCanvasReady}
                  modelUrl={modelUrl}
                  modelScale={modelScale}
                  modelPositionY={modelPositionY}
                  modelRotationY={modelRotationY}
                  displayMode="3d-only"
                />
              </div>
            </div>

            {product.technologies && product.technologies.length > 0 && (
              <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#181512] text-[#d7b27d]">
                    <Icon type="spark" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8b5e3c]">Tecnologias</p>
                    <h3 className="text-lg font-black">Prestaciones de la prenda</h3>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {product.technologies.map((tech) => (
                    <div key={tech} className="flex items-center gap-3 rounded-lg border border-black/10 bg-[#f6f1ea] p-3">
                      <span className="flex h-10 w-12 shrink-0 items-center justify-center rounded-md bg-white text-xs font-black text-[#8b5e3c] shadow-sm">
                        {getTechLabel(tech)}
                      </span>
                      <p className="text-sm font-black text-[#181512]">{tech}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {((product.colors && product.colors.length > 0) || availableSizes.length > 0) && (
              <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fff7ec] text-[#9a5a16]">
                    <Icon type="palette" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8b5e3c]">Variantes</p>
                    <h3 className="text-lg font-black">Colorama y tallas disponibles</h3>
                  </div>
                </div>
                <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                  {product.colors && product.colors.length > 0 && (
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8b5e3c]">
                          {product.colors.length} colores
                        </p>
                        <p className="truncate text-xs font-black text-[#655b50]">{selectedColor}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {product.colors.map((color) => (
                          <div
                            key={color}
                            className={`flex min-h-11 items-center gap-2 rounded-lg border px-2.5 py-2 ${
                              normalizeColorName(color) === normalizeColorName(selectedColor)
                                ? "border-[#bd7b2f] bg-[#fff7ec]"
                                : "border-black/10 bg-[#f6f1ea]"
                            }`}
                          >
                            <span
                              className="h-5 w-5 shrink-0 rounded-full border border-black/15 shadow-sm"
                              style={{ backgroundColor: getColorHex(color) }}
                            />
                            <span className="min-w-0 truncate text-xs font-black uppercase tracking-normal text-[#181512]">{color}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {availableSizes.length > 0 && (
                    <div>
                      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#18724f]">
                        Tallas del producto
                      </p>
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 xl:grid-cols-3">
                        {availableSizes.map((size) => (
                          <div
                            key={size}
                            className="flex h-11 items-center justify-center rounded-lg border border-black/10 bg-[#edf7f2] text-sm font-black text-[#181512]"
                          >
                            {size}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {certificationLogos.length > 0 && (
              <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eef3fb] text-[#24588d]">
                    <Icon type="shield" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#24588d]">Respaldo</p>
                    <h3 className="text-lg font-black">Certificaciones y control</h3>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {certificationLogos.slice(0, 6).map((logo) => (
                    <div key={logo} className="flex h-16 items-center justify-center rounded-lg border border-black/10 bg-[#f6f1ea] p-2">
                      <Image src={logo} alt="Certificacion" width={86} height={46} className="h-auto max-h-full w-auto object-contain" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </aside>
  );
}
