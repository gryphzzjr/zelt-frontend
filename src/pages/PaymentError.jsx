import { XCircle, ArrowLeft } from "lucide-react";
import { useSearchParams } from "react-router-dom";

export default function PaymentError() {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason") || "";

  const messages = {
    expired: "O tempo da sessão expirou.",
    declined: "Pagamento recusado pela operadora.",
    canceled: "Pagamento cancelado.",
    insufficient: "Saldo ou limite insuficiente.",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] font-sans antialiased flex items-center justify-center p-4">
      <style>{`* { font-family: 'Inter', system-ui, sans-serif; }`}</style>
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-red-500/15 bg-[#121418] p-8 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <XCircle className="w-6 h-6 text-red-400" />
          </div>

          <h1 className="text-xl font-bold text-white mb-1">Pagamento recusado</h1>
          <p className="text-sm text-zinc-500 mb-7">{messages[reason] || "Erro ao processar pagamento."}</p>

          <a
            href="/precos"
            className="flex items-center justify-center gap-2 w-full border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white rounded-xl px-5 py-3 text-sm font-semibold transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Tentar novamente
          </a>
        </div>

        <p className="text-center text-[11px] text-zinc-700 mt-4">Nenhum valor foi cobrado</p>
      </div>
    </div>
  );
}
