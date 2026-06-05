import { Clock, ArrowRight, AlertTriangle, Mail } from "lucide-react";
import { useSearchParams } from "react-router-dom";

export default function PaymentWarning() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "";

  const config = {
    pending: {
      icon: <Clock className="w-6 h-6 text-yellow-400" />,
      title: "Pagamento em análise",
      message: "Processando pagamento. Confirmação em alguns minutos.",
    },
    boleto: {
      icon: <Mail className="w-6 h-6 text-yellow-400" />,
      title: "Boleto gerado",
      message: "Enviado por e-mail. Vence em 3 dias úteis.",
    },
    trial: {
      icon: <Clock className="w-6 h-6 text-yellow-400" />,
      title: "Período grátis ativo",
      message: "Seus 3 dias grátis já estão valendo.",
    },
    upgrade: {
      icon: <AlertTriangle className="w-6 h-6 text-yellow-400" />,
      title: "Upgrade em processamento",
      message: "Mudança de plano sendo concluída.",
    },
  };

  const c = config[type] || config.pending;

  return (
    <div className="min-h-screen bg-[#0a0a0f] font-sans antialiased flex items-center justify-center p-4">
      <style>{`* { font-family: 'Inter', system-ui, sans-serif; }`}</style>
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-yellow-500/15 bg-[#121418] p-8 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-yellow-500/20 flex items-center justify-center mx-auto mb-5">
            {c.icon}
          </div>

          <h1 className="text-xl font-bold text-white mb-1">{c.title}</h1>
          <p className="text-sm text-zinc-500 mb-7">{c.message}</p>

          <a
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full border border-green-500/30 hover:border-green-500/50 text-green-400 hover:text-green-300 rounded-xl px-5 py-3 text-sm font-semibold transition-all"
          >
            Ir para o painel <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
