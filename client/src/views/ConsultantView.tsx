import React, { useState } from 'react';
import { UserProfile, Certificate } from '../types';
import { api } from '../services/api';
import { Users, Award, Shield, Share2, Copy, Check, HeartHandshake, ArrowRight, UserCheck, FileText, CheckCircle2, HelpCircle } from 'lucide-react';

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

    // Evaluate answers
    const textAll = `${q1WhatHappened} ${q2SuspiciousSigns} ${q3ActionNeeded}`.toLowerCase();
    const isQualityAnalysis =
      (textAll.includes('фишинг') || textAll.includes('поддел') || textAll.includes('троян') || textAll.includes('вирус') || textAll.includes('мошенни')) &&
      (textAll.includes('домен') || textAll.includes('сертификат') || textAll.includes('sms') || textAll.includes('прав') || textAll.includes('ссылк') || textAll.includes('доступ') || textAll.includes('.apk')) &&
      (textAll.includes('не вводить') || textAll.includes('удалить') || textAll.includes('запрет') || textAll.includes('закрыть') || textAll.includes('провер'));

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

      {/* Structured Audit Modal / Section (AC-CONSULT-03) */}
      {activeAuditCase && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-amber-700/80 shadow-2xl space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <FileText className="w-5 h-5" />
              <span>Структурированный письменный анализ консультанта (AC-CONSULT-03)</span>
            </div>
            <button
              onClick={() => setActiveAuditCase(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Закрыть форму
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
            <span className="text-amber-300 font-bold uppercase tracking-wider block">Разбираемый кейс:</span>
            <p className="italic">
              {activeAuditCase === 'kamola'
                ? '«Бухгалтер Камола: искала интернет-банк в поиске, антивирус ругается на сертификат, шеф торопит отправить платёж...»'
                : '«Младший брат Дилшод: сайт кричит, что телефон заражён, скачал CyberShield, утилита просит включить Специальные возможности и чтение SMS...»'}
            </p>
          </div>

          {!auditResult ? (
            <form onSubmit={handleAuditSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white block">
                  1. Что происходит в этой ситуации? (Суть атаки и психологическая уловка) *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Опишите, какую атаку предпринимают злоумышленники..."
                  value={q1WhatHappened}
                  onChange={(e) => setQ1WhatHappened(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white block">
                  2. Какие признаки вас насторожили? (Технические и поведенческие Red Flags) *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Укажите конкретные признаки (домен, сертификат, опасные права доступа, спешка)..."
                  value={q2SuspiciousSigns}
                  onChange={(e) => setQ2SuspiciousSigns(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white block">
                  3. Что конкретно должен сделать человек прямо сейчас? (Пошаговый алгоритм защиты) *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Инструкция для человека: чего категорически нельзя делать и как поступить правильно..."
                  value={q3ActionNeeded}
                  onChange={(e) => setQ3ActionNeeded(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-500 text-white shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>ЗАВЕРШИТЬ ЭКСПЕРТИЗУ И ОТПРАВИТЬ СОВЕТ</span>
                <Check className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-800 space-y-3 animate-fadeIn text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Экспертиза успешно зачтена (Оценка: {auditResult.score}%)</h4>
              <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">{auditResult.feedback}</p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveAuditCase(null)}
                  className="px-6 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700"
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

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => handleOpenAudit('kamola')}
                className="flex-1 py-3 px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-800/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Письменный аудит</span>
              </button>

              <button
                onClick={() => onStartScenario('phishing-browser-009')}
                className="flex-1 py-3 px-3 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Симуляция</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
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

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => handleOpenAudit('dilshod')}
                className="flex-1 py-3 px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-800/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Письменный аудит</span>
              </button>

              <button
                onClick={() => onStartScenario('malicious-apk-010')}
                className="flex-1 py-3 px-3 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Симуляция</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Community Mechanic (Section 13 & AC-COMM-01..03) */}
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
