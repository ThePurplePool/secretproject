import React from 'react';
import { Globe, Lock, AlertTriangle, ArrowLeft, ArrowRight, RotateCw, HelpCircle, Shield } from 'lucide-react';
import { Scenario } from '../../types';

interface BrowserInterfaceProps {
  scenario: Scenario;
  onSelectAction: (actionId: string) => void;
}

export const BrowserInterface: React.FC<BrowserInterfaceProps> = ({ scenario, onSelectAction }) => {
  const { content, availableActions, sender } = scenario;

  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl flex flex-col font-sans">
      {/* Browser Tab & Window Bar */}
      <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-xs text-slate-400 font-medium ml-2">Вход в интернет-банк — Браузер</span>
        </div>

        <div className="flex items-center gap-1 text-slate-400 text-xs">
          <span className="px-2 py-0.5 rounded bg-slate-700/60 text-slate-300">Безопасный режим</span>
        </div>
      </div>

      {/* Browser Address Bar */}
      <div className="bg-slate-850 px-4 py-2 flex items-center gap-3 border-b border-slate-700 text-slate-300">
        <div className="flex items-center gap-2 text-slate-400">
          <ArrowLeft className="w-4 h-4 cursor-pointer hover:text-white" />
          <ArrowRight className="w-4 h-4 cursor-pointer hover:text-white" />
          <RotateCw className="w-4 h-4 cursor-pointer hover:text-white" />
        </div>

        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-amber-300 font-mono select-all truncate">
            {content.url || 'https://online-agrobank-auth-uz.cc/login'}
          </span>
          <span className="text-[10px] ml-auto px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
            Зона .cc
          </span>
        </div>
      </div>

      {/* Browser Page Viewport */}
      <div className="p-6 bg-slate-950 space-y-5 min-h-[300px]">
        {/* Consultant case box if applicable */}
        {content.consultantCase && (
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 text-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <HelpCircle className="w-4 h-4" />
              <span>КЕЙС КОНСУЛЬТАНТА: Обращение коллеги</span>
            </div>
            <p className="italic">
              {content.consultantCase.messageReceived}
            </p>
            <div className="text-[11px] text-amber-400/90 font-medium">
              Дилемма: {content.consultantCase.dilemma}
            </div>
          </div>
        )}

        {/* Fake bank login webpage mockup */}
        <div className="max-w-md mx-auto p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-sm text-white">INTERNET BANKING UZBEKISTAN</span>
            </div>
            <span className="text-[10px] text-slate-500">v4.8</span>
          </div>

          <p className="text-xs text-slate-400">
            Для входа в личный кабинет клиента введите логин и постоянный пароль организации.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Имя пользователя / Логин</label>
              <input
                disabled
                placeholder="bukhgalter_uz@corp.uz"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-300 opacity-80"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Пароль от системы Клиент-Банк</label>
              <input
                disabled
                type="password"
                value="••••••••••••"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-300 opacity-80"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Decision Actions Bar */}
      <div className="bg-slate-900 p-4 border-t border-slate-800 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Ваша рекомендация как Консультанта:</span>
          <span className="text-[11px] text-amber-400">Оцените угрозу</span>
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
