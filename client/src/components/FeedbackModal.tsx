import React from 'react';
import { Lightbulb, AlertTriangle, ShieldCheck, Target, RefreshCw, ArrowRight } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Title */}
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Lightbulb className="w-4 h-4" />
            <span>Экспертный анализ инцидента</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Где была ловушка и как формируется защита?
          </h2>
        </div>

        {/* 1 & 2: User Action & Danger */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-rose-400" />
              <span>Суть атаки</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {feedback.userActionSummary}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>В чём главная опасность?</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {feedback.whyDangerous}
            </p>
          </div>
        </div>

        {/* 3: Psychological Tricks */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Психологические приёмы манипуляции:
          </h4>
          <div className="flex flex-wrap gap-2">
            {feedback.psychologicalTricks.map((trick, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800/80 text-purple-300 text-xs font-medium"
              >
                🧠 {trick}
              </span>
            ))}
          </div>
        </div>

        {/* 4: Suspicious Indicators */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Подозрительные признаки (Red Flags), на которые следовало обратить внимание:
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {feedback.suspiciousIndicators.map((ind, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-400 mt-0.5">•</span>
                <span>{ind}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 5 & 6: Safe Algorithm & Real Life Rule */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-slate-950 border border-cyan-800/60 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Золотое правило кибергигиены в Узбекистане:</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            {feedback.realLifeRule}
          </p>
          <p className="text-xs text-slate-400 italic pt-1">
            Правильный алгоритм: {feedback.correctActionAdvice}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          {retryScenarioId && (
            <button
              onClick={() => onRetry(retryScenarioId)}
              className="w-full sm:flex-1 py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>ЗАКРЕПИТЬ НАВЫК: НОВЫЙ ВЫЗОВ</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full sm:flex-1 py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>ВЕРНУТЬСЯ К КАТАЛОГУ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
