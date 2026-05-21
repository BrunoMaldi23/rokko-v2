"use client";

import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Transformer } from "react-konva";
import useImage from "use-image";
import Konva from "konva";

type Props = {
  productImage: string;
};

function EditableImage({
  src,
  x,
  y,
  width,
  height,
  draggable = false,
  selected = false,
  onSelect,
  onChange,
}: any) {
  const [image] = useImage(src);
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (selected && transformerRef.current && imageRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selected]);

  return (
    <>
      <KonvaImage
        ref={imageRef}
        image={image}
        x={x}
        y={y}
        width={width}
        height={height}
        draggable={draggable}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) =>
          onChange?.({
            x: e.target.x(),
            y: e.target.y(),
            width,
            height,
          })
        }
        onTransformEnd={() => {
          const node = imageRef.current;
          if (!node) return;

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);

          onChange?.({
            x: node.x(),
            y: node.y(),
            width: Math.max(24, node.width() * scaleX),
            height: Math.max(24, node.height() * scaleY),
          });
        }}
      />

      {selected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled
          flipEnabled={false}
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
        />
      )}
    </>
  );
}

export default function MockupEditor({ productImage }: Props) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selected, setSelected] = useState(false);
  const [applicationType, setApplicationType] = useState("Bordado");

  const [logoConfig, setLogoConfig] = useState({
    x: 215,
    y: 225,
    width: 70,
    height: 70,
  });

  function handleUpload(file?: File) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
    setSelected(true);
  }

  return (
    <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-700">
            Mockup corporativo
          </p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">
            Personaliza la prenda
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Sube el logo, muévelo y ajusta su tamaño.
          </p>
        </div>

        <label className="cursor-pointer rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan-700">
          Cargar logo
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files?.[0])}
          />
        </label>
      </div>

      <div className="mb-5">
        <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
          Aplicación
        </label>
        <select
          value={applicationType}
          onChange={(e) => setApplicationType(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-cyan-400"
        >
          <option>Bordado</option>
          <option>Estampado</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50">
        <Stage width={500} height={600}>
          <Layer>
            <EditableImage
              src={productImage}
              x={45}
              y={35}
              width={410}
              height={530}
            />

            {logoPreview && (
              <EditableImage
                src={logoPreview}
                x={logoConfig.x}
                y={logoConfig.y}
                width={logoConfig.width}
                height={logoConfig.height}
                draggable
                selected={selected}
                onSelect={() => setSelected(true)}
                onChange={(attrs: any) => setLogoConfig(attrs)}
              />
            )}
          </Layer>
        </Stage>
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
        <strong className="text-slate-950">Vista previa:</strong>{" "}
        {applicationType}. Puedes mover y redimensionar el logo manualmente.
      </div>
    </div>
  );
}