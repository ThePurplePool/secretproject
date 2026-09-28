import React from 'react';
import { UserProfile, Certificate } from '../types';
import { CertificateCard } from '../components/CertificateCard';
import { User, Award, Shield, Clock, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';

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
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-700 p-0.5 shadow-xl">
            <div className="w-full h-full bg-[#070d1e] rounded-[14px] flex items-center justify-center text-cyan-400">
              <User className="w-8 h-8" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {user.username}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold">
                Уровень {user.level}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Квалификация: <strong className="text-slate-200">{user.levelName}</strong>
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">ID Профиля</span>
          <span className="font-mono text-xs text-slate-400">{user.id.substring(0, 16)}...</span>
        </div>
      </div>

      {/* Metrics Grid per Section 18 */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>Метрики цифрового иммунитета</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Всего ситуаций</span>
            <span className="text-xl font-bold text-white font-mono mt-1 block">
              {user.scenariosTotal}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Пройдено</span>
            <span className="text-xl font-bold text-emerald-400 font-mono mt-1 block">
              {user.scenariosCompleted}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Ошибок</span>
            <span className="text-xl font-bold text-rose-400 font-mono mt-1 block">
              {user.errorCount}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Ср. время ответа</span>
            <span className="text-xl font-bold text-cyan-300 font-mono mt-1 block">
              {user.averageResponseTime} с
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Симулир. ущерб</span>
            <span className="text-sm font-bold text-rose-400 font-mono mt-2 block truncate">
              {formatUz(user.simulatedLoss)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Защищено</span>
            <span className="text-sm font-bold text-emerald-400 font-mono mt-2 block truncate">
              {formatUz(user.protectedAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Issued Certificates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Выданные сертификаты и цифровые бейджи</span>
          </h2>
          <span className="text-xs text-slate-400">
            Получено: {certificates.length} из 3
          </span>
        </div>

        {certificates.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <Award className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">Сертификаты ещё не получены</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Пройдите минимум 2 сценария Уровня 1 (Распознай) без критических ошибок для автоматической выдачи первого сертификата <strong>Anti-Scam Basic</strong>.
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
