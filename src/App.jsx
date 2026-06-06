import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import ZeltLogin from './pages/LoginPage';
import ZeltRegister from './pages/RegisterPage';
import ZeltDashboard from './pages/Dashboard';
import WhatsappConnect from './pages/Tests'; // FINALMENTE FUNCIONA!!!
import RecursosPage from './pages/ResourcesPage';
import ContatoPage from './pages/ContactPage';
import PrecosPage from './pages/PricingPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentError from './pages/PaymentError';
import PaymentWarning from './pages/PaymentWarning';
import DepoimentosPage from './pages/DepoimentosPage';
import TermsPage from './pages/Terms';

// Componente auxiliar lê o localStorage na hora da renderização
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('zelt_token');

  // Se não tiver token real salvo, chuta pro login usando o redirect do router
  if (!token || token === 'undefined' || token === 'null') {
    return <Navigate to="/login" replace />;
  }

  // Se tiver token, abre a rota privada numa boa
  return children;
};

export default function App() {
  // Checagem direta para as rotas públicas de login/register
  const token = localStorage.getItem('zelt_token');
  const isAuthenticated = token && token !== 'undefined' && token !== 'null';

  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/recursos" element={<RecursosPage />} />
        <Route path="/contato" element={<ContatoPage />} />
        <Route path="/precos" element={<PrecosPage />} />
        <Route path="/depoimentos" element={<DepoimentosPage />} />
        <Route path="/pagamento/sucesso" element={<PaymentSuccess />} />
        <Route path="/pagamento/erro" element={<PaymentError />} />
        <Route path="/pagamento/aviso" element={<PaymentWarning />} />
        <Route path="/termos" element={<TermsPage />} />

        {/* Se já tiver logado e tentar ir pro login/register, barra e joga pra dashboard */}
        <Route path="/login" element={!isAuthenticated ? <ZeltLogin /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!isAuthenticated ? <ZeltRegister /> : <Navigate to="/dashboard" replace />} />

        {/* Rotas Privadas protegidas direto pelo token */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ZeltDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tests"
          element={
            <ProtectedRoute>
              <WhatsappConnect />
            </ProtectedRoute>
          }
        />

        {/* Rota de fuga: qualquer link aleatório joga para a raiz */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
