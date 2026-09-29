import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Scenario, FraudReport, ScamCluster } from '../types';
import {
  Settings,
  Power,
  Loader2,
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
      <div className="min-h-[500px] flex items-center justify-center space-y-3 font-mono text-xs text-[#6B6661]">
        <Loader2 className="w-8 h-8 text-[#7A1F2B] animate-spin" />
        <span>Загрузка данных аналитики...</span>
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {};

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 font-sans text-[#191A1C]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8D2C5] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#7A1F2B] text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Панель управления и аналитики платформы</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191A1C] tracking-tight">
            Служба мониторинга и разведки угроз
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center p-1 rounded bg-[#E7E1D6] border border-[#D8D2C5] text-xs font-mono font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-[#191A1C] text-white' : 'text-[#6B6661] hover:text-[#191A1C]'
            }`}
          >
            Сводка
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'scenarios' ? 'bg-[#191A1C] text-white' : 'text-[#6B6661] hover:text-[#191A1C]'
            }`}
          >
            Сценарии ({scenarios.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'reports' ? 'bg-[#191A1C] text-white' : 'text-[#6B6661] hover:text-[#191A1C]'
            }`}
          >
            Инциденты ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('clusters')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'clusters' ? 'bg-[#191A1C] text-white' : 'text-[#6B6661] hover:text-[#191A1C]'
            }`}
          >
            Scam Clusters ({clusters.length})
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'certificates' ? 'bg-[#191A1C] text-white' : 'text-[#6B6661] hover:text-[#191A1C]'
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
            <div className="p-5 rounded-lg bg-[#FAF8F5] border border-[#D8D2C5] space-y-1">
              <span className="text-[11px] text-[#6B6661] uppercase tracking-wider block font-mono">Пользователи</span>
              <span className="text-2xl font-black text-[#191A1C] font-mono">{metrics.totalUsers}</span>
            </div>

            <div className="p-5 rounded-lg bg-[#FAF8F5] border border-[#D8D2C5] space-y-1">
              <span className="text-[11px] text-[#6B6661] uppercase tracking-wider block font-mono">Пройдено сессий</span>
              <span className="text-2xl font-black text-[#191A1C] font-mono">{metrics.completedScenarios}</span>
            </div>

            <div className="p-5 rounded-lg bg-[#FAF8F5] border border-[#D8D2C5] space-y-1">
              <span className="text-[11px] text-[#6B6661] uppercase tracking-wider block font-mono">Доля ошибок</span>
              <span className="text-2xl font-black text-[#7A1F2B] font-mono">{metrics.mistakeRate}%</span>
            </div>

            <div className="p-5 rounded-lg bg-[#FAF8F5] border border-[#D8D2C5] space-y-1">
              <span className="text-[11px] text-[#6B6661] uppercase tracking-wider block font-mono">Ср. время реакции</span>
              <span className="text-2xl font-black text-[#191A1C] font-mono">{metrics.averageResponseTime}с</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-lg bg-[#FAF8F5] border border-[#D8D2C5] space-y-1">
              <span className="text-[11px] text-[#6B6661] uppercase tracking-wider block font-mono">Симулированный ущерб</span>
              <span className="text-lg font-bold text-[#7A1F2B] font-mono">{formatUz(metrics.totalSimulatedLoss)}</span>
            </div>

            <div className="p-5 rounded-lg bg-[#FAF8F5] border border-[#D8D2C5] space-y-1">
              <span className="text-[11px] text-[#6B6661] uppercase tracking-wider block font-mono">Зафиксировано жалоб</span>
              <span className="text-lg font-bold text-[#191A1C] font-mono">{metrics.totalReports}</span>
            </div>

            <div className="p-5 rounded-lg bg-[#FAF8F5] border border-[#D8D2C5] space-y-1">
              <span className="text-[11px] text-[#6B6661] uppercase tracking-wider block font-mono">Выявлено Scam-сетей</span>
              <span className="text-lg font-bold text-[#191A1C] font-mono">{metrics.totalScamClusters}</span>
            </div>
          </div>

          {/* Recent Reports and Clusters preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg bg-[#FAF8F5] border border-[#D8D2C5] space-y-4">
              <h3 className="text-sm font-bold text-[#191A1C] flex items-center justify-between font-mono">
                <span>Свежие сообщения граждан</span>
                <span className="text-xs text-[#6B6661] font-normal">Последние 5</span>
              </h3>
              <div className="space-y-2.5">
                {reports.slice(0, 5).map((r) => (
                  <div key={r.id} className="p-3 rounded bg-white border border-[#D8D2C5] text-xs space-y-1 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#191A1C]">{r.category}</span>
                      <span className="text-[10px] text-[#6B6661]">{r.reportId}</span>
                    </div>
                    <p className="text-[#5C5854] line-clamp-1">{r.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-lg bg-[#FAF8F5] border border-[#D8D2C5] space-y-4">
              <h3 className="text-sm font-bold text-[#191A1C] flex items-center justify-between font-mono">
                <span>Связанные кластеры угроз</span>
                <span className="text-xs text-[#6B6661] font-normal">Активные</span>
              </h3>
              <div className="space-y-2.5">
                {clusters.slice(0, 5).map((c) => (
                  <div key={c.id} className="p-3 rounded bg-white border border-[#D8D2C5] text-xs space-y-1 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#7A1F2B]">{c.clusterCode}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#E7E1D6] text-[#191A1C] font-bold">
                        {c.reportCount} отчётов
                      </span>
                    </div>
                    <p className="text-[#5C5854] line-clamp-1">{c.indicatorsSummary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCENARIOS MANAGEMENT TAB */}
      {activeTab === 'scenarios' && (
        <div className="p-6 rounded-lg bg-[#FAF8F5] border border-[#D8D2C5] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D8D2C5]">
            <h3 className="text-sm font-bold text-[#191A1C] font-mono">Список data-driven сценариев</h3>
            <span className="text-xs text-[#6B6661] font-mono">Управление публикацией</span>
          </div>

          <div className="divide-y divide-[#D8D2C5]">
            {scenarios.map((s) => (
              <div key={s.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="space-y-1 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#191A1C]">{s.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#E7E1D6] text-[#191A1C]">
                      Уровень {s.level}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#E7E1D6] text-[#7A1F2B]">
                      {s.interface}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#6B6661]">
                    ID: {s.id} • Таймер: {s.timeLimit}с • Действий: {s.availableActions.length}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleScenario(s.id)}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    s.isActive
                      ? 'bg-[#465447] text-white hover:bg-[#344035]'
                      : 'bg-[#E7E1D6] text-[#6B6661] border border-[#D8D2C5] hover:bg-[#D8D2C5]'
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
        <div className="p-6 rounded-lg bg-[#FAF8F5] border border-[#D8D2C5] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D8D2C5]">
            <h3 className="text-sm font-bold text-[#191A1C] font-mono">Входящие инциденты и индикаторы</h3>
            <span className="text-xs text-[#6B6661] font-mono">Всего: {reports.length}</span>
          </div>

          <div className="space-y-3">
            {reports.map((rep) => (
              <div key={rep.id} className="p-4 rounded bg-white border border-[#D8D2C5] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#191A1C] text-sm">{rep.category}</span>
                    <span className="font-mono text-[#7A1F2B] font-bold">{rep.reportId}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E7E1D6] text-[#191A1C]">
                    {rep.status}
                  </span>
                </div>

                <p className="text-[#5C5854] leading-relaxed">{rep.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#6B6661] pt-1 border-t border-[#D8D2C5] font-mono">
                  {rep.phoneNumber && <span>Тел: <strong className="text-[#191A1C]">{rep.phoneNumber}</strong></span>}
                  {rep.telegramHandle && <span>Telegram: <strong className="text-[#191A1C]">@{rep.telegramHandle}</strong></span>}
                  {rep.url && <span>URL: <strong className="text-[#191A1C]">{rep.url}</strong></span>}
                  {rep.paymentRequisites && <span>Карта: <strong className="text-[#191A1C]">{rep.paymentRequisites}</strong></span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CLUSTERS TAB */}
      {activeTab === 'clusters' && (
        <div className="p-6 rounded-lg bg-[#FAF8F5] border border-[#D8D2C5] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D8D2C5]">
            <h3 className="text-sm font-bold text-[#191A1C] font-mono">Scam Clusters (Корреляция индикаторов)</h3>
            <span className="text-xs text-[#6B6661] font-mono">Связи между инцидентами</span>
          </div>

          <div className="space-y-4">
            {clusters.map((cl) => (
              <div key={cl.id} className="p-5 rounded bg-white border border-[#D8D2C5] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#7A1F2B] font-mono">{cl.clusterCode}</span>
                    <span className="text-xs font-semibold text-[#191A1C]">{cl.title}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-xs px-2 py-0.5 rounded bg-[#E7E1D6] text-[#465447] font-semibold">
                      Достоверность {(cl.confidenceScore * 100).toFixed(0)}%
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#E7E1D6] text-[#191A1C]">
                      {cl.reportCount} отчётов
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#5C5854]">{cl.indicatorsSummary}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-[#6B6661] bg-[#FAF8F5] p-3 rounded border border-[#D8D2C5] font-mono">
                  <div>
                    <span className="block mb-0.5">Связанные номера:</span>
                    <span className="text-[#191A1C] font-bold">{cl.matchedPhones.join(', ') || 'Нет'}</span>
                  </div>
                  <div>
                    <span className="block mb-0.5">Telegram профили:</span>
                    <span className="text-[#191A1C] font-bold">{cl.matchedTelegrams.map((t) => `@${t}`).join(', ') || 'Нет'}</span>
                  </div>
                  <div>
                    <span className="block mb-0.5">URL / Фишинговые домены:</span>
                    <span className="text-[#191A1C] font-bold truncate block">{cl.matchedUrls.join(', ') || 'Нет'}</span>
                  </div>
                  <div>
                    <span className="block mb-0.5">Платёжные реквизиты (дропы):</span>
                    <span className="text-[#191A1C] font-bold">{cl.matchedRequisites.join(', ') || 'Нет'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CERTIFICATES TAB */}
      {activeTab === 'certificates' && (
        <div className="p-6 rounded-lg bg-[#FAF8F5] border border-[#D8D2C5] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D8D2C5]">
            <h3 className="text-sm font-bold text-[#191A1C] font-mono">Реестр выданных цифровых сертификатов</h3>
            <span className="text-xs text-[#6B6661] font-mono">Верификация подлинности</span>
          </div>

          <div className="divide-y divide-[#D8D2C5]">
            {(dashboardData?.certificatesList || []).map((c: any) => (
              <div key={c.id} className="py-3.5 flex items-center justify-between text-xs">
                <div className="space-y-0.5 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#191A1C]">{c.user_name}</span>
                    <span className="px-2 py-0.5 rounded bg-[#E7E1D6] text-[#7A1F2B] font-semibold text-[10px]">
                      {c.level_name}
                    </span>
                  </div>
                  <div className="text-[#6B6661] text-[11px]">
                    ID: {c.certificate_id} • Хэш: {c.verification_hash}
                  </div>
                </div>

                <div className="text-right text-[11px] text-[#6B6661] font-mono">
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
