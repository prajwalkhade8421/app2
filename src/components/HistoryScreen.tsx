import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { formatClockTime, formatDatePretty, formatDurationHuman } from '../utils/time';
import { History as HistoryIcon, Search, Trash2, Download, AlertCircle, Calendar, Layers, Coffee, Zap } from 'lucide-react';
import { Storage } from '../utils/storage';

export const HistoryScreen: React.FC = () => {
  const { sessions, deleteSession, clearAllHistory, subjects, themeConfig } = useStudy();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    const matchesSubject = selectedSubjectFilter === 'all' || s.subjectId === selectedSubjectFilter;
    const matchesSearch =
      s.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.stopReason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.stopReasonDetails && s.stopReasonDetails.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSubject && matchesSearch;
  });

  const handleExportJSON = () => {
    const dataStr = Storage.exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `StudyMode_History_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Header & Export Actions */}
      <div className="flex items-start justify-between">
        <div>
          <div
            className="text-[10px] font-bold tracking-[0.2em] uppercase"
            style={{ color: themeConfig.hex }}
          >
            RECORDS & LOGS
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-100 font-heading">
            Session History
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            {sessions.length} recorded sessions (30+ days stored locally)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Export History to JSON"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="p-2.5 rounded-xl bg-red-950/30 hover:bg-red-950/60 border border-red-900/50 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Clear all records"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/80 animate-in fade-in space-y-3 text-xs text-red-200">
          <div className="flex items-center gap-2 font-bold text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>Are you sure you want to clear all history?</span>
          </div>
          <p className="text-neutral-300">
            This will permanently remove all {sessions.length} study session records from this device.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                clearAllHistory();
                setShowClearConfirm(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold"
            >
              Yes, Clear All
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search & Subject Filter Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject, stop reason, notes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
          />
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedSubjectFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedSubjectFilter === 'all'
                ? 'bg-neutral-100 text-neutral-950 font-bold'
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
            }`}
          >
            All Subjects
          </button>
          {subjects.map((subj) => (
            <button
              key={subj.id}
              onClick={() => setSelectedSubjectFilter(subj.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedSubjectFilter === subj.id
                  ? 'font-bold shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
              style={{
                backgroundColor: selectedSubjectFilter === subj.id ? themeConfig.hex : undefined,
                color: selectedSubjectFilter === subj.id ? '#0a0a0a' : undefined,
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: subj.color }} />
              <span>{subj.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Session History List */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800/60 text-center text-neutral-500 text-xs space-y-2">
            <HistoryIcon className="w-8 h-8 mx-auto text-neutral-600" />
            <p>No study sessions found matching your filter.</p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const startClock = formatClockTime(session.startTimestamp);
            const endClock = formatClockTime(session.endTimestamp);
            const penaltyMins = Math.floor(session.penaltySeconds / 60);

            // Group break counts
            const breakCounts: Record<string, { icon: string; name: string; count: number }> = {};
            session.breaks.forEach((b) => {
              if (!breakCounts[b.reasonId]) {
                breakCounts[b.reasonId] = { icon: b.reasonIcon, name: b.reasonName, count: 0 };
              }
              breakCounts[b.reasonId].count++;
            });

            return (
              <div
                key={session.id}
                className="p-4 sm:p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 shadow-md hover:border-neutral-700 transition-all space-y-3"
              >
                {/* Top Row: Date, Interval & Subject */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: session.subjectColor }}
                      />
                      <span className="text-sm font-black text-neutral-100">
                        {session.subjectName}
                      </span>
                      <span className="text-[11px] font-mono-numbers px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400">
                        {session.cyclesCompleted} cycle{session.cyclesCompleted > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Timeline 12:30 PM → 4:13 PM */}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono-numbers mt-1">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{formatDatePretty(session.startTimestamp)}</span>
                      <span>•</span>
                      <span className="text-neutral-300 font-semibold">{startClock} → {endClock}</span>
                    </div>
                  </div>

                  {/* Study Time Badge */}
                  <div className="text-right">
                    <div
                      className="text-sm sm:text-base font-black font-mono-numbers"
                      style={{ color: themeConfig.hex }}
                    >
                      {formatDurationHuman(session.actualStudySeconds)}
                    </div>
                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider">
                      Net Study Time
                    </div>
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800/60 text-[11px]">
                  <div>
                    <span className="text-neutral-500 block">Total Elapsed</span>
                    <span className="font-semibold text-neutral-300 font-mono-numbers">
                      {formatDurationHuman(session.totalSessionSeconds)}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Break Time</span>
                    <span className="font-semibold text-neutral-300 font-mono-numbers">
                      {session.breakSeconds > 0 ? formatDurationHuman(session.breakSeconds) : '0m'}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">2× Penalties</span>
                    <span className="font-bold font-mono-numbers" style={{ color: themeConfig.hex }}>
                      {penaltyMins > 0 ? `+${penaltyMins}m added` : '0m'}
                    </span>
                  </div>
                </div>

                {/* Breaks Tags List */}
                {Object.keys(breakCounts).length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                      <Coffee className="w-3 h-3 text-neutral-400" /> Breaks:
                    </span>
                    {Object.values(breakCounts).map((b, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-300 font-medium font-mono-numbers"
                      >
                        <span>{b.icon}</span>
                        <span>{b.name} ×{b.count}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Stop Reason & Delete Action */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-xs">
                  <div className="text-neutral-400 text-[11px]">
                    <span className="text-neutral-500">Stop reason: </span>
                    <span className="text-neutral-300 font-medium">{session.stopReason}</span>
                    {session.stopReasonDetails && (
                      <span className="text-neutral-500 italic ml-1">({session.stopReasonDetails})</span>
                    )}
                  </div>

                  <button
                    onClick={() => deleteSession(session.id)}
                    className="p-1 text-neutral-600 hover:text-red-400 transition-colors"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
