import React from 'react';
import { UserProfile, Certificate } from '../types';
import { CertificateCard } from '../components/CertificateCard';
import { User, Award, Shield } from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile | null;
  certificates: Certificate[];
  onRefresh: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, certificates }) => {
  if (!user) return null;

  const formatUz = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num) + ' сум';
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-12 space-y-6 sm:space-y-10 font-sans text-[#191A1C]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-8 rounded-lg bg-[#E7E1D6] border border-[#D8D2C5]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-md bg-[#191A1C] flex items-center justify-center text-[#F5F3EE] font-mono font-bold text-xl">
            {user.username.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#191A1C] tracking-tight">
                {user.username}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded bg-[#FAF8F5] text-[#7A1F2B] border border-[#D8D2C5] font-mono font-bold">
                УРОВЕНЬ {user.level}
              </span>
            </div>
            <p className="text-xs text-[#5C5854] mt-1 font-mono">
              Квалификационный статус: <strong className="text-[#191A1C]">{user.levelName}</strong>
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right font-mono">
          <span className="text-[10px] text-[#6B6661] uppercase tracking-wider block">ID Профиля</span>
          <span className="text-xs text-[#191A1C]">{user.id.substring(0, 16)}...</span>
        </div>
      </div>

      {/* Metrics Grid per Section 18 */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono font-bold text-[#191A1C] uppercase tracking-widest flex items-center gap-2 border-b border-[#D8D2C5] pb-2">
          <Shield className="w-4 h-4 text-[#7A1F2B]" />
          <span>Метрики цифрового иммунитета пользователя</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-md bg-[#FAF8F5] border border-[#D8D2C5] font-mono">
            <span className="text-[10px] text-[#6B6661] uppercase tracking-wider block">Всего ситуаций</span>
            <span className="text-xl font-bold text-[#191A1C] mt-1 block">
              {user.scenariosTotal}
            </span>
          </div>

          <div className="p-4 rounded-md bg-[#FAF8F5] border border-[#D8D2C5] font-mono">
            <span className="text-[10px] text-[#6B6661] uppercase tracking-wider block">Отработано</span>
            <span className="text-xl font-bold text-[#465447] mt-1 block">
              {user.scenariosCompleted}
            </span>
          </div>

          <div className="p-4 rounded-md bg-[#FAF8F5] border border-[#D8D2C5] font-mono">
            <span className="text-[10px] text-[#6B6661] uppercase tracking-wider block">Ошибок</span>
            <span className="text-xl font-bold text-[#7A1F2B] mt-1 block">
              {user.errorCount}
            </span>
          </div>

          <div className="p-4 rounded-md bg-[#FAF8F5] border border-[#D8D2C5] font-mono">
            <span className="text-[10px] text-[#6B6661] uppercase tracking-wider block">Ср. время</span>
            <span className="text-xl font-bold text-[#191A1C] mt-1 block">
              {user.averageResponseTime}с
            </span>
          </div>

          <div className="p-4 rounded-md bg-[#FAF8F5] border border-[#D8D2C5] font-mono">
            <span className="text-[10px] text-[#6B6661] uppercase tracking-wider block">Ущерб (симуляция)</span>
            <span className="text-xs font-bold text-[#7A1F2B] mt-2 block truncate">
              {formatUz(user.simulatedLoss)}
            </span>
          </div>

          <div className="p-4 rounded-md bg-[#FAF8F5] border border-[#D8D2C5] font-mono">
            <span className="text-[10px] text-[#6B6661] uppercase tracking-wider block">Защищено</span>
            <span className="text-xs font-bold text-[#465447] mt-2 block truncate">
              {formatUz(user.protectedAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Issued Certificates */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#D8D2C5] pb-2">
          <h2 className="text-xs font-mono font-bold text-[#191A1C] uppercase tracking-widest flex items-center gap-2">
            <Award className="w-4 h-4 text-[#7A1F2B]" />
            <span>Выданные квалификационные сертификаты</span>
          </h2>
          <span className="text-xs font-mono text-[#6B6661]">
            Получено: {certificates.length} из 3
          </span>
        </div>

        {certificates.length === 0 ? (
          <div className="p-8 rounded-lg bg-[#E7E1D6]/60 border border-[#D8D2C5] text-center space-y-2">
            <Award className="w-8 h-8 text-[#8A8580] mx-auto" />
            <h4 className="text-sm font-bold text-[#191A1C]">Сертификаты пока не получены</h4>
            <p className="text-xs text-[#5C5854] max-w-md mx-auto leading-relaxed">
              Пройдите минимум 2 сценария Уровня 1 без критических ошибок для автоматической выдачи первого сертификата <strong>Anti-Scam Basic</strong>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <CertificateCard key={cert.id} certificate={cert} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
