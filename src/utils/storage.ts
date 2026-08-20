import { DEFAULT_APPS, DEFAULT_SETTINGS, DEFAULT_SUBJECTS, ANDROID_PERMISSIONS } from '../constants';
import { AppItem, AndroidPermission, StudyNote, StudySession, Subject, UserSettings, ActiveStudyState, TodoItem, TargetTopic, FlashCard, CalendarStudyEvent } from '../types';
import { formatDateString } from './time';

const KEYS = {
  INITIALIZED: 'studymode_v2_init',
  SETTINGS: 'studymode_v2_settings',
  SUBJECTS: 'studymode_v2_subjects',
  SESSIONS: 'studymode_v2_sessions',
  APPS: 'studymode_v2_apps',
  PERMISSIONS: 'studymode_v2_permissions',
  NOTES: 'studymode_v2_notes',
  TODOS: 'studymode_v2_todos',
  TOPICS: 'studymode_v2_topics',
  FLASHCARDS: 'studymode_v2_flashcards',
  EVENTS: 'studymode_v2_calendar_events',
  ACTIVE_STATE: 'studymode_v2_active_session',
};

// Optional demo generator (only invoked when user explicitly clicks "Load Sample Demo Data")
export function generateDemo30DayHistory(): StudySession[] {
  const sessions: StudySession[] = [];
  const subjects = Storage.getSubjects();
  const stopReasons = ['Going somewhere', 'Meal / Dinner time', 'Sleep / Bedtime', 'College / Class session', 'Work shift / Meeting'];

  const now = new Date();
  for (let i = 28; i >= 0; i--) {
    const day = new Date();
    day.setDate(now.getDate() - i);
    const dateStr = formatDateString(day);

    if (i % 7 === 5 && i !== 0) continue; // rest day

    const numSessions = (i % 3 === 0) ? 2 : 1;

    for (let sIdx = 0; sIdx < numSessions; sIdx++) {
      const subject = subjects[(i + sIdx) % subjects.length] || DEFAULT_SUBJECTS[0];
      const cycles = (i % 4) + 1;
      
      const startHour = sIdx === 0 ? 9 + (i % 3) : 15 + (i % 2);
      const startMinute = (i * 7) % 60;
      
      const sessionStart = new Date(day);
      sessionStart.setHours(startHour, startMinute, 0, 0);

      const studySecs = cycles * 3600 - ((i * 120) % 600);
      const breaksList = [];
      let totalBreakSecs = 0;
      let totalPenaltySecs = 0;

      if (cycles >= 1) {
        breaksList.push({
          id: `brk-${i}-${sIdx}-1`,
          reasonId: 'water',
          reasonName: 'Drink Water',
          reasonIcon: '💧',
          durationMinutesScheduled: 2,
          actualDurationSeconds: 120,
          penaltyMinutesAdded: 4,
          timestamp: sessionStart.getTime() + 1800000,
        });
        totalBreakSecs += 120;
        totalPenaltySecs += 240;
      }

      if (cycles >= 2) {
        breaksList.push({
          id: `brk-${i}-${sIdx}-2`,
          reasonId: (i % 2 === 0) ? 'pee' : 'rest',
          reasonName: (i % 2 === 0) ? 'Pee' : 'Short Rest / Stretch',
          reasonIcon: (i % 2 === 0) ? '🚽' : '🧘',
          durationMinutesScheduled: (i % 2 === 0) ? 2 : 5,
          actualDurationSeconds: (i % 2 === 0) ? 120 : 300,
          penaltyMinutesAdded: (i % 2 === 0) ? 4 : 10,
          timestamp: sessionStart.getTime() + 5400000,
        });
        totalBreakSecs += (i % 2 === 0) ? 120 : 300;
        totalPenaltySecs += (i % 2 === 0) ? 240 : 600;
      }

      const totalElapsed = studySecs + totalBreakSecs + totalPenaltySecs;
      const sessionEnd = new Date(sessionStart.getTime() + totalElapsed * 1000);

      sessions.push({
        id: `demo-session-${i}-${sIdx}`,
        subjectId: subject.id,
        subjectName: subject.name,
        subjectColor: subject.color,
        startTimestamp: sessionStart.getTime(),
        endTimestamp: sessionEnd.getTime(),
        totalSessionSeconds: totalElapsed,
        actualStudySeconds: studySecs,
        breakSeconds: totalBreakSecs,
        penaltySeconds: totalPenaltySecs,
        cyclesCompleted: cycles,
        breaks: breaksList,
        stopReason: stopReasons[(i + sIdx) % stopReasons.length],
        dateString: dateStr,
      });
    }
  }

  return sessions.sort((a, b) => b.startTimestamp - a.startTimestamp);
}

