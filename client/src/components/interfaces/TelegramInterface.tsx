import React from 'react';
import { FileCode, MoreVertical, Search, CheckCheck, Paperclip, Send, ShieldAlert } from 'lucide-react';
import { Scenario } from '../../types';

interface TelegramInterfaceProps {
  scenario: Scenario;
  onSelectAction: (actionId: string) => void;
}

export const TelegramInterface: React.FC<TelegramInterfaceProps> = ({ scenario, onSelectAction }) => {
  const { sender, content, availableActions } = scenario;

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden border border-slate-700 bg-[#0f172a] shadow-2xl flex flex-col font-sans">
      {/* Telegram Chat Header */}
      <div className="bg-[#1e293b] px-4 py-3 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow">
              {sender.name.charAt(0)}
            </div>
            {sender.verified && (
              <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5">
                <CheckCheck className="w-3 h-3" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm text-white">{sender.name}</h3>
              {!sender.verified && (
                <span title="Неподтверждённый аккаунт" className="text-amber-400">
                  <ShieldAlert className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">{sender.handleOrPhone} • {sender.status || 'был(а) недавно'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <Search className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="p-4 sm:p-6 space-y-4 bg-[#0b1120] min-h-[300px] flex flex-col justify-end">
        {/* Date separator */}
        <div className="text-center my-1">
          <span className="px-3 py-1 rounded-full bg-slate-800/80 text-[11px] text-slate-400 border border-slate-700/50">
            Сегодня
          </span>
        </div>

        {/* Incoming message bubble */}
        <div className="max-w-[85%] self-start bg-[#1e293b] border border-slate-700/70 rounded-2xl rounded-tl-sm p-4 shadow-md space-y-3">
          <div className="text-xs font-semibold text-blue-400">
            {sender.name}
          </div>

          <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">
            {content.text}
          </p>

          {/* Attachment Preview Card */}
          {content.attachment && (
            <div className="rounded-xl p-3 bg-slate-900/90 border border-slate-700 flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 shrink-0">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
                    {content.attachment.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {content.attachment.size} • Документ
                  </div>
                </div>
              </div>

              {content.attachment.warningFlags && (
                <div className="hidden sm:block text-[10px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                  Подозрительно
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-1">
            <span>12:44</span>
            <CheckCheck className="w-3 h-3 text-blue-400" />
          </div>
        </div>

        {/* Typing indicator simulation */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 pl-2">
          <span>Собеседник печатает</span>
          <span className="w-1 h-1 rounded-full bg-slate-400 animate-ping" />
        </div>
      </div>

      {/* Decision Actions Area */}
      <div className="bg-[#1e293b] p-4 border-t border-slate-700 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Выберите ваше действие в этой ситуации:</span>
          <span className="text-[11px] text-amber-400">Время ограничено</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {availableActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onSelectAction(action.id)}
              className="text-left px-3.5 py-3 rounded-xl border transition-all duration-150 flex items-center justify-between gap-2 text-xs font-medium bg-slate-900/90 border-slate-700 hover:border-cyan-500 hover:bg-slate-800 text-slate-200 hover:text-white group"
            >
              <span>{action.label}</span>
              <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">→</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fake chat input footer */}
      <div className="bg-[#0f172a] px-4 py-2.5 border-t border-slate-800 flex items-center gap-3 text-slate-500">
        <Paperclip className="w-4 h-4" />
        <span className="text-xs text-slate-500 flex-1">Написать сообщение...</span>
        <Send className="w-4 h-4 text-blue-500" />
      </div>
    </div>
  );
};
