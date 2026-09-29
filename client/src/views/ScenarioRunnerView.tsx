import React, { useState, useEffect } from 'react';
import { Scenario, ConsequenceOutcome, ScenarioFeedback, UserProfile } from '../types';
import { api } from '../services/api';
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
import {
  ArrowLeft,
  Loader2,
  Clock,
  Shield,
  FileText,
  ExternalLink,
  Landmark,
  MessageSquare,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  Trash2,
} from 'lucide-react';

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
  const [allScenarios, setAllScenarios] = useState<Scenario[]>([]);

  // Simulation telemetry & execution states
  const [isPaused, setIsPaused] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(20);
  const [activePressurePhrase, setActivePressurePhrase] = useState<string | null>(null);
  const [activeConsequence, setActiveConsequence] = useState<ConsequenceOutcome | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeFeedback, setActiveFeedback] = useState<ScenarioFeedback | null>(null);
  const [retryId, setRetryId] = useState<string | undefined>(undefined);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Load scenarios list to determine scenario index and total
  useEffect(() => {
    api.getScenarios().then((data) => setAllScenarios(data)).catch(() => {});
  }, []);

  const currentIndex = Math.max(
    1,
    allScenarios.findIndex((s) => s.id === scenarioId) + 1
  );
  const totalCount = Math.max(20, allScenarios.length);
  const progressPercent = Math.min(100, Math.round((currentIndex / totalCount) * 100));

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setActiveConsequence(null);
    setActiveFeedback(null);
    setShowFeedbackModal(false);
    setIsPaused(false);
    setActivePressurePhrase(null);

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

  // Integrated countdown timer
  useEffect(() => {
    if (!scenario || isPaused || !!activeConsequence) return;

    if (secondsRemaining <= 0) {
      handleTimeExpired();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        const next = prev - 1;

        // Check for pressure phrases
        if (scenario.pressurePhrases) {
          const phrase = scenario.pressurePhrases
            .slice()
            .sort((a, b) => b.atSecondsRemaining - a.atSecondsRemaining)
            .find((p) => next <= p.atSecondsRemaining);

          if (phrase) {
            setActivePressurePhrase(phrase.text);
          }
        }

        if (next <= 0) {
          clearInterval(timer);
          handleTimeExpired();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [scenario, isPaused, activeConsequence, secondsRemaining]);

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

  const handleNextScenario = () => {
    const nextIdx = allScenarios.findIndex((s) => s.id === scenarioId) + 1;
    if (nextIdx > 0 && nextIdx < allScenarios.length) {
      onLoadScenario(allScenarios[nextIdx].id);
    } else {
      onBack();
    }
  };

  const handleRetry = () => {
    setActiveConsequence(null);
    setShowFeedbackModal(false);
    setIsPaused(false);
    if (scenario) {
      setSecondsRemaining(scenario.timeLimit);
    }
  };

  const getActionDetails = (action: any) => {
    const label = action.label.toLowerCase();
    const id = action.id.toLowerCase();

    if (action.type === 'critical_danger' || id.includes('file') || id.includes('download') || id.includes('open') || label.includes('скачать') || label.includes('открыть')) {
      return {
        icon: <FileText className="w-5 h-5 text-[#C83D2F]" />,
        iconBg: 'bg-[#F3D8D3]/70 border-[#C83D2F]/30',
        title: action.label,
        subtitle: 'Просмотреть содержимое файла или вложения',
      };
    }

    if (id.includes('link') || label.includes('ссылк') || label.includes('перейти')) {
      return {
        icon: <ExternalLink className="w-5 h-5 text-[#C68A2E]" />,
        iconBg: 'bg-[#F6F3EC] border-[#D9D6CF]',
        title: action.label,
        subtitle: 'Открыть сайт или внешнюю ссылку из сообщения',
      };
    }

    if (id.includes('bank') || id.includes('app') || id.includes('check') || label.includes('банк') || label.includes('проверить')) {
      return {
        icon: <Landmark className="w-5 h-5 text-[#19332F]" />,
        iconBg: 'bg-[#19332F]/10 border-[#19332F]/20',
        title: action.label,
        subtitle: 'Проверить информацию в официальном приложении банка',
      };
    }

    if (id.includes('delete') || id.includes('ignore') || label.includes('удал') || label.includes('игнор')) {
      return {
        icon: <Trash2 className="w-5 h-5 text-[#47705D]" />,
        iconBg: 'bg-[#47705D]/10 border-[#47705D]/20',
        title: action.label,
        subtitle: 'Удалить подозрительное сообщение без открытия файла',
      };
    }

    if (action.type === 'report' || id.includes('report') || id.includes('block') || label.includes('сообщ') || label.includes('заблок')) {
      return {
        icon: <ShieldAlert className="w-5 h-5 text-[#47705D]" />,
        iconBg: 'bg-[#47705D]/10 border-[#47705D]/20',
        title: action.label,
        subtitle: 'Изолировать отправителя и уведомить службу безопасности',
      };
    }

    return {
      icon: <MessageSquare className="w-5 h-5 text-[#171918]" />,
      iconBg: 'bg-[#F6F3EC] border-[#D9D6CF]',
      title: action.label,
      subtitle: 'Задать уточняющие вопросы отправителю',
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-4 font-sans text-[#171918]">
        <Loader2 className="w-8 h-8 text-[#19332F] animate-spin" />
        <p className="text-xs font-mono text-[#626560]">Подготовка симуляции инцидента...</p>
      </div>
    );
  }

  if (error || !scenario) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-lg bg-white border border-[#C83D2F] text-center space-y-4 font-sans text-[#171918]">
        <AlertTriangle className="w-10 h-10 text-[#C83D2F] mx-auto" />
        <h3 className="text-base font-bold text-[#171918]">Не удалось загрузить сценарий</h3>
        <p className="text-xs text-[#626560]">{error}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-md bg-[#19332F] text-white text-xs font-semibold hover:bg-[#122623] cursor-pointer"
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

  const timerFormatted = `00:${String(secondsRemaining).padStart(2, '0')}`;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-8 space-y-4 sm:space-y-6 font-sans text-[#171918]">
      {/* Top Header / Breadcrumb navigation */}
      <div className="flex items-center justify-between border-b border-[#D9D6CF] pb-3 sm:pb-4 gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-[#626560] hover:text-[#171918] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>К списку</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-white border border-[#D9D6CF] text-[#171918] text-[10px] sm:text-[11px] font-mono uppercase font-medium">
            {scenario.category}
          </span>
          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-[#19332F] text-white text-[10px] sm:text-[11px] font-mono uppercase font-bold">
            Уровень {scenario.level}
          </span>
        </div>
      </div>

      {/* Main 2-Column Desktop Grid matching Panels 4 & 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Authentic Mobile Smartphone Mockup (Panel 4) */}
        <div className="lg:col-span-5 flex justify-center">
          {renderInterface()}
        </div>

        {/* Right Column: Decision Board (Panel 5) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Progress bar and Telemetry Clock */}
          <div className="bg-white border border-[#D9D6CF] rounded-lg p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-mono text-[#626560]">
              <span className="font-bold text-[#171918]">Сценарий {currentIndex} из {totalCount}</span>
              <span>{progressPercent}% пройдено</span>
            </div>
            <div className="w-full h-1 bg-[#F6F3EC] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#19332F] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Timer Counter */}
            <div className="flex items-center justify-between pt-2 border-t border-[#D9D6CF]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C83D2F]" />
                <span className="text-xs font-medium text-[#626560]">Время на решение:</span>
              </div>
              <div className="font-mono text-base font-bold text-[#171918] bg-[#F6F3EC] px-3 py-1 rounded border border-[#D9D6CF]">
                {timerFormatted}
              </div>
            </div>

            {/* Pressure phrase if active */}
            {activePressurePhrase && (
              <div className="p-2.5 rounded bg-[#F3D8D3]/50 border border-[#C83D2F]/30 flex items-center gap-2 text-xs text-[#C83D2F] font-medium animate-pulse">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{activePressurePhrase}</span>
              </div>
            )}
          </div>

          {/* Decision Question Headline */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171918] tracking-tight">
              Что вы сделаете?
            </h2>
            <p className="text-sm text-[#626560]">
              Выберите наиболее безопасное действие в данной ситуации.
            </p>
          </div>

          {/* Action Cards List */}
          <div className="space-y-3">
            {scenario.availableActions.map((action) => {
              const details = getActionDetails(action);

              return (
                <div
                  key={action.id}
                  onClick={() => handleAction(action.id)}
                  className="group bg-white border border-[#D9D6CF] hover:border-[#19332F] rounded-lg p-4 transition-all cursor-pointer flex items-center justify-between gap-4 shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    {/* Action Icon */}
                    <div
                      className={`w-10 h-10 rounded-md border flex items-center justify-center shrink-0 ${details.iconBg}`}
                    >
                      {details.icon}
                    </div>

                    {/* Action Titles */}
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="font-bold text-sm text-[#171918] group-hover:text-[#19332F] transition-colors truncate">
                        {details.title}
                      </div>
                      <div className="text-xs text-[#626560] line-clamp-1">
                        {details.subtitle}
                      </div>
                    </div>
                  </div>

                  {/* Right Chevron */}
                  <div className="w-8 h-8 rounded-md bg-[#F6F3EC] group-hover:bg-[#19332F] group-hover:text-white text-[#626560] flex items-center justify-center transition-colors shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Simulation Safe Notice */}
          <div className="flex items-center gap-2 pt-2 text-xs font-mono text-[#626560]">
            <Shield className="w-4 h-4 text-[#47705D] shrink-0" />
            <span>Это симуляция. Никакие реальные данные не передаются.</span>
          </div>
        </div>
      </div>

      {/* Consequence Modal (Panel 6 - Danger / Panel 7 - Safe) */}
      {activeConsequence && !showFeedbackModal && (
        <ConsequenceModal
          consequence={activeConsequence}
          isSuccess={isSuccess}
          scenarioIndex={currentIndex}
          totalScenarios={totalCount}
          onOpenFeedback={() => setShowFeedbackModal(true)}
          onRetry={handleRetry}
          onNext={handleNextScenario}
        />
      )}

      {/* Feedback Modal (Detailed breakdown) */}
      {showFeedbackModal && activeFeedback && (
        <FeedbackModal
          feedback={activeFeedback}
          retryScenarioId={retryId}
          onRetry={(id) => {
            if (id) onLoadScenario(id);
            else handleRetry();
          }}
          onClose={onBack}
        />
      )}
    </div>
  );
};
