import React from 'react';
import { ShieldAlert, AlertOctagon, HelpCircle, Smartphone, Check, X } from 'lucide-react';
import { Scenario } from '../../types';

interface BankingInterfaceProps {
  scenario: Scenario;
  onSelectAction: (actionId: string) => void;
}

export const BankingInterface: React.FC<BankingInterfaceProps> = ({ scenario, onSelectAction }) => {
  const { content, availableActions } = scenario;

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl overflow-hidden border-2 border-slate-700 bg-slate-950 shadow-2xl flex flex-col font-sans">
      {/* Mobile top status bar */}
      <div className="bg-slate-900 px-6 py-2 flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800">
        <span>12:47</span>
        <div className="flex items-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Android 15 OS</span>
          <span>91%</span>
        </div>
      </div>

      {/* Screen Body */}
      <div className="p-6 bg-slate-950 min-h-[320px] space-y-4">
        {/* Consultant case box if present */}
        {content.consultantCase && (
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 text-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <HelpCircle className="w-4 h-4" />
              <span>КЕЙС КОНСУЛЬТАНТА: Обращение родственника ({content.consultantCase.victimName})</span>
            </div>
            <p className="italic">
              {content.consultantCase.messageReceived}
            </p>
            <div className="text-[11px] text-amber-400/90 font-medium">
              Дилемма: {content.consultantCase.dilemma}
            </div>
          </div>
        )}

        {/* Fake OS Dangerous Permission Dialog */}
        <div className="p-5 rounded-2xl bg-slate-900 border-2 border-rose-900/60 shadow-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Включить «Специальные возможности»?</h4>
              <p className="text-xs text-slate-400">Приложение: CyberShield Uzbekistan (Update.apk)</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-rose-300 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-rose-400">
              <AlertOctagon className="w-4 h-4" />
              <span>Запрашиваемые критические разрешения ОС:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1 text-[11px]">
              <li>Просмотр и управление экраном (автоматические нажатия кнопок)</li>
              <li>Чтение входящих SMS-сообщений и кодов подтверждения (OTP)</li>
              <li>Работа поверх других банковских приложений</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 text-xs">
            <button className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700">
              Отклонить
            </button>
            <button className="px-4 py-2 rounded-xl bg-rose-700 text-white font-semibold hover:bg-rose-600 shadow-md">
              Включить для CyberShield
            </button>
          </div>
        </div>
      </div>

      {/* Decision Actions Bar */}
      <div className="bg-slate-900 p-4 border-t border-slate-800 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Ваша инструкция как Эксперта:</span>
          <span className="text-[11px] text-amber-400">Защитите близкого</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {availableActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onSelectAction(action.id)}
              className="text-left px-3.5 py-3 rounded-xl border transition-all duration-150 flex items-center justify-between gap-2 text-xs font-medium bg-slate-950 border-slate-700/80 hover:border-cyan-500 hover:bg-slate-800 text-slate-200 hover:text-white group"
            >
              <span>{action.label}</span>
              <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
