import React from 'react';
import { Mail, AlertCircle, ExternalLink, Archive, Trash2, Reply } from 'lucide-react';
import { Scenario } from '../../types';

interface EmailInterfaceProps {
  scenario: Scenario;
  onSelectAction: (actionId: string) => void;
}

export const EmailInterface: React.FC<EmailInterfaceProps> = ({ scenario, onSelectAction }) => {
  const { sender, content, availableActions } = scenario;

  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl flex flex-col font-sans">
      {/* Webmail Top Toolbar */}
      <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between border-b border-slate-700 text-slate-300 text-xs">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-100">Почтовый ящик</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Входящие</span>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="В архив">
            <Archive className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="Удалить">
            <Trash2 className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="Ответить">
            <Reply className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Email Body */}
      <div className="p-6 bg-slate-950 space-y-5">
        {/* Subject Header */}
        <h2 className="text-lg font-bold text-white tracking-tight">
          {content.emailSubject || scenario.title}
        </h2>

        {/* Sender details */}
        <div className="flex items-start justify-between p-3.5 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs">
              {sender.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-slate-100">{sender.name}</span>
                <span className="text-[11px] text-slate-400 font-mono select-all">&lt;{sender.handleOrPhone}&gt;</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">Кому: вам &lt;citizen@uz.net&gt;</div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Сегодня, 10:14
          </div>
        </div>

        {/* Content text */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800/80 text-sm text-slate-200 leading-relaxed space-y-4 whitespace-pre-line">
          {content.text}

          {content.url && (
            <div className="pt-2">
              <a
                href="#action"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md transition-colors"
              >
                <span>Перейти в единый реестр</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <p className="text-[11px] text-slate-400 font-mono mt-1.5">
                Целевая ссылка: {content.displayUrl || content.url}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Decision Actions Bar */}
      <div className="bg-slate-900 p-4 border-t border-slate-800 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Ваше действие в отношении этого письма:</span>
          <span className="text-[11px] text-amber-400">Сделайте выбор</span>
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
