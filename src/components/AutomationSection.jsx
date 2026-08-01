import React, { useEffect, useRef, useState } from 'react';
import { FcBriefcase, FcCalendar, FcDatabase, FcGlobe, FcGoogle, FcHeadset, FcLock, FcMoneyTransfer, FcPieChart, FcRefresh, FcShop, FcSms, FcSynchronize } from 'react-icons/fc';
import { TbBolt, TbBrain, TbBrandWhatsapp, TbChartBar, TbCheck, TbClock, TbCodeOff, TbDatabase, TbFile, TbGlobe, TbLayersIntersect, TbLock, TbMessage2, TbMessageCircle, TbRobot, TbSearch, TbSparkles, TbTrendingUp, TbUsers } from 'react-icons/tb';

function useInView(threshold = 0.2) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function FadeUp({ delay = 0, show, children, className = '' }) {
  return (
    <div
      className={`anim-fade-up ${show ? 'show' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function CountUp({ target, suffix = '', prefix = '', duration = 2000, inView }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  }, [inView, target, duration]);
  return <span>{prefix}{val}{suffix}</span>;
}

function ChatMock() {
  const [ref, inView] = useInView(0.15);
  const [step, setStep] = useState(-1);

  const messages = [
    { from: 'client', text: 'Oi, tenho uma duvida sobre meu pedido #4821', time: '09:41', name: 'Maria Silva' },
    { from: 'ai', text: 'Oi Maria! Claro, vou verificar agora. Um momento...', time: '09:41', name: 'Zelt.AI', isAi: true },
    { from: 'ai', text: 'Encontrei! Seu pedido foi despachado ontem as 14h30 via Expresso. Previsao de entrega: amanha ate as 18h. Quer o codigo de rastreio?', time: '09:41', name: 'Zelt.AI', isAi: true },
    { from: 'client', text: 'Sim please! E esse plano anual de voces, tem desconto?', time: '09:42', name: 'Maria Silva' },
    { from: 'ai', text: 'Claro! O plano anual sai por R$ 89/mes no pix (economia de 40%). Inclui WhatsApp ilimitado, base de conhecimento e relatorios. Quer que eu te envie o link de pagamento?', time: '09:42', name: 'Zelt.AI', isAi: true },
    { from: 'client', text: 'Manda! Valeu demais', time: '09:43', name: 'Maria Silva' },
    { from: 'ai', text: 'Link enviado no seu email! Qualquer coisa, estou aqui. Bom dia!', time: '09:43', name: 'Zelt.AI', isAi: true },
  ];

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      setStep(i);
      i++;
      if (i <= messages.length) {
        setTimeout(tick, i === 1 ? 800 : 1100);
      }
    };
    const t = setTimeout(tick, 500);
    return () => { cancelled = true; clearTimeout(t); };
  }, [inView, messages.length]);

  return (
    <div ref={ref} className="lg:col-span-7 xl:col-span-7 rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-white">
        <div className="w-9 h-9 rounded-full bg-[#6300ff] flex items-center justify-center text-white text-[10px] font-bold tracking-wide">ZA</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">Zelt.AI Assistant</p>
          <p className="text-[10px] text-green-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" /> Online agora
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5">
            <div className="w-5 h-5 rounded-full bg-blue-100 border border-white flex items-center justify-center text-[7px] text-blue-600 font-bold">MS</div>
            <div className="w-5 h-5 rounded-full bg-green-100 border border-white flex items-center justify-center text-[7px] text-green-600 font-bold">JP</div>
            <div className="w-5 h-5 rounded-full bg-orange-100 border border-white flex items-center justify-center text-[7px] text-orange-600 font-bold">AL</div>
          </div>
          <span className="text-[9px] text-gray-400">3 atendimentos</span>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3 bg-[#f7f7f5] min-h-[400px] max-h-[400px] overflow-y-auto">
        {messages.map((m, i) => {
          const isAi = m.isAi;
          return (
            <FadeUp key={i} delay={i * 50} show={inView && i <= step} className={`flex ${isAi ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${isAi ? 'order-2' : ''}`}>
                <p className={`text-[9px] font-medium mb-0.5 ${isAi ? 'text-right text-[#6300ff]' : 'text-gray-500'}`}>{m.name}</p>
                <div className={`${!isAi ? 'bg-white rounded-2xl rounded-tl-md border border-gray-100' : 'bg-[#6300ff] rounded-2xl rounded-tr-md'} px-3.5 py-2.5 shadow-sm`}>
                  <p className={`text-[12px] leading-relaxed ${!isAi ? 'text-gray-800' : 'text-white'}`}>{m.text}</p>
                </div>
                <div className={`flex items-center gap-1 mt-0.5 ${!isAi ? 'ml-1' : 'justify-end mr-1'}`}>
                  <p className="text-[9px] text-gray-400">{m.time}</p>
                  {!isAi && <svg className="w-3 h-3 text-blue-400" viewBox="0 0 16 16"><path d="M1.5 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
              </div>
            </FadeUp>
          );
        })}

        <FadeUp delay={0} show={inView && step >= messages.length} className="flex justify-start">
          <div className="bg-white rounded-2xl rounded-tl-md px-3.5 py-2.5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}/>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}/>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}/>
            </div>
          </div>
        </FadeUp>
      </div>

      <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 bg-white">
        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
          <TbBolt className="w-3.5 h-3.5 text-gray-500" />
        </div>
        <div className="flex-1 bg-gray-50 rounded-full px-3 py-2 text-[12px] text-gray-400 border border-gray-100">Digite uma mensagem...</div>
        <div className="w-8 h-8 rounded-full bg-[#6300ff] flex items-center justify-center shrink-0 hover:bg-[#5200d6] transition-colors cursor-pointer">
          <svg className="w-3.5 h-3.5 text-white ml-0.5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.5 2.5l15 7.5-15 7.5 2-7.5z"/></svg>
        </div>
      </div>
    </div>
  );
}

const docs = [
  { name: 'Manual_do_Produto_v3.pdf', size: '2.4 MB', pages: 48, type: 'pdf' },
  { name: 'Tabela_de_Precos_2024.pdf', size: '840 KB', pages: 12, type: 'pdf' },
  { name: 'FAQ_Clientes.xlsx', size: '1.1 MB', pages: 3, type: 'xlsx' },
  { name: 'Politica_de_Trocas.pdf', size: '520 KB', pages: 8, type: 'pdf' },
];

function KnowledgeMock() {
  const [ref, inView] = useInView(0.15);
  const [phase, setPhase] = useState('idle');
  const [docsDone, setDocsDone] = useState([]);

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    const seq = async () => {
      setPhase('dragging');
      await new Promise(r => setTimeout(r, 900));
      if (cancelled) return;
      setPhase('dropped');
      await new Promise(r => setTimeout(r, 400));
      if (cancelled) return;
      setPhase('done');
      for (let i = 0; i < docs.length; i++) {
        if (cancelled) return;
        await new Promise(r => setTimeout(r, 1000));
        if (cancelled) return;
        setDocsDone(prev => [...prev, i]);
        await new Promise(r => setTimeout(r, 250));
      }
    };
    seq();
    return () => { cancelled = true; };
  }, [inView]);

  return (
    <div ref={ref} className="lg:col-span-5 xl:col-span-5 lg:order-first order-last rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-white">
        <div className="w-8 h-8 rounded-lg bg-[#6300ff]/10 flex items-center justify-center">
          <TbDatabase className="w-4 h-4 text-[#6300ff]" />
        </div>
        <p className="text-sm font-medium text-gray-900">Base de Conhecimento</p>
        <div className="ml-auto flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
          <TbCheck className="w-3 h-3" /> {docsDone.length}/{docs.length} processados
        </div>
      </div>

      <div className="px-4 py-4 bg-[#f7f7f5] min-h-[420px] flex flex-col gap-3">
        <FadeUp delay={0} show={inView}>
          <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
            <TbSearch className="w-4 h-4 text-gray-400 shrink-0" />
            <p className="text-[12px] text-gray-400">Pesquisar em 4 documentos...</p>
          </div>
        </FadeUp>

        <FadeUp delay={150} show={inView}>
          <div className={`relative bg-white rounded-xl border-2 border-dashed p-8 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${phase === 'dragging' ? 'border-[#6300ff] bg-[#6300ff]/5' : 'border-gray-200 opacity-60'}`}>
            <TbFile className="w-10 h-10 text-gray-300" />
            <div className="text-center">
              <p className={`text-[12px] font-medium transition-colors duration-300 ${phase === 'dragging' ? 'text-[#6300ff]' : 'text-gray-400'}`}>{phase === 'dragging' ? 'Solte para processar...' : 'Arraste arquivos aqui'}</p>
              <p className="text-[10px] text-gray-300 mt-1">PDF, XLSX, DOCX, TXT, CSV</p>
            </div>

            {phase === 'dragging' && (
              <div className="anim-drag-file show absolute right-6 top-3">
                <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 shadow-lg px-3 py-2">
                  <TbFile className="w-4 h-4 text-[#6300ff]" />
                  <span className="text-[10px] font-medium text-gray-700">Catalogo_de_Produtos.pdf</span>
                </div>
              </div>
            )}
            {phase === 'dropped' && (
              <div className="anim-drag-file drop absolute right-6 top-3">
                <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 shadow-lg px-3 py-2">
                  <TbFile className="w-4 h-4 text-[#6300ff]" />
                  <span className="text-[10px] font-medium text-gray-700">Catalogo_de_Produtos.pdf</span>
                </div>
              </div>
            )}
          </div>
        </FadeUp>

        <div className="space-y-2">
          {docs.map((doc, i) => {
            const isDone = docsDone.includes(i);
            const typeColors = { pdf: 'text-red-500 bg-red-50', xlsx: 'text-green-600 bg-green-50' };
            return (
              <FadeUp key={i} delay={300 + i * 150} show={inView}>
                <div className={`bg-white rounded-xl border p-3 flex items-center gap-3 transition-all duration-500 ${isDone ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300 ${isDone ? 'bg-green-100 text-green-600' : typeColors[doc.type] || 'bg-gray-100 text-gray-500'}`}>
                    {isDone ? <TbCheck className="w-4 h-4" /> : <TbFile className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] font-medium text-gray-900 truncate">{doc.name}</p>
                      {isDone && <span className="text-[8px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium shrink-0">IA treinada</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#6300ff] rounded-full transition-all duration-1200 ease-out" style={{ width: isDone ? '100%' : '0%', transitionDuration: isDone ? '1200ms' : '0ms' }} />
                      </div>
                      <p className="text-[9px] text-gray-400 shrink-0">{isDone ? `${doc.pages} paginas` : doc.size}</p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const orbitApps = [
  { icon: FcGoogle, label: 'Google', angle: 0 },
  { icon: FcSms, label: 'SMS', angle: 36 },
  { icon: FcCalendar, label: 'Agenda', angle: 72 },
  { icon: FcShop, label: 'E-commerce', angle: 108 },
  { icon: FcMoneyTransfer, label: 'Pagamentos', angle: 144 },
  { icon: FcDatabase, label: 'CRM', angle: 180 },
  { icon: FcGlobe, label: 'Webhooks', angle: 216 },
  { icon: FcLock, label: 'Seguranca', angle: 252 },
  { icon: FcPieChart, label: 'Analytics', angle: 288 },
  { icon: FcHeadset, label: 'Suporte', angle: 324 },
];

const orbitAppsInner = [
  { icon: FcBriefcase, label: 'ERP', angle: 18 },
  { icon: FcSynchronize, label: 'Sync', angle: 90 },
  { icon: TbBrandWhatsapp, label: 'WhatsApp', angle: 162, isReactIcon: true },
  { icon: FcSms, label: 'Email', angle: 234 },
  { icon: FcRefresh, label: 'Chatbot', angle: 306 },
];

function IntegrationOrbit() {
  const [ref, inView] = useInView(0.15);

  return (
    <div ref={ref} className="lg:col-span-7 xl:col-span-7 flex items-center justify-center w-full min-h-[560px] relative">
      {/* Outer ring */}
      <div className="absolute w-[480px] h-[480px] rounded-full border border-gray-200/60" />
      {/* Inner ring */}
      <div className="absolute w-[300px] h-[300px] rounded-full border border-gray-200/40" />

      {/* Outer orbit */}
      <div
        className="absolute w-[480px] h-[480px]"
        style={{ animation: inView ? 'orbit-spin 25s linear infinite' : 'none' }}
      >
        {orbitApps.map(({ icon: Icon, label, angle }, i) => {
          const rad = (angle * Math.PI) / 180;
          const r = 240;
          const x = Math.cos(rad) * r;
          const y = Math.sin(rad) * r;
          return (
            <div
              key={i}
              className="absolute flex flex-col items-center gap-1.5"
              style={{
                left: `calc(50% + ${x}px - 24px)`,
                top: `calc(50% + ${y}px - 24px)`,
                animation: inView ? 'orbit-spin 25s linear infinite reverse' : 'none',
              }}
            >
              <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:scale-110 hover:shadow-md transition-all duration-200 cursor-pointer">
                <Icon className="w-7 h-7" />
              </div>
              <span className="text-[9px] text-gray-400 font-medium whitespace-nowrap">{label}</span>
            </div>
          );
        })}
      </div>

      {/* Inner orbit */}
      <div
        className="absolute w-[300px] h-[300px]"
        style={{ animation: inView ? 'orbit-spin 18s linear infinite reverse' : 'none' }}
      >
        {orbitAppsInner.map(({ icon: Icon, label, angle, isReactIcon }, i) => {
          const rad = (angle * Math.PI) / 180;
          const r = 150;
          const x = Math.cos(rad) * r;
          const y = Math.sin(rad) * r;
          return (
            <div
              key={i}
              className="absolute flex flex-col items-center gap-1.5"
              style={{
                left: `calc(50% + ${x}px - 22px)`,
                top: `calc(50% + ${y}px - 22px)`,
                animation: inView ? 'orbit-spin 18s linear infinite' : 'none',
              }}
            >
              <div className="w-11 h-11 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:scale-110 hover:shadow-md transition-all duration-200 cursor-pointer">
                {isReactIcon ? <Icon className="w-6 h-6 text-green-500" /> : <Icon className="w-6 h-6" />}
              </div>
              <span className="text-[8px] text-gray-400 font-medium whitespace-nowrap">{label}</span>
            </div>
          );
        })}
      </div>

      {/* Center Zelt.AI */}
      <div className="absolute z-10 w-32 h-32 rounded-2xl bg-white flex items-center justify-center shadow-xl shadow-[#6300ff]/10 border border-gray-100">
        <img src="/icon.png" className="w-20 h-20 object-contain" alt="Zelt.AI" />
      </div>

      {/* Pulse rings */}
      <div className="absolute w-[480px] h-[480px] rounded-full border border-[#6300ff]/10 animate-ping" style={{ animationDuration: '3s' }} />
    </div>
  );
}

function DashboardMock() {
  const [ref, inView] = useInView(0.15);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const t = setInterval(() => {
      setActiveTab(i % 4);
      i++;
    }, 2500);
    return () => clearInterval(t);
  }, [inView]);

  const tabs = ['Hoje', '7 dias', '30 dias', '12 meses'];

  return (
    <div ref={ref} className="lg:col-span-6 xl:col-span-6 rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-white">
        <TbTrendingUp className="w-4 h-4 text-[#6300ff]" />
        <p className="text-sm font-medium text-gray-900">Dashboard em Tempo Real</p>
        <div className="ml-auto flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] text-gray-400">Ao vivo</span>
        </div>
      </div>

      <div className="px-4 py-4 bg-[#f7f7f5] min-h-[420px] flex flex-col gap-3">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-lg p-1 border border-gray-100">
          {tabs.map((t, i) => (
            <button key={i} className={`flex-1 text-[10px] py-1.5 rounded-md transition-all duration-200 font-medium ${activeTab === i ? 'bg-[#6300ff] text-white' : 'text-gray-500 hover:text-gray-700'}`}>{t}</button>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <FadeUp delay={0} show={inView}>
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <p className="text-[9px] text-gray-400 font-medium">Mensagens</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">
                {inView && <CountUp target={2847} inView={inView} />}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[9px] text-green-600 font-medium">+23%</span>
                <svg className="w-2.5 h-2.5 text-green-500" viewBox="0 0 12 12"><path d="M6 2v8M2 6l4-4 4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </FadeUp>
          <FadeUp delay={100} show={inView}>
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <p className="text-[9px] text-gray-400 font-medium">Atendimentos IA</p>
              <p className="text-xl font-semibold text-[#6300ff] mt-1">
                {inView && <CountUp target={1923} inView={inView} />}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[9px] text-green-600 font-medium">67% resolvidos</span>
              </div>
            </div>
          </FadeUp>
          <FadeUp delay={200} show={inView}>
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <p className="text-[9px] text-gray-400 font-medium">Leads Capturados</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">
                {inView && <CountUp target={412} inView={inView} />}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[9px] text-green-600 font-medium">+18% vs mes anterior</span>
              </div>
            </div>
          </FadeUp>
        </div>

        {/* Chart mock */}
        <FadeUp delay={300} show={inView}>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-medium text-gray-700">Volume de atendimentos</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#6300ff]" /><span className="text-[8px] text-gray-400">IA</span></div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300" /><span className="text-[8px] text-gray-400">Humano</span></div>
              </div>
            </div>
            <svg viewBox="0 0 400 100" className="w-full h-20">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6300ff" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#6300ff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,80 Q50,70 100,50 T200,35 T300,20 T400,10" fill="none" stroke="#6300ff" strokeWidth="2" />
              <path d="M0,80 Q50,70 100,50 T200,35 T300,20 T400,10 L400,100 L0,100 Z" fill="url(#chartGrad)" />
              <path d="M0,90 Q50,85 100,80 T200,70 T300,60 T400,55" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="4,3" />
            </svg>
            <div className="flex justify-between mt-1">
              <span className="text-[8px] text-gray-300">00:00</span>
              <span className="text-[8px] text-gray-300">06:00</span>
              <span className="text-[8px] text-gray-300">12:00</span>
              <span className="text-[8px] text-gray-300">18:00</span>
              <span className="text-[8px] text-gray-300">Agora</span>
            </div>
          </div>
        </FadeUp>

        {/* Bottom stats */}
        <div className="grid grid-cols-2 gap-2">
          <FadeUp delay={400} show={inView}>
            <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                <TbClock className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-[9px] text-gray-400">Tempo medio</p>
                <p className="text-sm font-semibold text-gray-900">0.8s</p>
              </div>
            </div>
          </FadeUp>
          <FadeUp delay={500} show={inView}>
            <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#6300ff]/10 flex items-center justify-center shrink-0">
                <TbUsers className="w-4 h-4 text-[#6300ff]" />
              </div>
              <div>
                <p className="text-[9px] text-gray-400">Conversas ativas</p>
                <p className="text-sm font-semibold text-gray-900">38</p>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </div>
  );
}

export default function AutomationSection() {
  return (
    <section className="w-full bg-white px-4 py-28 sm:px-6 lg:px-8 border-t border-gray-200 font-sans antialiased relative overflow-hidden flex flex-col gap-32">

      {/* NUMBERS BANNER */}
      <FadeUp delay={0} show={true}>
        <div className="mx-auto max-w-5xl relative z-10 w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { val: 94, suffix: '%', label: 'Taxa de resolucao', desc: 'Sem intervenção humana.' },
              { val: 850, suffix: 'ms', label: 'Tempo medio resposta', desc: 'Resposta instantânea.' },
              { val: 12, suffix: 'K+', label: 'Empresas atendidas', desc: 'Em 40+ paises' },
              { val: 99, suffix: '.9%', label: 'Uptime garantido', desc: 'infraestrutura cloud' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl sm:text-5xl font-normal text-[#111111] tracking-tight">
                  <CountUp target={s.val} suffix={s.suffix} inView={true} />
                </p>
                <p className="text-sm font-medium text-gray-900 mt-2">{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeUp>

      {/* SECAO 1: Zero Codigo */}
      <div className="mx-auto max-w-7xl relative z-10 w-full">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-24">
          <div className="lg:col-span-6 xl:col-span-7 flex items-center justify-center rounded-xl bg-white w-full overflow-hidden relative z-10">
            <img src="/illustrations/snippets.gif" alt="Automacao visual" className="w-full h-auto max-w-full object-contain bg-white scale-105 transition-transform duration-300" />
          </div>

          <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-6 justify-center relative z-10">
            <div className="inline-flex max-w-max items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm font-medium text-gray-600">
              <TbCodeOff className="h-5 w-5 text-[#6300ff]" />
              Zero Codigo. Automacao Pura.
            </div>
            <h2 className="text-4xl font-normal tracking-tight text-[#111111] sm:text-5xl lg:text-[56px] leading-[1.1] max-w-2xl">
              Esqueça as horas <br />
              <span className="text-gray-400">escrevendo codigo</span>
            </h2>
            <p className="text-lg text-gray-600 font-normal leading-relaxed max-w-2xl">
              Configurar Webhooks, debugar APIs do WhatsApp e manter servidores ativos e coisa do passado. Com o Zelt.AI, voce treina sua IA generativa com documentos e cria fluxos de atendimento inteligentes visualmente em minutos.
            </p>

            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3 w-full">
              <div className="group relative rounded-lg border border-gray-200 bg-white p-5 flex flex-col gap-3 overflow-hidden transition-colors duration-300">
                <div className="absolute inset-0 z-0 bg-[#6300ff] translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                <div className="relative z-10 flex flex-col gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-100 bg-gray-50 text-[#6300ff] transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20 group-hover:text-white">
                    <TbClock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-[#111111] tracking-tight transition-colors duration-300 group-hover:text-white">18h+</div>
                    <div className="text-xs font-medium text-gray-900 mt-0.5 transition-colors duration-300 group-hover:text-white/90">Tempo economizado</div>
                    <p className="text-[11px] text-gray-500 font-normal mt-1 leading-normal transition-colors duration-300 group-hover:text-white/70">Evite semanas de desenvolvimento criando regras manuais.</p>
                  </div>
                </div>
              </div>

              <div className="group relative rounded-lg border border-gray-200 bg-white p-5 flex flex-col gap-3 overflow-hidden transition-colors duration-300">
                <div className="absolute inset-0 z-0 bg-[#6300ff] translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                <div className="relative z-10 flex flex-col gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-100 bg-gray-50 text-[#6300ff] transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20 group-hover:text-white">
                    <TbCodeOff className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-[#111111] tracking-tight transition-colors duration-300 group-hover:text-white">0 linhas</div>
                    <div className="text-xs font-medium text-gray-900 mt-0.5 transition-colors duration-300 group-hover:text-white/90">De codigo</div>
                    <p className="text-[11px] text-gray-500 font-normal mt-1 leading-normal transition-colors duration-300 group-hover:text-white/70">Toda a infraestrutura baseada em LLM roda direto na nuvem.</p>
                  </div>
                </div>
              </div>

              <div className="group relative rounded-lg border border-gray-200 bg-white p-5 flex flex-col gap-3 overflow-hidden transition-colors duration-300">
                <div className="absolute inset-0 z-0 bg-[#6300ff] translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                <div className="relative z-10 flex flex-col gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-100 bg-gray-50 text-[#6300ff] transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20 group-hover:text-white">
                    <TbChartBar className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-[#111111] tracking-tight transition-colors duration-300 group-hover:text-white">94%</div>
                    <div className="text-xs font-medium text-gray-900 mt-0.5 transition-colors duration-300 group-hover:text-white/90">De resolucao</div>
                    <p className="text-[11px] text-gray-500 font-normal mt-1 leading-normal transition-colors duration-300 group-hover:text-white/70">Respostas geradas pela IA que resolvem duvidas sem humanos.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mini trust badges */}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <TbBolt className="w-3.5 h-3.5 text-[#6300ff]" /> Setup em 5 minutos
              </div>
              <div className="w-px h-3 bg-gray-200" />
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <TbLock className="w-3.5 h-3.5 text-[#6300ff]" /> Dados criptografados
              </div>
              <div className="w-px h-3 bg-gray-200" />
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <TbRobot className="w-3.5 h-3.5 text-[#6300ff]" /> Gemini + Groq
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECAO 2: Chat IA */}
      <div className="mx-auto max-w-7xl relative z-10 w-full">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-24">
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-6 justify-center">
            <div className="inline-flex max-w-max items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm font-medium text-gray-600">
              <TbMessage2 className="h-5 w-5 text-[#6300ff]" />
              Interacoes Inteligentes
            </div>
            <h2 className="text-4xl font-normal tracking-tight text-[#111111] sm:text-5xl lg:text-[56px] leading-[1.1] max-w-2xl">
              Respostas humanas <br />
              <span className="text-gray-400">geradas por IA</span>
            </h2>
            <p className="text-lg text-gray-600 font-normal leading-relaxed max-w-2xl">
              Nossa engine interpreta o tom de voz da sua marca e responde com precisao milimetrica. O cliente sente que esta conversando com um especialista, enquanto sua equipe foca apenas em fechar contratos complexos.
            </p>

            <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0"><TbBrandWhatsapp className="w-4 h-4 text-green-600" /></div>
                <div><p className="text-[12px] font-medium text-gray-900">WhatsApp nativo</p><p className="text-[11px] text-gray-500">Sem configuracao de webhooks. Conecte e comece.</p></div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-[#6300ff]/10 flex items-center justify-center shrink-0"><TbBrain className="w-4 h-4 text-[#6300ff]" /></div>
                <div><p className="text-[12px] font-medium text-gray-900">IA treinada com seus dados</p><p className="text-[11px] text-gray-500">Upload de PDFs, sites, tabelas. A IA aprende sua operacao.</p></div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0"><TbTrendingUp className="w-4 h-4 text-orange-500" /></div>
                <div><p className="text-[12px] font-medium text-gray-900">Relatorios em tempo real</p><p className="text-[11px] text-gray-500">Acompanhe volume, taxa de resolucao e satisfacao.</p></div>
              </div>
            </div>
          </div>
          <ChatMock />
        </div>
      </div>

      {/* SECAO 3: Base de Conhecimento */}
      <div className="mx-auto max-w-7xl relative z-10 w-full">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-24">
          <KnowledgeMock />
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-6 justify-center">
            <div className="inline-flex max-w-max items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm font-medium text-gray-600">
              <TbSparkles className="h-5 w-5 text-[#6300ff]" />
              Base de Conhecimento
            </div>
            <h2 className="text-4xl font-normal tracking-tight text-[#111111] sm:text-5xl lg:text-[56px] leading-[1.1] max-w-2xl">
              Faca o upload <br />
              <span className="text-gray-400">do seu conhecimento</span>
            </h2>
            <p className="text-lg text-gray-600 font-normal leading-relaxed max-w-2xl">
              Arraste PDFs, manuais tecnicos ou links de sites para dentro da plataforma. Em menos de um minuto, o agente cognitivo absorve os dados e passa a utiliza-los de forma contextualizada para sanar duvidas operacionais.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0"><TbFile className="w-4 h-4 text-red-500" /></div>
                <div><p className="text-[12px] font-medium text-gray-900">PDFs & Documentos</p><p className="text-[10px] text-gray-500">Manuais, catalogos, politicas</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0"><TbGlobe className="w-4 h-4 text-blue-500" /></div>
                <div><p className="text-[12px] font-medium text-gray-900">Sites & Links</p><p className="text-[10px] text-gray-500">Scraping automatico de conteudo</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0"><TbDatabase className="w-4 h-4 text-green-500" /></div>
                <div><p className="text-[12px] font-medium text-gray-900">Banco de Dados</p><p className="text-[10px] text-gray-500">Tabelas, listas de preco, estoque</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0"><TbBrain className="w-4 h-4 text-purple-500" /></div>
                <div><p className="text-[12px] font-medium text-gray-900">IA Auto-Treinada</p><p className="text-[10px] text-gray-500">A IA aprende e melhora com o tempo</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECAO 4: Dashboard */}
      <div className="mx-auto max-w-7xl relative z-10 w-full">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-24">
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-6 justify-center">
            <div className="inline-flex max-w-max items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm font-medium text-gray-600">
              <TbChartBar className="h-5 w-5 text-[#6300ff]" />
              Analitica Avancada
            </div>
            <h2 className="text-4xl font-normal tracking-tight text-[#111111] sm:text-5xl lg:text-[56px] leading-[1.1] max-w-2xl">
              Decisoes baseadas <br />
              <span className="text-gray-400">em dados reais</span>
            </h2>
            <p className="text-lg text-gray-600 font-normal leading-relaxed max-w-2xl">
              Acompanhe em tempo real o desempenho da sua IA. Volume de atendimentos, taxa de resolucao, tempo medio de resposta e satisfacao do cliente - tudo em um painel unico e intuitivo.
            </p>

            <div className="flex flex-col gap-3 mt-2">
              {[
                { icon: TbMessageCircle, label: '2.847 mensagens hoje', color: 'text-blue-500 bg-blue-50' },
                { icon: TbRobot, label: '1.923 resolvidas pela IA', color: 'text-[#6300ff] bg-[#6300ff]/10' },
                { icon: TbUsers, label: '412 leads capturados', color: 'text-green-600 bg-green-50' },
                { icon: TbBolt, label: '850ms tempo medio', color: 'text-orange-500 bg-orange-50' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}><item.icon className="w-3.5 h-3.5" /></div>
                  <span className="text-[12px] text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <DashboardMock />
        </div>
      </div>

      {/* SECAO 5: Integracoes */}
      <div className="mx-auto max-w-7xl relative z-10 w-full">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-24">
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-6 justify-center">
            <div className="inline-flex max-w-max items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm font-medium text-gray-600">
              <TbLayersIntersect className="h-5 w-5 text-[#6300ff]" />
              Integracoes Nativas
            </div>
            <h2 className="text-4xl font-normal tracking-tight text-[#111111] sm:text-5xl lg:text-[56px] leading-[1.1] max-w-2xl">
              Conectado aos seus <br />
              <span className="text-gray-400">sistemas favoritos</span>
            </h2>
            <p className="text-lg text-gray-600 font-normal leading-relaxed max-w-2xl">
              Sincronize perfeitamente com CRMs, plataformas de e-commerce e ferramentas de pagamento. Dispare fluxos automaticos baseados em acoes do cliente, como abandono de carrinho ou aprovacao de faturamento.
            </p>

            <div className="grid grid-cols-1 gap-3 mt-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0"><TbBrandWhatsapp className="w-4 h-4 text-green-600" /></div>
                <div><p className="text-[12px] font-medium text-gray-900">WhatsApp Business API</p><p className="text-[10px] text-gray-500">Mensagens, midia, grupos, automacao completa</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0"><FcGoogle className="w-4 h-4" /></div>
                <div><p className="text-[12px] font-medium text-gray-900">Google Workspace</p><p className="text-[10px] text-gray-500">Calendar, Sheets, Drive, Gmail integrados</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0"><FcShop className="w-4 h-4" /></div>
                <div><p className="text-[12px] font-medium text-gray-900">E-commerce & Pagamentos</p><p className="text-[10px] text-gray-500">Mercado Pago, Shopify, WooCommerce</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0"><FcDatabase className="w-4 h-4" /></div>
                <div><p className="text-[12px] font-medium text-gray-900">APIs & Webhooks</p><p className="text-[10px] text-gray-500">Conecte qualquer sistema via REST ou webhooks</p></div>
              </div>
            </div>
          </div>
          <IntegrationOrbit />
        </div>
      </div>

    </section>
  );
}
