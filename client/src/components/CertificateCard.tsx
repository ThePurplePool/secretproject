import React from 'react';
import { Award, Shield, CheckCircle, QrCode, Share2 } from 'lucide-react';
import { Certificate } from '../types';

interface CertificateCardProps {
  certificate: Certificate;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ certificate }) => {
  const getBadgeDetails = (level: number) => {
    switch (level) {
      case 1:
        return {
          title: 'ANTI-SCAM BASIC',
          subtitle: 'Уровень 1: Распознавание атак и фишинга',
          color: 'from-blue-600 to-cyan-500',
          borderColor: 'border-cyan-500/50',
          badgeText: 'БАЗОВЫЙ ИММУНИТЕТ',
        };
      case 2:
        return {
          title: 'ANTI-SCAM DEFENDER',
          subtitle: 'Уровень 2: Активная защита данных и противодействие давлению',
          color: 'from-indigo-600 to-purple-600',
          borderColor: 'border-purple-500/50',
          badgeText: 'ЦИФРОВОЙ ЗАЩИТНИК',
        };
      case 3:
      default:
        return {
          title: 'ANTI-SCAM CONSULTANT',
          subtitle: 'Уровень 3: Экспертная помощь и аудит инцидентов окружения',
          color: 'from-amber-500 to-emerald-600',
          borderColor: 'border-amber-500/50',
          badgeText: 'ЭКСПЕРТ-КОНСУЛЬТАНТ',
        };
    }
  };

  const badge = getBadgeDetails(certificate.levelNumber);

  return (
    <div className={`relative rounded-3xl overflow-hidden border-2 ${badge.borderColor} bg-slate-950 p-6 sm:p-8 shadow-2xl text-white font-sans max-w-xl mx-auto`}>
      {/* Decorative background watermark */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 blur-2xl pointer-events-none" />

      {/* Top Banner */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-700 p-0.5 shadow-lg">
            <div className="w-full h-full bg-[#070d1e] rounded-[14px] flex items-center justify-center text-cyan-400">
              <Shield className="w-6 h-6" />
            </div>
          </div>
          <div>
            <span className="text-[10px] tracking-widest text-cyan-400 font-bold uppercase">
              РЕСПУБЛИКА УЗБЕКИСТАН
            </span>
            <h4 className="text-base font-extrabold tracking-tight text-white">
              ANTI-SCAM VERIFIED
            </h4>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-[11px] font-mono text-cyan-300">
          {certificate.certificateId}
        </div>
      </div>

      {/* Main Award Content */}
      <div className="py-6 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300 mx-auto shadow-inner">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold block mb-1">
            СЕРТИФИКАТ КИБЕРГРАМОТНОСТИ
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {certificate.userName}
          </h2>
        </div>

        <div className="py-2">
          <span className={`inline-block px-4 py-1.5 rounded-xl font-extrabold text-xs uppercase tracking-wider bg-gradient-to-r ${badge.color} text-white shadow-lg`}>
            {badge.title}
          </span>
          <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto">
            {badge.subtitle}
          </p>
        </div>
      </div>

      {/* Verification footer */}
      <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <div>
          <div className="text-[10px] text-slate-500">Дата выдачи:</div>
          <div className="font-medium text-slate-200">
            {new Date(certificate.issuedAt).toLocaleDateString('ru-RU')}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500">Хэш верификации:</div>
          <div className="font-mono text-cyan-400 text-[11px]">
            {certificate.verificationHash}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <CheckCircle className="w-4 h-4" />
          <span>Подлинность подтверждена</span>
        </div>
      </div>
    </div>
  );
};
