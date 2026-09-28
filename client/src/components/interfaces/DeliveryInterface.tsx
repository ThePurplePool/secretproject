import React from 'react';
import { Package, Truck, AlertTriangle, ExternalLink, Clock } from 'lucide-react';
import { Scenario } from '../../types';

interface DeliveryInterfaceProps {
  scenario: Scenario;
  onSelectAction: (actionId: string) => void;
}

export const DeliveryInterface: React.FC<DeliveryInterfaceProps> = ({ scenario, onSelectAction }) => {
  const { sender, content, availableActions } = scenario;

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl flex flex-col font-sans">
      {/* Delivery Tracking Header */}
      <div className="bg-slate-900 px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">{sender.name}</h3>
            <p className="text-xs text-slate-400">Служба экспресс-доставки почтовых отправлений</p>
          </div>
        </div>

        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Задержка
        </span>
      </div>

      {/* Package Tracking Body */}
      <div className="p-6 bg-slate-950 space-y-4">
        {/* Status tracker visual */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Трек-номер:</span>
            <span className="font-mono font-bold text-white">UZ-8891402</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <div className="h-0.5 flex-1 bg-emerald-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <div className="h-0.5 flex-1 bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
          </div>

          <div className="text-xs text-amber-300 flex items-center gap-1.5 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Статус: Приостановлено на терминале (требуется оплата сбора 24 500 сум)</span>
          </div>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
          {content.text}
        </p>

        {content.url && (
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono truncate">{content.displayUrl || content.url}</span>
            <span className="text-amber-400 flex items-center gap-1 font-semibold ml-2">
              Оплатить 24 500 сум <ExternalLink className="w-3.5 h-3.5" />
            </span>
          </div>
        )}
      </div>

      {/* Decision Actions Bar */}
      <div className="bg-slate-900 p-4 border-t border-slate-800 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Ваше решение по посылке:</span>
          <span className="text-[11px] text-amber-400">Оцените риск</span>
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
