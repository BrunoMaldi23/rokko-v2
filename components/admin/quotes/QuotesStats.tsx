"use client";

type QuoteStat = {
  label: string;
  value: string;
  detail: string;
  wide?: boolean;
};

export default function QuotesStats({ stats }: { stats: QuoteStat[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 xl:min-w-[620px]">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-2xl border border-[#bfe8ee] bg-white px-3 py-3 text-center shadow-[0_8px_22px_rgba(8,115,129,0.04)] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319]/70 ${
            stat.wide ? "sm:col-span-1" : ""
          }`}
        >
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
            {stat.label}
          </p>

          <p className="mt-1 truncate text-[20px] font-black leading-none text-[#071827] [html[data-theme='dark']_&]:text-white">
            {stat.value}
          </p>

          <p className="mt-1 truncate text-[10px] font-bold text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
            {stat.detail}
          </p>
        </div>
      ))}
    </div>
  );
}