import { CheckCircle2, ArrowRight } from "lucide-react";
import { useSearchParams } from "react-router-dom";

function parseExternalReference(ref) {
  if (!ref) return null;
  const match = ref.match(/plan=([^:]+)/);
  return match ? match[1] : null;
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const extRef = searchParams.get("external_reference");
  const plan = parseExternalReference(extRef) || "Starter";
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);

  return (
    <div className="min-h-screen bg-[#0a0a0f] font-sans antialiased flex items-center justify-center p-4">
      <style>{`* { font-family: 'Inter', system-ui, sans-serif; }`}</style>
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-green-500/20 bg-[#121418] p-8 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-green-500/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          </div>

          <h1 className="text-xl font-bold text-white mb-1">Pagamento aprovado</h1>
          <p className="text-sm text-zinc-500 mb-7">
            Plano <span className="text-zinc-300">Zelt {planLabel}</span> ativo
          </p>

          <a
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full border border-green-500/30 hover:border-green-500/50 text-green-400 hover:text-green-300 rounded-xl px-5 py-3 text-sm font-semibold transition-all"
          >
            Ir para o painel <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <p className="text-center text-[11px] text-zinc-700 mt-4">Nota fiscal enviada por e-mail</p>
      </div>
    </div>
  );
}
