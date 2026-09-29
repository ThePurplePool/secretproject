import React from 'react';
import { Heart, MessageCircle, Share2, TrendingUp, AlertTriangle } from 'lucide-react';
import { Scenario } from '../../types';

interface SocialInterfaceProps {
  scenario: Scenario;
  onSelectAction: (actionId: string) => void;
}

export const SocialInterface: React.FC<SocialInterfaceProps> = ({ scenario, onSelectAction }) => {
  const { sender, content, availableActions } = scenario;

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl flex flex-col font-sans">
      {/* Social Feed Header */}
      <div className="bg-slate-900 px-5 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
            {sender.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-xs text-white">{sender.name}</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">Реклама</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">{sender.handleOrPhone} • 18 мин назад</p>
          </div>
        </div>
      </div>

      {/* Social Post Content */}
      <div className="p-5 bg-slate-950 space-y-4">
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans">
          {content.text}
        </p>

        {/* Investment Banner Visual */}
        <div className="rounded-xl p-5 bg-slate-900 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider font-mono">
              <TrendingUp className="w-4 h-4" />
              <span>Национальная инвестиционная программа</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">+40% ЕЖЕНЕДЕЛЬНО</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
            «Автоматическая торговля природными ресурсами. Минимальный вклад 1 200 000 сум гарантирует возврат с гарантированной государственной надбавкой.»
          </div>

          {content.url && (
            <div className="text-[11px] font-mono text-cyan-400 text-right truncate">
              {content.displayUrl || content.url}
            </div>
          )}
        </div>

        {/* Fake Likes / Comments */}
        <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-900">
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-rose-400">
            <Heart className="w-4 h-4" />
            <span>2 419</span>
          </div>
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-white">
            <MessageCircle className="w-4 h-4" />
            <span>342 комментария</span>
          </div>
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-white ml-auto">
            <Share2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Decision Actions Bar */}
      <div className="bg-slate-900 p-4 border-t border-slate-800 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Ваша реакция на это предложение:</span>
          <span className="text-[11px] text-amber-400">Не теряйте бдительность</span>
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
