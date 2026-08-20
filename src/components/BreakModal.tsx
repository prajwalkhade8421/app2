import React from 'react';
import { useStudy } from '../context/StudyContext';
import { PREDEFINED_BREAKS } from '../constants';
import { formatSecondsToDigital } from '../utils/time';
import { X, Clock, AlertTriangle, ArrowLeft, Zap } from 'lucide-react';
import { PredefinedBreakReason } from '../types';

export const BreakModal: React.FC = () => {
  const {
    showBreakModal,
    setShowBreakModal,
    startPredefinedBreak,
    activeState,
    endBreakEarly,
    settings,
  } = useStudy();

  // If in active temporary break, show the Active Break Fullscreen/Overlay View
  if (activeState?.cyclePhase === 'in_temporary_break' && activeState.activeBreak) {
    const activeBreak = activeState.activeBreak;
    const totalBreakSecs = activeBreak.durationMinutes * 60;
    const remainingSecs = Math.max(0, totalBreakSecs - activeBreak.elapsedSeconds);
    const progressPercent = Math.min(100, (activeBreak.elapsedSeconds / totalBreakSecs) * 100);
    const penaltyMinutes = Math.ceil(activeBreak.durationMinutes * settings.breakPenaltyMultiplier);

    return (
      <div className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
        <div className="max-w-md w-full flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Clock className="w-3.5 h-3.5" />
            Temporary Break Active
          </div>

          {/* Reason Icon & Title */}
          <div className="text-6xl mb-4 animate-bounce">
            {activeBreak.reasonIcon}
          </div>
          <h2 className="text-2xl font-black text-neutral-100 font-heading mb-1">
            {activeBreak.reasonName}
          </h2>
          <p className="text-neutral-400 text-sm mb-8">
            Scheduled for {activeBreak.durationMinutes} minutes
          </p>

          {/* Countdown Clock */}
          <div className="w-64 h-64 rounded-full border-4 border-neutral-900 flex flex-col items-center justify-center relative mb-8 bg-neutral-900/40">
            {/* SVG Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="116"
                className="stroke-cyan-500/20"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="128"
                cy="128"
                r="116"
                className="stroke-cyan-400 transition-all duration-1000 ease-linear"
                strokeWidth="8"
                fill="none"
                strokeDasharray={2 * Math.PI * 116}
                strokeDashoffset={2 * Math.PI * 116 * (1 - progressPercent / 100)}
                strokeLinecap="round"
              />
            </svg>

            <span className="text-5xl font-extrabold font-mono-numbers text-cyan-300 tracking-tight">
              {formatSecondsToDigital(remainingSecs)}
            </span>
            <span className="text-xs uppercase tracking-widest text-neutral-500 mt-2">
              Break Time Left
            </span>
          </div>

          {/* Penalty Notice Box */}
          <div className="w-full bg-amber-950/30 border border-amber-800/40 rounded-xl p-4 mb-8 text-left flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                2× Time Penalty Rule
              </div>
              <p className="text-xs text-neutral-300 mt-0.5">
                Returning from this {activeBreak.durationMinutes}m break will add <span className="font-bold text-amber-400">+{penaltyMinutes} minutes</span> to your current 1-hour study cycle.
              </p>
            </div>
          </div>

          {/* Return Early CTA */}
          <button
            onClick={endBreakEarly}
            className="w-full py-4 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
          >
            <ArrowLeft className="w-5 h-5" />
            Return to Study Mode (+{penaltyMinutes}m Penalty)
          </button>
        </div>
      </div>
    );
  }

  // Predefined Break Selection Modal
  if (!showBreakModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in slide-in-from-bottom-6 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <h3 className="text-lg font-bold text-neutral-100 font-heading">
              Select Temporary Break
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Breaks apply a mandatory <span className="text-amber-400 font-semibold">{settings.breakPenaltyMultiplier}× time penalty</span>
            </p>
          </div>
          <button
            onClick={() => setShowBreakModal(false)}
            className="p-2 text-neutral-400 hover:text-neutral-200 rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Note */}
        <div className="my-4 p-3 bg-amber-950/20 border border-amber-900/30 rounded-xl flex items-center gap-2 text-xs text-amber-300">
          <Zap className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Session stays active. Penalty time is added to your remaining cycle.</span>
        </div>

        {/* Predefined Break Buttons Grid */}
        <div className="grid grid-cols-2 gap-2.5 my-4">
          {PREDEFINED_BREAKS.map((brk: PredefinedBreakReason) => {
            const penalty = Math.ceil(brk.durationMinutes * settings.breakPenaltyMultiplier);
            return (
              <button
                key={brk.id}
                onClick={() => startPredefinedBreak(brk)}
                className="flex flex-col p-3 rounded-2xl bg-neutral-950/70 hover:bg-neutral-800/80 border border-neutral-800/80 hover:border-neutral-700 transition-all text-left group"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="text-2xl group-hover:scale-105 transition-transform">
                    {brk.icon}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono-numbers px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300">
                      {brk.durationMinutes}m
                    </span>
                  </div>
                </div>
                <div className="font-semibold text-xs text-neutral-200 group-hover:text-white">
                  {brk.name}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono-numbers mt-0.5">
                  +{penalty}m penalty added
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-2 text-center text-xs text-neutral-500">
          Custom reasons are disabled for temporary breaks to enforce focus.
        </div>
      </div>
    </div>
  );
};
