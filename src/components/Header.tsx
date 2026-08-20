import React from 'react';
import { useStudy } from '../context/StudyContext';
import { Flame, Shield, Volume2, VolumeX } from 'lucide-react';
import { calculateStreak, formatDurationHuman } from '../utils/time';

export const Header: React.FC = () => {
  const { activeState, sessions, settings, updateSettings, todayStudySeconds, setShowAppLauncherModal, themeConfig } = useStudy();
  const streakInfo = calculateStreak(sessions);

  return (
    <header className="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Left Branding */}
        <div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: themeConfig.hex }}
            />
            <h1
              className="text-[11px] font-bold tracking-[0.2em] uppercase"
              style={{ color: themeConfig.hex }}
            >
              TIMESKIP MODE
            </h1>
          </div>
          <div className="text-sm font-black tracking-tight text-neutral-100 font-heading">
            STUDY TIME
          </div>
        </div>

        {/* Right Info & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Daily study badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-300">
            <span className="text-neutral-500">Today:</span>
            <span className="font-semibold font-mono-numbers text-neutral-200" style={{ color: themeConfig.hex }}>
              {formatDurationHuman(todayStudySeconds)}
            </span>
          </div>

          {/* Streak indicator */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border"
            style={{
              borderColor: `${themeConfig.hex}40`,
              backgroundColor: `${themeConfig.hex}15`,
              color: themeConfig.hex,
            }}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span className="font-mono-numbers">{streakInfo.currentStreak}d</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`p-1.5 rounded-lg border transition-colors ${
              settings.soundEnabled
                ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-neutral-100'
                : 'bg-neutral-900 border-neutral-800 text-neutral-600'
            }`}
            title={settings.soundEnabled ? 'Sound is ON' : 'Sound is MUTED'}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Allowed Apps quick launcher button */}
          <button
            onClick={() => setShowAppLauncherModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-300 font-medium transition-colors"
            title="Allowed & Blocked Apps"
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Apps Shield</span>
          </button>
        </div>
      </div>
    </header>
  );
};

