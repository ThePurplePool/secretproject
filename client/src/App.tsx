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
import { AuthModal } from './components/AuthModal';
import { CertificateVerifyModal } from './components/CertificateVerifyModal';
import { Loader2 } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<string>('welcome');
  const [activeScenarioId, setActiveScenarioId] = useState<string>('fake-bank-telegram-001');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);

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
      <div className="min-h-screen bg-[#F6F3EC] text-[#171918] flex flex-col items-center justify-center space-y-3 font-sans">
        <Loader2 className="w-8 h-8 text-[#19332F] animate-spin" />
        <p className="text-xs font-mono tracking-wider uppercase text-[#626560]">Инициализация платформы Anti-Scam Uzbekistan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#171918] flex flex-col font-sans selection:bg-[#C83D2F]/15">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenVerifyCert={() => setIsVerifyOpen(true)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={user}
        onSuccess={(updatedUser, updatedCerts) => {
          setUser(updatedUser);
          setCertificates(updatedCerts);
        }}
      />

      {/* Certificate Verification Modal */}
      <CertificateVerifyModal
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
      />

      {/* Persistent Virtual Balance Bar */}
      <VirtualBalanceBar user={user} />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 pt-1 sm:pt-4">
        {currentView === 'welcome' && (
          <WelcomeView
            onStartFirstScenario={() => handleStartScenario('fake-bank-telegram-001')}
            onExploreCatalog={() => setCurrentView('scenarios')}
            onReport={() => setCurrentView('report')}
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
      <footer className="border-t border-[#D8D2C5] bg-[#E7E1D6]/50 py-8 px-6 text-center text-xs text-[#6B6661] space-y-1.5 font-sans">
        <div className="flex items-center justify-center gap-2 font-mono text-[11px] text-[#191A1C] uppercase tracking-wider font-semibold">
          <span>Республика Узбекистан</span>
          <span>•</span>
          <span>Национальная система противодействия мошенничеству</span>
        </div>
        <p className="max-w-2xl mx-auto text-[#6B6661] text-[11px] leading-relaxed">
          Все сценарии на платформе являются контролируемыми обучающими симуляциями. Платформа не запрашивает и не хранит реальные платежные реквизиты, SMS-коды или пароли.
        </p>
      </footer>
    </div>
  );
}

export default App;
