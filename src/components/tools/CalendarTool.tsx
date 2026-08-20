import React, { useState, useEffect, useMemo } from 'react';
import { useStudy } from '../../context/StudyContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  BookOpen,
  CheckCircle2,
  Circle,
  Trash2,
  Sparkles,
  Flame,
  AlertCircle,
  GraduationCap,
  ListTodo,
  FileCheck,
  CalendarDays,
  X,
} from 'lucide-react';
import { CalendarStudyEvent } from '../../types';
import { formatDateString, formatDurationHuman } from '../../utils/time';

const EVENT_TYPES = [
  { id: 'exam', label: 'Exam / Test', icon: GraduationCap, color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  { id: 'revision', label: 'Revision Milestone', icon: Sparkles, color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  { id: 'target', label: 'Daily Target', icon: Flame, color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'assignment', label: 'Assignment / Homework', icon: FileCheck, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { id: 'class', label: 'Class / Lecture', icon: BookOpen, color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
] as const;

export const CalendarTool: React.FC = () => {
  const {
    themeConfig,
    sessions,
    subjects,
    calendarEvents,
    addCalendarEvent,
    toggleCalendarEventCompleted,
    deleteCalendarEvent,
  } = useStudy();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(() => formatDateString(new Date()));
  const [realTimeClock, setRealTimeClock] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<CalendarStudyEvent['type']>('exam');
  const [newDate, setNewDate] = useState(selectedDateStr);
  const [newTime, setNewTime] = useState('');
  const [newSubjectId, setNewSubjectId] = useState(subjects[0]?.id || '');
  const [newTargetHours, setNewTargetHours] = useState('2');
  const [newNotes, setNewNotes] = useState('');

  // Live real-time clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setRealTimeClock(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(formatDateString(today));
  };

  // Calendar Grid Calculation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Days in current month
    const totalDays = lastDayOfMonth.getDate();

    // Day of the week for first day (0 = Sunday, 1 = Monday...)
    // Let's make Monday index 0:
    let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startingDayOfWeek === -1) startingDayOfWeek = 6;

    // Previous month padding
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    const days: Array<{
      date: Date;
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    const todayStr = formatDateString(new Date());

    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1, prevMonthLastDay - i);
      days.push({
        date: d,
        dateStr: formatDateString(d),
        dayNum: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: formatDateString(d) === todayStr,
      });
    }

    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(currentYear, currentMonth, day);
      const dStr = formatDateString(d);
      days.push({
        date: d,
        dateStr: dStr,
        dayNum: day,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
      });
    }

    // Next month padding to fill rows of 7
    const remaining = (7 - (days.length % 7)) % 7;
    for (let nextDay = 1; nextDay <= remaining; nextDay++) {
      const d = new Date(currentYear, currentMonth + 1, nextDay);
      days.push({
        date: d,
        dateStr: formatDateString(d),
        dayNum: nextDay,
        isCurrentMonth: false,
        isToday: formatDateString(d) === todayStr,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Aggregate sessions by date string
  const sessionsByDate = useMemo(() => {
    const map: Record<string, { totalStudySecs: number; count: number; subjects: Set<string> }> = {};
    sessions.forEach((s) => {
      if (!map[s.dateString]) {
        map[s.dateString] = { totalStudySecs: 0, count: 0, subjects: new Set() };
      }
      map[s.dateString].totalStudySecs += s.actualStudySeconds;
      map[s.dateString].count += 1;
      map[s.dateString].subjects.add(s.subjectName);
    });
    return map;
  }, [sessions]);

  // Aggregate events by date string
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarStudyEvent[]> = {};
    calendarEvents.forEach((ev) => {
      if (!map[ev.date]) {
        map[ev.date] = [];
      }
      map[ev.date].push(ev);
    });
    return map;
  }, [calendarEvents]);

  // Selected Day Details
  const selectedDaySessions = useMemo(() => {
    return sessions.filter((s) => s.dateString === selectedDateStr);
  }, [sessions, selectedDateStr]);

  const selectedDayEvents = useMemo(() => {
    return calendarEvents.filter((ev) => ev.date === selectedDateStr);
  }, [calendarEvents, selectedDateStr]);

  const selectedDayTotalSeconds = selectedDaySessions.reduce((acc, s) => acc + s.actualStudySeconds, 0);

  // Month Statistics
  const monthStats = useMemo(() => {
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const monthSessions = sessions.filter((s) => s.dateString.startsWith(monthPrefix));
    const totalSecs = monthSessions.reduce((acc, s) => acc + s.actualStudySeconds, 0);
    const activeDaysSet = new Set(monthSessions.map((s) => s.dateString));

    const monthEvents = calendarEvents.filter((ev) => ev.date.startsWith(monthPrefix));
    const completedEvents = monthEvents.filter((e) => e.completed).length;

    return {
      totalHours: (totalSecs / 3600).toFixed(1),
      activeDays: activeDaysSet.size,
      totalEvents: monthEvents.length,
      completedEvents,
    };
  }, [sessions, calendarEvents, currentYear, currentMonth]);

  // Next Upcoming Event / Countdown
  const nextUpcomingEvent = useMemo(() => {
    const todayStr = formatDateString(new Date());
    const upcoming = calendarEvents
      .filter((ev) => ev.date >= todayStr && !ev.completed)
      .sort((a, b) => a.date.localeCompare(b.date));
    return upcoming[0] || null;
  }, [calendarEvents]);

  const countdownText = useMemo(() => {
    if (!nextUpcomingEvent) return null;
    const targetDate = new Date(`${nextUpcomingEvent.date}T${nextUpcomingEvent.time || '00:00'}:00`);
    const diffMs = targetDate.getTime() - realTimeClock.getTime();
    if (diffMs <= 0) return 'Today / Due now';
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remHours = diffHours % 24;
    const remMinutes = Math.floor((diffMs / (1000 * 60)) % 60);

    if (diffDays > 0) {
      return `${diffDays}d ${remHours}h ${remMinutes}m left`;
    }
    return `${remHours}h ${remMinutes}m left`;
  }, [nextUpcomingEvent, realTimeClock]);

  // Open add modal for selected date
  const handleOpenAddModal = (dateStr?: string) => {
    setNewDate(dateStr || selectedDateStr);
    setNewTitle('');
    setNewType('exam');
    setNewTime('');
    setNewSubjectId(subjects[0]?.id || '');
    setNewTargetHours('2');
    setNewNotes('');
    setShowAddModal(true);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const subj = subjects.find((s) => s.id === newSubjectId);

    addCalendarEvent({
      title: newTitle.trim(),
      date: newDate,
      time: newTime.trim() || undefined,
      type: newType,
      subjectId: newSubjectId || undefined,
      subjectName: subj?.name,
      targetHours: parseFloat(newTargetHours) || undefined,
      notes: newNotes.trim() || undefined,
      completed: false,
    });

    setShowAddModal(false);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-4">
      {/* Real-time Status Card */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border font-mono font-bold text-xs"
            style={{ backgroundColor: `${themeConfig.hex}15`, borderColor: `${themeConfig.hex}40`, color: themeConfig.hex }}
          >
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-400">REAL-TIME CLOCK</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-lg sm:text-xl font-mono font-black text-neutral-100">
              {realTimeClock.toLocaleTimeString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleJumpToToday}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition flex items-center gap-1.5"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Jump Today</span>
          </button>
          <button
            onClick={() => handleOpenAddModal(selectedDateStr)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm"
            style={{ backgroundColor: themeConfig.hex, color: '#0a0a0a' }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Next Upcoming Exam / Milestone Countdown Banner */}
      {nextUpcomingEvent && (
        <div className="bg-gradient-to-r from-rose-950/40 via-neutral-900 to-neutral-900 border border-rose-900/40 rounded-2xl p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-wider uppercase text-rose-400 flex items-center gap-1">
                <span>NEXT TARGET / DEADLINE</span>
              </div>
              <div className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <span>{nextUpcomingEvent.title}</span>
                {nextUpcomingEvent.subjectName && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-medium">
                    {nextUpcomingEvent.subjectName}
                  </span>
                )}
              </div>
              <div className="text-xs text-neutral-400">
                {nextUpcomingEvent.date} {nextUpcomingEvent.time ? `@ ${nextUpcomingEvent.time}` : ''}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs font-mono font-bold text-rose-300 bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-800/40">
              {countdownText}
            </div>
          </div>
        </div>
      )}

      {/* Month Navigation & Month Stats */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" style={{ color: themeConfig.hex }} />
            <h3 className="text-lg font-black text-neutral-100">
              {monthNames[currentMonth]} {currentYear}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
          {daysOfWeek.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Month Day Cells Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((item, idx) => {
            const isSelected = item.dateStr === selectedDateStr;
            const dayStudy = sessionsByDate[item.dateStr];
            const dayEvents = eventsByDate[item.dateStr] || [];
            const hasExam = dayEvents.some((e) => e.type === 'exam');
            const hasTarget = dayEvents.some((e) => e.type === 'target' || e.type === 'revision');

            // Format study hours
            const studyHours = dayStudy ? (dayStudy.totalStudySecs / 3600).toFixed(1) : null;

            return (
              <button
                key={idx}
                onClick={() => setSelectedDateStr(item.dateStr)}
                className={`min-h-[64px] sm:min-h-[70px] p-1.5 rounded-xl flex flex-col justify-between items-start transition-all relative border ${
                  isSelected
                    ? 'border-2 shadow-md ring-2 ring-neutral-700'
                    : item.isToday
                    ? 'border-neutral-700 bg-neutral-800/80'
                    : item.isCurrentMonth
                    ? 'border-neutral-800/60 bg-neutral-900/60 hover:bg-neutral-800/40 hover:border-neutral-700'
                    : 'border-transparent bg-neutral-950/40 opacity-35'
                }`}
                style={{
                  borderColor: isSelected ? themeConfig.hex : undefined,
                  backgroundColor: isSelected ? `${themeConfig.hex}15` : undefined,
                }}
              >
                {/* Day Number and Today Badge */}
                <div className="w-full flex items-center justify-between">
                  <span
                    className={`text-xs font-black ${
                      item.isToday
                        ? 'px-1.5 py-0.5 rounded-full text-black'
                        : isSelected
                        ? 'font-extrabold text-neutral-100'
                        : item.isCurrentMonth
                        ? 'text-neutral-300'
                        : 'text-neutral-600'
                    }`}
                    style={{
                      backgroundColor: item.isToday ? themeConfig.hex : undefined,
                    }}
                  >
                    {item.dayNum}
                  </span>

                  {/* Event Badges / Dots */}
                  <div className="flex items-center gap-0.5">
                    {hasExam && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                    {hasTarget && !hasExam && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                    {dayEvents.length > 0 && (
                      <span className="text-[9px] font-mono text-neutral-400 font-bold">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>
                </div>

                {/* Study Time / Activity Bar */}
                <div className="w-full mt-1">
                  {dayStudy && dayStudy.totalStudySecs > 0 ? (
                    <div
                      className="w-full px-1 py-0.5 rounded text-[9px] font-mono font-bold truncate text-center"
                      style={{
                        backgroundColor: `${themeConfig.hex}25`,
                        color: themeConfig.hex,
                      }}
                    >
                      {studyHours}h
                    </div>
                  ) : dayEvents.length > 0 ? (
                    <div className="w-full px-1 py-0.5 rounded text-[9px] font-medium truncate text-neutral-400 bg-neutral-800 text-center">
                      {dayEvents[0].title}
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        {/* Month Summary Bar */}
        <div className="pt-3 border-t border-neutral-800/80 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="text-neutral-400 text-[10px] uppercase font-bold">Total Focus</div>
            <div className="text-base font-black text-neutral-100 font-mono mt-0.5">
              {monthStats.totalHours} <span className="text-xs font-normal text-neutral-400">hrs</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="text-neutral-400 text-[10px] uppercase font-bold">Active Days</div>
            <div className="text-base font-black text-neutral-100 font-mono mt-0.5">
              {monthStats.activeDays} <span className="text-xs font-normal text-neutral-400">days</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="text-neutral-400 text-[10px] uppercase font-bold">Events / Deadlines</div>
            <div className="text-base font-black text-neutral-100 font-mono mt-0.5">
              {monthStats.completedEvents} / {monthStats.totalEvents}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Day Inspector */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-800">
          <div>
            <div className="text-[10px] font-bold tracking-wider uppercase" style={{ color: themeConfig.hex }}>
              DAY SCHEDULE & FOCUS LOG
            </div>
            <h3 className="text-xl font-black text-neutral-100 font-heading">
              {selectedDateStr === formatDateString(new Date()) ? `Today (${selectedDateStr})` : selectedDateStr}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenAddModal(selectedDateStr)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Target</span>
            </button>
          </div>
        </div>

        {/* Day Focus Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <div className="text-[10px] font-bold text-neutral-400 uppercase">Focus Time</div>
            <div className="text-lg font-black text-neutral-100 font-mono mt-0.5">
              {formatDurationHuman(selectedDayTotalSeconds)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <div className="text-[10px] font-bold text-neutral-400 uppercase">Sessions</div>
            <div className="text-lg font-black text-neutral-100 font-mono mt-0.5">
              {selectedDaySessions.length}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <div className="text-[10px] font-bold text-neutral-400 uppercase">Cycles Completed</div>
            <div className="text-lg font-black text-neutral-100 font-mono mt-0.5">
              {selectedDaySessions.reduce((acc, s) => acc + s.cyclesCompleted, 0)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <div className="text-[10px] font-bold text-neutral-400 uppercase">Break Count</div>
            <div className="text-lg font-black text-neutral-100 font-mono mt-0.5">
              {selectedDaySessions.reduce((acc, s) => acc + (s.breaks?.length || 0), 0)}
            </div>
          </div>
        </div>

        {/* Day Events Section */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <ListTodo className="w-3.5 h-3.5" />
              <span>Events & Deadlines ({selectedDayEvents.length})</span>
            </h4>
          </div>

          {selectedDayEvents.length === 0 ? (
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 text-center text-xs text-neutral-500">
              No exams or deadlines scheduled for this date.{' '}
              <button
                onClick={() => handleOpenAddModal(selectedDateStr)}
                className="underline hover:text-neutral-300 font-semibold ml-1"
                style={{ color: themeConfig.hex }}
              >
                + Add one
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDayEvents.map((ev) => {
                const typeConfig = EVENT_TYPES.find((t) => t.id === ev.type) || EVENT_TYPES[0];
                const TypeIcon = typeConfig.icon;

                return (
                  <div
                    key={ev.id}
                    className={`p-3 rounded-xl border flex items-start justify-between gap-3 transition-all ${
                      ev.completed
                        ? 'bg-neutral-950/40 border-neutral-900 opacity-60'
                        : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleCalendarEventCompleted(ev.id)}
                        className="mt-0.5 text-neutral-500 hover:text-neutral-200 transition"
                      >
                        {ev.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-bold ${
                              ev.completed ? 'line-through text-neutral-400' : 'text-neutral-100'
                            }`}
                          >
                            {ev.title}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${typeConfig.color}`}
                          >
                            <TypeIcon className="w-3 h-3" />
                            <span>{typeConfig.label}</span>
                          </span>
                          {ev.subjectName && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                              {ev.subjectName}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-neutral-400">
                          {ev.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{ev.time}</span>
                            </span>
                          )}
                          {ev.targetHours && (
                            <span className="flex items-center gap-1">
                              <Flame className="w-3 h-3 text-amber-400" />
                              <span>Target: {ev.targetHours} hrs</span>
                            </span>
                          )}
                        </div>

                        {ev.notes && (
                          <p className="text-xs text-neutral-400 bg-neutral-900/70 p-2 rounded-lg border border-neutral-800/80 mt-1">
                            {ev.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteCalendarEvent(ev.id)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-900 transition"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Day Sessions List */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Recorded Study Sessions ({selectedDaySessions.length})</span>
          </h4>

          {selectedDaySessions.length === 0 ? (
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 text-center text-xs text-neutral-500">
              No study sessions logged on this day yet.
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDaySessions.map((s) => {
                const startTimeStr = new Date(s.startTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const endTimeStr = new Date(s.endTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: s.subjectColor || themeConfig.hex }}
                      />
                      <div>
                        <div className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                          <span>{s.subjectName}</span>
                          <span className="text-xs font-mono text-neutral-400">
                            {startTimeStr} - {endTimeStr}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                          <span>{s.cyclesCompleted} cycle(s)</span>
                          <span>•</span>
                          <span>{Math.floor(s.actualStudySeconds / 60)} mins focus</span>
                          {s.breaks && s.breaks.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{s.breaks.length} break(s)</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <div className="font-mono font-bold text-neutral-200">
                        {formatDurationHuman(s.actualStudySeconds)}
                      </div>
                      {s.stopReason && (
                        <div className="text-[10px] text-neutral-500 truncate max-w-[120px]">
                          {s.stopReason}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Study Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm"
                  style={{ backgroundColor: `${themeConfig.hex}20`, color: themeConfig.hex }}
                >
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-neutral-100 font-heading">
                    Add Study Event / Exam
                  </h3>
                  <p className="text-xs text-neutral-400">Schedule a target or exam deadline</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Calculus Midterm Exam, Revise Unit 3..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">Event Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-neutral-600"
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">Subject</label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => setNewSubjectId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-neutral-600"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-neutral-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">Time (Optional)</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-neutral-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Target Study Hours (Optional)
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  max="24"
                  placeholder="e.g. 2.0"
                  value={newTargetHours}
                  onChange={(e) => setNewTargetHours(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">Notes / Syllabus</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Chapters 4, 5, 6 formulas and practice tests..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black transition shadow-sm"
                  style={{ backgroundColor: themeConfig.hex, color: '#0a0a0a' }}
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
