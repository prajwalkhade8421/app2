export interface Subject {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: number;
}

export interface PredefinedBreakReason {
  id: string;
  name: string;
  icon: string;
  durationMinutes: number;
  description: string;
}

export interface ActiveBreak {
  reasonId: string;
  reasonName: string;
  reasonIcon: string;
  durationMinutes: number;
  startTimestamp: number;
  targetEndTimestamp: number;
  elapsedSeconds: number;
  calculatedPenaltyMinutes: number;
}

export interface BreakRecord {
  id: string;
  reasonId: string;
  reasonName: string;
  reasonIcon: string;
  durationMinutesScheduled: number;
  actualDurationSeconds: number;
  penaltyMinutesAdded: number;
  timestamp: number;
}

export interface StopReasonOption {
  id: string;
  label: string;
  icon: string;
  requiresDetails?: boolean;
}

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  startTimestamp: number;
  endTimestamp: number;
  totalSessionSeconds: number;
  actualStudySeconds: number;
  breakSeconds: number;
  penaltySeconds: number;
  cyclesCompleted: number;
  breaks: BreakRecord[];
  stopReason: string;
  stopReasonDetails?: string;
  dateString: string; // YYYY-MM-DD
}

export interface ActiveStudyState {
  isActive: boolean;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  sessionStartTimestamp: number;
  cycleDurationMinutes: number;
  currentCycleNumber: number;
  cycleStartTimestamp: number;
  cycleRemainingSeconds: number;
  isPaused: boolean;
  pauseStartTimestamp?: number;
  accumulatedStudySeconds: number;
  accumulatedPenaltySeconds: number;
  activeBreak: ActiveBreak | null;
  breaksHistory: BreakRecord[];
  cyclePhase: 'studying' | 'cycle_complete_break' | 'in_temporary_break';
  cycleCompletedTimestamp?: number;
  fiveMinWarningTriggered?: boolean;
  tenMinAlarmTriggered?: boolean;
}

export interface AppItem {
  id: string;
  name: string;
  packageName: string;
  category: 'productivity' | 'communication' | 'reference' | 'entertainment' | 'social' | 'games' | 'other';
  iconName: string;
  isAllowed: boolean;
  isDefault: boolean;
  launchUrl?: string;
}

export interface AndroidPermission {
  id: string;
  name: string;
  code: string;
  description: string;
  whyNeeded: string;
  granted: boolean;
  iconName: string;
  badge: 'Required' | 'Recommended' | 'System';
}

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  subjectId?: string;
  subjectName?: string;
  createdAt: number;
  updatedAt: number;
}
export type NoteItem = StudyNote;

export interface TodoItem {
  id: string;
  title: string;
  subjectId?: string;
  subjectName?: string;
  priority: 'low' | 'medium' | 'high';
  estimatedMinutes?: number;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
}

export interface TargetTopic {
  id: string;
  title: string;
  subjectId?: string;
  subjectName?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  targetCycles: number;
  notes?: string;
  subCheckpoints: { id: string; label: string; done: boolean }[];
  createdAt: number;
}

export interface CalendarStudyEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  type: 'exam' | 'target' | 'revision' | 'assignment' | 'class';
  subjectId?: string;
  subjectName?: string;
  targetHours?: number;
  notes?: string;
  completed?: boolean;
  createdAt: number;
}

export interface FlashCard {
  id: string;
  front: string; // Question or formula name
  back: string;  // Solution, explanation, or equation
  subjectId?: string;
  subjectName?: string;
  mastered: boolean;
  masteryLevel?: number;
  nextReviewDate?: string;
  createdAt: number;
}
export type FlashcardItem = FlashCard;

export type ThemeAccentColor = 'amber' | 'cyan' | 'emerald' | 'blue' | 'violet' | 'rose' | 'zinc';

export type AlarmRingtoneId = 'chime' | 'zen_bowl' | 'digital_beep' | 'radar' | 'bell' | 'siren' | 'marimba' | 'custom';

export interface UserSettings {
  dailyGoalHours: number;
  studyCycleMinutes: number;
  breakPenaltyMultiplier: number;
  warning5MinEnabled: boolean;
  alarm10MinEnabled: boolean;
  soundEnabled: boolean;
  alarmVolume: number; // 0.1 to 1.0
  cycleCompleteRingtone: AlarmRingtoneId;
  warningRingtone: AlarmRingtoneId;
  urgentRingtone: AlarmRingtoneId;
  customAlarmAudioUrl?: string | null;
  customAlarmFileName?: string | null;
  wakeLockEnabled: boolean;
  keepScreenAlwaysOn: boolean;
  theme: 'dark' | 'amoled' | 'light';
  accentColor: ThemeAccentColor;
  onboardingCompleted: boolean;
}

export type NavigationTab = 'home' | 'statistics' | 'history' | 'tools' | 'settings';
