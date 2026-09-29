import React from 'react';
import { Shield, Search, User, ChevronDown } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onOpenVerifyCert: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  onOpenAuth,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#F6F3EC] border-b border-[#D9D6CF] text-[#171918] safe-top">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo Brand matching Reference */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => onNavigate('welcome')}
          >
            {/* Shield with Uzbekistan flag colors */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[4px] bg-[#19332F] flex items-center justify-center text-white shadow-2xs shrink-0">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C83D2F] fill-[#C83D2F]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[13px] sm:text-[15px] leading-tight tracking-tight text-[#171918]">
                Anti-Scam
              </span>
              <span className="font-bold text-[13px] sm:text-[15px] leading-tight tracking-tight text-[#171918]">
                Uzbekistan
              </span>
            </div>
          </div>

          {/* Navigation Items (Reference style: clean editorial links) */}
          <nav className="hidden lg:flex items-center gap-7 text-[14px] font-medium text-[#171918]">
            <button
              onClick={() => onNavigate('welcome')}
              className={`pb-1 transition-colors cursor-pointer ${
                currentView === 'welcome'
                  ? 'border-b-2 border-[#19332F] font-semibold text-[#171918]'
                  : 'text-[#626560] hover:text-[#171918]'
              }`}
            >
              Главная
            </button>

            <button
              onClick={() => onNavigate('scenarios')}
              className={`pb-1 transition-colors cursor-pointer ${
                currentView === 'scenarios' || currentView === 'scenario-runner'
                  ? 'border-b-2 border-[#19332F] font-semibold text-[#171918]'
                  : 'text-[#626560] hover:text-[#171918]'
              }`}
            >
              Сценарии
            </button>

            <button
              onClick={() => onNavigate('consultant')}
              className={`pb-1 transition-colors cursor-pointer ${
                currentView === 'consultant'
                  ? 'border-b-2 border-[#19332F] font-semibold text-[#171918]'
                  : 'text-[#626560] hover:text-[#171918]'
              }`}
            >
              Знания
            </button>

            <button
              onClick={() => onNavigate('profile')}
              className={`pb-1 transition-colors cursor-pointer ${
                currentView === 'profile'
                  ? 'border-b-2 border-[#19332F] font-semibold text-[#171918]'
                  : 'text-[#626560] hover:text-[#171918]'
              }`}
            >
              Сообщество
            </button>

            <button
              onClick={() => onNavigate('report')}
              className={`pb-1 transition-colors cursor-pointer ${
                currentView === 'report'
                  ? 'border-b-2 border-[#C83D2F] font-semibold text-[#C83D2F]'
                  : 'text-[#626560] hover:text-[#C83D2F]'
              }`}
            >
              Сообщить о мошенничестве
            </button>
          </nav>

          {/* Right Action Icons (Search, Lang, Profile) */}
          <div className="flex items-center gap-2 sm:gap-4 text-[#171918]">
            <button
              onClick={() => onNavigate('scenarios')}
              title="Поиск сценариев"
              className="p-1.5 text-[#626560] hover:text-[#171918] transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Language Picker */}
            <div className="flex items-center gap-1 text-xs font-semibold cursor-pointer text-[#171918] px-1.5 py-0.5 rounded hover:bg-[#D9D6CF]/40 transition-colors">
              <span>RU</span>
              <ChevronDown className="w-3 h-3 text-[#626560]" />
            </div>

            {/* Profile Avatar Button */}
            <div
              onClick={user ? () => onNavigate('profile') : onOpenAuth}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#19332F] text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity shrink-0"
              title={user ? `Профиль: ${user.username}` : 'Войти в аккаунт'}
            >
              {user ? (
                <span className="font-mono text-xs font-bold uppercase">{user.username.substring(0, 1)}</span>
              ) : (
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation row: horizontal scrollable pills, zero wrapping or overflowing */}
      <div className="lg:hidden flex items-center overflow-x-auto scrollbar-none px-3 py-1.5 border-t border-[#D9D6CF] bg-[#F6F3EC] text-xs font-medium gap-1.5">
        <button
          onClick={() => onNavigate('welcome')}
          className={`shrink-0 px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
            currentView === 'welcome'
              ? 'bg-[#19332F] text-white font-bold'
              : 'text-[#626560] hover:text-[#171918]'
          }`}
        >
          Главная
        </button>
        <button
          onClick={() => onNavigate('scenarios')}
          className={`shrink-0 px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
            currentView === 'scenarios' || currentView === 'scenario-runner'
              ? 'bg-[#19332F] text-white font-bold'
              : 'text-[#626560] hover:text-[#171918]'
          }`}
        >
          Сценарии
        </button>
        <button
          onClick={() => onNavigate('consultant')}
          className={`shrink-0 px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
            currentView === 'consultant'
              ? 'bg-[#19332F] text-white font-bold'
              : 'text-[#626560] hover:text-[#171918]'
          }`}
        >
          Знания
        </button>
        <button
          onClick={() => onNavigate('report')}
          className={`shrink-0 px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
            currentView === 'report'
              ? 'bg-[#C83D2F] text-white font-bold'
              : 'text-[#C83D2F] hover:bg-[#F3D8D3]/40'
          }`}
        >
          Жалоба
        </button>
        <button
          onClick={() => onNavigate('profile')}
          className={`shrink-0 px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
            currentView === 'profile'
              ? 'bg-[#19332F] text-white font-bold'
              : 'text-[#626560] hover:text-[#171918]'
          }`}
        >
          Профиль
        </button>
      </div>
    </header>
  );
};
