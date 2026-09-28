import React, { useState } from 'react';
import { UserProfile, Certificate } from '../types';
import { api } from '../services/api';
import { Users, Award, Shield, Share2, Copy, Check, HeartHandshake, ArrowRight, UserCheck } from 'lucide-react';

interface ConsultantViewProps {
  user: UserProfile | null;
  certificates: Certificate[];
  onStartScenario: (id: string) => void;
  onRefreshProfile: () => void;
}

export const ConsultantView: React.FC<ConsultantViewProps> = ({
  user,
  certificates,
  onStartScenario,
  onRefreshProfile,
}) => {
  const [copied, setCopied] = useState(false);
  const [invitedAudience, setInvitedAudience] = useState<string | null>(null);

  const isConsultant = user && user.level >= 3;
  const consultantCert = certificates.find((c) => c.levelNumber === 3);

  const referralUrl = `${window.location.origin}/?ref=${user?.referralCode || 'UZ-PROTECT'}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTo = async (audienceName: string) => {
    setInvitedAudience(audienceName);
    if (user?.referralCode) {
      await api.trackInvite(user.referralCode);
      onRefreshProfile();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Top Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/60 border border-amber-800/50 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950 border border-amber-700/80 text-amber-300 text-xs font-bold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" />
          <span>Уровень 3: Anti-Scam Consultant</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          От обучаемого — к Эксперту и Защитнику окружения
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
          Главная идея платформы: человек перестаёт быть только жертвой или пассивным учеником. Получив статус Консультанта, вы разбираете реальные инциденты других людей и защищаете свою семью, коллег и друзей.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-amber-300/90 font-medium">
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-amber-400" />
            Разбор дилемм родственников и коллег
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-amber-400" />
            Официальный статус Антискам-Консультанта
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-amber-400" />
            Защита минимум 5 человек в сообществе
          </span>
        </div>
      </div>

      {/* Consultant Specific Scenarios */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-400" />
          <span>Кейсы Консультанта (помощь другим людям)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Case 1 */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-semibold">
                  Кейс: Бухгалтерия на работе
                </span>
                <span className="text-slate-500 font-mono">30 сек</span>
              </div>

              <h3 className="font-bold text-base text-white">
                Поддельный интернет-банк в поиске (Коллега Камола)
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                «Я набрала в поисковике название банка, кликнула на первую строчку. Выглядит как обычно, но антивирус выдал предупреждение о сертификате. Мне срочно надо оплатить счёт шефа, вводить пароль?»
              </p>
            </div>

            <button
              onClick={() => onStartScenario('phishing-browser-009')}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Консультировать коллегу</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Case 2 */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-semibold">
                  Кейс: Семья и смартфон
                </span>
                <span className="text-slate-500 font-mono">30 сек</span>
              </div>

              <h3 className="font-bold text-base text-white">
                Троян «CyberShield» (Младший брат Дилшод)
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                «Мне вылезло предупреждение, что телефон заражён. Я скачал утилиту, а она просит включить "Специальные возможности" (Accessibility) и читать SMS. Нажимать "Разрешить"?»
              </p>
            </div>

            <button
              onClick={() => onStartScenario('malicious-apk-010')}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Защитить брата от трояна</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Community Mechanic (Section 13) */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
              <HeartHandshake className="w-4 h-4" />
              <span>Образовательная миссия сообщества</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              «Теперь вы можете помочь защитить ещё 5 человек»
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Без финансового MLM и навязчивой рекламы. Пригласите близких пройти проверку социальной инженерии.
            </p>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
            <UserCheck className="w-8 h-8 text-cyan-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Обучено вами:</div>
              <div className="text-xl font-bold text-white font-mono">{user?.invitedCount || 0} из 5 чел.</div>
            </div>
          </div>
        </div>

        {/* Quick Audience Share Buttons */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 block">
            Кого вы хотите обезопасить в первую очередь?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {['Семья', 'Друзья', 'Коллеги', 'Одногруппники', 'Сообщество'].map((aud) => (
              <button
                key={aud}
                onClick={() => handleShareTo(aud)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  invitedAudience === aud
                    ? 'bg-cyan-900/60 border-cyan-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                👥 {aud}
              </button>
            ))}
          </div>

          {invitedAudience && (
            <p className="text-xs text-emerald-400 flex items-center gap-1.5 animate-fadeIn">
              <Check className="w-3.5 h-3.5" />
              <span>Целевая группа выбрана: <strong>{invitedAudience}</strong>. Скопируйте персональную ссылку ниже:</span>
            </p>
          )}
        </div>

        {/* Invitation Link Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 block">
            Ваша защитная ссылка для приглашения:
          </label>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={referralUrl}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none select-all"
            />
            <button
              onClick={copyLink}
              className="px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
