import React, { useState } from 'react';
import { api } from '../services/api';
import { Certificate } from '../types';
import { ShieldCheck, Search, X, CheckCircle, AlertOctagon, Award, Calendar, Hash } from 'lucide-react';

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
      setError('Сертификат с указанным ID не найден в государственном реестре Anti-Scam Uzbekistan или является недействительным.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shadow">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Верификация сертификата</h3>
            <p className="text-xs text-slate-400">Публичная проверка подлинности цифрового документа</p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-3">
          <label className="text-xs font-medium text-slate-300 block">
            Введите уникальный номер сертификата:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              required
              placeholder="Например: CERT-UZ-1-849201"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-cyan-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-cyan-600 hover:bg-cyan-500 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Поиск...' : 'Проверить'}</span>
            </button>
          </div>
        </form>

        {searched && (
          <div className="pt-2">
            {result ? (
              <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-800/80 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle className="w-4 h-4" />
                  <span>СЕРТИФИКАТ ДЕЙСТВИТЕЛЕН И ПОДТВЕРЖДЁН</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-900 pt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Владелец:</span>
                    <span className="font-semibold text-white">{result.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Квалификация:</span>
                    <span className="font-semibold text-cyan-300">{result.levelName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Уровень:</span>
                    <span className="text-slate-200">Уровень {result.levelNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Дата выдачи:</span>
                    <span className="text-slate-200">{new Date(result.issuedAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">SHA-256 Хэш:</span>
                    <span className="font-mono text-cyan-400 text-[11px]">{result.verificationHash}</span>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-start gap-2.5 animate-fadeIn">
                <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{error}</span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
