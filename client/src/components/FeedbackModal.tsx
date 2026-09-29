import React from 'react';
import { Lightbulb, AlertTriangle, ShieldCheck, Target, RefreshCw, ArrowRight, X } from 'lucide-react';
import { ScenarioFeedback } from '../types';

interface FeedbackModalProps {
  feedback: ScenarioFeedback;
  retryScenarioId?: string;
  onRetry: (scenarioId?: string) => void;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  feedback,
  retryScenarioId,
  onRetry,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans text-[#171918] animate-fadeIn">
      <div className="w-full max-w-2xl bg-white border border-[#D9D6CF] rounded-xl shadow-2xl p-5 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#D9D6CF] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#C83D2F] text-xs font-mono font-bold uppercase tracking-wider">
              <Lightbulb className="w-4 h-4" />
              <span>Экспертный разбор ситуации</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#171918] tracking-tight">
              Разбор психологических ловушек и защита
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#626560] hover:text-[#171918] p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1 & 2: User Action & Danger */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-[#F6F3EC] border border-[#D9D6CF] space-y-1.5">
            <h4 className="text-xs font-mono font-bold text-[#171918] uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#C83D2F]" />
              <span>Суть атаки</span>
            </h4>
            <p className="text-xs sm:text-sm text-[#626560] leading-relaxed">
              {feedback.userActionSummary}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#F6F3EC] border border-[#D9D6CF] space-y-1.5">
            <h4 className="text-xs font-mono font-bold text-[#171918] uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#C68A2E]" />
              <span>Главная опасность</span>
            </h4>
            <p className="text-xs sm:text-sm text-[#626560] leading-relaxed">
              {feedback.whyDangerous}
            </p>
          </div>
        </div>

        {/* 3: Psychological Tricks */}
        <div className="p-4 rounded-lg bg-[#F6F3EC] border border-[#D9D6CF] space-y-2.5">
          <h4 className="text-xs font-mono font-bold text-[#171918] uppercase tracking-wider">
            Психологические приёмы манипуляции:
          </h4>
          <div className="flex flex-wrap gap-2">
            {feedback.psychologicalTricks.map((trick, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded bg-white border border-[#D9D6CF] text-[#171918] text-xs font-mono"
              >
                • {trick}
              </span>
            ))}
          </div>
        </div>

        {/* 4: Suspicious Indicators */}
        <div className="p-4 rounded-lg bg-[#F6F3EC] border border-[#D9D6CF] space-y-2.5">
          <h4 className="text-xs font-mono font-bold text-[#171918] uppercase tracking-wider">
            Признаки опасности (Red Flags), на которые следовало обратить внимание:
          </h4>
          <ul className="space-y-1.5 text-xs text-[#626560]">
            {feedback.suspiciousIndicators.map((ind, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#C83D2F] font-bold mt-0.5">•</span>
                <span>{ind}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 5 & 6: Safe Algorithm & Real Life Rule */}
        <div className="p-4 rounded-lg bg-white border-2 border-[#47705D] space-y-2">
          <div className="flex items-center gap-2 text-[#47705D] font-mono font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#47705D] shrink-0" />
            <span>Главное правило кибергигиены в Узбекистане:</span>
          </div>
          <p className="text-xs sm:text-sm text-[#171918] leading-relaxed font-semibold">
            {feedback.realLifeRule}
          </p>
          <div className="text-xs text-[#626560] font-mono pt-1 border-t border-[#D9D6CF] mt-2">
            Рекомендуемый алгоритм: <span className="text-[#171918] font-medium">{feedback.correctActionAdvice}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          {retryScenarioId ? (
            <button
              onClick={() => onRetry(retryScenarioId)}
              className="w-full sm:flex-1 py-3 px-4 rounded-md font-semibold text-xs uppercase tracking-wider bg-[#C83D2F] hover:bg-[#a82d21] text-white shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Закрепить навык (новый вызов)</span>
            </button>
          ) : null}

          <button
            onClick={onClose}
            className="w-full sm:flex-1 py-3 px-4 rounded-md font-semibold text-xs uppercase tracking-wider bg-[#19332F] hover:bg-[#122623] text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Вернуться к сценариям</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
