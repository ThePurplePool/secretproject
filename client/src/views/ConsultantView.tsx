import React, { useState } from 'react';
import { UserProfile, Certificate } from '../types';
import { api } from '../services/api';
import { Award, Check, ArrowRight, UserCheck, FileText, CheckCircle2 } from 'lucide-react';

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

  // Structured response form state (AC-CONSULT-03)
  const [activeAuditCase, setActiveAuditCase] = useState<string | null>(null);
  const [q1WhatHappened, setQ1WhatHappened] = useState('');
  const [q2SuspiciousSigns, setQ2SuspiciousSigns] = useState('');
  const [q3ActionNeeded, setQ3ActionNeeded] = useState('');
  const [auditResult, setAuditResult] = useState<{
    score: number;
    feedback: string;
    isPassed: boolean;
  } | null>(null);

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

  const handleOpenAudit = (caseId: string) => {
    setActiveAuditCase(caseId);
    setQ1WhatHappened('');
    setQ2SuspiciousSigns('');
    setQ3ActionNeeded('');
    setAuditResult(null);
  };

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!q1WhatHappened.trim() || !q2SuspiciousSigns.trim() || !q3ActionNeeded.trim()) {
      alert('Пожалуйста, ответьте на все 3 вопроса структурированного анализа');
      return;
    }

    const fullAnalysis = `${q1WhatHappened} ${q2SuspiciousSigns} ${q3ActionNeeded}`.toLowerCase();
    const isQualityAnalysis =
      (fullAnalysis.includes('домен') || fullAnalysis.includes('ссылк') || fullAnalysis.includes('сертификат') || fullAnalysis.includes('доступ') || fullAnalysis.includes('apk') || fullAnalysis.includes('sms')) &&
      (fullAnalysis.includes('нельзя') || fullAnalysis.includes('проверить') || fullAnalysis.includes('запретить') || fullAnalysis.includes('банк') || fullAnalysis.includes('удалить'));

    const score = isQualityAnalysis ? 100 : 75;

    // Send successful consultant decision to backend
    if (user && activeAuditCase) {
      const scenarioId = activeAuditCase === 'kamola' ? 'phishing-browser-009' : 'malicious-apk-010';
      const actionId = activeAuditCase === 'kamola' ? 'advise_check_domain_and_use_app' : 'explain_accessibility_danger';
      await api.submitDecision(scenarioId, actionId, 25);
      onRefreshProfile();
    }

    setAuditResult({
      score,
      feedback: isQualityAnalysis
        ? 'Отличный структурированный разбор! Вы точно выявили вектор атаки, обратили внимание на ключевые технические индикаторы и сформулировали защитный регламент для человека.'
        : 'Хороший анализ ситуации. Экспертный совет: в рекомендациях всегда требуйте не просто закрыть окно, но и проверить официальные каналы или настройки безопасности.',
      isPassed: true,
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-12 space-y-6 sm:space-y-10 font-sans text-[#191A1C]">
      {/* Top Banner */}
      <div className="p-4 sm:p-8 rounded-lg bg-[#E7E1D6] border border-[#D8D2C5] space-y-3 sm:space-y-4">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#7A1F2B] font-semibold border-b border-[#D8D2C5] pb-1">
          <Award className="w-3.5 h-3.5" />
          <span>Уровень 3: Anti-Scam Consultant</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#191A1C] tracking-tight">
          От обучаемого — к эксперту и защитнику своего окружения
        </h1>

        <p className="text-sm sm:text-base text-[#5C5854] max-w-2xl leading-relaxed">
          Главная цель платформы: человек перестаёт быть только потенциальной жертвой. Получив статус Консультанта, вы разбираете реальные дилеммы коллег и родственников, помогая предотвратить финансовые потери.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-[#191A1C]">
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-[#465447]" />
            Разбор дилемм коллег и близких
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-[#465447]" />
            Официальный статус Консультанта
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-[#465447]" />
            Защита минимум 5 человек в сообществе
          </span>
        </div>
      </div>

      {/* Structured Audit Modal / Section (AC-CONSULT-03) */}
      {activeAuditCase && (
        <div className="p-6 sm:p-8 rounded-lg bg-[#FAF8F5] border-2 border-[#7A1F2B] space-y-5 animate-fadeIn shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-[#D8D2C5]">
            <div className="flex items-center gap-2 text-[#7A1F2B] font-mono font-bold text-xs uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Структурированный письменный анализ консультанта (AC-CONSULT-03)</span>
            </div>
            <button
              onClick={() => setActiveAuditCase(null)}
              className="text-xs font-mono text-[#6B6661] hover:text-[#191A1C] cursor-pointer"
            >
              Закрыть форму
            </button>
          </div>

          <div className="p-4 rounded bg-[#E7E1D6] border border-[#D8D2C5] text-xs text-[#191A1C] space-y-1">
            <span className="font-mono font-bold uppercase tracking-wider text-[#7A1F2B] block">Разбираемый кейс:</span>
            <p className="italic">
              {activeAuditCase === 'kamola'
                ? '«Бухгалтер Камола: искала интернет-банк в поиске, антивирус ругается на сертификат, шеф торопит отправить платёж...»'
                : '«Младший брат Дилшод: сайт кричит, что телефон заражён, скачал CyberShield, утилита просит включить Специальные возможности и чтение SMS...»'}
            </p>
          </div>

          {!auditResult ? (
            <form onSubmit={handleAuditSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#191A1C] uppercase tracking-wider block">
                  1. Что происходит в этой ситуации? (Суть атаки и психологическая уловка) *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Опишите, какую атаку предпринимают злоумышленники..."
                  value={q1WhatHappened}
                  onChange={(e) => setQ1WhatHappened(e.target.value)}
                  className="w-full px-3.5 py-2 rounded bg-white border border-[#D8D2C5] text-[#191A1C] text-xs focus:border-[#7A1F2B] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#191A1C] uppercase tracking-wider block">
                  2. Какие признаки вас насторожили? (Технические и поведенческие Red Flags) *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Укажите конкретные признаки (домен, сертификат, опасные права доступа, спешка)..."
                  value={q2SuspiciousSigns}
                  onChange={(e) => setQ2SuspiciousSigns(e.target.value)}
                  className="w-full px-3.5 py-2 rounded bg-white border border-[#D8D2C5] text-[#191A1C] text-xs focus:border-[#7A1F2B] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#191A1C] uppercase tracking-wider block">
                  3. Что конкретно должен сделать человек прямо сейчас? (Пошаговый алгоритм защиты) *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Инструкция для человека: чего категорически нельзя делать и как поступить правильно..."
                  value={q3ActionNeeded}
                  onChange={(e) => setQ3ActionNeeded(e.target.value)}
                  className="w-full px-3.5 py-2 rounded bg-white border border-[#D8D2C5] text-[#191A1C] text-xs focus:border-[#7A1F2B] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded font-mono font-bold text-xs uppercase tracking-wider bg-[#7A1F2B] hover:bg-[#621822] text-white shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>ЗАВЕРШИТЬ ЭКСПЕРТИЗУ И ОТПРАВИТЬ СОВЕТ</span>
                <Check className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="p-5 rounded bg-[#FAF8F5] border-2 border-[#465447] space-y-3 animate-fadeIn text-center">
              <CheckCircle2 className="w-8 h-8 text-[#465447] mx-auto" />
              <h4 className="text-base font-bold text-[#191A1C]">Экспертиза успешно зачтена (Оценка: {auditResult.score}%)</h4>
              <p className="text-xs text-[#5C5854] max-w-lg mx-auto leading-relaxed">{auditResult.feedback}</p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveAuditCase(null)}
                  className="px-6 py-2 rounded font-mono text-xs font-semibold bg-[#191A1C] text-white hover:bg-[#7A1F2B] cursor-pointer"
                >
                  Вернуться к списку
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Consultant Specific Scenarios */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono font-bold text-[#191A1C] uppercase tracking-widest border-b border-[#D8D2C5] pb-2">
          Кейсы Консультанта (помощь другим людям)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Case 1 */}
          <div className="p-6 rounded-lg bg-[#FAF8F5] border border-[#D8D2C5] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-[#E7E1D6] text-[#7A1F2B] font-bold">
                  КЕЙС: БУХГАЛТЕРИЯ НА РАБОТЕ
                </span>
                <span className="text-[#6B6661]">30 сек</span>
              </div>

              <h3 className="font-bold text-base text-[#191A1C]">
                Поддельный интернет-банк в поиске (Коллега Камола)
              </h3>

              <p className="text-xs text-[#5C5854] leading-relaxed italic bg-[#E7E1D6] p-3.5 rounded border border-[#D8D2C5]">
                «Я набрала в поисковике название банка, кликнула на первую строчку. Выглядит как обычно, но антивирус выдал предупреждение о сертификате. Мне срочно надо оплатить счёт шефа, вводить пароль?»
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 font-mono">
              <button
                onClick={() => handleOpenAudit('kamola')}
                className="flex-1 py-2.5 px-3 rounded text-xs font-bold bg-[#E7E1D6] hover:bg-[#D8D2C5] text-[#191A1C] border border-[#D8D2C5] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Письменный аудит</span>
              </button>

              <button
                onClick={() => onStartScenario('phishing-browser-009')}
                className="flex-1 py-2.5 px-3 rounded text-xs font-bold bg-[#191A1C] hover:bg-[#7A1F2B] text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Симуляция</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Case 2 */}
          <div className="p-6 rounded-lg bg-[#FAF8F5] border border-[#D8D2C5] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-[#E7E1D6] text-[#7A1F2B] font-bold">
                  КЕЙС: СЕМЬЯ И СМАРТФОН
                </span>
                <span className="text-[#6B6661]">30 сек</span>
              </div>

              <h3 className="font-bold text-base text-[#191A1C]">
                Троян «CyberShield» (Младший брат Дилшод)
              </h3>

              <p className="text-xs text-[#5C5854] leading-relaxed italic bg-[#E7E1D6] p-3.5 rounded border border-[#D8D2C5]">
                «Мне вылезло предупреждение, что телефон заражён. Я скачал утилиту, а она просит включить "Специальные возможности" (Accessibility) и читать SMS. Нажимать "Разрешить"?»
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 font-mono">
              <button
                onClick={() => handleOpenAudit('dilshod')}
                className="flex-1 py-2.5 px-3 rounded text-xs font-bold bg-[#E7E1D6] hover:bg-[#D8D2C5] text-[#191A1C] border border-[#D8D2C5] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Письменный аудит</span>
              </button>

              <button
                onClick={() => onStartScenario('malicious-apk-010')}
                className="flex-1 py-2.5 px-3 rounded text-xs font-bold bg-[#191A1C] hover:bg-[#7A1F2B] text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Симуляция</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Community Protection Section */}
      <div className="p-6 sm:p-8 rounded-lg bg-[#FAF8F5] border border-[#D8D2C5] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D8D2C5] pb-5">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#7A1F2B] font-bold mb-1">
              Миссия цифровой солидарности
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#191A1C] tracking-tight">
              «Теперь вы можете защитить ещё 5 человек»
            </h2>
            <p className="text-xs sm:text-sm text-[#5C5854] mt-1 max-w-xl leading-relaxed">
              Без рекламы и спама. Поделитесь персональной защитной ссылкой, чтобы близкие прошли проверку на распознавание телефонного и онлайн-мошенничества.
            </p>
          </div>

          <div className="flex items-center gap-3 p-3 rounded bg-[#E7E1D6] border border-[#D8D2C5] shrink-0 font-mono">
            <UserCheck className="w-6 h-6 text-[#191A1C]" />
            <div>
              <div className="text-[10px] text-[#6B6661] uppercase font-semibold">Обучено вами:</div>
              <div className="text-lg font-bold text-[#191A1C]">{user?.invitedCount || 0} из 5 чел.</div>
            </div>
          </div>
        </div>

        {/* Quick Audience Share Buttons */}
        <div className="space-y-3 font-mono">
          <label className="text-xs font-bold text-[#191A1C] block uppercase tracking-wider">
            Кого вы хотите обезопасить в первую очередь?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {['Семья', 'Друзья', 'Коллеги', 'Одногруппники', 'Соседи'].map((aud) => (
              <button
                key={aud}
                onClick={() => handleShareTo(aud)}
                className={`py-2 px-3 rounded border text-xs font-semibold transition-colors cursor-pointer ${
                  invitedAudience === aud
                    ? 'bg-[#191A1C] border-[#191A1C] text-white'
                    : 'bg-white border-[#D8D2C5] text-[#5C5854] hover:border-[#191A1C] hover:text-[#191A1C]'
                }`}
              >
                {aud}
              </button>
            ))}
          </div>

          {invitedAudience && (
            <p className="text-xs text-[#465447] flex items-center gap-1.5 animate-fadeIn font-sans">
              <Check className="w-3.5 h-3.5" />
              <span>Целевая группа выбрана: <strong>{invitedAudience}</strong>. Скопируйте персональную ссылку ниже:</span>
            </p>
          )}
        </div>

        {/* Invitation Link Input */}
        <div className="space-y-1.5 font-mono">
          <label className="text-xs font-bold text-[#6B6661] uppercase tracking-wider block">
            Ваша персональная защитная ссылка:
          </label>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={referralUrl}
              className="flex-1 px-3.5 py-2.5 rounded bg-white border border-[#D8D2C5] text-xs text-[#191A1C] focus:outline-none select-all font-mono"
            />
            <button
              onClick={copyLink}
              className="px-5 py-2.5 rounded font-mono text-xs font-bold uppercase tracking-wider bg-[#191A1C] hover:bg-[#7A1F2B] text-white transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
