import React from 'react';
import { Shield, ArrowRight, Zap, Target, Award, Users, AlertTriangle } from 'lucide-react';
import { UserProfile } from '../types';

interface WelcomeViewProps {
  onStartFirstScenario: () => void;
  onExploreCatalog: () => void;
  user: UserProfile | null;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onStartFirstScenario,
  onExploreCatalog,
  user,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-16 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold uppercase tracking-wider shadow-inner">
          <Shield className="w-3.5 h-3.5" />
          <span>Практический тренажёр защиты граждан</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
          Добро пожаловать в <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
            Anti-Scam Uzbekistan
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Здесь вас не будут учить по скучным учебникам. Вы попадёте в реалистичные искусственные ситуации, которые прямо сейчас используют мошенники, и примете решение под давлением времени.
        </p>

        {/* CTA Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartFirstScenario}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-base bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-xl shadow-cyan-900/40 hover:scale-105 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>НАЧАТЬ ПЕРВУЮ СИТУАЦИЮ</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={onExploreCatalog}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-sm bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Каталог сценариев</span>
          </button>
        </div>
      </div>

      {/* Core Principle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 relative overflow-hidden group hover:border-cyan-800/60 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-white">Реалистичные интерфейсы</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Симуляции Telegram, SMS, звонков, интернет-банков и маркетплейсов. Никаких абстрактных тестов — только интерфейсы, с которыми вы сталкиваетесь каждый день.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 relative overflow-hidden group hover:border-amber-800/60 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-white">Психологическое давление</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ограничение времени, угрозы блокировок счетов и ложные обещания выгоды. Тренируйте устойчивость перед манипуляциями социальной инженерии.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 relative overflow-hidden group hover:border-emerald-800/60 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-white">Сертификация от Basic до Consultant</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Пройдите путь от распознавания базовых уловок до уровня Эксперта-Консультанта, способного защитить близких, семью и коллег на работе.
          </p>
        </div>
      </div>

      {/* Real-time platform impact notice */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-cyan-400 shrink-0" />
          <div className="text-xs text-slate-300">
            <strong className="text-white">Главный принцип: </strong>
            Мы не оцениваем «правильно/неправильно». Мы показываем реальные последствия каждого вашего клика.
          </div>
        </div>

        <div className="text-xs font-mono text-cyan-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          Виртуальный фонд: 10 000 000 сум
        </div>
      </div>
    </div>
  );
};
