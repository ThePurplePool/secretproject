import React, { useState, useEffect } from 'react';
import { Scenario, ConsequenceOutcome, ScenarioFeedback, UserProfile } from '../types';
import { api } from '../services/api';
import { TimerBar } from '../components/TimerBar';
import { TelegramInterface } from '../components/interfaces/TelegramInterface';
import { SmsInterface } from '../components/interfaces/SmsInterface';
import { EmailInterface } from '../components/interfaces/EmailInterface';
import { BrowserInterface } from '../components/interfaces/BrowserInterface';
import { BankingInterface } from '../components/interfaces/BankingInterface';
import { SocialInterface } from '../components/interfaces/SocialInterface';
import { DeliveryInterface } from '../components/interfaces/DeliveryInterface';
import { CallInterface } from '../components/interfaces/CallInterface';
import { ConsequenceModal } from '../components/ConsequenceModal';
import { FeedbackModal } from '../components/FeedbackModal';
import { ArrowLeft, Loader2, ShieldCheck, AlertOctagon } from 'lucide-react';

interface ScenarioRunnerViewProps {
  scenarioId: string;
  onBack: () => void;
  onScenarioFinished: (user: UserProfile) => void;
  onLoadScenario: (id: string) => void;
}

export const ScenarioRunnerView: React.FC<ScenarioRunnerViewProps> = ({
  scenarioId,
  onBack,
  onScenarioFinished,
  onLoadScenario,
}) => {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Execution states
  const [isPaused, setIsPaused] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(20);
  const [activeConsequence, setActiveConsequence] = useState<ConsequenceOutcome | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeFeedback, setActiveFeedback] = useState<ScenarioFeedback | null>(null);
  const [retryId, setRetryId] = useState<string | undefined>(undefined);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setActiveConsequence(null);
    setActiveFeedback(null);
    setShowFeedbackModal(false);
    setIsPaused(false);

    Promise.all([
      api.getScenario(scenarioId),
      api.startScenario(scenarioId).catch(() => null),
    ])
      .then(([data, session]) => {
        if (isMounted) {
          setScenario(data);
          let remaining = data.timeLimit;
          if (session && session.startedAt) {
            const elapsed = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000);
            if (elapsed > 0 && elapsed < data.timeLimit) {
              remaining = data.timeLimit - elapsed;
            }
          }
          setSecondsRemaining(remaining);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Ошибка загрузки сценария');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [scenarioId]);

  const handleAction = async (actionId: string) => {
    if (!scenario) return;
    setIsPaused(true);

    const timeSpent = scenario.timeLimit - secondsRemaining;

    try {
      const res = await api.submitDecision(scenario.id, actionId, Math.max(1, timeSpent));
      setActiveConsequence(res.consequence);
      setIsSuccess(res.isSuccess);
      setActiveFeedback(res.feedback);
      setRetryId(res.retryScenarioId);
      onScenarioFinished(res.user);
    } catch (err: any) {
      alert('Ошибка отправки решения: ' + err.message);
      setIsPaused(false);
    }
  };

  const handleTimeExpired = async () => {
    if (!scenario || activeConsequence) return;
    setIsPaused(true);

    const actionToUse = scenario.timeoutActionId || '__TIMEOUT__';
    try {
      const res = await api.submitDecision(scenario.id, actionToUse, scenario.timeLimit);
      setActiveConsequence(res.consequence);
      setIsSuccess(res.isSuccess);
      setActiveFeedback(res.feedback);
      setRetryId(res.retryScenarioId);
      onScenarioFinished(res.user);
    } catch (err: any) {
      alert('Ошибка при истечении времени: ' + err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-sm text-slate-400">Инициализация симуляции инцидента...</p>
      </div>
    );
  }

  if (error || !scenario) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-2xl bg-rose-950/40 border border-rose-800 text-center space-y-4">
        <AlertOctagon className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Не удалось открыть ситуацию</h3>
        <p className="text-xs text-rose-300">{error}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700"
        >
          Вернуться назад
        </button>
      </div>
    );
  }

  const renderInterface = () => {
    switch (scenario.interface) {
      case 'telegram':
        return <TelegramInterface scenario={scenario} onSelectAction={handleAction} />;
      case 'sms':
        return <SmsInterface scenario={scenario} onSelectAction={handleAction} />;
      case 'email':
        return <EmailInterface scenario={scenario} onSelectAction={handleAction} />;
      case 'browser':
        return <BrowserInterface scenario={scenario} onSelectAction={handleAction} />;
      case 'banking':
        return <BankingInterface scenario={scenario} onSelectAction={handleAction} />;
      case 'social':
        return <SocialInterface scenario={scenario} onSelectAction={handleAction} />;
      case 'delivery':
        return <DeliveryInterface scenario={scenario} onSelectAction={handleAction} />;
      case 'call':
        return <CallInterface scenario={scenario} onSelectAction={handleAction} />;
      default:
        return <TelegramInterface scenario={scenario} onSelectAction={handleAction} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Выйти к списку</span>
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Уровень {scenario.level}:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-semibold border border-slate-700">
            {scenario.category.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Scenario Title Banner */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {scenario.title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Примите решение. Ваше действие определит исход инцидента.
          </p>
        </div>

        <div className="hidden sm:block text-right">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Сложность</span>
          <span className="text-xs font-bold text-amber-400">
            {'★'.repeat(scenario.difficulty)}{'☆'.repeat(3 - scenario.difficulty)}
          </span>
        </div>
      </div>

      {/* Timer Bar with Urgency Pressure phrases */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-lg">
        <TimerBar
          timeLimit={scenario.timeLimit}
          pressurePhrases={scenario.pressurePhrases}
          onTimeExpired={handleTimeExpired}
          isPaused={isPaused}
          onTick={(sec) => setSecondsRemaining(sec)}
        />
      </div>

      {/* Simulated Interface Body */}
      <div className="pt-2">
        {renderInterface()}
      </div>

      {/* Consequence Modal */}
      {activeConsequence && !showFeedbackModal && (
        <ConsequenceModal
          consequence={activeConsequence}
          isSuccess={isSuccess}
          onOpenFeedback={() => setShowFeedbackModal(true)}
        />
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && activeFeedback && (
        <FeedbackModal
          feedback={activeFeedback}
          retryScenarioId={retryId}
          onRetry={(id) => {
            if (id) onLoadScenario(id);
            else onBack();
          }}
          onClose={onBack}
        />
      )}
    </div>
  );
};
