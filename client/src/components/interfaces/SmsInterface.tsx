import React from 'react';
import { MessageSquare, ExternalLink, ShieldAlert, Phone, MoreHorizontal } from 'lucide-react';
import { Scenario } from '../../types';

interface SmsInterfaceProps {
  scenario: Scenario;
  onSelectAction: (actionId: string) => void;
}

export const SmsInterface: React.FC<SmsInterfaceProps> = ({ scenario, onSelectAction }) => {
  const { sender, content, availableActions } = scenario;

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl overflow-hidden border-2 border-slate-700 bg-slate-950 shadow-2xl flex flex-col font-sans">
      {/* Mobile Phone Top Bar Simulation */}
      <div className="bg-slate-900 px-6 py-2 flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800">
        <span>12:45</span>
        <div className="flex items-center gap-1.5">
          <span>Beeline UZ / Ucell</span>
          <span>4G</span>
          <span>87%</span>
        </div>
      </div>

      {/* SMS Conversation Header */}
      <div className="bg-slate-900/90 px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-white">{sender.name}</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">SMS</span>
            </div>
            <p className="text-xs text-slate-400">{sender.handleOrPhone}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="p-4 sm:p-6 bg-slate-950 min-h-[280px] flex flex-col justify-end space-y-3">
        <div className="text-center text-[10px] text-slate-500">
          Сообщение от оператора связи • SIM 1
        </div>

        {/* SMS Bubble */}
        <div className="max-w-[90%] self-start bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm p-4 space-y-3 shadow-lg">
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
            {content.text}
          </p>

          {content.url && (
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-cyan-400 hover:underline cursor-pointer">
              <span className="truncate font-mono">{content.displayUrl || content.url}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-2" />
            </div>
          )}

          <div className="text-[10px] text-slate-500 text-right">
            12:45 • Доставлено
          </div>
        </div>
      </div>

      {/* Decision Actions Bar */}
      <div className="bg-slate-900 p-4 border-t border-slate-800 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Ваша реакция на это SMS:</span>
          <span className="text-[11px] text-amber-400">Требуется решение</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
