import React from 'react';
import { useStudy } from '../context/StudyContext';
import { NavigationTab } from '../types';
import { Home, BarChart3, History, Wrench, Settings } from 'lucide-react';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'statistics', label: 'Stats', icon: BarChart3 },
  { id: 'history', label: 'History', icon: History },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const BottomNav: React.FC = () => {
  const { currentTab, setCurrentTab, activeState, themeConfig } = useStudy();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/90 backdrop-blur-lg border-t border-neutral-900 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                isActive
                  ? 'font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              style={{
                color: isActive ? themeConfig.hex : undefined,
              }}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-105' : ''}`} />
                {item.id === 'home' && activeState?.isActive && (
                  <span
                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                    style={{ backgroundColor: themeConfig.hex }}
                  />
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <span
                  className="absolute bottom-0 w-6 h-0.5 rounded-full"
                  style={{ backgroundColor: themeConfig.hex }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
