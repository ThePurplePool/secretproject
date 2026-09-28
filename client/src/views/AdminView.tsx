import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Scenario, FraudReport, ScamCluster, Certificate } from '../types';
import {
  Settings,
  Users,
  CheckCircle,
  AlertTriangle,
  Layers,
  Award,
  Power,
  Search,
  Filter,
  Loader2,
  DollarSign,
  Clock,
  ShieldAlert,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scenarios' | 'reports' | 'clusters' | 'certificates'>('dashboard');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [reports, setReports] = useState<FraudReport[]>([]);
  const [clusters, setClusters] = useState<ScamCluster[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dash, scList, repList, clList] = await Promise.all([
        api.getAdminDashboard(),
        api.getScenarios(),
        api.getReports(),
        api.getClusters(),
      ]);
      setDashboardData(dash);
      setScenarios(scList);
      setReports(repList);
      setClusters(clList);
      setLoading(false);
    } catch (err: any) {
      alert('Ошибка загрузки данных админ-панели: ' + err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleScenario = async (id: string) => {
    try {
      const res = await api.toggleScenario(id);
      setScenarios((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: res.isActive } : s))
      );
    } catch (err: any) {
      alert('Ошибка переключения статуса сценария: ' + err.message);
    }
  };

  const formatUz = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num) + ' сум';
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {};

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Панель управления и мониторинга платформы</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Admin Intelligence Center
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Дашборд
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'scenarios' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Сценарии ({scenarios.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'reports' ? 'bg-slate-800 text-rose-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Инциденты ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('clusters')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'clusters' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Scam Clusters ({clusters.length})
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'certificates' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Сертификаты
          </button>
        </div>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Пользователи</span>
              <span className="text-2xl font-black text-white font-mono">{metrics.totalUsers}</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Пройдено сессий</span>
              <span className="text-2xl font-black text-cyan-400 font-mono">{metrics.completedScenarios}</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Доля ошибок</span>
              <span className="text-2xl font-black text-rose-400 font-mono">{metrics.mistakeRate}%</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Ср. время реакции</span>
              <span className="text-2xl font-black text-amber-400 font-mono">{metrics.averageResponseTime} с</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Симулированный ущерб</span>
              <span className="text-lg font-bold text-rose-400 font-mono">{formatUz(metrics.totalSimulatedLoss)}</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Зафиксировано жалоб</span>
              <span className="text-lg font-bold text-white font-mono">{metrics.totalReports}</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Выявлено Scam-сетей</span>
              <span className="text-lg font-bold text-indigo-400 font-mono">{metrics.totalScamClusters}</span>
            </div>
          </div>

          {/* Recent Reports and Clusters preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Свежие сообщения граждан</span>
                <span className="text-xs text-slate-500 font-normal">Последние 5</span>
              </h3>
              <div className="space-y-2.5">
                {reports.slice(0, 5).map((r) => (
                  <div key={r.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{r.category}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{r.reportId}</span>
                    </div>
                    <p className="text-slate-400 line-clamp-1">{r.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Связанные кластеры угроз</span>
                <span className="text-xs text-slate-500 font-normal">Активные</span>
              </h3>
              <div className="space-y-2.5">
                {clusters.slice(0, 5).map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-cyan-300">{c.clusterCode}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold">
                        {c.reportCount} отчётов
                      </span>
                    </div>
                    <p className="text-slate-400 line-clamp-1">{c.indicatorsSummary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCENARIOS MANAGEMENT TAB */}
      {activeTab === 'scenarios' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Список data-driven сценариев</h3>
            <span className="text-xs text-slate-400">Управление публикацией</span>
          </div>

          <div className="divide-y divide-slate-800">
            {scenarios.map((s) => (
              <div key={s.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{s.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Уровень {s.level}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">
                      {s.interface}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    ID: {s.id} • Таймер: {s.timeLimit}с • Действий: {s.availableActions.length}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleScenario(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    s.isActive
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{s.isActive ? 'Активен' : 'Отключён'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Входящие инциденты и индикаторы</h3>
            <span className="text-xs text-slate-400">Всего: {reports.length}</span>
          </div>

          <div className="space-y-3">
            {reports.map((rep) => (
              <div key={rep.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{rep.category}</span>
                    <span className="font-mono text-cyan-400">{rep.reportId}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    rep.status === 'confirmed_cluster'
                      ? 'bg-purple-950 text-purple-300 border border-purple-800'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {rep.status}
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed">{rep.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                  {rep.phoneNumber && <span>Тел: <strong className="text-white font-mono">{rep.phoneNumber}</strong></span>}
                  {rep.telegramHandle && <span>Telegram: <strong className="text-white font-mono">@{rep.telegramHandle}</strong></span>}
                  {rep.url && <span>URL: <strong className="text-white font-mono">{rep.url}</strong></span>}
                  {rep.paymentRequisites && <span>Карта: <strong className="text-white font-mono">{rep.paymentRequisites}</strong></span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CLUSTERS TAB */}
      {activeTab === 'clusters' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Scam Clusters (Корреляция индикаторов)</h3>
            <span className="text-xs text-slate-400">Rule-based threat linking</span>
          </div>

          <div className="space-y-4">
            {clusters.map((cl) => (
              <div key={cl.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-cyan-300 font-mono">{cl.clusterCode}</span>
                    <span className="text-xs font-semibold text-white">{cl.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                      Достоверность {(cl.confidenceScore * 100).toFixed(0)}%
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {cl.reportCount} отчётов
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300">{cl.indicatorsSummary}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-400 bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Связанные номера:</span>
                    <span className="font-mono text-slate-200">{cl.matchedPhones.join(', ') || 'Нет'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Telegram профили:</span>
                    <span className="font-mono text-slate-200">{cl.matchedTelegrams.map((t) => `@${t}`).join(', ') || 'Нет'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">URL / Фишинговые домены:</span>
                    <span className="font-mono text-slate-200 truncate block">{cl.matchedUrls.join(', ') || 'Нет'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Платёжные реквизиты (дропы):</span>
                    <span className="font-mono text-slate-200">{cl.matchedRequisites.join(', ') || 'Нет'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CERTIFICATES TAB */}
      {activeTab === 'certificates' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Реестр выданных цифровых сертификатов</h3>
            <span className="text-xs text-slate-400">Верификация подлинности</span>
          </div>

          <div className="divide-y divide-slate-800">
            {(dashboardData?.certificatesList || []).map((c: any) => (
              <div key={c.id} className="py-3.5 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{c.user_name}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-semibold text-[10px]">
                      {c.level_name}
                    </span>
                  </div>
                  <div className="font-mono text-slate-400 text-[11px]">
                    ID: {c.certificate_id} • Хэш: {c.verification_hash}
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-500">
                  {new Date(c.issued_at).toLocaleDateString('ru-RU')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
