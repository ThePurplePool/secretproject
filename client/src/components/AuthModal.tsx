import React, { useState } from 'react';
import { api } from '../services/api';
import { UserProfile, Certificate } from '../types';
import { LogIn, UserPlus, X, Shield, Lock, User, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile, certificates: Certificate[]) => void;
  currentUser: UserProfile | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let res;
      if (mode === 'register') {
        if (username.length < 3) {
          throw new Error('Имя пользователя должно содержать не менее 3 символов');
        }
        if (password.length < 6) {
          throw new Error('Пароль должен содержать не менее 6 символов');
        }
        res = await api.register(username, password);
      } else {
        res = await api.login(username, password);
      }

      onSuccess(res.user, res.certificates);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка аутентификации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#191A1C]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn font-sans text-[#191A1C]">
      <div className="w-full max-w-md bg-[#FAF8F5] border border-[#D8D2C5] rounded-lg p-6 sm:p-8 space-y-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded text-[#6B6661] hover:text-[#191A1C] hover:bg-[#E7E1D6] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-[#D8D2C5] pb-4">
          <div className="w-9 h-9 rounded bg-[#191A1C] flex items-center justify-center text-white font-bold">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-[#191A1C] tracking-tight">
              {mode === 'login' ? 'Вход в аккаунт' : 'Регистрация оператора'}
            </h3>
            <p className="text-xs text-[#5C5854]">
              Сохранение профиля, статистики и сертификатов
            </p>
          </div>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex items-center p-1 rounded bg-[#E7E1D6] border border-[#D8D2C5] text-xs font-mono font-medium">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-1.5 rounded transition-colors cursor-pointer ${
              mode === 'login' ? 'bg-[#191A1C] text-white font-bold' : 'text-[#6B6661] hover:text-[#191A1C]'
            }`}
          >
            Войти
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-1.5 rounded transition-colors cursor-pointer ${
              mode === 'register' ? 'bg-[#191A1C] text-white font-bold' : 'text-[#6B6661] hover:text-[#191A1C]'
            }`}
          >
            Регистрация
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded bg-[#7A1F2B]/10 border border-[#7A1F2B]/30 text-[#7A1F2B] text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-[#191A1C] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#6B6661]" />
              <span>Имя пользователя (Логин)</span>
            </label>
            <input
              required
              type="text"
              placeholder="Например: jasur_dev"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2 rounded bg-white border border-[#D8D2C5] text-[#191A1C] text-xs font-mono focus:border-[#7A1F2B] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-[#191A1C] uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#6B6661]" />
              <span>Пароль {mode === 'register' && '(не менее 6 знаков)'}</span>
            </label>
            <input
              required
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded bg-white border border-[#D8D2C5] text-[#191A1C] text-xs font-mono focus:border-[#7A1F2B] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded font-mono font-bold text-xs uppercase tracking-wider bg-[#191A1C] hover:bg-[#7A1F2B] text-white shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{loading ? 'Обработка...' : mode === 'login' ? 'ВОЙТИ В СИСТЕМУ' : 'ЗАРЕГИСТРИРОВАТЬСЯ'}</span>
          </button>
        </form>

        {currentUser && (
          <div className="pt-2 border-t border-[#D8D2C5] text-center">
            <span className="text-[11px] text-[#6B6661] font-mono">
              Текущий сеанс: <strong className="text-[#191A1C]">{currentUser.username}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
