import React, { useState } from 'react';
import { api } from '../services/api';
import { Certificate } from '../types';
import { ShieldCheck, Search, X, CheckCircle, AlertOctagon } from 'lucide-react';

interface CertificateVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCertId?: string;
}

export const CertificateVerifyModal: React.FC<CertificateVerifyModalProps> = ({
  isOpen,
  onClose,
  initialCertId = '',
}) => {
  const [certId, setCertId] = useState(initialCertId);
  const [result, setResult] = useState<Certificate | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = certId.trim();
    if (!cleanId) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSearched(true);

    try {
      const data = await api.verifyCertificate(cleanId);
      setResult(data);
    } catch (err: any) {
      setError('Сертификат с указанным идентификатором не найден в государственном реестре Anti-Scam Uzbekistan или является недействительным.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#191A1C]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn font-sans text-[#191A1C]">
      <div className="w-full max-w-lg bg-[#FAF8F5] border border-[#D8D2C5] rounded-lg p-6 sm:p-8 space-y-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded text-[#6B6661] hover:text-[#191A1C] hover:bg-[#E7E1D6] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 border-b border-[#D8D2C5] pb-4">
          <div className="w-9 h-9 rounded bg-[#191A1C] flex items-center justify-center text-white">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-[#191A1C] tracking-tight">
              Верификация сертификата
            </h3>
            <p className="text-xs text-[#5C5854]">
              Публичная проверка подлинности цифрового документа в реестре
            </p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-3">
          <label className="text-xs font-mono font-bold text-[#191A1C] uppercase tracking-wider block">
            Введите уникальный номер сертификата:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              required
              placeholder="Например: CERT-UZ-1-849201"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded bg-white border border-[#D8D2C5] text-[#191A1C] text-xs font-mono focus:border-[#7A1F2B] focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded font-mono font-bold text-xs uppercase tracking-wider bg-[#191A1C] hover:bg-[#7A1F2B] text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? 'Поиск...' : 'Проверить'}</span>
            </button>
          </div>
        </form>

        {searched && (
          <div className="pt-2">
            {result ? (
              <div className="p-5 rounded bg-[#FAF8F5] border-2 border-[#465447] space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-[#465447] font-mono font-bold text-xs">
                  <CheckCircle className="w-4 h-4" />
                  <span>СЕРТИФИКАТ ДЕЙСТВИТЕЛЕН И ПОДТВЕРЖДЁН</span>
                </div>

                <div className="space-y-1.5 text-xs text-[#191A1C] border-t border-[#D8D2C5] pt-2">
                  <div className="flex justify-between">
                    <span className="text-[#6B6661]">Владелец:</span>
                    <span className="font-bold text-[#191A1C]">{result.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6661]">Квалификация:</span>
                    <span className="font-semibold text-[#7A1F2B]">{result.levelName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6661]">Уровень:</span>
                    <span className="font-mono text-[#191A1C]">Уровень {result.levelNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6661]">Дата выдачи:</span>
                    <span className="font-mono text-[#191A1C]">{new Date(result.issuedAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6661]">SHA-256 Хэш:</span>
                    <span className="font-mono text-[#7A1F2B] text-[11px] truncate max-w-[200px]">{result.verificationHash}</span>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="p-4 rounded bg-[#7A1F2B]/10 border border-[#7A1F2B]/30 text-xs text-[#7A1F2B] flex items-start gap-2.5 animate-fadeIn font-mono">
                <AlertOctagon className="w-4 h-4 shrink-0 text-[#7A1F2B] mt-0.5" />
                <span>{error}</span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
