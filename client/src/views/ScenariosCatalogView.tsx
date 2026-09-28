import React, { useState, useEffect } from 'react';
import { Scenario } from '../types';
import { api } from '../services/api';
import {
  MessageSquare,
  Mail,
  Globe,
  Smartphone,
  PhoneCall,
  Package,
  Share2,
  Clock,
  Shield,
  Loader2,
  CheckCircle,
  Play,
} from 'lucide-react';

interface ScenariosCatalogViewProps {
  onSelectScenario: (id: string) => void;
}

export const ScenariosCatalogView: React.FC<ScenariosCatalogViewProps> = ({ onSelectScenario }) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');

  useEffect(() => {
    setIsLoading(true);
    const lvl = selectedLevel === 'all' ? undefined : selectedLevel;
    api.getScenarios(lvl)
      .then((data) => {
        setScenarios(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [selectedLevel]);

  const getInterfaceIcon = (type: string) => {
    switch (type) {
      case 'telegram':
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'sms':
        return <Smartphone className="w-4 h-4 text-cyan-400" />;
      case 'email':
        return <Mail className="w-4 h-4 text-purple-400" />;
      case 'browser':
        return <Globe className="w-4 h-4 text-amber-400" />;
      case 'banking':
        return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'call':
        return <PhoneCall className="w-4 h-4 text-rose-400" />;
      case 'delivery':
        return <Package className="w-4 h-4 text-orange-400" />;
      case 'social':
      default:
        return <Share2 className="w-4 h-4 text-pink-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Каталог ситуаций социальной инженерии
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Выберите сценарий для прохождения реалистичной симуляции под давлением времени.
          </p>
        </div>

        {/* Level Filter Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setSelectedLevel('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedLevel === 'all' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Все (10)
          </button>
          <button
            onClick={() => setSelectedLevel(1)}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedLevel === 1 ? 'bg-blue-900/80 text-blue-300 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Уровень 1: Распознай
          </button>
          <button
            onClick={() => setSelectedLevel(2)}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedLevel === 2 ? 'bg-indigo-900/80 text-indigo-300 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Уровень 2: Защити
          </button>
          <button
            onClick={() => setSelectedLevel(3)}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedLevel === 3 ? 'bg-amber-900/80 text-amber-300 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Уровень 3: Консультант
          </button>
        </div>
      </div>

      {/* Grid of Scenarios */}
      {isLoading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {scenarios.map((sc) => (
            <div
              key={sc.id}
              className="rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-5 flex flex-col justify-between space-y-4 hover:shadow-xl hover:shadow-cyan-950/20 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300">
                    {getInterfaceIcon(sc.interface)}
                    <span className="capitalize">{sc.interface}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {sc.timeLimit}с
                    </span>
                    <span className="text-[11px] font-bold text-amber-400">
                      {'★'.repeat(sc.difficulty)}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-base text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                  {sc.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {sc.content.text || sc.content.callDetails?.simulatedAudioText || 'Интерактивная проверка на проникновение и манипуляцию'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 font-medium">
                  Уровень: <span className="text-slate-200">Lvl {sc.level}</span>
                </div>

                <button
                  onClick={() => onSelectScenario(sc.id)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer group-hover:scale-105"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Пройти</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
