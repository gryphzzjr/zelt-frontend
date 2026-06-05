import React, { useState } from 'react';
import api from '../services/api';

export default function WhatsappConnect() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [statusText, setStatusText] = useState('Aguardando resposta da API...');
  const [error, setError] = useState(false);

  const generateQRCode = async () => {
    setIsOpen(true);
    setLoading(true);
    setError(false);
    setStatusText("Chamando seu FastAPI...");

    try {
      const response = await api.post('/whatsapp/conectar/minha_empresa');
      const data = response.data;

      if (data.status === 'success') {
        setQrCode(data.qrcode);
        setStatusText("QR Code Gerado! Pode escanear.");
      } else {
        throw new Error("Erro na resposta do servidor");
      }
    } catch (err) {
      console.error(err);
      setError(true);
      setStatusText(
        err?.response?.data?.detail ||
        "Erro ao conectar. Verifique se o FastAPI e o Evolution estão ligados."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0f172a] text-[#f5f5f5] flex flex-col justify-center items-center overflow-hidden font-sans p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(222,255,154,0.05)_0%,transparent_70%)] z-0" />

      <div className="relative z-10 text-center max-w-xl">
        <h2 className="text-3xl font-bold text-[#deff9a] mb-4 tracking-tight">
          Dashboard de Conexão
        </h2>
        <p className="mb-10 text-gray-400 font-light">
          Clique no botão abaixo para gerar o QR Code <br />
          e conectar seu WhatsApp.
        </p>

        <button
          onClick={generateQRCode}
          className="bg-[#deff9a] text-black px-10 py-5 rounded-full text-xl font-bold flex items-center justify-center gap-3 mx-auto cursor-pointer transition-all hover:scale-105 hover:shadow-[0_15px_40px_rgba(222,255,154,0.4)] shadow-[0_10px_30px_rgba(222,255,154,0.2)]"
        >
          <span>💬</span> CONECTAR WHATSAPP
        </button>
      </div>

      {isOpen && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-[#1a1a1a] border border-[#deff9a]/30 p-10 rounded-[30px] text-center max-w-[450px] w-[90%] relative shadow-2xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 text-[#deff9a] hover:text-white transition-colors text-2xl font-bold"
            >
              ✕
            </button>

            <h3 className="text-white text-xl font-semibold mb-2">Escaneie o QR Code</h3>
            <p className="text-sm text-gray-400 font-light mb-6">
              Abra o WhatsApp no seu celular e aponte a câmera para esta tela.
            </p>

            <div className="w-[250px] h-[250px] bg-white mx-auto rounded-2xl flex items-center justify-center overflow-hidden shadow-inner p-4">
              {loading ? (
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#deff9a]/20 border-t-[#deff9a]" />
              ) : error ? (
                <span className="text-red-500 text-5xl">⚠️</span>
              ) : (
                <img src={qrCode} alt="WhatsApp QR Code" className="w-full h-full object-contain" />
              )}
            </div>

            <p className={`text-sm mt-6 font-medium ${error ? 'text-red-400' : 'text-[#deff9a]'}`}>
              {statusText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
