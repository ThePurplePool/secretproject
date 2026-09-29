import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Shield,
  Lightbulb,
  Check,
  Laptop,
  RotateCcw,
} from 'lucide-react';
import { ConsequenceOutcome } from '../types';

interface ConsequenceModalProps {
  consequence: ConsequenceOutcome;
  isSuccess: boolean;
  onOpenFeedback: () => void;
  onRetry?: () => void;
  onNext?: () => void;
  scenarioIndex?: number;
  totalScenarios?: number;
}

export const ConsequenceModal: React.FC<ConsequenceModalProps> = ({
  consequence,
  isSuccess,
  onOpenFeedback,
  onRetry,
  onNext,
  scenarioIndex = 1,
  totalScenarios = 20,
}) => {
  const formatUz = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num) + ' UZS';
  };

  const progressPercent = Math.min(100, Math.round((scenarioIndex / totalScenarios) * 100));

  // If Danger state (Failure / Error) -> Panel 6 style
  if (!isSuccess) {
    return (
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans text-white animate-fadeIn">
        <div className="w-full max-w-2xl bg-[#171918] border border-[#2F3230] rounded-xl shadow-2xl p-5 sm:p-8 space-y-6">
          {/* Progress Track */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#9E9E9E]">
              <span>Сценарий {scenarioIndex} из {totalScenarios}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-1 bg-[#2F3230] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C83D2F] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Alert Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#C83D2F]">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Ошибка</h2>
            </div>
            <p className="text-base sm:text-lg font-bold text-white">
              {consequence.title.replace(/^[⚠️🛡️\s]+/, '') || 'Вы открыли вложение.'}
            </p>
          </div>

          {/* Visual Laptop Mockup with simulated alert */}
          <div className="bg-[#1F2220] border border-[#333734] rounded-lg p-4 sm:p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-md bg-[#C83D2F]/15 border border-[#C83D2F]/30 flex items-center justify-center text-[#C83D2F] shrink-0">
              <Laptop className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#C83D2F] font-bold">
                Вредоносная активность зафиксирована
              </div>
              <p className="text-xs text-[#C5C8C6] leading-relaxed">
                Симулятор обнаружил запуск несанкционированного скрипта и попытку перехвата сессии мобильного банкинга.
              </p>
            </div>
          </div>

          {/* Two-Column Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Left: What happened */}
            <div className="bg-[#1F2220] border border-[#333734] rounded-lg p-4 space-y-1.5">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Что произошло?
              </h4>
              <p className="text-xs sm:text-sm text-[#A6AAA7] leading-relaxed">
                {consequence.summary ||
                  'Вложение могло содержать вредоносный код, который получает доступ к вашему устройству и данным.'}
              </p>
            </div>

            {/* Right: Simulated Damage */}
            <div className="bg-[#1F2220] border border-[#333734] rounded-lg p-4 flex flex-col justify-between space-y-1.5">
              <h4 className="text-[11px] font-mono text-[#9E9E9E] uppercase tracking-wider">
                Симулированный потенциальный ущерб
              </h4>
              <div>
                <span className="font-mono text-2xl sm:text-3xl font-bold text-[#C83D2F] tracking-tight">
                  -{formatUz(consequence.simulatedLoss || 1500000)}
                </span>
              </div>
              <span className="text-[10px] text-[#717572] font-mono">
                *Учебная оценка финансовых рисков инцидента
              </span>
            </div>
          </div>

          {/* Attack Chain */}
          {consequence.chain && consequence.chain.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#9E9E9E]">
                Цепочка атаки:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {consequence.chain.map((step, idx) => (
                  <div
                    key={idx}
                    className="bg-[#1F2220] border border-[#333734] rounded-md p-2.5 text-center flex flex-col items-center justify-center min-h-[56px]"
                  >
                    <span className="text-[10px] font-mono text-[#C83D2F] font-bold mb-0.5">
                      0{idx + 1}
                    </span>
                    <span className="text-[11px] text-white leading-tight font-medium line-clamp-2">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={onOpenFeedback}
              className="w-full sm:w-1/2 py-3 px-4 rounded-md border border-[#444845] hover:border-white bg-[#1F2220] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer text-center"
            >
              Разобрать ситуацию
            </button>
            <button
              onClick={onRetry || onOpenFeedback}
              className="w-full sm:w-1/2 py-3 px-4 rounded-md bg-[#C83D2F] hover:bg-[#a82d21] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Попробовать ещё раз</span>
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Safe State (Success) -> Panel 7 style
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans text-[#171918] animate-fadeIn">
      <div className="w-full max-w-2xl bg-white border border-[#D9D6CF] rounded-xl shadow-2xl p-5 sm:p-8 space-y-6">
        {/* Progress Track */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#626560]">
            <span>Сценарий {scenarioIndex} из {totalScenarios}</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-1 bg-[#F6F3EC] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#47705D] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Success Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 text-[#47705D]">
            <CheckCircle2 className="w-7 h-7 shrink-0" />
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Правильное решение!</h2>
          </div>
          <p className="text-sm sm:text-base text-[#626560] leading-relaxed">
            {consequence.summary ||
              'Вы не стали открывать вложение и проверили информацию через официальный канал.'}
          </p>
        </div>

        {/* What You Correctly Noticed */}
        <div className="bg-[#F6F3EC] border border-[#D9D6CF] rounded-lg p-4 sm:p-5 space-y-3">
          <h4 className="text-xs font-mono font-bold text-[#171918] uppercase tracking-wider">
            Что вы правильно заметили?
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-[#171918]">
            <li className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-[#47705D] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span>Подозрительное сообщение с искусственным нагнетанием паники и таймером</span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-[#47705D] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span>Отказ от скачивания непроверенного вложения (.pdf.apk)</span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-[#47705D] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span>Проверка информации через официальные каналы или приложение банка</span>
            </li>
          </ul>
        </div>

        {/* Important Rule Callout */}
        <div className="bg-white border border-[#D9D6CF] rounded-lg p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
          <div className="w-8 h-8 rounded-md bg-[#C68A2E]/10 border border-[#C68A2E]/30 flex items-center justify-center text-[#C68A2E] shrink-0">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h5 className="text-xs font-mono font-bold text-[#171918] uppercase tracking-wider">
              Важно помнить:
            </h5>
            <p className="text-xs sm:text-sm text-[#626560] leading-relaxed">
              Банки и госорганы Узбекистана никогда не отправляют файлы для установки в мессенджерах и не требуют срочной разблокировки через сторонние документы.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={onOpenFeedback}
            className="w-full sm:w-1/2 py-3 px-4 rounded-md border border-[#D9D6CF] hover:border-[#171918] bg-white text-[#171918] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer text-center"
          >
            Подробный разбор
          </button>
          <button
            onClick={onNext || onOpenFeedback}
            className="w-full sm:w-1/2 py-3 px-4 rounded-md bg-[#19332F] hover:bg-[#122623] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>Следующий сценарий</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
