import React from 'react';
import { Wallet, ShieldCheck, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface VirtualBalanceBarProps {
  user: UserProfile | null;
}

export const VirtualBalanceBar: React.FC<VirtualBalanceBarProps> = ({ user }) => {
  if (!user) return null;

  const formatUz = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num) + ' сум';
  };

  const percentageProtected = Math.max(
    0,
    Math.round((user.currentBalance / user.initialBalance) * 100)
  );

  return (
    <div className="bg-slate-900/80 border-b border-slate-800/80 py-2.5 px-4 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Balance metric */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Виртуальный баланс
            </div>
            <div className="text-sm sm:text-base font-bold text-white font-mono tracking-tight">
              {formatUz(user.currentBalance)}
            </div>
          </div>
        </div>

        {/* Simulated Loss Indicator */}
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            user.simulatedLoss > 0
              ? 'bg-rose-950/80 border border-rose-800/50 text-rose-400'
              : 'bg-slate-800 border border-slate-700 text-slate-400'
          }`}>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Симулированный ущерб</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                симуляция
              </span>
            </div>
            <div className={`text-sm sm:text-base font-bold font-mono tracking-tight ${
              user.simulatedLoss > 0 ? 'text-rose-400' : 'text-slate-400'
            }`}>
              {user.simulatedLoss > 0 ? `-${formatUz(user.simulatedLoss)}` : '0 сум'}
            </div>
          </div>
        </div>

        {/* Protection Score */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Защищено капитала
            </div>
            <div className="text-sm sm:text-base font-bold text-cyan-300 font-mono tracking-tight">
              {formatUz(user.protectedAmount)} ({percentageProtected}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
