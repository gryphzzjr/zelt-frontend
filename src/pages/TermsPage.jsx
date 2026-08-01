import React from 'react';
import HeaderZelt from '../components/Header';
import FooterSection from '../components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <HeaderZelt />

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-normal tracking-tight text-[#111111] sm:text-5xl leading-[1.1] mb-4">
            Termos de Uso
          </h1>
          <p className="text-sm text-gray-500 mb-12">Última atualização: 13 de julho de 2026</p>

          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">1. Aceitação dos Termos</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Ao acessar ou usar a plataforma Zelt.AI ("Plataforma"), você concorda com estes Termos de Uso. Se não concordar com algum dos termos, não use a Plataforma.
            </p>

            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">2. Descrição do Serviço</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              O Zelt.AI é uma plataforma de inteligência artificial para automação e vendas no WhatsApp. O serviço inclui IA generativa, automação de fluxos conversacionais, gerenciamento de atendimento e integrações com sistemas de terceiros.
            </p>

            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">3. Elegibilidade</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Para usar a Plataforma, você deve ter pelo menos 18 anos de idade e capacidade legal para firmar contratos. Ao se cadastrar, você declara que atende a esses requisitos.
            </p>

            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">4. Conta de Usuário</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades que ocorrem em sua conta. Notifique-nos imediatamente sobre qualquer uso não autorizado.
            </p>

            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">5. Uso Aceitável</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Você concorda em não usar a Plataforma para:
            </p>
            <ul className="text-sm text-gray-600 leading-relaxed mb-4 list-disc pl-5 space-y-1">
              <li>Enviar spam ou mensagens não solicitadas em violação da legislação aplicável;</li>
              <li>Violar direitos de terceiros, incluindo direitos de propriedade intelectual;</li>
              <li>Tentar acessar não autorizado a sistemas ou dados de outros usuários;</li>
              <li>Interferir no funcionamento da Plataforma ou de servidores conectados;</li>
              <li>Usar a Plataforma para fins ilegais ou não autorizados.</li>
            </ul>

            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">6. Propriedade Intelectual</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Todo o conteúdo, funcionalidades e tecnologia da Plataforma são de propriedade da Zelt.AI e protegidos por leis de propriedade intelectual. Você recebe uma licença limitada, não exclusiva e revogável para usar a Plataforma conforme estes Termos.
            </p>

            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">7. Dados do Usuário</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Você mantém a propriedade dos dados que carrega na Plataforma. Ao usar o serviço, você nos concede uma licença para processar esses dados exclusivamente para fornecer e melhorar o serviço. Consulte nossa Política de Privacidade para mais detalhes.
            </p>

            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">8. Planos e Pagamentos</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Os preços e condições dos planos estão disponíveis na página de Preços da Plataforma. Os valores podem ser alterados com aviso prévio de 30 dias. Planos pagos são cobrados antecipadamente e não são reembolsáveis, exceto quando previsto em lei.
            </p>

            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">9. Isenção de Garantias</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              A Plataforma é fornecida "como está", sem garantias de qualquer tipo, expressas ou implícitas. Não garantimos que o serviço será ininterrupto, livre de erros ou que os resultados obtidos serão precisos ou confiáveis.
            </p>

            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">10. Limitação de Responsabilidade</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Em nenhuma circunstância a Zelt.AI será responsável por danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo perda de dados, lucros ou oportunidades de negócios, decorrentes do uso da Plataforma.
            </p>

            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">11. Rescisão</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Podemos suspender ou encerrar sua acesso à Plataforma a qualquer momento, com ou sem motivo, com ou sem aviso prévio. Após a rescisão, seu direito de usar a Plataforma cessa imediatamente.
            </p>

            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">12. Alterações nos Termos</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Reservamo-nos o direito de modificar estes Termos a qualquer momento. Alterações significativas serão comunicadas por e-mail ou através da Plataforma com pelo menos 30 dias de antecedência.
            </p>

            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">13. Legislação Aplicável</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer dispute será resolvida nos tribunais competentes da comarca de São Paulo, SP.
            </p>

            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">14. Contato</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Em caso de dúvidas sobre estes Termos, entre em contato conosco pelo e-mail: contato@zelt.ai
            </p>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
