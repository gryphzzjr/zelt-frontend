import React from 'react';
import HeaderZelt from '../components/Header';
import FooterSection from '../components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <HeaderZelt />

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-normal tracking-tight text-[#111111] sm:text-5xl leading-[1.1] mb-4">
            Política de Privacidade
          </h1>
          <p className="text-sm text-gray-500 mb-12">Última atualização: 13 de julho de 2026</p>

          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">1. Introdução</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              A Zelt.AI valoriza a privacidade dos seus usuários. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD) e demais legislação aplicável.
            </p>

            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">2. Dados Coletados</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Coletamos os seguintes tipos de informações:
            </p>
            <ul className="text-sm text-gray-600 leading-relaxed mb-4 list-disc pl-5 space-y-1">
              <li><strong>Dados de cadastro:</strong> nome, e-mail, CPF/CNPJ, telefone e dados da empresa;</li>
              <li><strong>Dados de uso:</strong> informações sobre como você interage com a Plataforma;</li>
              <li><strong>Dados carregados:</strong> documentos, FAQs e outros conteúdos que você upload na plataforma para treinamento da IA;</li>
              <li><strong>Dados de pagamento:</strong> informações de faturamento (processadas por parceiros de pagamento certificados);</li>
              <li><strong>Dados de comunicação:</strong> mensagens trocadas com nosso suporte.</li>
            </ul>

            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">3. Finalidade do Tratamento</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Utilizamos seus dados para:
            </p>
            <ul className="text-sm text-gray-600 leading-relaxed mb-4 list-disc pl-5 space-y-1">
              <li>Fornecer e operar a Plataforma;</li>
              <li>Processar e responder suas solicitações;</li>
              <li>Melhorar a qualidade do serviço;</li>
              <li>Enviar comunicações sobre atualizações, novos recursos e ofertas;</li>
              <li>Cumprir obrigações legais e regulatórias;</li>
              <li>Garantir a segurança da Plataforma e prevenir fraudes.</li>
            </ul>

            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">4. Base Legal para o Tratamento</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              O tratamento dos seus dados é realizado com base em:
            </p>
            <ul className="text-sm text-gray-600 leading-relaxed mb-4 list-disc pl-5 space-y-1">
              <li>Execução de contrato ou de procedimentos preliminares;</li>
              <li>Consentimento do titular dos dados;</li>
              <li>Legítimo interesse do controlador;</li>
              <li>Cumprimento de obrigação legal ou regulatória.</li>
            </ul>

            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">5. Compartilhamento de Dados</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Não vendemos seus dados pessoais. Podemos compartilhar informações com:
            </p>
            <ul className="text-sm text-gray-600 leading-relaxed mb-4 list-disc pl-5 space-y-1">
              <li>Parceiros de tecnologia que auxiliam na operação da Plataforma;</li>
              <li>Parceiros de pagamento para processar transações;</li>
              <li>Autoridades competentes, quando exigido por lei;</li>
              <li>Em caso de fusão, aquisição ou venda de ativos, os dados podem ser transferidos.</li>
            </ul>

            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">6. Armazenamento e Segurança</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Seus dados são armazenados em servidores seguros com criptografia em trânsito e em repouso. Implementamos medidas técnicas e administrativas para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição.
            </p>

            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">7. Retenção de Dados</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas nesta política, salvo quando um período de retenção mais longo é exigido ou permitido por lei. Após o encerramento da conta, seus dados serão eliminados em até 90 dias, exceto quando necessário para cumprir obrigações legais.
            </p>

            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">8. Direitos do Titular</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Conforme a LGPD, você tem direito a:
            </p>
            <ul className="text-sm text-gray-600 leading-relaxed mb-4 list-disc pl-5 space-y-1">
              <li>Confirmar a existência de tratamento de dados;</li>
              <li>Acessar seus dados pessoais;</li>
              <li>Corrigir dados incompletos ou desatualizados;</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários;</li>
              <li>Solicitar a portabilidade dos dados;</li>
              <li>Eliminar os dados tratados com consentimento;</li>
              <li>Revogar o consentimento a qualquer momento;</li>
              <li>Opor-se ao tratamento em certas hipóteses.</li>
            </ul>

            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">9. Cookies</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso da Plataforma e personalizar conteúdo. Você pode gerenciar suas preferências de cookies nas configurações do seu navegador.
            </p>

            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">10. Transferência Internacional de Dados</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Caso seus dados sejam transferidos para fora do Brasil, garantiremos que a transferência ocorra em conformidade com a LGPD e com salvaguardas adequadas para proteger suas informações.
            </p>

            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">11. Menores de Idade</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              A Plataforma não é destinada a menores de 18 anos. Não coletamos intencionalmente dados de menores de idade. Se tomarmos conhecimento de que coletamos dados de um menor, tomaremos medidas para eliminar essas informações.
            </p>

            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">12. Alterações nesta Política</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Podemos atualizar esta Política de Privacidade periodicamente. Alterações significativas serão comunicadas por e-mail ou através da Plataforma com pelo menos 30 dias de antecedência.
            </p>

            <h2 className="text-xl font-medium text-[#111111] tracking-tight mt-10 mb-4">13. Contato</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato com nosso Encarregado de Proteção de Dados (DPO):
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              E-mail: privacidade@zelt.ai
            </p>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
