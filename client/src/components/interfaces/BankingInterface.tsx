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
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Включить «Специальные возможности»?</h4>
              <p className="text-xs text-slate-400 font-mono">Служба: CyberShield Uzbekistan (Update.apk)</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-amber-400 font-mono text-[11px] uppercase tracking-wider">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span>Запрос полного контроля над устройством:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1 text-[11px] leading-relaxed">
              <li>Просмотр экрана и отслеживание действий пользователя</li>
              <li>Чтение входящих SMS-сообщений и системных уведомлений банка</li>
              <li>Выполнение жестов и нажатий от имени пользователя</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 text-xs font-medium">
            <span className="text-[11px] text-slate-500 font-mono mr-auto">Android Security Subsystem</span>
            <div className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              Запретить
            </div>
            <div className="px-3.5 py-1.5 rounded-lg bg-rose-900/80 border border-rose-700 text-rose-100 font-semibold shadow-sm">
              Разрешить
            </div>
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
