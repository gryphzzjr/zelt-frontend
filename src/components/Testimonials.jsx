import { useEffect, useRef, useState } from 'react';
import { Star, Quote } from 'lucide-react';


const testimonials = [
  {
    name: 'Maria Silva',
    role: 'Diretora de Vendas',
    company: 'TechStart',
    content: 'Zelt.ai revolucionou nossa operação comercial. Aumentamos 340% em conversões e reduzimos o ciclo de vendas pela metade.',
    rating: 5,
    avatar: 'MS',
  },
  {
    name: 'João Santos',
    role: 'CEO',
    company: 'GrowthLab',
    content: 'Incrível! O agente de IA trabalha sem parar e fecha vendas enquanto dormimos. ROI positivo já no primeiro mês.',
    rating: 5,
    avatar: 'JS',
  },
  {
    name: 'Ana Costa',
    role: 'Fundadora',
    company: 'SmartSales',
    content: 'A qualificação automática de leads economizou horas do nosso time. Agora focamos apenas nos prospects mais qualificados.',
    rating: 5,
    avatar: 'AC',
  },
];

function TestimonialCard({ testimonial, index }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 150);
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

  return (
    <div
      ref={cardRef}
      className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      <div className="flex items-center mb-6">
        <Quote className="w-8 h-8 text-blue-500 opacity-50" />
      </div>

      <div className="flex mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>

      <p className="text-gray-700 mb-6 leading-relaxed italic">
        "{testimonial.content}"
      </p>

      <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
          {testimonial.avatar}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{testimonial.name}</p>
          <p className="text-sm text-gray-500">
            {testimonial.role} • {testimonial.company}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
            <Star className="w-4 h-4 fill-current" />
            <span>Depoimentos</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800">
            O que nossos clientes{' '}
            <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
              estão dizendo
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Resultados reais de quem já transformou vendas com Zelt.ai
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-6 bg-gradient-to-r from-blue-50 to-pink-50 px-8 py-6 rounded-2xl">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-800">5.000+</p>
              <p className="text-sm text-gray-600">Usuários Ativos</p>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-800">98%</p>
              <p className="text-sm text-gray-600">Satisfação</p>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-800">24/7</p>
              <p className="text-sm text-gray-600">Suporte</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
