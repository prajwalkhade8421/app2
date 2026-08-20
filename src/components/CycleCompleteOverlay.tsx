import React from 'react';
import { useStudy } from '../context/StudyContext';
import { Play, AlertTriangle, BellRing, Sparkles, StopCircle } from 'lucide-react';
import { formatSecondsToDigital } from '../utils/time';

export const CycleCompleteOverlay: React.FC = () => {
  const { activeState, startNextCycle, setShowStopModal } = useStudy();

  if (!activeState || activeState.cyclePhase !== 'cycle_complete_break') {
    return null;
  }

  const cycleNum = activeState.currentCycleNumber;
  const completedAt = activeState.cycleCompletedTimestamp || Date.now();
  const elapsedBreakSecs = Math.max(0, Math.floor((Date.now() - completedAt) / 1000));
  const breakElapsedMins = Math.floor(elapsedBreakSecs / 60);

  const is5MinWarning = breakElapsedMins >= 5;
  const is10MinAlarm = breakElapsedMins >= 10;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
      <div className="max-w-md w-full flex flex-col items-center">
        {/* Celebration / Alert Icon */}
        <div className="relative mb-6">
          <div className={`w-24 h-24 rounded-3xl flex items-center justify-center border-2 transition-all ${
            is10MinAlarm
              ? 'bg-red-950/70 border-red-500 text-red-400 animate-bounce'
              : is5MinWarning
              ? 'bg-amber-950/70 border-amber-500 text-amber-400'
              : 'bg-emerald-950/70 border-emerald-500 text-emerald-400'
          }`}>
            {is10MinAlarm ? (
              <BellRing className="w-12 h-12 animate-pulse" />
            ) : is5MinWarning ? (
              <AlertTriangle className="w-12 h-12" />
            ) : (
              <Sparkles className="w-12 h-12" />
            )}
          </div>
        </div>

        {/* Title */}
        <div className="text-xs font-bold tracking-[0.25em] text-neutral-400 uppercase mb-1">
          CYCLE #{cycleNum} COMPLETED
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-neutral-100 font-heading mb-2">
          {is10MinAlarm
            ? 'URGENT: TIME TO STUDY!'
            : is5MinWarning
            ? 'GET BACK TO STUDY'
            : '60-Minute Cycle Complete!'}
        </h2>

        {/* Warning Badge & Message */}
        {is10MinAlarm ? (
          <div className="w-full bg-red-950/40 border border-red-800/60 rounded-xl p-4 mb-6 text-red-200 text-xs text-left flex items-start gap-2.5">
            <BellRing className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-red-300 uppercase">10+ Minute Idle Alarm</div>
              <p className="mt-0.5">
                Break has exceeded 10 minutes. Click START STUDY immediately to retain cognitive momentum!
              </p>
            </div>
          </div>
        ) : is5MinWarning ? (
          <div className="w-full bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 mb-6 text-amber-200 text-xs text-left flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-300 uppercase">5-Minute Focus Warning</div>
              <p className="mt-0.5">
                5 minutes have passed since your study cycle finished. Wrap up your break.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-neutral-400 text-sm mb-6 max-w-xs">
            Great work! Take a short stretch. When ready, tap below to start Cycle #{cycleNum + 1}.
          </p>
        )}

        {/* Break Elapsed Stopwatch */}
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 w-full mb-8">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
            Break Duration Since Cycle #{cycleNum}
          </div>
          <div className="text-4xl font-extrabold font-mono-numbers text-neutral-100">
            {formatSecondsToDigital(elapsedBreakSecs)}
          </div>
        </div>

        {/* Primary CTA - Start Next Cycle */}
        <button
          onClick={startNextCycle}
          className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-base transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/20 active:scale-[0.98] mb-3"
        >
          <Play className="w-5 h-5 fill-neutral-950" />
          START STUDY (CYCLE #{cycleNum + 1})
        </button>

        {/* Secondary Stop Button */}
        <button
          onClick={() => setShowStopModal(true)}
          className="w-full py-3 px-6 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
        >
          <StopCircle className="w-4 h-4 text-red-400" />
          Stop Study Mode for Today
        </button>
      </div>
    </div>
  );
};
