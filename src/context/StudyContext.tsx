import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ActiveStudyState, BreakRecord, PredefinedBreakReason, StudyNote, StudySession, Subject, UserSettings, AppItem, AndroidPermission, NavigationTab, TodoItem, TargetTopic, FlashCard, ThemeAccentColor, AlarmRingtoneId } from '../types';
import { Storage } from '../utils/storage';
import { soundManager } from '../utils/audio';
import { formatDateString } from '../utils/time';
import { PREDEFINED_BREAKS, DEFAULT_SETTINGS, DEFAULT_SUBJECTS, ANDROID_PERMISSIONS, DEFAULT_APPS, DEFAULT_TODOS, DEFAULT_TARGET_TOPICS, DEFAULT_FLASHCARDS } from '../constants';
import { getThemeConfig, applyThemeToDocument, AccentThemeConfig } from '../utils/theme';

interface StudyContextType {
  activeState: ActiveStudyState | null;
  settings: UserSettings;
  themeConfig: AccentThemeConfig;
  subjects: Subject[];
  sessions: StudySession[];
  apps: AppItem[];
  permissions: AndroidPermission[];
  notes: StudyNote[];
  todos: TodoItem[];
  targetTopics: TargetTopic[];
  flashcards: FlashCard[];
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  selectedSubjectId: string;
  setSelectedSubjectId: (id: string) => void;
  startStudyMode: (subjectId?: string) => void;
  pauseStudy: () => void;
  resumeStudy: () => void;
  startPredefinedBreak: (reason: PredefinedBreakReason) => void;
  endBreakEarly: () => void;
  startNextCycle: () => void;
  stopStudyMode: (stopReason: string, stopDetails?: string) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetAllData: () => void;
  testPlayRingtone: (ringtoneId: AlarmRingtoneId) => void;
  stopTestRingtone: () => void;
  uploadCustomAlarmAudio: (file: File) => Promise<boolean>;
  removeCustomAlarmAudio: () => void;
  addSubject: (name: string, color: string, icon?: string) => void;
  editSubject: (id: string, name: string, color: string) => void;
  deleteSubject: (id: string) => void;
  toggleAppAllowed: (appId: string) => void;
  addCustomApp: (name: string, packageName: string, category: AppItem['category'], isAllowed: boolean) => void;
  togglePermission: (id: string) => void;
  addNote: (title: string, content: string, subjectId?: string) => void;
  updateNote: (id: string, title: string, content: string) => void;
  deleteNote: (id: string) => void;
  // Todo Handlers
  addTodo: (title: string, priority: 'low' | 'medium' | 'high', estimatedMinutes?: number, subjectId?: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  // Target Topic Handlers
  addTargetTopic: (title: string, targetCycles: number, subjectId?: string, notes?: string, checkpoints?: string[]) => void;
  updateTargetTopicStatus: (id: string, status: TargetTopic['status']) => void;
  toggleTopicCheckpoint: (topicId: string, checkpointId: string) => void;
  deleteTargetTopic: (id: string) => void;
  // Flashcards Handlers
  addFlashcard: (front: string, back: string, subjectId?: string) => void;
  toggleFlashcardMastered: (id: string) => void;
  deleteFlashcard: (id: string) => void;
  deleteSession: (id: string) => void;
  clearAllHistory: () => void;
  requestAllPermissions: () => Promise<void>;
  showBreakModal: boolean;
  setShowBreakModal: (show: boolean) => void;
  showStopModal: boolean;
  setShowStopModal: (show: boolean) => void;
  showAppLauncherModal: boolean;
  setShowAppLauncherModal: (show: boolean) => void;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  cycleProgressPercent: number;
  todayStudySeconds: number;
}

const StudyContext = createContext<StudyContextType | null>(null);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettingsState] = useState<UserSettings>(() => Storage.getSettings());
  const [subjects, setSubjectsState] = useState<Subject[]>(() => Storage.getSubjects());
  const [sessions, setSessionsState] = useState<StudySession[]>(() => Storage.getSessions());
  const [apps, setAppsState] = useState<AppItem[]>(() => Storage.getApps());
  const [permissions, setPermissionsState] = useState<AndroidPermission[]>(() => Storage.getPermissions());
  const [notes, setNotesState] = useState<StudyNote[]>(() => Storage.getNotes());
  const [todos, setTodosState] = useState<TodoItem[]>(() => Storage.getTodos());
  const [targetTopics, setTargetTopicsState] = useState<TargetTopic[]>(() => Storage.getTargetTopics());
  const [flashcards, setFlashcardsState] = useState<FlashCard[]>(() => Storage.getFlashcards());
  const [activeState, setActiveState] = useState<ActiveStudyState | null>(() => Storage.getActiveState());

  const themeConfig = getThemeConfig(settings.accentColor);

  useEffect(() => {
    applyThemeToDocument(settings.accentColor);
  }, [settings.accentColor]);

  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    const subs = Storage.getSubjects();
    return subs.length > 0 ? subs[0].id : 'math';
  });

  const [showBreakModal, setShowBreakModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [showAppLauncherModal, setShowAppLauncherModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(!settings.onboardingCompleted);

  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const lastTickTimeRef = useRef<number>(Date.now());

  // Manage Screen WakeLock (Keeping display on during study mode if enabled)
  useEffect(() => {
    const enableWakeLock = async () => {
      if (activeState && (settings.keepScreenAlwaysOn || settings.wakeLockEnabled) && 'wakeLock' in navigator) {
        try {
          if (!wakeLockRef.current) {
            wakeLockRef.current = await navigator.wakeLock.request('screen');
          }
        } catch {
          // Wake lock request failed or unsupported
        }
      } else if ((!activeState || (!settings.keepScreenAlwaysOn && !settings.wakeLockEnabled)) && wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
    enableWakeLock();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        enableWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [activeState, settings.keepScreenAlwaysOn, settings.wakeLockEnabled]);

  // Request browser notifications if supported
  const requestAllPermissions = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        if (res === 'granted') {
          const updated = permissions.map((p) => (p.id === 'notifications' ? { ...p, granted: true } : p));
          setPermissionsState(updated);
          Storage.savePermissions(updated);
        }
      } catch {}
    }
  };

  const notifyUser = useCallback((title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch {}
    }
  }, []);

  // Main Timer Tick & Wall-clock Synchronization (Works even when display turns off or tab sleeps)
  const syncTimerState = useCallback(() => {
    const now = Date.now();
    const lastTick = lastTickTimeRef.current;
    const deltaSeconds = Math.max(1, Math.floor((now - lastTick) / 1000));
    lastTickTimeRef.current = now;

    setActiveState((prev) => {
      if (!prev || !prev.isActive) return null;

      // Handling Active Break
      if (prev.cyclePhase === 'in_temporary_break' && prev.activeBreak) {
        const breakStart = prev.activeBreak.startTimestamp;
        const breakTarget = prev.activeBreak.targetEndTimestamp;
        const elapsedSecs = Math.floor((now - breakStart) / 1000);

        // Break timer finished naturally
        if (now >= breakTarget) {
          if (settings.soundEnabled) soundManager.playBreakReturnSound();
          notifyUser('Break Over!', 'Timeskip study cycle is resuming with penalty applied.');

          const penaltyMins = Math.ceil(prev.activeBreak.durationMinutes * settings.breakPenaltyMultiplier);
          const penaltySecs = penaltyMins * 60;

          const breakRecord: BreakRecord = {
            id: `break-${now}`,
            reasonId: prev.activeBreak.reasonId,
            reasonName: prev.activeBreak.reasonName,
            reasonIcon: prev.activeBreak.reasonIcon,
            durationMinutesScheduled: prev.activeBreak.durationMinutes,
            actualDurationSeconds: prev.activeBreak.durationMinutes * 60,
            penaltyMinutesAdded: penaltyMins,
            timestamp: breakStart,
          };

          const updatedState: ActiveStudyState = {
            ...prev,
            cyclePhase: 'studying',
            activeBreak: null,
            cycleRemainingSeconds: Math.max(0, prev.cycleRemainingSeconds + penaltySecs),
            accumulatedPenaltySeconds: prev.accumulatedPenaltySeconds + penaltySecs,
            breaksHistory: [...prev.breaksHistory, breakRecord],
          };
          Storage.saveActiveState(updatedState);
          return updatedState;
        }

        const updatedState = {
          ...prev,
          activeBreak: {
            ...prev.activeBreak,
            elapsedSeconds: elapsedSecs,
          },
        };
        Storage.saveActiveState(updatedState);
        return updatedState;
      }

      // Handling Cycle Complete Waiting Phase (Hourly Break)
      if (prev.cyclePhase === 'cycle_complete_break') {
        const completedAt = prev.cycleCompletedTimestamp || now;
        const breakElapsedMins = (now - completedAt) / (1000 * 60);

        let updatedFiveMin = prev.fiveMinWarningTriggered;
        let updatedTenMin = prev.tenMinAlarmTriggered;

        // 5-minute warning: "GET BACK TO STUDY"
        if (breakElapsedMins >= 5 && !prev.fiveMinWarningTriggered) {
          updatedFiveMin = true;
          if (settings.warning5MinEnabled && settings.soundEnabled) {
            soundManager.play5MinWarningSound(
              settings.warningRingtone,
              settings.alarmVolume,
              settings.customAlarmAudioUrl
            );
          }
          notifyUser('GET BACK TO STUDY', '5 minutes have passed since your 1-hour cycle finished. Resume to maintain focus.');
        }

        // 10-minute urgent reminder / recurring alarm
        if (breakElapsedMins >= 10 && !prev.tenMinAlarmTriggered) {
          updatedTenMin = true;
          if (settings.alarm10MinEnabled && settings.soundEnabled) {
            soundManager.play10MinAlarmSound(
              settings.urgentRingtone,
              settings.alarmVolume,
              settings.customAlarmAudioUrl
            );
          }
          notifyUser('URGENT: TIMESKIP ALERT', '10 minutes idle! Tap START STUDY to begin the next 60-minute cycle.');
        }

        const updatedState = {
          ...prev,
          fiveMinWarningTriggered: updatedFiveMin,
          tenMinAlarmTriggered: updatedTenMin,
        };
        Storage.saveActiveState(updatedState);
        return updatedState;
      }

      // Normal Active Studying Phase
      if (prev.cyclePhase === 'studying' && !prev.isPaused) {
        const nextRemaining = prev.cycleRemainingSeconds - deltaSeconds;

        // Cycle Completed (60 minutes done!)
        if (nextRemaining <= 0) {
          if (settings.soundEnabled) {
            soundManager.playCycleCompleteSound(
              settings.cycleCompleteRingtone,
              settings.alarmVolume,
              settings.customAlarmAudioUrl
            );
          }
          notifyUser('60-Minute Study Cycle Completed!', 'Cycle finished! Take a break or tap START STUDY for the next cycle.');

          const updatedState: ActiveStudyState = {
            ...prev,
            cycleRemainingSeconds: 0,
            accumulatedStudySeconds: prev.accumulatedStudySeconds + Math.max(1, prev.cycleRemainingSeconds),
            cyclePhase: 'cycle_complete_break',
            cycleCompletedTimestamp: now,
            fiveMinWarningTriggered: false,
            tenMinAlarmTriggered: false,
          };
          Storage.saveActiveState(updatedState);
          return updatedState;
        }

        const updatedState: ActiveStudyState = {
          ...prev,
          cycleRemainingSeconds: nextRemaining,
          accumulatedStudySeconds: prev.accumulatedStudySeconds + deltaSeconds,
        };
        Storage.saveActiveState(updatedState);
        return updatedState;
      }

      return prev;
    });
  }, [notifyUser, settings]);

  useEffect(() => {
    if (!activeState || !activeState.isActive) return;

    lastTickTimeRef.current = Date.now();
    const interval = window.setInterval(syncTimerState, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncTimerState();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [activeState?.isActive, activeState?.cyclePhase, activeState?.isPaused, syncTimerState]);

  // Start Study Mode
  const startStudyMode = useCallback((subjId?: string) => {
    const targetSubjectId = subjId || selectedSubjectId;
    const subject = subjects.find((s) => s.id === targetSubjectId) || subjects[0];
    const now = Date.now();
    const cycleMins = settings.studyCycleMinutes || 60;
    const cycleSecs = cycleMins * 60;

    const newState: ActiveStudyState = {
      isActive: true,
      subjectId: subject.id,
      subjectName: subject.name,
      subjectColor: subject.color,
      sessionStartTimestamp: now,
      cycleDurationMinutes: cycleMins,
      currentCycleNumber: 1,
      cycleStartTimestamp: now,
      cycleRemainingSeconds: cycleSecs,
      isPaused: false,
      accumulatedStudySeconds: 0,
      accumulatedPenaltySeconds: 0,
      activeBreak: null,
      breaksHistory: [],
      cyclePhase: 'studying',
      fiveMinWarningTriggered: false,
      tenMinAlarmTriggered: false,
    };

    setActiveState(newState);
    Storage.saveActiveState(newState);

    if (settings.soundEnabled) soundManager.playTickSound();
    notifyUser('TIMESKIP MODE ACTIVATED', `Studying ${subject.name}. Repeating 1-hour cycle started.`);
  }, [selectedSubjectId, subjects, settings, notifyUser]);

  // Pause / Resume
  const pauseStudy = useCallback(() => {
    setActiveState((prev) => {
      if (!prev) return null;
      const updated = { ...prev, isPaused: true, pauseStartTimestamp: Date.now() };
      Storage.saveActiveState(updated);
      return updated;
    });
  }, []);

  const resumeStudy = useCallback(() => {
    setActiveState((prev) => {
      if (!prev) return null;
      const updated = { ...prev, isPaused: false };
      Storage.saveActiveState(updated);
      return updated;
    });
  }, []);

  // Predefined Break Start
  const startPredefinedBreak = useCallback((reason: PredefinedBreakReason) => {
    const now = Date.now();
    const durationMs = reason.durationMinutes * 60 * 1000;
    const penaltyMins = Math.ceil(reason.durationMinutes * settings.breakPenaltyMultiplier);

    setActiveState((prev) => {
      if (!prev) return null;
      const activeBreak: ActiveStudyState['activeBreak'] = {
        reasonId: reason.id,
        reasonName: reason.name,
        reasonIcon: reason.icon,
        durationMinutes: reason.durationMinutes,
        startTimestamp: now,
        targetEndTimestamp: now + durationMs,
        elapsedSeconds: 0,
        calculatedPenaltyMinutes: penaltyMins,
      };

      const updated: ActiveStudyState = {
        ...prev,
        cyclePhase: 'in_temporary_break',
        activeBreak,
      };
      Storage.saveActiveState(updated);
      return updated;
    });

    setShowBreakModal(false);
    if (settings.soundEnabled) soundManager.playTickSound();
  }, [settings.breakPenaltyMultiplier, settings.soundEnabled]);

  // End Break Early
  const endBreakEarly = useCallback(() => {
    setActiveState((prev) => {
      if (!prev || !prev.activeBreak) return prev;
      const now = Date.now();
      const actualSecs = Math.max(10, Math.floor((now - prev.activeBreak.startTimestamp) / 1000));
      const scheduledMins = prev.activeBreak.durationMinutes;
      const penaltyMins = Math.ceil(scheduledMins * settings.breakPenaltyMultiplier);
      const penaltySecs = penaltyMins * 60;

      const record: BreakRecord = {
        id: `brk-${now}`,
        reasonId: prev.activeBreak.reasonId,
        reasonName: prev.activeBreak.reasonName,
        reasonIcon: prev.activeBreak.reasonIcon,
        durationMinutesScheduled: scheduledMins,
        actualDurationSeconds: actualSecs,
        penaltyMinutesAdded: penaltyMins,
        timestamp: prev.activeBreak.startTimestamp,
      };

      if (settings.soundEnabled) {
        soundManager.playPenaltySound();
      }

      const updated: ActiveStudyState = {
        ...prev,
        cyclePhase: 'studying',
        activeBreak: null,
        cycleRemainingSeconds: prev.cycleRemainingSeconds + penaltySecs,
        accumulatedPenaltySeconds: prev.accumulatedPenaltySeconds + penaltySecs,
        breaksHistory: [...prev.breaksHistory, record],
      };
      Storage.saveActiveState(updated);
      return updated;
    });
  }, [settings.breakPenaltyMultiplier, settings.soundEnabled]);

  // Start Next Cycle
  const startNextCycle = useCallback(() => {
    setActiveState((prev) => {
      if (!prev) return null;
      const now = Date.now();
      const cycleMins = settings.studyCycleMinutes || 60;

      const updated: ActiveStudyState = {
        ...prev,
        currentCycleNumber: prev.currentCycleNumber + 1,
        cycleStartTimestamp: now,
        cycleRemainingSeconds: cycleMins * 60,
        cyclePhase: 'studying',
        cycleCompletedTimestamp: undefined,
        fiveMinWarningTriggered: false,
        tenMinAlarmTriggered: false,
        isPaused: false,
      };
      Storage.saveActiveState(updated);
      return updated;
    });

    if (settings.soundEnabled) soundManager.playTickSound();
    notifyUser('Cycle Started!', 'Next 60-minute study cycle has commenced.');
  }, [settings.studyCycleMinutes, settings.soundEnabled, notifyUser]);

  // Stop Study Mode with Reason
  const stopStudyMode = useCallback((stopReason: string, stopDetails?: string) => {
    if (!activeState) return;

    const now = Date.now();
    const totalElapsedSecs = Math.max(10, Math.floor((now - activeState.sessionStartTimestamp) / 1000));
    
    // Sum break seconds
    const totalBreakSecs = activeState.breaksHistory.reduce((acc, b) => acc + b.actualDurationSeconds, 0);

    const completedSession: StudySession = {
      id: `session-${now}`,
      subjectId: activeState.subjectId,
      subjectName: activeState.subjectName,
      subjectColor: activeState.subjectColor,
      startTimestamp: activeState.sessionStartTimestamp,
      endTimestamp: now,
      totalSessionSeconds: totalElapsedSecs,
      actualStudySeconds: activeState.accumulatedStudySeconds,
      breakSeconds: totalBreakSecs,
      penaltySeconds: activeState.accumulatedPenaltySeconds,
      cyclesCompleted: activeState.currentCycleNumber,
      breaks: activeState.breaksHistory,
      stopReason,
      stopReasonDetails: stopDetails,
      dateString: formatDateString(new Date(activeState.sessionStartTimestamp)),
    };

    Storage.addSession(completedSession);
    setSessionsState(Storage.getSessions());

    setActiveState(null);
    Storage.saveActiveState(null);
    setShowStopModal(false);

    if (settings.soundEnabled) soundManager.playGoalCelebrationSound();
    notifyUser('Study Session Saved', `Recorded ${Math.floor(completedSession.actualStudySeconds / 60)} minutes of focus.`);
  }, [activeState, settings.soundEnabled, notifyUser]);

  // Settings & Subjects management
  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...newSettings };
      Storage.saveSettings(updated);
      return updated;
    });
  }, []);

  const addSubject = useCallback((name: string, color: string, icon = 'BookOpen') => {
    const newSubject: Subject = {
      id: `subj-${Date.now()}`,
      name: name.trim(),
      color,
      icon,
      createdAt: Date.now(),
    };
    setSubjectsState((prev) => {
      const updated = [...prev, newSubject];
      Storage.saveSubjects(updated);
      return updated;
    });
  }, []);

  const editSubject = useCallback((id: string, name: string, color: string) => {
    setSubjectsState((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, name: name.trim(), color } : s));
      Storage.saveSubjects(updated);
      return updated;
    });
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setSubjectsState((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      Storage.saveSubjects(updated);
      return updated;
    });
  }, []);

  const toggleAppAllowed = useCallback((appId: string) => {
    setAppsState((prev) => {
      const updated = prev.map((a) => (a.id === appId ? { ...a, isAllowed: !a.isAllowed } : a));
      Storage.saveApps(updated);
      return updated;
    });
  }, []);

  const addCustomApp = useCallback((name: string, packageName: string, category: AppItem['category'], isAllowed: boolean) => {
    const newApp: AppItem = {
      id: `app-${Date.now()}`,
      name: name.trim(),
      packageName: packageName.trim(),
      category,
      iconName: 'Smartphone',
      isAllowed,
      isDefault: false,
    };
    setAppsState((prev) => {
      const updated = [...prev, newApp];
      Storage.saveApps(updated);
      return updated;
    });
  }, []);

  const togglePermission = useCallback((id: string) => {
    setPermissionsState((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, granted: !p.granted } : p));
      Storage.savePermissions(updated);
      return updated;
    });
  }, []);

  const addNote = useCallback((title: string, content: string, subjectId?: string) => {
    const subj = subjects.find((s) => s.id === subjectId);
    const newNote: StudyNote = {
      id: `note-${Date.now()}`,
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
      subjectId,
      subjectName: subj?.name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotesState((prev) => {
      const updated = [newNote, ...prev];
      Storage.saveNotes(updated);
      return updated;
    });
  }, [subjects]);

  const updateNote = useCallback((id: string, title: string, content: string) => {
    setNotesState((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, title: title.trim() || 'Untitled Note', content: content.trim(), updatedAt: Date.now() } : n));
      Storage.saveNotes(updated);
      return updated;
    });
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotesState((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      Storage.saveNotes(updated);
      return updated;
    });
  }, []);

  // Todo Handlers
  const addTodo = useCallback((title: string, priority: 'low' | 'medium' | 'high', estimatedMinutes?: number, subjectId?: string) => {
    const subj = subjects.find((s) => s.id === subjectId);
    const newTodo: TodoItem = {
      id: `todo-${Date.now()}`,
      title: title.trim(),
      priority,
      estimatedMinutes,
      subjectId,
      subjectName: subj?.name,
      completed: false,
      createdAt: Date.now(),
    };
    setTodosState((prev) => {
      const updated = [newTodo, ...prev];
      Storage.saveTodos(updated);
      return updated;
    });
  }, [subjects]);

  const toggleTodo = useCallback((id: string) => {
    setTodosState((prev) => {
      const updated = prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? Date.now() : undefined,
          };
        }
        return t;
      });
      Storage.saveTodos(updated);
      return updated;
    });
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodosState((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      Storage.saveTodos(updated);
      return updated;
    });
  }, []);

  // Target Topics Handlers
  const addTargetTopic = useCallback((title: string, targetCycles: number, subjectId?: string, notes?: string, checkpoints?: string[]) => {
    const subj = subjects.find((s) => s.id === subjectId);
    const subCheckpoints = (checkpoints || []).filter(c => c.trim().length > 0).map((c, idx) => ({
      id: `chk-${Date.now()}-${idx}`,
      label: c.trim(),
      done: false,
    }));

    const newTopic: TargetTopic = {
      id: `topic-${Date.now()}`,
      title: title.trim(),
      targetCycles: Math.max(1, targetCycles || 1),
      subjectId,
      subjectName: subj?.name,
      status: 'not_started',
      notes: notes?.trim() || undefined,
      subCheckpoints,
      createdAt: Date.now(),
    };

    setTargetTopicsState((prev) => {
      const updated = [newTopic, ...prev];
      Storage.saveTargetTopics(updated);
      return updated;
    });
  }, [subjects]);

  const updateTargetTopicStatus = useCallback((id: string, status: TargetTopic['status']) => {
    setTargetTopicsState((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, status } : t));
      Storage.saveTargetTopics(updated);
      return updated;
    });
  }, []);

  const toggleTopicCheckpoint = useCallback((topicId: string, checkpointId: string) => {
    setTargetTopicsState((prev) => {
      const updated = prev.map((t) => {
        if (t.id === topicId) {
          const updatedCheckpoints = t.subCheckpoints.map((cp) => (cp.id === checkpointId ? { ...cp, done: !cp.done } : cp));
          const allDone = updatedCheckpoints.length > 0 && updatedCheckpoints.every(cp => cp.done);
          return {
            ...t,
            subCheckpoints: updatedCheckpoints,
            status: allDone ? 'completed' : (t.status === 'not_started' ? 'in_progress' : t.status),
          };
        }
        return t;
      });
      Storage.saveTargetTopics(updated);
      return updated;
    });
  }, []);

  const deleteTargetTopic = useCallback((id: string) => {
    setTargetTopicsState((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      Storage.saveTargetTopics(updated);
      return updated;
    });
  }, []);

  // Flashcards Handlers
  const addFlashcard = useCallback((front: string, back: string, subjectId?: string) => {
    const subj = subjects.find((s) => s.id === subjectId);
    const newCard: FlashCard = {
      id: `fc-${Date.now()}`,
      front: front.trim(),
      back: back.trim(),
      subjectId,
      subjectName: subj?.name,
      mastered: false,
      createdAt: Date.now(),
    };
    setFlashcardsState((prev) => {
      const updated = [newCard, ...prev];
      Storage.saveFlashcards(updated);
      return updated;
    });
  }, [subjects]);

  const toggleFlashcardMastered = useCallback((id: string) => {
    setFlashcardsState((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, mastered: !c.mastered } : c));
      Storage.saveFlashcards(updated);
      return updated;
    });
  }, []);

  const deleteFlashcard = useCallback((id: string) => {
    setFlashcardsState((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      Storage.saveFlashcards(updated);
      return updated;
    });
  }, []);

  const deleteSession = useCallback((id: string) => {
    Storage.deleteSession(id);
    setSessionsState(Storage.getSessions());
  }, []);

  const clearAllHistory = useCallback(() => {
    Storage.clearAllSessions();
    setSessionsState([]);
  }, []);

  // Reset ALL app data to initial factory state
  const resetAllData = useCallback(() => {
    soundManager.stopAllAudio();
    Storage.resetAllData();
    setSettingsState(DEFAULT_SETTINGS);
    setSubjectsState(DEFAULT_SUBJECTS);
    setSessionsState([]);
    setAppsState(DEFAULT_APPS);
    setPermissionsState(ANDROID_PERMISSIONS);
    setNotesState([]);
    setTodosState(DEFAULT_TODOS);
    setTargetTopicsState(DEFAULT_TARGET_TOPICS);
    setFlashcardsState(DEFAULT_FLASHCARDS);
    setActiveState(null);
    setSelectedSubjectId('math');
    setCurrentTab('home');
    setShowBreakModal(false);
    setShowStopModal(false);
    setShowAppLauncherModal(false);
    if (settings.soundEnabled) soundManager.playTickSound();
  }, [settings.soundEnabled]);

  // Test play alarm ringtone
  const testPlayRingtone = useCallback((ringtoneId: AlarmRingtoneId) => {
    soundManager.playRingtone(
      ringtoneId,
      settings.alarmVolume,
      settings.customAlarmAudioUrl
    );
  }, [settings.alarmVolume, settings.customAlarmAudioUrl]);

  // Stop test ringtone
  const stopTestRingtone = useCallback(() => {
    soundManager.stopAllAudio();
  }, []);

  // Upload custom alarm audio (convert to base64 and store)
  const uploadCustomAlarmAudio = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        resolve(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Audio = e.target?.result as string;
        if (base64Audio) {
          const updatedSettings: UserSettings = {
            ...settings,
            customAlarmAudioUrl: base64Audio,
            customAlarmFileName: file.name,
            cycleCompleteRingtone: 'custom',
          };
          setSettingsState(updatedSettings);
          Storage.saveSettings(updatedSettings);
          resolve(true);
        } else {
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsDataURL(file);
    });
  }, [settings]);

  // Remove custom uploaded ringtone
  const removeCustomAlarmAudio = useCallback(() => {
    const updatedSettings: UserSettings = {
      ...settings,
      customAlarmAudioUrl: null,
      customAlarmFileName: null,
      cycleCompleteRingtone: settings.cycleCompleteRingtone === 'custom' ? 'chime' : settings.cycleCompleteRingtone,
      warningRingtone: settings.warningRingtone === 'custom' ? 'digital_beep' : settings.warningRingtone,
      urgentRingtone: settings.urgentRingtone === 'custom' ? 'siren' : settings.urgentRingtone,
    };
    setSettingsState(updatedSettings);
    Storage.saveSettings(updatedSettings);
    soundManager.stopAllAudio();
  }, [settings]);

  // Today study seconds calculation
  const todayStr = formatDateString(new Date());
  const todayStudySeconds = sessions
    .filter((s) => s.dateString === todayStr)
    .reduce((acc, s) => acc + s.actualStudySeconds, 0) + (activeState ? activeState.accumulatedStudySeconds : 0);

  // Cycle progress calculation (0 to 100)
  let cycleProgressPercent = 0;
  if (activeState) {
    const totalCycleSecs = activeState.cycleDurationMinutes * 60;
    const remaining = activeState.cycleRemainingSeconds;
    cycleProgressPercent = Math.min(100, Math.max(0, ((totalCycleSecs - remaining) / totalCycleSecs) * 100));
  }

  return (
    <StudyContext.Provider
      value={{
        activeState,
        settings,
        themeConfig,
        subjects,
        sessions,
        apps,
        permissions,
        notes,
        todos,
        targetTopics,
        flashcards,
        currentTab,
        setCurrentTab,
        selectedSubjectId,
        setSelectedSubjectId,
        startStudyMode,
        pauseStudy,
        resumeStudy,
        startPredefinedBreak,
        endBreakEarly,
        startNextCycle,
        stopStudyMode,
        updateSettings,
        resetAllData,
        testPlayRingtone,
        stopTestRingtone,
        uploadCustomAlarmAudio,
        removeCustomAlarmAudio,
        addSubject,
        editSubject,
        deleteSubject,
        toggleAppAllowed,
        addCustomApp,
        togglePermission,
        addNote,
        updateNote,
        deleteNote,
        addTodo,
        toggleTodo,
        deleteTodo,
        addTargetTopic,
        updateTargetTopicStatus,
        toggleTopicCheckpoint,
        deleteTargetTopic,
        addFlashcard,
        toggleFlashcardMastered,
        deleteFlashcard,
        deleteSession,
        clearAllHistory,
        requestAllPermissions,
        showBreakModal,
        setShowBreakModal,
        showStopModal,
        setShowStopModal,
        showAppLauncherModal,
        setShowAppLauncherModal,
        showOnboarding,
        setShowOnboarding,
        cycleProgressPercent,
        todayStudySeconds,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
