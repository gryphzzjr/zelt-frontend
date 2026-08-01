import React from 'react';
import { TbCar, TbScissors, TbStethoscope, TbShoppingBag, TbBuildingSkyscraper, TbHelp, TbArrowRight, TbCheck, TbGavel, TbSchool, TbPlane } from 'react-icons/tb';

export default function SegmentStep({ data, updateData, onNext }) {
  const segments = [
    { id: 'car-dealers', title: 'Lojas de Carros & Automóveis', description: 'Automatize envio de fotos e propostas de financiamento.', icon: TbCar },
    { id: 'beauty', title: 'Salões de Estética e Beleza', description: 'Lembretes de agendamentos automáticos para reduzir faltas.', icon: TbScissors },
    { id: 'dentistry', title: 'Clínicas de Odontologia', description: 'Confirmação de consultas de rotina e suporte para pacientes.', icon: TbStethoscope },
    { id: 'retail', title: 'Varejistas & E-commerce', description: 'Recupere carrinhos abandonados e venda direto pelo chat.', icon: TbShoppingBag },
    { id: 'real-estate', title: 'Imobiliárias & Corretores', description: 'Qualifique leads frios e envie catálogos de imóveis.', icon: TbBuildingSkyscraper },
    { id: 'others', title: 'Outros Segmentos', description: 'Se o seu modelo não está listado, selecione esta opção.', icon: TbHelp }
  ];

  const suggestions = [
    { label: 'Advocacia', icon: TbGavel },
    { label: 'Educação', icon: TbSchool },
    { label: 'Turismo', icon: TbPlane },
  ];

  const isValid = data.segment && (data.segment !== 'others' || data.otherSpecification.trim());

  return (
    <div className="w-full max-w-5xl mx-auto py-6 flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-[#6300ff] uppercase tracking-wider">Etapa 1 de 3</span>
        <h2 className="text-4xl font-medium tracking-tight sm:text-5xl leading-tight">Com o que a sua <span className="text-gray-400">empresa trabalha?</span></h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {segments.map((seg) => {
          const Icon = seg.icon;
          const isSelected = data.segment === seg.id;
          return (
            <button
              key={seg.id}
              onClick={() => updateData({ segment: seg.id })}
              className={`relative rounded-xl border p-5 text-left transition-all flex items-start gap-4 outline-none ${isSelected ? 'border-[#6300ff] ring-4 ring-[#6300ff]/5' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border ${isSelected ? 'bg-[#6300ff]/10 text-[#6300ff] border-transparent' : 'bg-gray-50 text-gray-500'}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex flex-col gap-1 pr-8">
                <span className="text-base font-medium text-gray-900">{seg.title}</span>
                <p className="text-sm text-gray-500 leading-relaxed">{seg.description}</p>
              </div>
              {isSelected && (
                <div className="absolute top-5 right-5 h-6 w-6 rounded-full bg-[#6300ff] flex items-center justify-center">
                  <TbCheck className="h-3.5 w-3.5 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {data.segment === 'others' && (
        <div className="flex flex-col gap-3 max-w-xl border-t border-gray-100 pt-6 transition-all duration-300 ease-out opacity-100 max-h-48">
          <label className="text-sm font-medium text-gray-700" htmlFor="other-spec">Especifique o seu segmento</label>
          <input
            id="other-spec"
            type="text"
            placeholder="Ex: Escritório de Advocacia..."
            value={data.otherSpecification}
            onChange={(e) => updateData({ otherSpecification: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base outline-none focus:border-[#6300ff] focus:ring-4 focus:ring-[#6300ff]/5 transition-all"
          />
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs text-gray-400 font-medium mr-1">Sugestões:</span>
            {suggestions.map((sug, idx) => {
              const SugIcon = sug.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => updateData({ otherSpecification: sug.label })}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:border-[#6300ff] hover:text-[#6300ff] transition-all"
                >
                  <SugIcon className="h-3.5 w-3.5" />
                  {sug.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-100 pt-6">
        <span className="text-sm text-gray-400 font-medium">Configuração inicial de escopo.</span>
        <button
          disabled={!isValid}
          onClick={onNext}
          className={`rounded-lg px-6 py-3 text-sm font-medium flex items-center gap-2 transition-all ${isValid ? 'bg-[#111111] text-white hover:bg-black cursor-pointer' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
        >
          Avançar <TbArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
