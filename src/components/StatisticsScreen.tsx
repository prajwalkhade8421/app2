import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { formatDurationHuman, formatClockTime, formatDatePretty, formatDateString, calculateStreak } from '../utils/time';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, Clock, Flame, BookOpen, Coffee, Calendar, TrendingUp, Award, Layers } from 'lucide-react';
import { PREDEFINED_BREAKS } from '../constants';

export const StatisticsScreen: React.FC = () => {
  const { sessions, subjects, todayStudySeconds, themeConfig } = useStudy();
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'breaks' | 'timeline' | 'daily'>('overview');

  const streakInfo = calculateStreak(sessions);

  // Time calculations
  const now = new Date();
  const todayStr = formatDateString(now);

  // Start of this week (Monday)
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  // Start of this month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisWeekSeconds = sessions
    .filter((s) => s.startTimestamp >= startOfWeek.getTime())
    .reduce((acc, s) => acc + s.actualStudySeconds, 0);

  const thisMonthSeconds = sessions
    .filter((s) => s.startTimestamp >= startOfMonth.getTime())
    .reduce((acc, s) => acc + s.actualStudySeconds, 0);

  const totalStudySeconds = sessions.reduce((acc, s) => acc + s.actualStudySeconds, 0);
  const totalSessionsCount = sessions.length;
  const totalCyclesCompleted = sessions.reduce((acc, s) => acc + s.cyclesCompleted, 0);

  const avgSessionSeconds = totalSessionsCount > 0 ? Math.floor(totalStudySeconds / totalSessionsCount) : 0;
  const longestSessionSeconds = sessions.reduce((max, s) => Math.max(max, s.actualStudySeconds), 0);

  // Best study day
  const dailyAgg: Record<string, number> = {};
  sessions.forEach((s) => {
    dailyAgg[s.dateString] = (dailyAgg[s.dateString] || 0) + s.actualStudySeconds;
  });

  let bestDayDate = '';
  let bestDaySeconds = 0;
  Object.entries(dailyAgg).forEach(([dStr, secs]) => {
    if (secs > bestDaySeconds) {
      bestDaySeconds = secs;
      bestDayDate = dStr;
    }
  });

  // Subject statistics
  const subjectStats = subjects.map((subj) => {
    const subjSessions = sessions.filter((s) => s.subjectId === subj.id);
    const time = subjSessions.reduce((acc, s) => acc + s.actualStudySeconds, 0);
    const count = subjSessions.length;
    const avg = count > 0 ? Math.floor(time / count) : 0;
    const percent = totalStudySeconds > 0 ? Math.round((time / totalStudySeconds) * 100) : 0;

    return {
      subject: subj,
      totalSeconds: time,
      sessionCount: count,
      avgSeconds: avg,
      percentage: percent,
    };
  }).sort((a, b) => b.totalSeconds - a.totalSeconds);

  // Break statistics
  const allBreakRecords = sessions.flatMap((s) => s.breaks);
  const breakStats = PREDEFINED_BREAKS.map((pBreak) => {
    const matched = allBreakRecords.filter((b) => b.reasonId === pBreak.id);
    const count = matched.length;
    const duration = matched.reduce((acc, b) => acc + b.actualDurationSeconds, 0);
    const penalty = matched.reduce((acc, b) => acc + b.penaltyMinutesAdded, 0);
    const avgDuration = count > 0 ? Math.floor(duration / count) : 0;

    return {
      reason: pBreak,
      count,
      totalSeconds: duration,
      avgSeconds: avgDuration,
      penaltyMinutes: penalty,
    };
  });

  // Daily Graph Data (Past 7 Days)
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dStr = formatDateString(d);
    const dayName = d.toLocaleDateString([], { weekday: 'short' });
    const daySecs = dailyAgg[dStr] || 0;
    const dayHours = Number((daySecs / 3600).toFixed(1));

    chartData.push({
      dateStr: dStr,
      day: dayName,
      hours: dayHours,
      label: formatDurationHuman(daySecs),
      rawSeconds: daySecs,
    });
  }

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div
          className="text-[10px] font-bold tracking-[0.2em] uppercase"
          style={{ color: themeConfig.hex }}
        >
          ANALYTICS & INSIGHTS
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-neutral-100 font-heading">
          Study Statistics
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Comprehensive tracking across cycles, subjects, and penalties
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-x-auto">
        {(
          [
            { id: 'overview', label: 'Overview' },
            { id: 'subjects', label: 'Subjects' },
            { id: 'breaks', label: 'Breaks' },
            { id: 'daily', label: 'Graph' },
            { id: 'timeline', label: 'Timeline' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'font-bold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            style={{
              backgroundColor: activeTab === tab.id ? themeConfig.hex : undefined,
              color: activeTab === tab.id ? '#0a0a0a' : undefined,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Main 4 Metric Cards Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Today</div>
              <div
                className="text-2xl font-black font-mono-numbers mt-1"
                style={{ color: themeConfig.hex }}
              >
                {formatDurationHuman(todayStudySeconds)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">This Week</div>
              <div className="text-2xl font-black font-mono-numbers text-neutral-100 mt-1">
                {formatDurationHuman(thisWeekSeconds)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">This Month</div>
              <div className="text-2xl font-black font-mono-numbers text-neutral-100 mt-1">
                {formatDurationHuman(thisMonthSeconds)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">All-Time Total</div>
              <div className="text-2xl font-black font-mono-numbers text-neutral-100 mt-1">
                {formatDurationHuman(totalStudySeconds)}
              </div>
            </div>
          </div>

          {/* Detailed Metric List */}
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 divide-y divide-neutral-800/80 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-neutral-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-neutral-400" /> Total Completed Cycles
              </span>
              <span className="font-bold font-mono-numbers text-neutral-200">{totalCyclesCompleted} (60m each)</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-neutral-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-400" /> Total Sessions
              </span>
              <span className="font-bold font-mono-numbers text-neutral-200">{totalSessionsCount}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-neutral-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-neutral-400" /> Average Session Length
              </span>
              <span className="font-bold font-mono-numbers text-neutral-200">{formatDurationHuman(avgSessionSeconds)}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-neutral-400 flex items-center gap-2">
                <Award className="w-4 h-4 text-neutral-400" /> Longest Session
              </span>
              <span className="font-bold font-mono-numbers text-neutral-200">{formatDurationHuman(longestSessionSeconds)}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-neutral-400 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" /> Current / Longest Streak
              </span>
              <span className="font-bold font-mono-numbers text-neutral-200">
                {streakInfo.currentStreak}d / {streakInfo.longestStreak}d
              </span>
            </div>

            {bestDayDate && (
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-neutral-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-neutral-400" /> Best Study Day
                </span>
                <span className="font-bold font-mono-numbers text-neutral-200">
                  {formatDatePretty(new Date(bestDayDate).getTime())} ({formatDurationHuman(bestDaySeconds)})
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SUBJECT STATISTICS */}
      {activeTab === 'subjects' && (
        <div className="space-y-3 animate-in fade-in">
          {subjectStats.map((item) => (
            <div
              key={item.subject.id}
              className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.subject.color }}
                  />
                  <span className="text-sm font-bold text-neutral-100">{item.subject.name}</span>
                </div>
                <span
                  className="text-xs font-black font-mono-numbers"
                  style={{ color: themeConfig.hex }}
                >
                  {formatDurationHuman(item.totalSeconds)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-neutral-950 overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.subject.color,
                  }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] text-neutral-400 pt-1 border-t border-neutral-800/60">
                <div>
                  <span className="text-neutral-500 block">Sessions</span>
                  <span className="font-semibold text-neutral-200 font-mono-numbers">{item.sessionCount}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Avg Duration</span>
                  <span className="font-semibold text-neutral-200 font-mono-numbers">{formatDurationHuman(item.avgSeconds)}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Total Share</span>
                  <span className="font-semibold text-neutral-200 font-mono-numbers">{item.percentage}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: BREAK STATISTICS */}
      {activeTab === 'breaks' && (
        <div className="space-y-3 animate-in fade-in">
          <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300 flex items-center gap-2">
            <Coffee className="w-4 h-4 text-neutral-400 shrink-0" />
            <span>All temporary breaks generate 2× time penalties added to study cycles.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {breakStats.map((item) => (
              <div
                key={item.reason.id}
                className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.reason.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-neutral-200">{item.reason.name}</div>
                      <div className="text-[10px] text-neutral-500">{item.reason.durationMinutes}m scheduled</div>
                    </div>
                  </div>
                  <span className="text-xs font-black font-mono-numbers px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300">
                    ×{item.count}
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-neutral-800 text-[11px]">
                  <div className="flex justify-between text-neutral-400">
                    <span>Total Duration:</span>
                    <span className="text-neutral-200 font-semibold font-mono-numbers">{formatDurationHuman(item.totalSeconds)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>Penalties Generated:</span>
                    <span className="font-bold font-mono-numbers" style={{ color: themeConfig.hex }}>
                      +{item.penaltyMinutes}m Added
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DAILY GRAPH */}
      {activeTab === 'daily' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                7-Day Study Activity (Hours)
              </div>
              <div className="text-xs text-neutral-500 font-medium">Daily Target: 6h</div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    stroke="#525252"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#262626' }}
                  />
                  <YAxis
                    stroke="#525252"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#262626' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-neutral-900 border border-neutral-700 p-2.5 rounded-xl text-xs shadow-xl">
                            <div className="font-bold text-neutral-200">{data.day} ({data.dateStr})</div>
                            <div className="font-mono-numbers font-semibold mt-0.5" style={{ color: themeConfig.hex }}>
                              Study Time: {data.label}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.hours >= 6 ? themeConfig.hex : '#404040'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Table list */}
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 divide-y divide-neutral-800 text-xs">
            {chartData.map((d) => (
              <div key={d.dateStr} className="py-2.5 flex items-center justify-between">
                <span className="text-neutral-300 font-medium">{d.day} ({d.dateStr})</span>
                <span className="font-bold font-mono-numbers" style={{ color: themeConfig.hex }}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="space-y-3 animate-in fade-in">
          <div className="text-xs text-neutral-400 mb-1">
            Exact timestamp intervals for completed sessions:
          </div>

          {sessions.slice(0, 15).map((s) => {
            const startClock = formatClockTime(s.startTimestamp);
            const endClock = formatClockTime(s.endTimestamp);

            return (
              <div
                key={s.id}
                className="p-3.5 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: s.subjectColor }}
                  />
                  <div>
                    <div className="text-xs font-bold font-mono-numbers text-neutral-200">
                      {startClock} → {endClock}
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                      {formatDatePretty(s.startTimestamp)} • {s.subjectName}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className="text-xs font-black font-mono-numbers"
                    style={{ color: themeConfig.hex }}
                  >
                    {formatDurationHuman(s.actualStudySeconds)}
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    {s.cyclesCompleted} cycle{s.cyclesCompleted > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
