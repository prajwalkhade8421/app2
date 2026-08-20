import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { Play, Plus, BookOpen, Clock, Target, Shield, Check, Flame, ChevronRight, Award, CheckSquare, ListTodo } from 'lucide-react';
import { formatDurationHuman, calculateStreak, formatDatePretty } from '../utils/time';

export const HomeScreen: React.FC = () => {
  const {
    subjects,
    selectedSubjectId,
    setSelectedSubjectId,
    startStudyMode,
    settings,
    todayStudySeconds,
    sessions,
    apps,
    todos,
    targetTopics,
    setCurrentTab,
    setShowAppLauncherModal,
    addSubject,
    themeConfig,
  } = useStudy();

  const [showAddSubjectInput, setShowAddSubjectInput] = useState(false);
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjColor, setNewSubjColor] = useState('#3B82F6');

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const streakInfo = calculateStreak(sessions);

  const goalSeconds = (settings.dailyGoalHours || 6) * 3600;
  const goalProgressPercent = Math.min(100, Math.floor((todayStudySeconds / goalSeconds) * 100));
  const isGoalReached = todayStudySeconds >= goalSeconds;

  const allowedAppsCount = apps.filter((a) => a.isAllowed).length;
  const blockedAppsCount = apps.filter((a) => !a.isAllowed).length;

  const activeTodos = todos.filter((t) => !t.completed);
  const inProgressTopics = targetTopics.filter((t) => t.status !== 'completed');

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubjName.trim()) {
      addSubject(newSubjName.trim(), newSubjColor);
      setNewSubjName('');
      setShowAddSubjectInput(false);
    }
  };

  const COLOR_PALETTE = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#6366F1'];

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Minimal Header Typography */}
      <div className="text-center pt-2 pb-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-bold tracking-[0.2em] text-neutral-300 uppercase mb-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: themeConfig.hex }}
          />
          TIMESKIP MODE
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-100 font-heading tracking-tight">
          STUDY TIME
        </h1>
        <p className="text-neutral-400 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
          Repeating 1-hour focus cycles • 2× break penalty • Strict app shield
        </p>
      </div>

      {/* Daily Goal & Progress Card */}
      <div className="p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800/80 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            <Target className="w-4 h-4 text-neutral-400" />
            <span>Today's Study Goal</span>
          </div>
          <span
            className="text-xs font-bold font-mono-numbers"
            style={{ color: themeConfig.hex }}
          >
            {goalProgressPercent}%
          </span>
        </div>

        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black font-mono-numbers text-neutral-100">
              {formatDurationHuman(todayStudySeconds)}
            </span>
            <span className="text-neutral-500 text-sm font-medium">
              / {settings.dailyGoalHours}h Goal
            </span>
          </div>

          {isGoalReached && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-bold">
              <Award className="w-3.5 h-3.5" />
              Goal Complete
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-neutral-950 overflow-hidden p-0.5 border border-neutral-800/80">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${goalProgressPercent}%`,
              backgroundColor: themeConfig.hex,
            }}
          />
        </div>

        {/* Mini stats row inside card */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-neutral-800/60 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-neutral-400" />
            <span>Streak: <strong className="text-neutral-200 font-mono-numbers">{streakInfo.currentStreak} Days</strong></span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Shield className="w-4 h-4 text-neutral-400" />
            <span>Shield: <strong className="text-neutral-200">{allowedAppsCount} Allowed</strong></span>
          </div>
        </div>
      </div>

      {/* Subject Selection Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
            <span>Select Target Subject</span>
          </label>
          <button
            onClick={() => setShowAddSubjectInput(!showAddSubjectInput)}
            className="text-xs text-neutral-300 hover:text-white font-medium flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subject</span>
          </button>
        </div>

        {/* Add Subject Inline Form */}
        {showAddSubjectInput && (
          <form onSubmit={handleCreateSubject} className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubjName}
                onChange={(e) => setNewSubjName(e.target.value)}
                placeholder="e.g. Organic Chemistry, Calculus..."
                className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                autoFocus
              />
              <button
                type="submit"
                className="py-2 px-3.5 rounded-xl font-bold text-xs transition-colors"
                style={{
                  backgroundColor: themeConfig.hex,
                  color: '#000',
                }}
              >
                Save
              </button>
            </div>
            {/* Color palette */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-400">Color:</span>
              {COLOR_PALETTE.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setNewSubjColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    newSubjColor === c ? 'scale-110 border-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </form>
        )}

        {/* Subject Chips Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {subjects.map((subj) => {
            const isSelected = subj.id === selectedSubjectId;
            return (
              <button
                key={subj.id}
                onClick={() => setSelectedSubjectId(subj.id)}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-neutral-900 border-neutral-700 shadow-sm ring-1 ring-neutral-700'
                    : 'bg-neutral-900/40 border-neutral-800/80 hover:bg-neutral-900/70 hover:border-neutral-700'
                }`}
                style={{
                  borderColor: isSelected ? themeConfig.hex : undefined,
                }}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: subj.color }}
                  />
                  <span className="text-xs font-bold text-neutral-200 truncate">
                    {subj.name}
                  </span>
                </div>
                {isSelected && (
                  <Check
                    className="w-3.5 h-3.5 shrink-0 ml-1"
                    style={{ color: themeConfig.hex }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Start Action CTA */}
      <div className="pt-1">
        <button
          onClick={() => startStudyMode(selectedSubjectId)}
          className="w-full py-4 sm:py-5 px-6 rounded-3xl font-black text-base sm:text-lg transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] group"
          style={{
            backgroundColor: themeConfig.hex,
            color: '#0a0a0a',
          }}
        >
          <Play className="w-5 h-5 fill-current group-hover:scale-105 transition-transform" />
          <span className="tracking-wide">START STUDY MODE</span>
        </button>
        <p className="text-center text-[11px] text-neutral-500 mt-2">
          Will initiate 60-minute Cycle #1 for <strong className="text-neutral-400">{selectedSubject.name}</strong>
        </p>
      </div>

      {/* Today's Focus Overview (Todos & Topics quick look) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Active Todos Widget */}
        <div
          onClick={() => setCurrentTab('tools')}
          className="p-4 rounded-2xl bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/80 cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-300">
              <CheckSquare className="w-4 h-4 text-neutral-400" />
              <span>To-Do List</span>
            </div>
            <span className="text-[11px] font-mono-numbers px-2 py-0.5 rounded-md bg-neutral-950 border border-neutral-800 text-neutral-400">
              {activeTodos.length} pending
            </span>
          </div>
          <div className="text-xs text-neutral-400 space-y-1">
            {activeTodos.slice(0, 2).map((t) => (
              <div key={t.id} className="truncate text-neutral-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 shrink-0" />
                <span className="truncate">{t.title}</span>
              </div>
            ))}
            {activeTodos.length === 0 && (
              <span className="text-neutral-500 italic">All tasks completed!</span>
            )}
          </div>
        </div>

        {/* Target Topics Widget */}
        <div
          onClick={() => setCurrentTab('tools')}
          className="p-4 rounded-2xl bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/80 cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-300">
              <ListTodo className="w-4 h-4 text-neutral-400" />
              <span>Target Topics</span>
            </div>
            <span className="text-[11px] font-mono-numbers px-2 py-0.5 rounded-md bg-neutral-950 border border-neutral-800 text-neutral-400">
              {inProgressTopics.length} active
            </span>
          </div>
          <div className="text-xs text-neutral-400 space-y-1">
            {inProgressTopics.slice(0, 2).map((topic) => (
              <div key={topic.id} className="truncate text-neutral-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 shrink-0" />
                <span className="truncate">{topic.title}</span>
              </div>
            ))}
            {inProgressTopics.length === 0 && (
              <span className="text-neutral-500 italic">No pending topics</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick App Shield Launcher Banner */}
      <div
        onClick={() => setShowAppLauncherModal(true)}
        className="p-3.5 rounded-2xl bg-neutral-900/50 hover:bg-neutral-900 border border-neutral-800/80 flex items-center justify-between cursor-pointer transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-neutral-800/60 border border-neutral-700/60 text-neutral-300">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-neutral-200 group-hover:text-white flex items-center gap-1.5">
              <span>App Shield & Launcher</span>
              <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-[10px] text-neutral-300 font-mono-numbers">
                {allowedAppsCount} Allowed
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              {blockedAppsCount} unauthorized apps will be blocked during study
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
};

