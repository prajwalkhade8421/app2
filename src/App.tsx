import React, { useEffect } from 'react';
import { StudyProvider, useStudy } from './context/StudyContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { ActiveStudyView } from './components/ActiveStudyView';
import { StatisticsScreen } from './components/StatisticsScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { ToolsScreen } from './components/ToolsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { BreakModal } from './components/BreakModal';
import { StopStudyModal } from './components/StopStudyModal';
import { CycleCompleteOverlay } from './components/CycleCompleteOverlay';
import { AppLockShieldModal } from './components/AppLockShieldModal';
import { OnboardingModal } from './components/OnboardingModal';

const MainLayout: React.FC = () => {
  const { currentTab, activeState, settings } = useStudy();

  // Handle Theme Classes on document root
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [settings.theme]);

  return (
    <div
      className={`min-h-screen transition-colors ${
        settings.theme === 'amoled'
          ? 'bg-black text-neutral-100'
          : settings.theme === 'light'
          ? 'bg-neutral-100 text-neutral-900'
          : 'bg-neutral-950 text-neutral-100'
      }`}
    >
      {/* Top App Header */}
      <Header />

      {/* Main Content Area */}
      <main className="relative pb-24 sm:pb-28">
        {/* If Active Study is running and user is on 'home', render the Active Study View */}
        {activeState?.isActive && currentTab === 'home' ? (
          <ActiveStudyView />
        ) : (
          <>
            {currentTab === 'home' && <HomeScreen />}
            {currentTab === 'statistics' && <StatisticsScreen />}
            {currentTab === 'history' && <HistoryScreen />}
            {currentTab === 'tools' && <ToolsScreen />}
            {currentTab === 'settings' && <SettingsScreen />}
          </>
        )}
      </main>

      {/* Persistent Global Modals & Overlays */}
      <BreakModal />
      <StopStudyModal />
      <CycleCompleteOverlay />
      <AppLockShieldModal />
      <OnboardingModal />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <StudyProvider>
      <MainLayout />
    </StudyProvider>
  );
}
