import { StudySession } from '../types';

export function formatSecondsToDigital(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function formatSecondsToFullDigital(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function formatDurationHuman(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);

  if (hours === 0 && minutes === 0) {
    return `${s}s`;
  }
  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

export function formatClockTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatDatePretty(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateStreak(sessions: StudySession[]): { currentStreak: number; longestStreak: number; daysStudied: number } {
  if (!sessions || sessions.length === 0) {
    return { currentStreak: 0, longestStreak: 0, daysStudied: 0 };
  }

  // Get unique study dates sorted descending
  const uniqueDates = Array.from(
    new Set(
      sessions
        .filter((s) => s.actualStudySeconds > 120) // at least 2 minutes
        .map((s) => s.dateString)
    )
  ).sort().reverse();

  if (uniqueDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, daysStudied: 0 };
  }

  const todayStr = formatDateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateString(yesterday);

  let currentStreak = 0;
  let checkDate = new Date();

  // If studied today, start from today; if not today but studied yesterday, start from yesterday
  if (uniqueDates.includes(todayStr)) {
    checkDate = new Date();
  } else if (uniqueDates.includes(yesterdayStr)) {
    checkDate = yesterday;
  } else {
    // Streak broken
    currentStreak = 0;
  }

  if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
    while (true) {
      const dStr = formatDateString(checkDate);
      if (uniqueDates.includes(dStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  const dateObjects = uniqueDates
    .map((d) => new Date(d).getTime())
    .sort((a, b) => a - b);

  let longest = 1;
  let running = 1;
  for (let i = 1; i < dateObjects.length; i++) {
    const diffDays = Math.round((dateObjects[i] - dateObjects[i - 1]) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      running++;
      if (running > longest) longest = running;
    } else if (diffDays > 1) {
      running = 1;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longest, currentStreak),
    daysStudied: uniqueDates.length,
  };
}
