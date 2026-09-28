import React from 'react';
import { AlertOctagon, CheckCircle2, ArrowDown, ShieldAlert, DollarSign, Smartphone, Key, Lock } from 'lucide-react';
import { ConsequenceOutcome, ConsequenceType } from '../types';

interface ConsequenceModalProps {
  consequence: ConsequenceOutcome;
  isSuccess: boolean;
  onOpenFeedback: () => void;
}

export const ConsequenceModal: React.FC<ConsequenceModalProps> = ({
  consequence,
  isSuccess,
  onOpenFeedback,
}) => {
  const formatUz = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num) + ' сум';
  };

  const getConsequenceTypeLabel = (type: ConsequenceType) => {
    const map: Record<ConsequenceType, { label: string; icon: any; color: string }> = {
      FINANCIAL_LOSS: { label: 'Финансовый ущерб', icon: DollarSign, color: 'text-rose-400' },
      DATA_LOSS: { label: 'Кража персональных данных', icon: Lock, color: 'text-amber-400' },
      ACCOUNT_COMPROMISE: { label: 'Компрометация аккаунта', icon: Key, color: 'text-orange-400' },
      DEVICE_COMPROMISE: { label: 'Заражение устройства', icon: Smartphone, color: 'text-rose-400' },
      IDENTITY_RISK: { label: 'Риск кражи цифровой личности', icon: ShieldAlert, color: 'text-amber-400' },
      PRIVACY_RISK: { label: 'Утечка приватной информации', icon: ShieldAlert, color: 'text-amber-400' },
      CREDENTIAL_EXPOSURE: { label: 'Перехват паролей и логинов', icon: Key, color: 'text-rose-400' },
      OTP_EXPOSURE: { label: 'Передача одноразовых SMS-кодов (OTP)', icon: Key, color: 'text-rose-400' },
    };
    return map[type] || { label: type, icon: ShieldAlert, color: 'text-slate-300' };
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header Alert */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-2 shadow-xl shadow-rose-950/50">
            {isSuccess ? (
              <div className="w-full h-full bg-emerald-950/80 border border-emerald-700 text-emerald-400 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9" />
              </div>
            ) : (
              <div className="w-full h-full bg-rose-950/80 border border-rose-700 text-rose-400 rounded-2xl flex items-center justify-center animate-pulse">
                <AlertOctagon className="w-9 h-9" />
              </div>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {consequence.title}
          </h2>

          <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            {consequence.summary}
          </p>
        </div>

        {/* Visual Chain of Events (Section 9) */}
        {consequence.chain && consequence.chain.length > 0 && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">
              Цепочка развития событий в симуляции:
            </h4>

            <div className="flex flex-col items-center space-y-2">
              {consequence.chain.map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className="w-full max-w-md px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs font-medium text-slate-200 shadow-sm">
                    {step}
                  </div>
                  {idx < consequence.chain.length - 1 && (
                    <ArrowDown className="w-4 h-4 text-rose-500 animate-bounce" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Simulated Damage & Impact Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Simulated Money Impact */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Симулированный ущерб
            </span>
            <div className="my-2">
              <span className={`text-xl sm:text-2xl font-mono font-bold tracking-tight ${
                consequence.simulatedLoss > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {consequence.simulatedLoss > 0 ? `-${formatUz(consequence.simulatedLoss)}` : '0 сум'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500">
              *Учебная симуляция последствий, а не реальный финансовый прогноз
            </span>
          </div>

          {/* Types of Impact */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Зафиксированные угрозы
            </span>
            <div className="space-y-1.5 pt-1">
              {consequence.types && consequence.types.length > 0 ? (
                consequence.types.map((type, idx) => {
                  const info = getConsequenceTypeLabel(type);
                  const Icon = info.icon;
                  return (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <Icon className={`w-3.5 h-3.5 ${info.color} shrink-0`} />
                      <span className="truncate">{info.label}</span>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Угроз не обнаружено, система в безопасности</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={onOpenFeedback}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-xl shadow-cyan-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>РАЗОБРАТЬ СИТУАЦИЮ И ОШИБКИ</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
