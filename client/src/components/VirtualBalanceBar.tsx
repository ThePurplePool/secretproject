import React from 'react';
import { UserProfile } from '../types';

interface VirtualBalanceBarProps {
  user: UserProfile | null;
}

export const VirtualBalanceBar: React.FC<VirtualBalanceBarProps> = ({ user }) => {
  if (!user) return null;

  const formatUz = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num) + ' UZS';
  };

  const percentageProtected = Math.max(
    0,
    Math.round((user.currentBalance / user.initialBalance) * 100)
  );

  return (
    <div className="bg-[#F6F3EC] border-b border-[#D9D6CF] px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-mono text-[#171918]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
        {/* Left: Operational Environment Status */}
        <div className="flex items-center gap-1.5 shrink-0 text-[10px] sm:text-[11px]">
          <span className="inline-block w-2 h-2 rounded-full bg-[#47705D] shrink-0" />
          <span className="text-[#171918] font-bold uppercase tracking-wider">
            Учебный режим
          </span>
          <span className="hidden md:inline text-[#D9D6CF]">•</span>
          <span className="hidden md:inline text-[#626560]">
            Защита от социальной инженерии
          </span>
        </div>

        {/* Right: Telemetry Metrics */}
        <div className="flex items-center gap-2.5 sm:gap-6 text-[10px] sm:text-[11px] shrink-0">
          <div className="flex items-center gap-1">
            <span className="text-[#626560]">БАЛАНС:</span>
            <span className="text-[#171918] font-bold font-mono">{formatUz(user.currentBalance)}</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[#626560]">УЩЕРБ:</span>
            <span className={user.simulatedLoss > 0 ? 'text-[#C83D2F] font-bold font-mono' : 'text-[#626560] font-mono'}>
              {user.simulatedLoss > 0 ? `-${formatUz(user.simulatedLoss)}` : '0 UZS'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1">
            <span className="text-[#626560]">ИММУНИТЕТ:</span>
            <span className="text-[#47705D] font-bold font-mono">{percentageProtected}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
