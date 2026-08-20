import { DEFAULT_APPS, DEFAULT_SETTINGS, DEFAULT_SUBJECTS, ANDROID_PERMISSIONS, DEFAULT_TODOS, DEFAULT_TARGET_TOPICS, DEFAULT_FLASHCARDS } from '../constants';
import { AppItem, AndroidPermission, StudyNote, StudySession, Subject, UserSettings, ActiveStudyState, TodoItem, TargetTopic, FlashCard } from '../types';
import { formatDateString } from './time';

const KEYS = {
  SETTINGS: 'studymode_settings_v1',
  SUBJECTS: 'studymode_subjects_v1',
  SESSIONS: 'studymode_sessions_v1',
  APPS: 'studymode_apps_v1',
  PERMISSIONS: 'studymode_permissions_v1',
  NOTES: 'studymode_notes_v1',
  TODOS: 'studymode_todos_v1',
  TOPICS: 'studymode_topics_v1',
  FLASHCARDS: 'studymode_flashcards_v1',
  ACTIVE_STATE: 'studymode_active_session_v1',
};

// Seed realistic 30-day history if empty
function generateInitial30DayHistory(): StudySession[] {
  const sessions: StudySession[] = [];
  const subjects = DEFAULT_SUBJECTS;
  const stopReasons = ['Going somewhere', 'Meal / Dinner time', 'Sleep / Bedtime', 'College / Class session', 'Work shift / Meeting'];

  const now = new Date();
  
  // Seed past 30 days
  for (let i = 28; i >= 0; i--) {
    const day = new Date();
    day.setDate(now.getDate() - i);
    const dateStr = formatDateString(day);

    // 1 to 2 sessions on most days (skip a couple to be realistic)
    if (i % 7 === 5 && i !== 0) continue; // rest day

    const numSessions = (i % 3 === 0) ? 2 : 1;

    for (let sIdx = 0; sIdx < numSessions; sIdx++) {
      const subject = subjects[(i + sIdx) % subjects.length];
      const cycles = (i % 4) + 1; // 1 to 4 cycles
      
      const startHour = sIdx === 0 ? 9 + (i % 3) : 15 + (i % 2);
      const startMinute = (i * 7) % 60;
      
      const sessionStart = new Date(day);
      sessionStart.setHours(startHour, startMinute, 0, 0);

      const studySecs = cycles * 3600 - ((i * 120) % 600);
      const numBreaks = cycles;
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

      if (cycles >= 3) {
        breaksList.push({
          id: `brk-${i}-${sIdx}-3`,
          reasonId: 'eat',
          reasonName: 'Eat / Meal',
          reasonIcon: '🍽️',
          durationMinutesScheduled: 15,
          actualDurationSeconds: 900,
          penaltyMinutesAdded: 30,
          timestamp: sessionStart.getTime() + 9000000,
        });
        totalBreakSecs += 900;
        totalPenaltySecs += 1800;
      }

      const totalElapsed = studySecs + totalBreakSecs + totalPenaltySecs;
      const sessionEnd = new Date(sessionStart.getTime() + totalElapsed * 1000);

      sessions.push({
        id: `session-seed-${i}-${sIdx}`,
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

export const Storage = {
  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  },

  getSubjects(): Subject[] {
    try {
      const data = localStorage.getItem(KEYS.SUBJECTS);
      return data ? JSON.parse(data) : DEFAULT_SUBJECTS;
    } catch {
      return DEFAULT_SUBJECTS;
    }
  },

  saveSubjects(subjects: Subject[]): void {
    try {
      localStorage.setItem(KEYS.SUBJECTS, JSON.stringify(subjects));
    } catch {}
  },

  getSessions(): StudySession[] {
    try {
      const data = localStorage.getItem(KEYS.SESSIONS);
      if (!data) {
        const initial = generateInitial30DayHistory();
        this.saveSessions(initial);
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveSessions(sessions: StudySession[]): void {
    try {
      localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
    } catch {}
  },

  addSession(session: StudySession): void {
    const sessions = this.getSessions();
    sessions.unshift(session);
    this.saveSessions(sessions);
  },

  deleteSession(id: string): void {
    const sessions = this.getSessions().filter((s) => s.id !== id);
    this.saveSessions(sessions);
  },

  clearAllSessions(): void {
    try {
      localStorage.removeItem(KEYS.SESSIONS);
    } catch {}
  },

  getApps(): AppItem[] {
    try {
      const data = localStorage.getItem(KEYS.APPS);
      return data ? JSON.parse(data) : DEFAULT_APPS;
    } catch {
      return DEFAULT_APPS;
    }
  },

  saveApps(apps: AppItem[]): void {
    try {
      localStorage.setItem(KEYS.APPS, JSON.stringify(apps));
    } catch {}
  },

  getPermissions(): AndroidPermission[] {
    try {
      const data = localStorage.getItem(KEYS.PERMISSIONS);
      return data ? JSON.parse(data) : ANDROID_PERMISSIONS;
    } catch {
      return ANDROID_PERMISSIONS;
    }
  },

  savePermissions(permissions: AndroidPermission[]): void {
    try {
      localStorage.setItem(KEYS.PERMISSIONS, JSON.stringify(permissions));
    } catch {}
  },

  getNotes(): StudyNote[] {
    try {
      const data = localStorage.getItem(KEYS.NOTES);
      if (!data) {
        const seedNotes: StudyNote[] = [
          {
            id: 'note-1',
            title: 'Mathematics — Differential Equations Formula Sheet',
            content: 'dy/dx + P(x)y = Q(x)\nIntegrating factor IF = e^(∫P dx)\nGeneral solution: y * IF = ∫(Q * IF) dx + C\nRemember to verify boundary conditions at x = 0!',
            subjectId: 'math',
            subjectName: 'Mathematics',
            createdAt: Date.now() - 86400000 * 2,
            updatedAt: Date.now() - 86400000 * 2,
          },
          {
            id: 'note-2',
            title: 'CNC G-Codes & M-Codes Quick Reference',
            content: 'G00: Rapid linear positioning\nG01: Linear feed move\nG02/G03: CW / CCW Arc feed\nM03: Spindle CW start\nM08: Flood Coolant ON\nM30: Program End and Rewind',
            subjectId: 'cnc',
            subjectName: 'CNC',
            createdAt: Date.now() - 86400000 * 4,
            updatedAt: Date.now() - 86400000 * 4,
          }
        ];
        this.saveNotes(seedNotes);
        return seedNotes;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveNotes(notes: StudyNote[]): void {
    try {
      localStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
    } catch {}
  },

  getActiveState(): ActiveStudyState | null {
    try {
      const data = localStorage.getItem(KEYS.ACTIVE_STATE);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveActiveState(state: ActiveStudyState | null): void {
    try {
      if (!state) {
        localStorage.removeItem(KEYS.ACTIVE_STATE);
      } else {
        localStorage.setItem(KEYS.ACTIVE_STATE, JSON.stringify(state));
      }
    } catch {}
  },

  getTodos(): TodoItem[] {
    try {
      const data = localStorage.getItem(KEYS.TODOS);
      if (!data) {
        this.saveTodos(DEFAULT_TODOS);
        return DEFAULT_TODOS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_TODOS;
    }
  },

  saveTodos(todos: TodoItem[]): void {
    try {
      localStorage.setItem(KEYS.TODOS, JSON.stringify(todos));
    } catch {}
  },

  getTargetTopics(): TargetTopic[] {
    try {
      const data = localStorage.getItem(KEYS.TOPICS);
      if (!data) {
        this.saveTargetTopics(DEFAULT_TARGET_TOPICS);
        return DEFAULT_TARGET_TOPICS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_TARGET_TOPICS;
    }
  },

  saveTargetTopics(topics: TargetTopic[]): void {
    try {
      localStorage.setItem(KEYS.TOPICS, JSON.stringify(topics));
    } catch {}
  },

  getFlashcards(): FlashCard[] {
    try {
      const data = localStorage.getItem(KEYS.FLASHCARDS);
      if (!data) {
        this.saveFlashcards(DEFAULT_FLASHCARDS);
        return DEFAULT_FLASHCARDS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_FLASHCARDS;
    }
  },

  saveFlashcards(cards: FlashCard[]): void {
    try {
      localStorage.setItem(KEYS.FLASHCARDS, JSON.stringify(cards));
    } catch {}
  },

  exportAllData(): string {
    return JSON.stringify({
      settings: this.getSettings(),
      subjects: this.getSubjects(),
      sessions: this.getSessions(),
      apps: this.getApps(),
      permissions: this.getPermissions(),
      notes: this.getNotes(),
      todos: this.getTodos(),
      targetTopics: this.getTargetTopics(),
      flashcards: this.getFlashcards(),
      exportedAt: new Date().toISOString(),
    }, null, 2);
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
    } catch {}
  }
};
