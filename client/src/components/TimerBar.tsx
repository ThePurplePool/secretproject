import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
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

  // Controlled tension state colors per design system
  let barBg = 'bg-[#191A1C]';
  let badgeStyle = 'bg-[#E7E1D6] text-[#191A1C] border-[#D8D2C5]';
  let statusText = 'Оценка ситуации';

  if (secondsLeft <= 5) {
    barBg = 'bg-[#7A1F2B]';
    badgeStyle = 'bg-[#7A1F2B] text-white border-[#7A1F2B]';
    statusText = 'Критический дефицит времени';
  } else if (secondsLeft <= 12) {
    barBg = 'bg-[#B87918]';
    badgeStyle = 'bg-[#B87918] text-white border-[#B87918]';
    statusText = 'Искусственная спешка';
  }

  return (
    <div className="w-full space-y-2 font-mono">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[#6B6661]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#191A1C]">
            {statusText}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded border transition-colors ${badgeStyle}`}>
            00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
          </span>
        </div>
      </div>

      {/* Progress track */}
      <div className="h-2 w-full bg-[#D8D2C5] rounded-full overflow-hidden">
        <div
          className={`h-full ${barBg} transition-all duration-1000 ease-linear rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Dynamic Psychological Pressure Warning */}
      {activePressure && (
        <div className="flex items-start gap-2 p-2.5 rounded bg-[#FAF8F5] border border-[#D8D2C5] text-xs font-sans text-[#191A1C]">
          <AlertTriangle className="w-3.5 h-3.5 text-[#B87918] shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-semibold text-[#B87918] font-mono text-[11px] uppercase mr-1">
              Психологический прессинг:
            </span>
            <span className="italic text-[#5C5854]">«{activePressure}»</span>
          </div>
        </div>
      )}
    </div>
  );
};
