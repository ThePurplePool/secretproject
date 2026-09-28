import React from 'react';
import { Shield, PhoneCall, AlertTriangle, User, Award, Settings, BookOpen, Users } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onOpenVerifyCert: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, user, onOpenAuth, onOpenVerifyCert }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#070d1e]/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate('welcome')}
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 p-0.5 shadow-lg shadow-cyan-900/40 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#070d1e] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">ANTI-SCAM</span>
                <span className="text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  UZBEKISTAN
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
                Платформа практической защиты
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigate('scenarios')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'scenarios' || currentView === 'scenario-runner'
                  ? 'bg-slate-800 text-cyan-400 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Ситуации
            </button>

            <button
              onClick={() => onNavigate('consultant')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'consultant'
                  ? 'bg-slate-800 text-amber-400 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              Консультант
            </button>

            <button
              onClick={() => onNavigate('voice')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'voice'
                  ? 'bg-slate-800 text-indigo-400 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              AI Звонок
            </button>

            <button
              onClick={() => onNavigate('report')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'report'
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                  : 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/40'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Сообщить о скаме
            </button>

            <button
              onClick={onOpenVerifyCert}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50 transition-colors ml-1"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Проверка сертификата</span>
            </button>
          </nav>

          {/* User Profile & Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <div
                  onClick={() => onNavigate('profile')}
                  className="cursor-pointer flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-semibold text-slate-200">{user.username}</span>
                    <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-medium">
                      <Award className="w-3 h-3" />
                      <span>Уровень {user.level}: {user.levelName.replace('Anti-Scam ', '')}</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700">
                    <User className="w-4 h-4" />
                  </div>
                </div>

                <button
                  onClick={onOpenAuth}
                  className="hidden sm:inline-flex text-[11px] px-2 py-1 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  Вход
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                Войти
              </button>
            )}

            <button
              onClick={() => onNavigate('admin')}
              title="Админ-панель"
              className={`p-2 rounded-lg transition-colors ${
                currentView === 'admin'
                  ? 'bg-slate-800 text-cyan-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 bg-[#070d1e] text-xs">
        <button
          onClick={() => onNavigate('scenarios')}
          className={`px-2 py-1 flex flex-col items-center ${currentView === 'scenarios' ? 'text-cyan-400' : 'text-slate-400'}`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Ситуации</span>
        </button>
        <button
          onClick={() => onNavigate('consultant')}
          className={`px-2 py-1 flex flex-col items-center ${currentView === 'consultant' ? 'text-amber-400' : 'text-slate-400'}`}
        >
          <Users className="w-4 h-4" />
          <span>Консультант</span>
        </button>
        <button
          onClick={() => onNavigate('voice')}
          className={`px-2 py-1 flex flex-col items-center ${currentView === 'voice' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>AI Звонок</span>
        </button>
        <button
          onClick={() => onNavigate('report')}
          className={`px-2 py-1 flex flex-col items-center ${currentView === 'report' ? 'text-rose-400' : 'text-slate-400'}`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Жалоба</span>
        </button>
        <button
          onClick={() => onNavigate('profile')}
          className={`px-2 py-1 flex flex-col items-center ${currentView === 'profile' ? 'text-cyan-400' : 'text-slate-400'}`}
        >
          <User className="w-4 h-4" />
          <span>Профиль</span>
        </button>
      </div>
    </header>
  );
};
