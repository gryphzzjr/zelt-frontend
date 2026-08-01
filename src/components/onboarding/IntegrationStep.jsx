import React from 'react';
import { TbArrowLeft, TbCheck, TbBrandWhatsapp, TbMessage } from 'react-icons/tb';

export default function IntegrationStep({ data, updateData, onComplete, onPrev }) {
  const isValid = data.phone.trim() && data.botName.trim();

  return (
    <div className="w-full max-w-2xl mx-auto py-6 flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-[#6300ff] uppercase tracking-wider">Etapa 3 de 3</span>
        <h2 className="text-4xl font-medium tracking-tight sm:text-5xl leading-tight">Configuração do <span className="text-gray-400">Agente Virtual</span></h2>
        <p className="text-base text-gray-500">Defina o número e a identidade inicial da sua inteligência artificial.</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Nome do Bot */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 ml-1">Nome da Inteligência Artificial</label>
          <div className="relative">
            <TbMessage className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Ex: Clara, Assistente Virtual"
              value={data.botName}
              onChange={(e) => updateData({ botName: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-12 py-3 text-base outline-none focus:border-[#6300ff] focus:ring-4 focus:ring-[#6300ff]/5 transition-all"
            />
          </div>
        </div>

        {/* WhatsApp do Bot */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 ml-1">Número do WhatsApp Comercial</label>
          <div className="relative">
            <TbBrandWhatsapp className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              placeholder="Ex: (11) 99999-9999"
              value={data.phone}
              onChange={(e) => updateData({ phone: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-12 py-3 text-base outline-none focus:border-[#6300ff] focus:ring-4 focus:ring-[#6300ff]/5 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-6">
        <button onClick={onPrev} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#111] transition-colors py-2">
          <TbArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <button
          disabled={!isValid}
          onClick={onComplete}
          className={`rounded-lg px-6 py-3 text-sm font-medium flex items-center gap-2 transition-all ${isValid ? 'bg-[#6300ff] text-white hover:bg-[#5200d5] cursor-pointer' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
        >
          Concluir e Acessar Painel <TbCheck className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
