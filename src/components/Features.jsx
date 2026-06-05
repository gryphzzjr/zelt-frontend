import { useEffect, useRef, useState } from 'react';
import { Bot, Clock, Target, Zap, BarChart3, MessageCircle } from 'lucide-react'

const features = [
  {
    icon: Bot,
    title: 'IA Conversacional',
    description: 'Respostas naturais e inteligentes que se adaptam ao contexto de cada cliente.',
    color: 'bg-blue-200 border border-blue-300',
  },
  {
    icon: Clock,
    title: 'Disponível 24/7',
    description: 'Seu agente de vendas nunca dorme. Atendimento contínuo para maximizar oportunidades.',
    color: 'bg-green-200 border border-green-300',
  },
  {
    icon: Target,
    title: 'Qualificação de Leads',
    description: 'Identifica automaticamente os leads mais promissores e prioriza o follow-up.',
    color: 'bg-pink-200 border border-pink-300',
  },
  {
    icon: Zap,
    title: 'Automação Completa',
    description: 'Do primeiro contato ao fechamento, tudo acontece automaticamente.',
    color: 'bg-blue-200 border border-blue-300',
  },
  {
    icon: BarChart3,
    title: 'Analytics Avançado',
    description: 'Insights profundos sobre performance de vendas e comportamento do cliente.',
    color: 'bg-green-200 border border-green-300',
  },
  {
    icon: MessageCircle,
    title: 'Multicanal',
    description: 'Integração com WhatsApp, email, chat e redes sociais em uma única plataforma.',
    color: 'bg-pink-200 border border-pink-300',
  },
];

function FeatureCard({ feature, index }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 100);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [index]);

  const Icon = feature.icon;

  return (
    <div
      ref={cardRef}
      className={`group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
        {feature.title}
      </h3>
      <p className="text-gray-600 leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="py-24 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
            <Zap className="w-4 h-4" />
            <span>Recursos Poderosos</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800">
            Tudo que você precisa para{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              vender mais
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tecnologia de ponta que transforma conversas em vendas
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
