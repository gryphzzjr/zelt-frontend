import { ArrowRight, Sparkles, TrendingUp, MessageSquare } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-32 grid md:grid-cols-2 gap-12 items-center w-full">
        <div className="space-y-8">
          <div className="inline-flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium border border-blue-600">
            <Sparkles className="w-4 h-4" />
            <span>Inteligência Artificial que Vende</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900">
            Automatize suas vendas com IA
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed">
            Zelt.ai é o agente inteligente que trabalha 24/7 para fechar negócios,
            qualificar leads e aumentar sua receita automaticamente.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center space-x-2 border border-blue-600">
              <span>Experimente Gratuitamente</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="bg-white text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors duration-200 border-2 border-gray-300">
              Ver Demo
            </button>
          </div>

          <div className="flex items-center space-x-8 pt-4 border-t border-gray-300 pt-8">
            <div>
              <p className="text-2xl font-bold text-gray-900">5.000+</p>
              <p className="text-sm text-gray-600">Usuários Ativos</p>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">340%</p>
              <p className="text-sm text-gray-600">Aumento Médio</p>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">24/7</p>
              <p className="text-sm text-gray-600">Funcionando</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="bg-white rounded-xl p-8 border-2 border-blue-500">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-300">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Conversão</p>
                  <p className="text-2xl font-bold text-gray-900">+340%</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 pb-4 border-b border-gray-300">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Respostas Automáticas</p>
                  <p className="text-2xl font-bold text-gray-900">24/7</p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6 border border-blue-300">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 mb-1">IA Conversando</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      "Olá! Posso te ajudar a escolher o melhor plano para seu negócio?"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
