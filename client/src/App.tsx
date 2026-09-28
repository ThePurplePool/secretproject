import React, { useState, useEffect } from 'react';
import { UserProfile, Certificate } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { VirtualBalanceBar } from './components/VirtualBalanceBar';
import { WelcomeView } from './views/WelcomeView';
import { ScenarioRunnerView } from './views/ScenarioRunnerView';
import { ScenariosCatalogView } from './views/ScenariosCatalogView';
import { ConsultantView } from './views/ConsultantView';
import { VoiceCallView } from './views/VoiceCallView';
import { FraudReportView } from './views/FraudReportView';
import { ProfileView } from './views/ProfileView';
import { AdminView } from './views/AdminView';
import { Loader2 } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<string>('welcome');
  const [activeScenarioId, setActiveScenarioId] = useState<string>('fake-bank-telegram-001');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile on startup
  const loadUserProfile = async () => {
    try {
      const data = await api.getProfile();
      setUser(data.user);
      setCertificates(data.certificates);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const handleStartScenario = (scenarioId: string) => {
    setActiveScenarioId(scenarioId);
    setCurrentView('scenario-runner');
  };

  const handleScenarioFinished = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    loadUserProfile(); // refresh certificates and full stats
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070d1e] text-white flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-sm font-medium text-slate-400">Запуск платформы Anti-Scam Uzbekistan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Top Navbar */}
      <Navbar currentView={currentView} onNavigate={setCurrentView} user={user} />

      {/* Persistent Virtual Balance Bar */}
      <VirtualBalanceBar user={user} />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentView === 'welcome' && (
          <WelcomeView
            onStartFirstScenario={() => handleStartScenario('fake-bank-telegram-001')}
            onExploreCatalog={() => setCurrentView('scenarios')}
            user={user}
          />
        )}

        {currentView === 'scenarios' && (
          <ScenariosCatalogView onSelectScenario={handleStartScenario} />
        )}

        {currentView === 'scenario-runner' && (
          <ScenarioRunnerView
            scenarioId={activeScenarioId}
            onBack={() => setCurrentView('scenarios')}
            onScenarioFinished={handleScenarioFinished}
            onLoadScenario={handleStartScenario}
          />
        )}

        {currentView === 'consultant' && (
          <ConsultantView
            user={user}
            certificates={certificates}
            onStartScenario={handleStartScenario}
            onRefreshProfile={loadUserProfile}
          />
        )}

        {currentView === 'voice' && <VoiceCallView />}

        {currentView === 'report' && <FraudReportView />}

        {currentView === 'profile' && (
          <ProfileView user={user} certificates={certificates} onRefresh={loadUserProfile} />
        )}

        {currentView === 'admin' && <AdminView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#070d1e] py-6 px-4 text-center text-xs text-slate-500 space-y-1">
        <p>Anti-Scam Uzbekistan — Интерактивная платформа практической защиты граждан от социальной инженерии.</p>
        <p className="text-[11px] text-slate-600">Все сценарии являются безопасными контролируемыми обучающими симуляциями. Без реальных банковских данных и вредоносного ПО.</p>
      </footer>
    </div>
  );
}

export default App;
