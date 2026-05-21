import Header from "@/components/Header";
import QuoteBuilder from "@/components/QuoteBuilder";

export default async function CotizarCategoria({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;

  return (
    <main className="min-h-screen bg-[#f6f8fb]">
      <Header />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-cyan-600">
            Cotizador ROKKO
          </p>

          <h1 className="mt-3 text-5xl font-black text-slate-950 capitalize">
            {categoria}
          </h1>
        </div>

        <QuoteBuilder />
      </div>
    </main>
  );
}