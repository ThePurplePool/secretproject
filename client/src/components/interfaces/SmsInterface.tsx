import React from 'react';
import { MessageSquare, ExternalLink, Phone, ShieldAlert } from 'lucide-react';
import { Scenario } from '../../types';

interface SmsInterfaceProps {
  scenario: Scenario;
  onSelectAction: (actionId: string) => void;
}

export const SmsInterface: React.FC<SmsInterfaceProps> = ({ scenario, onSelectAction }) => {
  const { sender, content, availableActions } = scenario;

  const handleLinkClick = () => {
    const linkAction = availableActions.find((a) => a.id.includes('link') || a.id.includes('open') || a.id.includes('pay') || a.id.includes('confirm'));
    if (linkAction) {
      onSelectAction(linkAction.id);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-xl overflow-hidden border border-slate-800 bg-[#0a0f1d] shadow-2xl flex flex-col font-sans select-none">
      {/* Mobile Phone Status Bar */}
      <div className="bg-[#0f172a] px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800">
        <span>12:45</span>
        <div className="flex items-center gap-2">
          <span>UCELL • 4G</span>
          <span>89%</span>
        </div>
      </div>

      {/* SMS Conversation Header */}
      <div className="bg-[#0f172a] px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs">
            {sender.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm text-white">{sender.name}</h3>
              <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">SMS</span>
            </div>
            <p className="text-xs text-slate-400 font-mono">{sender.handleOrPhone}</p>
          </div>
        </div>

        <div className="text-slate-400 text-xs font-mono">
          <span>SIM 1</span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="p-4 sm:p-5 bg-[#070b14] min-h-[260px] flex flex-col justify-end space-y-3">
        <div className="text-center text-[10px] font-mono text-slate-500">
          Сегодня • 12:45
        </div>

        {/* SMS Bubble */}
        <div className="max-w-[90%] self-start bg-[#162032] border border-slate-800 rounded-xl rounded-tl-sm p-4 space-y-3 shadow">
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans">
            {content.text}
          </p>

          {content.url && (
            <div
              onClick={handleLinkClick}
              title="Перейти по ссылке"
              className="p-2.5 rounded-lg bg-[#0c1424] hover:bg-[#101b30] border border-slate-700/80 flex items-center justify-between text-xs text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              <span className="truncate font-mono">{content.displayUrl || content.url}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-2" />
            </div>
          )}

          <div className="text-[10px] font-mono text-slate-400 text-right">
            Доставлено
          </div>
        </div>
      </div>

      {/* Decision Actions Bar */}
      <div className="bg-[#0f172a] p-3 border-t border-slate-800 space-y-2">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Ваша реакция на входящее SMS:</span>
          <span className="text-amber-400">Требуется решение</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {availableActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onSelectAction(action.id)}
              className="text-left px-3 py-2.5 rounded-lg border transition-colors flex items-center justify-between gap-2 text-xs font-medium bg-[#162032] border-slate-700 hover:border-cyan-500 hover:bg-[#1c2940] text-slate-200 hover:text-white cursor-pointer"
            >
              <span className="truncate">{action.label}</span>
              <span className="text-slate-400 shrink-0">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