function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[StudyMode Storage] Error parsing key ${key}`, err);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`[StudyMode Storage] Error saving key ${key}`, err);
  }
}

// Initial bootstrap check
function ensureInitialized(): void {
  try {
    const isInit = localStorage.getItem(KEYS.INITIALIZED);
    if (!isInit) {
      // First-ever launch: initialize with clean user slate
      safeSet(KEYS.SETTINGS, DEFAULT_SETTINGS);
      safeSet(KEYS.SUBJECTS, DEFAULT_SUBJECTS);
      safeSet(KEYS.SESSIONS, []);
      safeSet(KEYS.APPS, DEFAULT_APPS);
      safeSet(KEYS.PERMISSIONS, ANDROID_PERMISSIONS);
      safeSet(KEYS.NOTES, []);
      safeSet(KEYS.TODOS, []);
      safeSet(KEYS.TOPICS, []);
      safeSet(KEYS.FLASHCARDS, []);
      safeSet(KEYS.EVENTS, []);
      localStorage.setItem(KEYS.INITIALIZED, 'true');
    }
  } catch {}
}

// Run bootstrap immediately on import
ensureInitialized();

export const Storage = {
  getSettings(): UserSettings {
    const saved = safeGet<UserSettings | null>(KEYS.SETTINGS, null);
    if (!saved) {
      safeSet(KEYS.SETTINGS, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...saved };
  },

  saveSettings(settings: UserSettings): void {
    safeSet(KEYS.SETTINGS, settings);
  },

  getSubjects(): Subject[] {
    const saved = safeGet<Subject[] | null>(KEYS.SUBJECTS, null);
    if (!saved || saved.length === 0) {
      safeSet(KEYS.SUBJECTS, DEFAULT_SUBJECTS);
      return DEFAULT_SUBJECTS;
    }
    return saved;
  },

  saveSubjects(subjects: Subject[]): void {
    safeSet(KEYS.SUBJECTS, subjects);
  },

  getSessions(): StudySession[] {
    // Return saved sessions or empty array - NEVER resurrects fake sessions automatically
    return safeGet<StudySession[]>(KEYS.SESSIONS, []);
  },

  saveSessions(sessions: StudySession[]): void {
    safeSet(KEYS.SESSIONS, sessions);
  },

  addSession(session: StudySession): void {
    const current = this.getSessions();
    const updated = [session, ...current];
    this.saveSessions(updated);
  },

  deleteSession(id: string): void {
    const current = this.getSessions();
    const updated = current.filter((s) => s.id !== id);
    this.saveSessions(updated);
  },

  clearAllSessions(): void {
    safeSet(KEYS.SESSIONS, []);
  },

  getApps(): AppItem[] {
    const saved = safeGet<AppItem[] | null>(KEYS.APPS, null);
    if (!saved || saved.length === 0) {
      safeSet(KEYS.APPS, DEFAULT_APPS);
      return DEFAULT_APPS;
    }
    return saved;
  },

  saveApps(apps: AppItem[]): void {
    safeSet(KEYS.APPS, apps);
  },

  getPermissions(): AndroidPermission[] {
    const saved = safeGet<AndroidPermission[] | null>(KEYS.PERMISSIONS, null);
    if (!saved || saved.length === 0) {
      safeSet(KEYS.PERMISSIONS, ANDROID_PERMISSIONS);
      return ANDROID_PERMISSIONS;
    }
    return saved;
  },

  savePermissions(permissions: AndroidPermission[]): void {
    safeSet(KEYS.PERMISSIONS, permissions);
  },

  getNotes(): StudyNote[] {
    return safeGet<StudyNote[]>(KEYS.NOTES, []);
  },

  saveNotes(notes: StudyNote[]): void {
    safeSet(KEYS.NOTES, notes);
  },

  getActiveState(): ActiveStudyState | null {
    return safeGet<ActiveStudyState | null>(KEYS.ACTIVE_STATE, null);
  },

  saveActiveState(state: ActiveStudyState | null): void {
    if (!state) {
      try {
        localStorage.removeItem(KEYS.ACTIVE_STATE);
      } catch {}
    } else {
      safeSet(KEYS.ACTIVE_STATE, state);
    }
  },

  getTodos(): TodoItem[] {
    return safeGet<TodoItem[]>(KEYS.TODOS, []);
  },

  saveTodos(todos: TodoItem[]): void {
    safeSet(KEYS.TODOS, todos);
  },

  getTargetTopics(): TargetTopic[] {
    return safeGet<TargetTopic[]>(KEYS.TOPICS, []);
  },

  saveTargetTopics(topics: TargetTopic[]): void {
    safeSet(KEYS.TOPICS, topics);
  },

  getFlashcards(): FlashCard[] {
    return safeGet<FlashCard[]>(KEYS.FLASHCARDS, []);
  },

  saveFlashcards(cards: FlashCard[]): void {
    safeSet(KEYS.FLASHCARDS, cards);
  },

  getCalendarEvents(): CalendarStudyEvent[] {
    return safeGet<CalendarStudyEvent[]>(KEYS.EVENTS, []);
  },

  saveCalendarEvents(events: CalendarStudyEvent[]): void {
    safeSet(KEYS.EVENTS, events);
  },

  addCalendarEvent(event: CalendarStudyEvent): void {
    const current = this.getCalendarEvents();
    const updated = [event, ...current];
    this.saveCalendarEvents(updated);
  },

  deleteCalendarEvent(id: string): void {
    const current = this.getCalendarEvents();
    const updated = current.filter((e) => e.id !== id);
    this.saveCalendarEvents(updated);
  },

  // Load sample demo data on explicit user demand
  loadDemoData(): void {
    const demoSessions = generateDemo30DayHistory();
    this.saveSessions(demoSessions);
  },

  exportAllData(): string {
    return JSON.stringify(
      {
        version: '2.0',
        settings: this.getSettings(),
        subjects: this.getSubjects(),
        sessions: this.getSessions(),
        apps: this.getApps(),
        permissions: this.getPermissions(),
        notes: this.getNotes(),
        todos: this.getTodos(),
        targetTopics: this.getTargetTopics(),
        flashcards: this.getFlashcards(),
        calendarEvents: this.getCalendarEvents(),
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  },

  importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.settings) this.saveSettings(parsed.settings);
      if (parsed.subjects) this.saveSubjects(parsed.subjects);
      if (parsed.sessions) this.saveSessions(parsed.sessions);
      if (parsed.apps) this.saveApps(parsed.apps);
      if (parsed.permissions) this.savePermissions(parsed.permissions);
      if (parsed.notes) this.saveNotes(parsed.notes);
      if (parsed.todos) this.saveTodos(parsed.todos);
      if (parsed.targetTopics) this.saveTargetTopics(parsed.targetTopics);
      if (parsed.flashcards) this.saveFlashcards(parsed.flashcards);
      if (parsed.calendarEvents) this.saveCalendarEvents(parsed.calendarEvents);
      return true;
    } catch {
      return false;
    }
  },

  resetAllData(): void {
    try {
      Object.values(KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      // Re-initialize clean factory defaults
      safeSet(KEYS.SETTINGS, DEFAULT_SETTINGS);
      safeSet(KEYS.SUBJECTS, DEFAULT_SUBJECTS);
      safeSet(KEYS.SESSIONS, []);
      safeSet(KEYS.APPS, DEFAULT_APPS);
      safeSet(KEYS.PERMISSIONS, ANDROID_PERMISSIONS);
      safeSet(KEYS.NOTES, []);
      safeSet(KEYS.TODOS, []);
      safeSet(KEYS.TOPICS, []);
      safeSet(KEYS.FLASHCARDS, []);
      safeSet(KEYS.EVENTS, []);
      localStorage.setItem(KEYS.INITIALIZED, 'true');
    } catch {}
  },
};
