import React, { useState, useEffect, useRef } from 'react';
import {
  TbArrowLeft, TbArrowRight, TbUser, TbFileText, TbCalendar,
  TbBuilding, TbLoader2, TbCheck, TbAlertTriangle, TbX, TbChevronDown
} from 'react-icons/tb';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

function formatCpf(value) {
  const n = value.replace(/\D/g, '').slice(0, 11);
  return n
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatCnpj(value) {
  const n = value.replace(/\D/g, '').slice(0, 14);
  return n
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

function validateCpf(cpf) {
  const nums = cpf.replace(/\D/g, '');
  if (nums.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(nums)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(nums[i]) * (10 - i);
  let rest = sum % 11;
  const d1 = rest < 2 ? 0 : 11 - rest;
  if (parseInt(nums[9]) !== d1) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(nums[i]) * (11 - i);
  rest = sum % 11;
  const d2 = rest < 2 ? 0 : 11 - rest;
  return parseInt(nums[10]) === d2;
}

function validateCnpj(cnpj) {
  const nums = cnpj.replace(/\D/g, '');
  if (nums.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(nums)) return false;

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(nums[i]) * w1[i];
  let rest = sum % 11;
  const d1 = rest < 2 ? 0 : 11 - rest;
  if (parseInt(nums[12]) !== d1) return false;

  sum = 0;
  for (let i = 0; i < 13; i++) sum += parseInt(nums[i]) * w2[i];
  rest = sum % 11;
  const d2 = rest < 2 ? 0 : 11 - rest;
  return parseInt(nums[13]) === d2;
}

export default function CompanyStep({ data, updateData, onNext, onPrev }) {
  const [docType, setDocType] = useState('cnpj');
  const [docStatus, setDocStatus] = useState('idle');
  const [docError, setDocError] = useState('');
  const [cnpjData, setCnpjData] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  const rawDoc = (data.taxId || '').replace(/\D/g, '');
  const isCnpjMode = docType === 'cnpj';
  const isCpfMode = docType === 'cpf';
  const maxLen = isCnpjMode ? 14 : 11;

  const docValid = isCnpjMode
    ? (rawDoc.length === 14 && docStatus === 'success')
    : (rawDoc.length === 11 && docStatus === 'success');

  const canProceed = data.fullName.trim() && data.companyName.trim() && data.birthDate && docValid;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (isCnpjMode) {
      if (rawDoc.length !== 14) {
        setDocStatus(rawDoc.length === 0 ? 'idle' : 'idle');
        setDocError('');
        setCnpjData(null);
        return;
      }

      if (!validateCnpj(rawDoc)) {
        setDocStatus('invalid');
        setDocError('Dígitos verificadores do CNPJ inválidos.');
        setCnpjData(null);
        return;
      }

      setDocStatus('loading');
      setDocError('');

      debounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`${API_URL}/company/cnpj/${rawDoc}`);
          const json = await res.json();

          if (!res.ok || !json.success) {
            setDocStatus('error');
            setDocError(json.message || 'CNPJ não encontrado na Receita Federal.');
            setCnpjData(null);
            return;
          }

          setDocStatus('success');
          setCnpjData(json.data);

          updateData({
            companyName: json.data.nomeFantasia || json.data.razaoSocial || '',
            phone: json.data.telefone || '',
            cnpjData: json.data
          });
        } catch {
          setDocStatus('error');
          setDocError('Erro ao consultar CNPJ. Tente novamente.');
          setCnpjData(null);
        }
      }, 600);
    } else {
      if (rawDoc.length !== 11) {
        setDocStatus('idle');
        setDocError('');
        setCnpjData(null);
        return;
      }

      if (!validateCpf(rawDoc)) {
        setDocStatus('invalid');
        setDocError('Dígitos verificadores do CPF inválidos.');
        setCnpjData(null);
        return;
      }

      setDocStatus('success');
      setDocError('');
      setCnpjData(null);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [rawDoc, docType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDocTypeSwitch = (type) => {
    setDocType(type);
    setDocStatus('idle');
    setDocError('');
    setCnpjData(null);
    updateData({ taxId: '', cnpjData: null });
    setDropdownOpen(false);
  };

  const handleDocInput = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length > maxLen) return;
    updateData({ taxId: isCnpjMode ? formatCnpj(e.target.value) : formatCpf(e.target.value) });
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-6 flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-[#6300ff] uppercase tracking-wider">Etapa 2 de 3</span>
        <h2 className="text-4xl font-medium tracking-tight sm:text-5xl leading-tight">
          Identificação e <span className="text-gray-400">dados empresariais</span>
        </h2>
        <p className="text-base text-gray-500">
          Informe o CNPJ ou CPF do responsável para validação.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Nome Completo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 ml-1">Nome completo do responsável</label>
          <div className="relative">
            <TbUser className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Seu nome completo"
              value={data.fullName}
              onChange={(e) => updateData({ fullName: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-12 py-3 text-base outline-none focus:border-[#6300ff] focus:ring-4 focus:ring-[#6300ff]/5 transition-all"
            />
          </div>
        </div>

        {/* CPF ou CNPJ com dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 ml-1">
            {isCnpjMode ? 'CNPJ da empresa' : 'CPF do responsável'}
          </label>
          <div className="flex gap-2">
            {/* Dropdown seletor */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="h-full px-3 border border-gray-200 rounded-lg text-xs font-semibold uppercase tracking-wide text-gray-600 hover:border-gray-300 focus:border-[#6300ff] focus:ring-4 focus:ring-[#6300ff]/5 outline-none transition-all flex items-center gap-1.5 min-w-[72px] justify-center"
              >
                {docType === 'cnpj' ? 'CNPJ' : 'CPF'}
                <TbChevronDown className={`h-3.5 w-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden min-w-[72px]">
                  <button
                    type="button"
                    onClick={() => handleDocTypeSwitch('cnpj')}
                    className={`w-full px-3 py-2 text-xs font-semibold uppercase text-left hover:bg-gray-50 transition-colors ${docType === 'cnpj' ? 'text-[#6300ff] bg-[#6300ff]/5' : 'text-gray-600'}`}
                  >
                    CNPJ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDocTypeSwitch('cpf')}
                    className={`w-full px-3 py-2 text-xs font-semibold uppercase text-left hover:bg-gray-50 transition-colors ${docType === 'cpf' ? 'text-[#6300ff] bg-[#6300ff]/5' : 'text-gray-600'}`}
                  >
                    CPF
                  </button>
                </div>
              )}
            </div>

            {/* Input do documento */}
            <div className="relative flex-1">
              <TbFileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={isCnpjMode ? '00.000.000/0001-00' : '000.000.000-00'}
                value={data.taxId}
                onChange={handleDocInput}
                className={`w-full border rounded-lg px-12 py-3 pr-12 text-base outline-none focus:ring-4 transition-all ${
                  docStatus === 'success'
                    ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-50'
                    : docStatus === 'error' || docStatus === 'invalid'
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-50'
                      : 'border-gray-200 focus:border-[#6300ff] focus:ring-[#6300ff]/5'
                }`}
              />

              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {docStatus === 'loading' && (
                  <TbLoader2 className="h-5 w-5 text-gray-400 animate-spin" />
                )}
                {docStatus === 'success' && (
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <TbCheck className="h-4 w-4 text-emerald-600" />
                  </div>
                )}
                {(docStatus === 'error' || docStatus === 'invalid') && (
                  <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                    <TbX className="h-4 w-4 text-red-500" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mensagens de status */}
          {(docStatus === 'error' || docStatus === 'invalid') && docError && (
            <p className="text-xs font-medium text-red-500 ml-1 flex items-center gap-1.5">
              <TbAlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {docError}
            </p>
          )}
          {docStatus === 'success' && cnpjData && (
            <div className="ml-1 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <p className="text-xs font-medium text-emerald-700 mb-1">
                {cnpjData.nomeFantasia || cnpjData.razaoSocial}
              </p>
              <p className="text-[11px] text-emerald-600/70">
                {cnpjData.municipio}/{cnpjData.uf} · Razão social: {cnpjData.razaoSocial}
              </p>
            </div>
          )}
          {docStatus === 'success' && isCpfMode && (
            <p className="text-xs font-medium text-emerald-600 ml-1 flex items-center gap-1.5">
              <TbCheck className="h-3.5 w-3.5 shrink-0" />
              CPF válido
            </p>
          )}
          {docStatus === 'loading' && (
            <p className="text-xs font-medium text-gray-400 ml-1">
              Consultando Receita Federal...
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Data de Nascimento */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 ml-1">Data de nascimento</label>
            <div className="relative">
              <TbCalendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={data.birthDate}
                onChange={(e) => updateData({ birthDate: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-12 py-3 text-base outline-none focus:border-[#6300ff] focus:ring-4 focus:ring-[#6300ff]/5 transition-all text-gray-600"
              />
            </div>
          </div>

          {/* Nome da Empresa */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 ml-1">Nome da Empresa</label>
            <div className="relative">
              <TbBuilding className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={docStatus === 'loading' ? 'Aguardando consulta...' : 'Razão social ou Nome fantasia'}
                value={data.companyName}
                onChange={(e) => updateData({ companyName: e.target.value })}
                readOnly={docStatus === 'loading'}
                className={`w-full border border-gray-200 rounded-lg px-12 py-3 text-base outline-none focus:border-[#6300ff] focus:ring-4 focus:ring-[#6300ff]/5 transition-all ${
                  docStatus === 'loading' ? 'bg-gray-50 text-gray-400' : ''
                }`}
              />
            </div>
          </div>
        </div>

        {/* Telefone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 ml-1">Telefone da empresa</label>
          <div className="relative">
            <TbBuilding className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="(00) 00000-0000"
              value={data.phone}
              onChange={(e) => updateData({ phone: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-12 py-3 text-base outline-none focus:border-[#6300ff] focus:ring-4 focus:ring-[#6300ff]/5 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-6">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#111] transition-colors py-2"
        >
          <TbArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <button
          disabled={!canProceed}
          onClick={onNext}
          className={`rounded-lg px-6 py-3 text-sm font-medium flex items-center gap-2 transition-all ${
            canProceed
              ? 'bg-[#111111] text-white hover:bg-black cursor-pointer'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Avançar <TbArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
