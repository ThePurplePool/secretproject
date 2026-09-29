import React from 'react';
import { Award, Shield, CheckCircle } from 'lucide-react';
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
          subtitle: 'Уровень 1: Распознавание атак социальной инженерии и фишинга',
          badgeText: 'БАЗОВЫЙ ИММУНИТЕТ',
        };
      case 2:
        return {
          title: 'ANTI-SCAM DEFENDER',
          subtitle: 'Уровень 2: Активная защита данных и противодействие давлению',
          badgeText: 'ЦИФРОВОЙ ЗАЩИТНИК',
        };
      case 3:
      default:
        return {
          title: 'ANTI-SCAM CONSULTANT',
          subtitle: 'Уровень 3: Экспертная помощь и аудит инцидентов окружения',
          badgeText: 'ЭКСПЕРТ-КОНСУЛЬТАНТ',
        };
    }
  };

  const badge = getBadgeDetails(certificate.levelNumber);

  return (
    <div className="relative rounded-lg overflow-hidden border-2 border-[#191A1C] bg-[#FAF8F5] p-6 sm:p-7 shadow-md text-[#191A1C] font-sans max-w-xl mx-auto">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-5 border-b border-[#D8D2C5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#191A1C] flex items-center justify-center text-white">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] tracking-widest text-[#7A1F2B] font-mono font-bold uppercase">
              РЕСПУБЛИКА УЗБЕКИСТАН // НАЦИОНАЛЬНЫЙ РЕЕСТР
            </span>
            <h4 className="text-sm font-bold tracking-tight text-[#191A1C] font-mono">
              ANTI-SCAM VERIFIED CREDENTIAL
            </h4>
          </div>
        </div>

        <div className="px-2.5 py-1 rounded bg-[#E7E1D6] border border-[#D8D2C5] text-[11px] font-mono font-semibold text-[#191A1C]">
          {certificate.certificateId}
        </div>
      </div>

      {/* Main Award Content */}
      <div className="py-6 text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-[#E7E1D6] text-[#7A1F2B] mx-auto">
          <Award className="w-6 h-6" />
        </div>

        <div>
          <span className="text-[10px] text-[#6B6661] uppercase tracking-widest font-mono font-semibold block mb-1">
            СЕРТИФИКАТ КИБЕРГРАМОТНОСТИ И ПРОТИВОДЕЙСТВИЯ МОШЕННИЧЕСТВУ
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#191A1C]">
            {certificate.userName}
          </h2>
        </div>

        <div className="pt-2">
          <span className="inline-block px-3 py-1 rounded bg-[#191A1C] text-white font-mono font-bold text-xs uppercase tracking-wider">
            {badge.title}
          </span>
          <p className="text-xs text-[#5C5854] mt-2 max-w-md mx-auto leading-relaxed">
            {badge.subtitle}
          </p>
        </div>
      </div>

      {/* Verification footer */}
      <div className="pt-5 border-t border-[#D8D2C5] flex flex-wrap items-center justify-between gap-4 text-xs text-[#6B6661]">
        <div>
          <div className="text-[10px] text-[#8A8580] uppercase font-mono">Дата выдачи:</div>
          <div className="font-mono text-[#191A1C] font-semibold">
            {new Date(certificate.issuedAt).toLocaleDateString('ru-RU')}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-[#8A8580] uppercase font-mono">Хэш верификации SHA-256:</div>
          <div className="font-mono text-[#7A1F2B] text-[11px] truncate max-w-[200px]" title={certificate.verificationHash}>
            {certificate.verificationHash}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[#465447] font-semibold text-xs font-mono">
          <CheckCircle className="w-4 h-4" />
          <span>Верифицирован</span>
        </div>
      </div>
    </div>
  );
};
