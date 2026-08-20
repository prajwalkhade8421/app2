import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { STOP_REASONS } from '../constants';
import { X, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { formatDurationHuman } from '../utils/time';

export const StopStudyModal: React.FC = () => {
  const { showStopModal, setShowStopModal, stopStudyMode, activeState } = useStudy();
  const [selectedReasonId, setSelectedReasonId] = useState<string>('going_somewhere');
  const [otherDetails, setOtherDetails] = useState<string>('');

  if (!showStopModal || !activeState) return null;

  const currentStudyTime = activeState.accumulatedStudySeconds;
  const currentSubject = activeState.subjectName;

  const handleConfirmStop = () => {
    const selectedOption = STOP_REASONS.find((r) => r.id === selectedReasonId);
    const reasonLabel = selectedOption ? `${selectedOption.icon} ${selectedOption.label}` : 'Other';
    stopStudyMode(reasonLabel, selectedReasonId === 'other' ? otherDetails.trim() : undefined);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in slide-in-from-bottom-6 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-950/60 border border-red-800/60 text-red-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100 font-heading">
                Stop Study Mode
              </h3>
              <p className="text-xs text-neutral-400">
                Session: <span className="text-neutral-200 font-medium">{currentSubject}</span> ({formatDurationHuman(currentStudyTime)} focused)
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowStopModal(false)}
            className="p-2 text-neutral-400 hover:text-neutral-200 rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prompt */}
        <div className="mt-4 mb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            WHY ARE YOU STOPPING STUDY MODE?
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Select an honest reason to preserve detailed session records.
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3">
          {STOP_REASONS.map((r) => {
            const isSelected = selectedReasonId === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedReasonId(r.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-500/70 text-amber-100 ring-1 ring-amber-500/50'
                    : 'bg-neutral-950/40 border-neutral-800 text-neutral-300 hover:bg-neutral-800/70 hover:border-neutral-700'
                }`}
              >
                <span className="text-xl shrink-0">{r.icon}</span>
                <span className="text-xs font-medium flex-1">{r.label}</span>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Custom text explanation if 'Other' selected */}
        {selectedReasonId === 'other' && (
          <div className="my-3">
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Short Explanation (Optional)
            </label>
            <input
              type="text"
              value={otherDetails}
              onChange={(e) => setOtherDetails(e.target.value)}
              placeholder="e.g. Urgent phone call, assignment submission..."
              maxLength={100}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-neutral-800 mt-4">
          <button
            onClick={() => setShowStopModal(false)}
            className="flex-1 py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
          >
            Keep Studying
          </button>
          <button
            onClick={handleConfirmStop}
            className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/20 active:scale-[0.98]"
          >
            Confirm & End Session
          </button>
        </div>
      </div>
    </div>
  );
};
