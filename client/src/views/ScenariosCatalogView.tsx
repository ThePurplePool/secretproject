import React, { useState, useEffect, useMemo } from 'react';
import { Scenario } from '../types';
import { api } from '../services/api';
import {
  Search,
  Clock,
  ArrowRight,
  Shield,
  Package,
  Landmark,
  PhoneCall,
  Mail,
  Briefcase,
  Share2,
  Loader2,
  Smartphone,
  AlertTriangle,
  ShoppingCart,
} from 'lucide-react';

interface ScenariosCatalogViewProps {
  onSelectScenario: (id: string) => void;
}

type CategoryFilter = 'all' | 'bank' | 'market' | 'delivery' | 'gov' | 'social' | 'job' | 'call' | 'email';

const CATEGORY_TABS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'bank', label: 'Банки' },
  { id: 'market', label: 'Покупки' },
  { id: 'delivery', label: 'Доставка' },
  { id: 'gov', label: 'Госуслуги' },
  { id: 'social', label: 'Соцсети' },
  { id: 'job', label: 'Работа' },
  { id: 'call', label: 'Звонки' },
  { id: 'email', label: 'Почта' },
];

export const ScenariosCatalogView: React.FC<ScenariosCatalogViewProps> = ({ onSelectScenario }) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');

  useEffect(() => {
    setIsLoading(true);
    api.getScenarios()
      .then((data) => {
        setScenarios(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const getScenarioTags = (sc: Scenario): string[] => {
    const text = (sc.title + ' ' + (sc.content.text || '') + ' ' + sc.category).toLowerCase();
    const tags: string[] = [];

    if (sc.interface === 'banking' || text.includes('банк') || text.includes('карт')) {
      tags.push('БАНКИ');
    } else if (sc.interface === 'delivery' || text.includes('посылк') || text.includes('доставк')) {
      tags.push('ДОСТАВКА');
    } else if (text.includes('налог') || text.includes('реестр') || text.includes('гос')) {
      tags.push('ГОСУСЛУГИ');
    } else if (sc.interface === 'call' || text.includes('звон')) {
      tags.push('ЗВОНКИ');
    } else if (sc.interface === 'email' || text.includes('почт')) {
      tags.push('ПОЧТА');
    } else {
      tags.push('СОЦСЕТИ');
    }

    if (sc.category === 'malware' || text.includes('apk') || text.includes('файл')) {
      tags.push('ВРЕДОНОСНЫЙ APK');
    } else if (sc.category === 'financial' || text.includes('инвест') || text.includes('доход')) {
      tags.push('ФИНАНСОВЫЙ ОБМАН');
    } else {
      tags.push('ФИШИНГ');
    }

    tags.push('ЛИЧНЫЕ ДАННЫЕ');
    return tags.slice(0, 3);
  };

  const getScenarioIcon = (sc: Scenario) => {
    const text = (sc.title + ' ' + (sc.content.text || '')).toLowerCase();
    if (sc.interface === 'call' || text.includes('звон')) {
      return (
        <div className="w-14 h-14 rounded-md bg-[#F3D8D3]/50 border border-[#C83D2F]/20 flex items-center justify-center text-[#C83D2F] shrink-0">
          <PhoneCall className="w-7 h-7" />
        </div>
      );
    }
    if (sc.interface === 'delivery' || text.includes('посылк') || text.includes('доставк')) {
      return (
        <div className="w-14 h-14 rounded-md bg-[#F6F3EC] border border-[#D9D6CF] flex items-center justify-center text-[#19332F] shrink-0">
          <Package className="w-7 h-7" />
        </div>
      );
    }
    if (text.includes('гос') || text.includes('налог') || text.includes('штраф')) {
      return (
        <div className="w-14 h-14 rounded-md bg-[#F6F3EC] border border-[#D9D6CF] flex items-center justify-center text-[#19332F] shrink-0">
          <Landmark className="w-7 h-7" />
        </div>
      );
    }
    if (sc.interface === 'email' || text.includes('почт')) {
      return (
        <div className="w-14 h-14 rounded-md bg-[#F6F3EC] border border-[#D9D6CF] flex items-center justify-center text-[#19332F] shrink-0">
          <Mail className="w-7 h-7" />
        </div>
      );
    }
    if (text.includes('olx') || text.includes('магазин') || text.includes('товар') || text.includes('покупк') || text.includes('чек') || text.includes('скидк')) {
      return (
        <div className="w-14 h-14 rounded-md bg-[#F6F3EC] border border-[#D9D6CF] flex items-center justify-center text-[#19332F] shrink-0">
          <ShoppingCart className="w-7 h-7" />
        </div>
      );
    }
    if (text.includes('инвест') || text.includes('работ') || text.includes('доход')) {
      return (
        <div className="w-14 h-14 rounded-md bg-[#F6F3EC] border border-[#D9D6CF] flex items-center justify-center text-[#C68A2E] shrink-0">
          <Briefcase className="w-7 h-7" />
        </div>
      );
    }
    // Default bank or messenger
    return (
      <div className="w-14 h-14 rounded-md bg-[#19332F]/10 border border-[#19332F]/20 flex items-center justify-center text-[#19332F] shrink-0">
        <Shield className="w-7 h-7" />
      </div>
    );
  };

  const matchesCategory = (sc: Scenario, cat: CategoryFilter): boolean => {
    if (cat === 'all') return true;
    const text = (sc.title + ' ' + (sc.content.text || '') + ' ' + sc.category).toLowerCase();
    switch (cat) {
      case 'bank':
        return sc.interface === 'banking' || text.includes('банк') || text.includes('карт') || text.includes('счет') || text.includes('счёт');
      case 'market':
        return text.includes('olx') || text.includes('магазин') || text.includes('товар') || text.includes('покупк') || text.includes('чек') || text.includes('скидк') || text.includes('объявлен');
      case 'delivery':
        return sc.interface === 'delivery' || text.includes('посылк') || text.includes('доставк') || text.includes('курьер');
      case 'gov':
        return text.includes('гос') || text.includes('налог') || text.includes('реестр') || text.includes('субсид') || text.includes('штраф');
      case 'social':
        return sc.interface === 'telegram' || sc.interface === 'social' || text.includes('telegram') || text.includes('канал') || text.includes('чат');
      case 'job':
        return text.includes('работ') || text.includes('ваканс') || text.includes('инвест') || text.includes('доход') || text.includes('заработ');
      case 'call':
        return sc.interface === 'call' || text.includes('звон') || text.includes('оператор');
      case 'email':
        return sc.interface === 'email' || text.includes('почт') || text.includes('письм');
      default:
        return true;
    }
  };

  const filteredScenarios = useMemo(() => {
    return scenarios.filter((sc) => {
      const matchCat = matchesCategory(sc, selectedCategory);
      if (!matchCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const titleMatch = sc.title.toLowerCase().includes(q);
      const textMatch = (sc.content.text || '').toLowerCase().includes(q);
      const catMatch = sc.category.toLowerCase().includes(q);
      return titleMatch || textMatch || catMatch;
    });
  }, [scenarios, selectedCategory, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-10 space-y-5 sm:space-y-8 font-sans text-[#171918]">
      {/* Header Section matching reference Panel 2 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 border-b border-[#D9D6CF] pb-4 sm:pb-6">
        <div className="space-y-1 sm:space-y-1.5">
          <div className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-[#C83D2F] uppercase">
            ТРЕНИРУЙТЕСЬ НА РЕАЛЬНЫХ СИТУАЦИЯХ
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#171918] tracking-tight">
            Выберите сценарий
          </h1>
          <p className="text-xs sm:text-sm text-[#626560] max-w-xl">
            Каждый сценарий основан на реальных методах мошенников в Узбекистане.
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#626560]" />
          <input
            type="text"
            placeholder="Поиск сценариев..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D9D6CF] rounded-md text-xs text-[#171918] placeholder-[#626560] focus:outline-none focus:border-[#19332F] transition-colors"
          />
        </div>
      </div>

      {/* Filter Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORY_TABS.map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#19332F] text-white shadow-xs'
                  : 'bg-white border border-[#D9D6CF] text-[#626560] hover:text-[#171918] hover:bg-[#F6F3EC]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Scenarios List */}
      {isLoading ? (
        <div className="min-h-[360px] flex flex-col items-center justify-center gap-3 text-[#626560] font-mono text-xs">
          <Loader2 className="w-6 h-6 text-[#19332F] animate-spin" />
          <span>Загрузка учебных сценариев...</span>
        </div>
      ) : filteredScenarios.length === 0 ? (
        <div className="min-h-[300px] bg-white border border-[#D9D6CF] rounded-md p-10 flex flex-col items-center justify-center text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-[#C68A2E]" />
          <h3 className="font-bold text-base text-[#171918]">Сценарии не найдены</h3>
          <p className="text-xs text-[#626560] max-w-sm">
            По вашему запросу не найдено подходящих ситуаций. Попробуйте сбросить фильтр или строку поиска.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-md bg-[#19332F] text-white text-xs font-semibold cursor-pointer"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredScenarios.map((sc, index) => {
            const numStr = String(index + 1).padStart(2, '0');
            const tags = getScenarioTags(sc);
            const timeFormatted = `00:${String(sc.timeLimit).padStart(2, '0')}`;

            return (
              <div
                key={sc.id}
                onClick={() => onSelectScenario(sc.id)}
                className="group bg-white border border-[#D9D6CF] hover:border-[#19332F] rounded-md p-4 sm:p-5 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
              >
                {/* Left: Number + Thumbnail + Info */}
                <div className="flex items-start sm:items-center gap-4 sm:gap-6 flex-1 min-w-0">
                  {/* Number */}
                  <span className="font-mono text-xl sm:text-2xl font-bold text-[#171918] w-8 shrink-0">
                    {numStr}
                  </span>

                  {/* Thumbnail / Icon container */}
                  {getScenarioIcon(sc)}

                  {/* Details */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <h3 className="font-bold text-base text-[#171918] group-hover:text-[#19332F] transition-colors leading-snug">
                      {sc.title}
                    </h3>
                    <p className="text-xs text-[#626560] line-clamp-1 leading-relaxed">
                      {sc.content.text || sc.content.callDetails?.simulatedAudioText || 'Отработка навыка выявления социальной инженерии'}
                    </p>

                    {/* Tag Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded bg-[#F6F3EC] border border-[#D9D6CF] text-[#171918] font-mono text-[10px] uppercase font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Timer + Action button */}
                <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#D9D6CF]">
                  {/* Timer */}
                  <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-[#171918] bg-[#F6F3EC] px-2.5 py-1.5 rounded border border-[#D9D6CF]">
                    <Clock className="w-3.5 h-3.5 text-[#626560]" />
                    <span>{timeFormatted}</span>
                  </div>

                  {/* Arrow Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectScenario(sc.id);
                    }}
                    className="w-10 h-10 rounded-md bg-[#19332F] group-hover:bg-[#C83D2F] text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                    title="Начать сценарий"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
