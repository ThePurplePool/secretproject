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
    <div className="w-full max-w-3xl mx-auto rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl flex flex-col font-sans">
      {/* Browser Tab & Window Bar */}
      <div className="bg-slate-900 px-3 py-2 flex items-center justify-between border-b border-slate-800 select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-t-lg bg-slate-950 border-t border-x border-slate-800 text-xs text-slate-200">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="max-w-[200px] truncate font-medium">Интернет-банкинг для юрлиц</span>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-500 hidden sm:block">
          Chromium v128 • Desktop View
        </div>
      </div>

      {/* Browser Address Bar - Realistic Chrome, NO spoiler alerts or badges */}
      <div className="bg-slate-900 px-3 py-1.5 flex items-center gap-2 border-b border-slate-800 text-slate-300">
        <div className="flex items-center gap-1 text-slate-400">
          <button className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white" title="Назад">
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white" title="Вперед">
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white" title="Обновить">
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-xs">
          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-200 font-mono select-all truncate">
            {content.url || 'https://online-agrobank-auth-uz.cc/login'}
          </span>
        </div>
      </div>

      {/* Browser Page Viewport */}
      <div className="p-6 bg-slate-950 space-y-5 min-h-[320px]">
        {/* Consultant case box if applicable */}
        {content.consultantCase && (
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-amber-400 font-semibold">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Служебная записка / Запрос от коллеги:</span>
            </div>
            <p className="italic text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800">
              «{content.consultantCase.messageReceived}»
            </p>
            <div className="text-[11px] text-slate-400 font-mono">
              Контекст задачи: <span className="text-slate-200">{content.consultantCase.dilemma}</span>
            </div>
          </div>
        )}

        {/* Fake bank login webpage mockup */}
        <div className="max-w-md mx-auto p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold text-xs">
                IB
              </div>
              <div>
                <div className="font-bold text-xs text-white">INTERNET BANKING UZBEKISTAN</div>
                <div className="text-[10px] text-slate-500">Система дистанционного банковского обслуживания</div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500">SSL 256-bit</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Для входа в личный кабинет организации введите логин уполномоченного лица и пароль от системы ДБО.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-medium">Логин главного бухгалтера / директора</label>
              <input
                disabled
                placeholder="bukhgalter_uz@corp.uz"
                className="w-full px-3 py-2 text-xs rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-medium">Постоянный пароль доступа</label>
              <input
                disabled
                type="password"
                value="••••••••••••"
                className="w-full px-3 py-2 text-xs rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono"
              />
            </div>
            <button
              disabled
              className="w-full py-2 rounded bg-emerald-700/80 text-white font-medium text-xs opacity-90 cursor-not-allowed"
            >
              Войти в защищенную зону
            </button>
          </div>
        </div>
      </div>

      {/* Decision Actions Bar */}
      <div className="bg-slate-900 p-4 border-t border-slate-800 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between font-mono">
          <span>Решение оператора / Экспертная рекомендация:</span>
          <span className="text-[11px] text-cyan-400 font-normal">Выберите протокол реагирования</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {availableActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onSelectAction(action.id)}
              className="text-left px-3.5 py-3 rounded-lg border transition-all duration-150 flex items-center justify-between gap-2 text-xs font-medium bg-slate-950 border-slate-800 hover:border-cyan-500 hover:bg-slate-850 text-slate-200 hover:text-white group cursor-pointer"
            >
              <span>{action.label}</span>
              <span className="text-slate-600 group-hover:text-cyan-400 transition-colors font-mono">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
