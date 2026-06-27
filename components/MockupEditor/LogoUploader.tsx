import type { ProcessedLogo } from "@/types/mockup.types";

type LogoUploaderProps = {
  processing: boolean;
  onLogo: (file: File | undefined) => Promise<ProcessedLogo | null>;
};

export default function LogoUploader({ processing, onLogo }: LogoUploaderProps) {
  async function handleFile(file: File | undefined) {
    await onLogo(file);
  }

  return (
    <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-white/18 bg-white px-3 text-xs font-black text-[#15191a] shadow-sm transition hover:bg-[#e4f7fa]">
      <input
        type="file"
        accept=".svg,.png,.jpg,.jpeg,image/svg+xml,image/png,image/jpeg"
        className="sr-only"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      {processing ? "Procesando..." : "Subir logo"}
    </label>
  );
}
