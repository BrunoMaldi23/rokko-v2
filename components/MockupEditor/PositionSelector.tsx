import type { MockupPositionId, ResolvedPositionConfig } from "@/types/mockup.types";

type PositionSelectorProps = {
  positions: ResolvedPositionConfig[];
  value: MockupPositionId;
  onChange: (position: MockupPositionId) => void;
};

export default function PositionSelector({
  positions,
  value,
  onChange,
}: PositionSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {positions.map((position) => (
        <button
          key={position.id}
          type="button"
          onClick={() => onChange(position.id)}
          className={`min-h-10 rounded-xl border px-2 text-xs font-black transition-all ${
            value === position.id
              ? "border-[#46b9c8] bg-[#e4f7fa] text-[#087181] shadow-sm shadow-[#46b9c8]/10"
              : "border-white/12 bg-white/8 text-white/72 hover:border-[#46b9c8]/55 hover:bg-white/14 hover:text-white"
          }`}
        >
          {position.label}
        </button>
      ))}
    </div>
  );
}
