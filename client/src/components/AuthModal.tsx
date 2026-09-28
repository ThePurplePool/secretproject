import React, { useState } from 'react';
import { api } from '../services/api';
import { UserProfile, Certificate } from '../types';
import { LogIn, UserPlus, X, Shield, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shadow">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">
              {mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
            </h3>
            <p className="text-xs text-slate-400">
              Сохранение вашего прогресса и сертификатов
            </p>
          </div>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer ${
              mode === 'login' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Войти
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer ${
              mode === 'register' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Регистрация
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Имя пользователя (Логин)</span>
            </label>
            <input
              required
              type="text"
              placeholder="Например: jasur_dev"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Пароль {mode === 'register' && '(не менее 6 знаков)'}</span>
            </label>
            <input
              required
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-cyan-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{loading ? 'Обработка...' : mode === 'login' ? 'ВОЙТИ' : 'ЗАРЕГИСТРИРОВАТЬСЯ'}</span>
          </button>
        </form>

        {currentUser && (
          <div className="pt-2 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-500">
              Текущий сеанс: <strong className="text-slate-300">{currentUser.username}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
