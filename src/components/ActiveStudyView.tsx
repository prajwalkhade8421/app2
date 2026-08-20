import React from 'react';
import { useStudy } from '../context/StudyContext';
import { formatClockTime, formatSecondsToFullDigital, formatDurationHuman } from '../utils/time';
import { Pause, Play, Coffee, Square, Shield, StickyNote, Zap } from 'lucide-react';

export const ActiveStudyView: React.FC = () => {
  const {
    activeState,
    pauseStudy,
    resumeStudy,
    setShowBreakModal,
    setShowStopModal,
    setShowAppLauncherModal,
    setCurrentTab,
    cycleProgressPercent,
    themeConfig,
  } = useStudy();

  if (!activeState || !activeState.isActive) return null;

  const isPaused = activeState.isPaused;
  const cycleNumber = activeState.currentCycleNumber;
  const remainingSecs = activeState.cycleRemainingSeconds;
  const startedAt = formatClockTime(activeState.sessionStartTimestamp);
  const totalBreaksTaken = activeState.breaksHistory.length;
  const penaltyMins = Math.floor(activeState.accumulatedPenaltySeconds / 60);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 space-y-6 text-center animate-in fade-in duration-300">
      {/* Top Header info */}
      <div className="w-full flex items-center justify-between pt-1">
        <div className="text-left">
          <div
            className="text-[10px] font-bold tracking-[0.2em] uppercase"
            style={{ color: themeConfig.hex }}
          >
            TIMESKIP MODE
          </div>
          <div className="text-xs font-black tracking-wider text-neutral-300 font-heading">
            STUDY TIME
          </div>
        </div>

        {/* Subject Tag */}
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border"
          style={{
            backgroundColor: `${activeState.subjectColor}15`,
            borderColor: `${activeState.subjectColor}50`,
            color: activeState.subjectColor,
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: activeState.subjectColor }}
          />
          <span>{activeState.subjectName}</span>
        </div>
      </div>

      {/* Center Focus Area: Large Countdown & Cycle Ring */}
      <div className="flex flex-col items-center justify-center py-2">
        {/* Status Chip */}
        <div className="mb-3">
          {isPaused ? (
            <span
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border animate-pulse"
              style={{
                backgroundColor: `${themeConfig.hex}20`,
                borderColor: `${themeConfig.hex}60`,
                color: themeConfig.hex,
              }}
            >
              <Pause className="w-3.5 h-3.5" />
              Timer Paused
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-semibold uppercase tracking-wider">
              Cycle #{cycleNumber} • In Progress
            </span>
          )}
        </div>

        {/* Digital Timer with SVG Progress Circle */}
        <div className="relative flex flex-col items-center justify-center">
          <div className="w-68 h-68 sm:w-76 sm:h-76 rounded-full border border-neutral-900 bg-neutral-950/90 flex flex-col items-center justify-center relative shadow-xl">
            {/* SVG Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="44%"
                className="stroke-neutral-900"
                strokeWidth="5"
                fill="none"
              />
              <circle
                cx="50%"
                cy="50%"
                r="44%"
                style={{ stroke: themeConfig.hex }}
                className="transition-all duration-1000 ease-linear"
                strokeWidth="5"
                fill="none"
                strokeDasharray={2 * Math.PI * 135}
                strokeDashoffset={2 * Math.PI * 135 * (1 - cycleProgressPercent / 100)}
                strokeLinecap="round"
              />
            </svg>

            {/* Time readout */}
            <div className="text-4xl sm:text-5xl font-black font-mono-numbers text-neutral-100 tracking-tight">
              {formatSecondsToFullDigital(remainingSecs)}
            </div>
            
            <div className="text-xs uppercase tracking-widest text-neutral-500 mt-2">
              Remaining in Cycle #{cycleNumber}
            </div>

            {penaltyMins > 0 && (
              <div className="inline-flex items-center gap-1 mt-3 px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-[11px] font-mono-numbers text-neutral-300 font-medium">
                <Zap className="w-3 h-3 text-neutral-400" />
                +{penaltyMins}m Penalty Added
              </div>
            )}
          </div>
        </div>

        {/* Session Metadata Row */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-5 text-xs text-neutral-400">
          <div>
            <span className="text-neutral-600 block text-[10px] uppercase font-medium">Started</span>
            <span className="font-semibold text-neutral-200 font-mono-numbers">{startedAt}</span>
          </div>
          <div className="h-4 w-px bg-neutral-800" />
          <div>
            <span className="text-neutral-600 block text-[10px] uppercase font-medium">Focus Time</span>
            <span
              className="font-semibold font-mono-numbers"
              style={{ color: themeConfig.hex }}
            >
              {formatDurationHuman(activeState.accumulatedStudySeconds)}
            </span>
          </div>
          <div className="h-4 w-px bg-neutral-800" />
          <div>
            <span className="text-neutral-600 block text-[10px] uppercase font-medium">Breaks Taken</span>
            <span className="font-semibold text-neutral-200 font-mono-numbers">{totalBreaksTaken}</span>
          </div>
        </div>
      </div>

      {/* Control Actions Section */}
      <div className="w-full space-y-3 pt-1">
        {/* Primary Controls Row: Pause / Resume & Take Break */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={isPaused ? resumeStudy : pauseStudy}
            className="py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer shadow-md"
            style={{
              backgroundColor: isPaused ? themeConfig.hex : '#171717',
              color: isPaused ? '#000' : '#e5e5e5',
              borderColor: isPaused ? themeConfig.hex : '#262626',
            }}
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
            <span>{isPaused ? 'Resume Timer' : 'Pause'}</span>
          </button>

          <button
            onClick={() => setShowBreakModal(true)}
            className="py-3.5 px-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer group shadow-md"
          >
            <Coffee className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>Take Break (2×)</span>
          </button>
        </div>

        {/* Secondary Tools Row: App Shield & Notes */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowAppLauncherModal(true)}
            className="py-2.5 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Allowed Apps</span>
          </button>

          <button
            onClick={() => setCurrentTab('tools')}
            className="py-2.5 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <StickyNote className="w-3.5 h-3.5 text-neutral-400" />
            <span>Tools & Notes</span>
          </button>
        </div>

        {/* Dedicated, 100% Visible Stop Study Session Button */}
        <div className="pt-2">
          <button
            onClick={() => setShowStopModal(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-red-950/40 hover:bg-red-950/70 border border-red-800/60 text-sm text-red-300 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-[0.99]"
          >
            <Square className="w-4 h-4 fill-red-400" />
            <span>Stop Study Mode (Save / Exit)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

