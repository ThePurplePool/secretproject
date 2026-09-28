import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle, Flame } from 'lucide-react';
import { ScenarioPressurePhrase } from '../types';

interface TimerBarProps {
  timeLimit: number;
  pressurePhrases: ScenarioPressurePhrase[];
  onTimeExpired: () => void;
  isPaused: boolean;
  onTick?: (secondsLeft: number) => void;
}

export const TimerBar: React.FC<TimerBarProps> = ({
  timeLimit,
  pressurePhrases,
  onTimeExpired,
  isPaused,
  onTick,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(timeLimit);
  const [activePressure, setActivePressure] = useState<string | null>(null);

  useEffect(() => {
    setSecondsLeft(timeLimit);
    setActivePressure(null);
  }, [timeLimit]);

  useEffect(() => {
    if (isPaused) return;

    if (secondsLeft <= 0) {
      onTimeExpired();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (onTick) onTick(next);

        // Find applicable pressure phrase
        const phrase = pressurePhrases
          .slice()
          .sort((a, b) => b.atSecondsRemaining - a.atSecondsRemaining)
          .find((p) => next <= p.atSecondsRemaining);

        if (phrase) {
          setActivePressure(phrase.text);
        }

        if (next <= 0) {
          clearInterval(timer);
          onTimeExpired();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, isPaused, onTimeExpired, pressurePhrases, onTick]);

  const percentage = Math.max(0, Math.min(100, (secondsLeft / timeLimit) * 100));

  // Pressure color styling
  let colorClass = 'from-cyan-500 to-blue-600';
  let badgeColor = 'bg-cyan-950 text-cyan-400 border-cyan-800';
  let statusText = 'Время на анализ ситуации';

  if (secondsLeft <= 5) {
    colorClass = 'from-rose-600 to-red-700 animate-pulse';
    badgeColor = 'bg-rose-950 text-rose-300 border-rose-800 animate-bounce';
    statusText = 'КРИТИЧЕСКИЙ ДЕФИЦИТ ВРЕМЕНИ!';
  } else if (secondsLeft <= 12) {
    colorClass = 'from-amber-500 to-orange-600';
    badgeColor = 'bg-amber-950 text-amber-300 border-amber-800';
    statusText = 'Психологическое давление нарастает';
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${secondsLeft <= 5 ? 'text-rose-400 animate-spin' : 'text-slate-400'}`} />
          <span className="font-medium text-slate-300">{statusText}</span>
        </div>

        <div className="flex items-center gap-2">
          {secondsLeft <= 5 && <Flame className="w-4 h-4 text-rose-500 animate-pulse" />}
          <span className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
            00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-1000 ease-linear`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Dynamic Psychological Pressure Warning */}
      {activePressure && (
        <div className="flex items-start gap-2.5 px-3 py-2 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-200 text-xs animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300">Сообщение злоумышленника: </span>
            <span className="italic">{activePressure}</span>
          </div>
        </div>
      )}
    </div>
  );
};
