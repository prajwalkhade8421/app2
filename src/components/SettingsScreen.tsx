import React, { useState, useRef } from 'react';
import { useStudy } from '../context/StudyContext';
import {
  Settings as SettingsIcon,
  BookOpen,
  Shield,
  Bell,
  Smartphone,
  Moon,
  Sun,
  Database,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  RefreshCw,
  Volume2,
  Info,
  Play,
  Square,
  Upload,
  Music,
  RotateCcw,
  Sparkles,
  GitBranch,
  Terminal,
  ShieldCheck,
  ShieldAlert,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { Storage } from '../utils/storage';
import { ThemeAccentColor, AlarmRingtoneId } from '../types';
import { ALARM_RINGTONES_OPTIONS } from '../constants';
import { NativeAppBlocker } from '../utils/nativeAppBlocker';

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetAllData,
    loadDemoData,
    testPlayRingtone,
    stopTestRingtone,
    uploadCustomAlarmAudio,
    removeCustomAlarmAudio,
    subjects,
    addSubject,
    editSubject,
    deleteSubject,
    apps,
    toggleAppAllowed,
    addCustomApp,
    permissions,
    togglePermission,
    requestAllPermissions,
    themeConfig,
    clearAllHistory,
  } = useStudy();

  const [activeSection, setActiveSection] = useState<'study' | 'alarms' | 'appearance' | 'subjects' | 'apps' | 'native' | 'permissions' | 'data'>('study');

  // Currently playing test ringtone
  const [playingRingtoneId, setPlayingRingtoneId] = useState<AlarmRingtoneId | null>(null);

  // New Subject State
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjColor, setNewSubjColor] = useState('#3B82F6');
  const [editingSubjId, setEditingSubjId] = useState<string | null>(null);
  const [editSubjName, setEditSubjName] = useState('');
  const [editSubjColor, setEditSubjColor] = useState('#3B82F6');

  // New App State
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppPackage, setNewAppPackage] = useState('');
  const [newAppCategory, setNewAppCategory] = useState<'productivity' | 'communication' | 'reference' | 'social' | 'games'>('productivity');
  const [newAppAllowed, setNewAppAllowed] = useState(true);

  // Reset confirmation modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  // Backup & audio file input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [audioUploadStatus, setAudioUploadStatus] = useState<string | null>(null);

  // Blocker test feedback
  const [blockerTestStatus, setBlockerTestStatus] = useState<string | null>(null);

  const COLOR_PALETTE = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#6366F1', '#EF4444'];

  const THEME_ACCENTS: { id: ThemeAccentColor; label: string; hex: string }[] = [
    { id: 'zinc', label: 'Minimal Black & Zinc', hex: '#E4E4E7' },
    { id: 'amber', label: 'Warm Amber Gold', hex: '#F59E0B' },
    { id: 'cyan', label: 'Electric Cyan', hex: '#06B6D4' },
    { id: 'emerald', label: 'Zen Emerald', hex: '#10B981' },
    { id: 'blue', label: 'Deep Focus Blue', hex: '#3B82F6' },
    { id: 'violet', label: 'Royal Violet', hex: '#8B5CF6' },
    { id: 'rose', label: 'Ruby Rose', hex: '#F43F5E' },
  ];

  const handleTestRingtone = (ringtoneId: AlarmRingtoneId) => {
    if (playingRingtoneId === ringtoneId) {
      stopTestRingtone();
      setPlayingRingtoneId(null);
    } else {
      stopTestRingtone();
      setPlayingRingtoneId(ringtoneId);
      testPlayRingtone(ringtoneId);
      setTimeout(() => {
        setPlayingRingtoneId((curr) => (curr === ringtoneId ? null : curr));
      }, 3500);
    }
  };

  const handleCustomAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioUploadStatus('Uploading audio file...');
      const success = await uploadCustomAlarmAudio(file);
      if (success) {
        setAudioUploadStatus(`Loaded: ${file.name}`);
        setTimeout(() => setAudioUploadStatus(null), 3000);
      } else {
        setAudioUploadStatus('Failed to load file. Maximum size is 10MB.');
      }
    }
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubjName.trim()) {
      addSubject(newSubjName.trim(), newSubjColor);
      setNewSubjName('');
    }
  };

  const handleSaveEditSubject = (id: string) => {
    if (editSubjName.trim()) {
      editSubject(id, editSubjName.trim(), editSubjColor);
      setEditingSubjId(null);
    }
  };

  const handleCreateApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAppName.trim() && newAppPackage.trim()) {
      addCustomApp(newAppName.trim(), newAppPackage.trim(), newAppCategory, newAppAllowed);
      setNewAppName('');
      setNewAppPackage('');
      setShowAddAppModal(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = Storage.exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `StudyMode_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          const ok = Storage.importData(content);
          if (ok) {
            setImportStatus('Backup restored successfully! Reloading...');
            setTimeout(() => window.location.reload(), 1000);
          } else {
            setImportStatus('Failed to parse backup file.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleConfirmResetAllData = () => {
    resetAllData();
    setShowResetModal(false);
    setResetFeedback('All data has been reset to factory defaults.');
    setTimeout(() => setResetFeedback(null), 3000);
  };

  const handleLoadDemo = () => {
    loadDemoData();
    setResetFeedback('30-day realistic sample study metrics loaded.');
    setTimeout(() => setResetFeedback(null), 3000);
  };

  const handleClearHistory = () => {
    clearAllHistory();
    setResetFeedback('Study session history cleared.');
    setTimeout(() => setResetFeedback(null), 3000);
  };

  const handleTestBlocker = async () => {
    setBlockerTestStatus('Testing App Blocker service...');
    await NativeAppBlocker.startBlocker(apps, 'Test Session');
    setTimeout(() => {
      setBlockerTestStatus('App Blocker test completed. In native APK mode, foreground packages are monitored via AccessibilityService.');
      setTimeout(() => setBlockerTestStatus(null), 4000);
    }, 1000);
  };

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div
          className="text-[10px] font-bold tracking-[0.2em] uppercase"
          style={{ color: themeConfig.hex }}
        >
          PREFERENCES
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-neutral-100 font-heading">
          Settings
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Customize study cycle rules, alarms, themes, app shield, and native Android export
        </p>
      </div>

      {/* Settings Section Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-x-auto">
        {(
          [
            { id: 'study', label: 'Study & Rules' },
            { id: 'alarms', label: 'Alarms & Sound' },
            { id: 'appearance', label: 'Theme & Accent' },
            { id: 'subjects', label: 'Subjects' },
            { id: 'apps', label: 'App Shield' },
            { id: 'native', label: 'Android Blocker (APK)' },
            { id: 'permissions', label: 'Permissions' },
            { id: 'data', label: 'Data & Storage' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSection === tab.id
                ? 'font-bold shadow'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            style={{
              backgroundColor: activeSection === tab.id ? themeConfig.hex : undefined,
              color: activeSection === tab.id ? '#0a0a0a' : undefined,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {resetFeedback && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{resetFeedback}</span>
        </div>
      )}

      {/* SECTION 1: STUDY RULES */}
      {activeSection === 'study' && (
        <div className="space-y-3 animate-in fade-in">
          {/* Cycle duration */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-neutral-200 block">
                  Study Cycle Duration
                </label>
                <span className="text-[11px] text-neutral-400">
                  Standard repeating study cycle length
                </span>
              </div>
              <span
                className="text-sm font-black font-mono-numbers"
                style={{ color: themeConfig.hex }}
              >
                {settings.studyCycleMinutes} minutes
              </span>
            </div>
            <input
              type="range"
              min={25}
              max={90}
              step={5}
              value={settings.studyCycleMinutes}
              onChange={(e) => updateSettings({ studyCycleMinutes: Number(e.target.value) })}
              className="w-full cursor-pointer accent-neutral-300"
            />
          </div>

          {/* Break Penalty Multiplier */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-neutral-200 block">
                  Break Penalty Multiplier
                </label>
                <span className="text-[11px] text-neutral-400">
                  Added to current cycle (e.g. 2m break = +4m penalty)
                </span>
              </div>
              <span className="text-xs font-bold font-mono-numbers px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                {settings.breakPenaltyMultiplier}× Time Penalty
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              {[1.5, 2, 2.5, 3].map((mult) => (
                <button
                  key={mult}
                  onClick={() => updateSettings({ breakPenaltyMultiplier: mult })}
                  className="flex-1 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer"
                  style={{
                    backgroundColor: settings.breakPenaltyMultiplier === mult ? themeConfig.hex : '#0a0a0a',
                    color: settings.breakPenaltyMultiplier === mult ? '#0a0a0a' : '#d4d4d8',
                    borderColor: settings.breakPenaltyMultiplier === mult ? themeConfig.hex : '#262626',
                  }}
                >
                  {mult}×
                </button>
              ))}
            </div>
          </div>

          {/* Daily Goal */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-neutral-200 block">
                  Daily Study Goal
                </label>
                <span className="text-[11px] text-neutral-400">
                  Target focused study hours per day
                </span>
              </div>
              <span
                className="text-sm font-black font-mono-numbers"
                style={{ color: themeConfig.hex }}
              >
                {settings.dailyGoalHours} hours / day
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={14}
              step={1}
              value={settings.dailyGoalHours}
              onChange={(e) => updateSettings({ dailyGoalHours: Number(e.target.value) })}
              className="w-full cursor-pointer accent-neutral-300"
            />
          </div>

          {/* Screen Off & Wake Lock Resilience */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-neutral-200">Keep Screen Awake (Wake Lock)</div>
                <div className="text-[11px] text-neutral-400">
                  Prevents display from sleeping while active timer is running
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.keepScreenAlwaysOn}
                onChange={(e) => updateSettings({ keepScreenAlwaysOn: e.target.checked })}
                className="w-4 h-4 accent-neutral-200 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-[11px] text-neutral-400 space-y-1">
              <div className="text-neutral-200 font-semibold flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                Display-Off & Background Sync
              </div>
              <p>
                Study Mode calculates time using real-world timestamps. Timers, penalties, and break alerts remain 100% accurate even if your screen turns off or you switch apps.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: ALARMS & SOUNDS */}
      {activeSection === 'alarms' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Master Sound & Volume */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-neutral-200">Audio Sound Effects & Alarms</div>
                <div className="text-[11px] text-neutral-400">Enable chime rings for cycle end and warnings</div>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                className="w-4 h-4 accent-neutral-200 cursor-pointer"
              />
            </div>

            {/* Alarm Volume Slider */}
            <div className="pt-2 border-t border-neutral-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-300 font-medium flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
                  Alarm Volume
                </span>
                <span className="text-xs font-mono font-bold text-neutral-200">
                  {Math.round((settings.alarmVolume ?? 0.8) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                value={settings.alarmVolume ?? 0.8}
                onChange={(e) => updateSettings({ alarmVolume: Number(e.target.value) })}
                className="w-full cursor-pointer accent-neutral-300"
              />
            </div>
          </div>

          {/* Custom Ringtone Audio Upload */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-cyan-400" />
                  Custom Alarm Ringtone File
                </div>
                <div className="text-[11px] text-neutral-400">
                  Upload your favorite audio ringtone (.mp3, .wav, .m4a, .ogg)
                </div>
              </div>

              <button
                onClick={() => audioInputRef.current?.click()}
                className="py-1.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Audio</span>
              </button>
              <input
                type="file"
                ref={audioInputRef}
                onChange={handleCustomAudioUpload}
                accept="audio/*"
                className="hidden"
              />
            </div>

            {settings.customAlarmAudioUrl ? (
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                <div className="truncate mr-2">
                  <div className="text-xs font-bold text-neutral-200 truncate">
                    {settings.customAlarmFileName || 'Custom Sound File'}
                  </div>
                  <div className="text-[10px] text-neutral-500">Stored in local app data</div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleTestRingtone('custom')}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    {playingRingtoneId === 'custom' ? (
                      <Square className="w-3 h-3 fill-red-400 text-red-400" />
                    ) : (
                      <Play className="w-3 h-3 fill-current" />
                    )}
                    <span>{playingRingtoneId === 'custom' ? 'Stop' : 'Test'}</span>
                  </button>

                  <button
                    onClick={removeCustomAlarmAudio}
                    className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-950 text-red-300 text-xs cursor-pointer"
                    title="Remove custom audio"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-neutral-500 italic">
                No custom audio uploaded yet. Default synthesizer presets are active.
              </div>
            )}

            {audioUploadStatus && (
              <div className="text-xs text-cyan-400 font-medium">{audioUploadStatus}</div>
            )}
          </div>

          {/* Ringtone Selectors */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Ringtone Configuration
            </div>

            {/* 1. Cycle Complete Ringtone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-200 block">
                Cycle Completed Alarm (60-min finish)
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={settings.cycleCompleteRingtone}
                  onChange={(e) => updateSettings({ cycleCompleteRingtone: e.target.value as AlarmRingtoneId })}
                  className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 cursor-pointer"
                >
                  {ALARM_RINGTONES_OPTIONS.map((opt) => (
                    <option
                      key={opt.id}
                      value={opt.id}
                      disabled={opt.id === 'custom' && !settings.customAlarmAudioUrl}
                    >
                      {opt.label} ({opt.description})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleTestRingtone(settings.cycleCompleteRingtone)}
                  className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {playingRingtoneId === settings.cycleCompleteRingtone ? (
                    <Square className="w-3 h-3 fill-red-400 text-red-400" />
                  ) : (
                    <Play className="w-3 h-3 fill-current" />
                  )}
                  <span>{playingRingtoneId === settings.cycleCompleteRingtone ? 'Stop' : 'Play'}</span>
                </button>
              </div>
            </div>

            {/* 2. 5-Minute Warning Ringtone */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-800/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-200 block">
                  5-Minute Focus Warning Ringtone
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-neutral-400">Active</span>
                  <input
                    type="checkbox"
                    checked={settings.warning5MinEnabled}
                    onChange={(e) => updateSettings({ warning5MinEnabled: e.target.checked })}
                    className="w-3.5 h-3.5 accent-neutral-300 cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={settings.warningRingtone}
                  onChange={(e) => updateSettings({ warningRingtone: e.target.value as AlarmRingtoneId })}
                  className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 cursor-pointer"
                >
                  {ALARM_RINGTONES_OPTIONS.map((opt) => (
                    <option
                      key={opt.id}
                      value={opt.id}
                      disabled={opt.id === 'custom' && !settings.customAlarmAudioUrl}
                    >
                      {opt.label} ({opt.description})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleTestRingtone(settings.warningRingtone)}
                  className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {playingRingtoneId === settings.warningRingtone ? (
                    <Square className="w-3 h-3 fill-red-400 text-red-400" />
                  ) : (
                    <Play className="w-3 h-3 fill-current" />
                  )}
                  <span>{playingRingtoneId === settings.warningRingtone ? 'Stop' : 'Play'}</span>
                </button>
              </div>
            </div>

            {/* 3. 10-Minute Urgent Ringtone */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-800/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-200 block">
                  10-Minute Urgent Return Alarm Ringtone
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-neutral-400">Active</span>
                  <input
                    type="checkbox"
                    checked={settings.alarm10MinEnabled}
                    onChange={(e) => updateSettings({ alarm10MinEnabled: e.target.checked })}
                    className="w-3.5 h-3.5 accent-neutral-300 cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={settings.urgentRingtone}
                  onChange={(e) => updateSettings({ urgentRingtone: e.target.value as AlarmRingtoneId })}
                  className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 cursor-pointer"
                >
                  {ALARM_RINGTONES_OPTIONS.map((opt) => (
                    <option
                      key={opt.id}
                      value={opt.id}
                      disabled={opt.id === 'custom' && !settings.customAlarmAudioUrl}
                    >
                      {opt.label} ({opt.description})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleTestRingtone(settings.urgentRingtone)}
                  className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {playingRingtoneId === settings.urgentRingtone ? (
                    <Square className="w-3 h-3 fill-red-400 text-red-400" />
                  ) : (
                    <Play className="w-3 h-3 fill-current" />
                  )}
                  <span>{playingRingtoneId === settings.urgentRingtone ? 'Stop' : 'Play'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: THEME & ACCENT */}
      {activeSection === 'appearance' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Background Canvas Theme
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'dark', label: 'Dark Charcoal', desc: 'Standard OLED dark' },
                { id: 'amoled', label: 'True Black', desc: 'Pure black for battery' },
                { id: 'light', label: 'Clean Light', desc: 'High daylight contrast' },
              ].map((th) => (
                <button
                  key={th.id}
                  onClick={() => updateSettings({ theme: th.id as any })}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    settings.theme === th.id
                      ? 'border-neutral-200 bg-neutral-800/80'
                      : 'border-neutral-800 bg-neutral-950 hover:bg-neutral-900'
                  }`}
                >
                  <div className="text-xs font-bold text-neutral-100">{th.label}</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">{th.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-neutral-200">Minimal Accent Color</div>
                <div className="text-[11px] text-neutral-400">
                  Controls buttons, highlights, badges, and progress dials
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {THEME_ACCENTS.map((accent) => {
                const isSelected = settings.accentColor === accent.id;
                return (
                  <button
                    key={accent.id}
                    onClick={() => updateSettings({ accentColor: accent.id })}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-neutral-200 bg-neutral-800/90'
                        : 'border-neutral-800/80 bg-neutral-950 hover:bg-neutral-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full border border-neutral-700 shadow-sm shrink-0"
                        style={{ backgroundColor: accent.hex }}
                      />
                      <span className="text-xs font-bold text-neutral-200">{accent.label}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-neutral-100" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: SUBJECTS */}
      {activeSection === 'subjects' && (
        <div className="space-y-4 animate-in fade-in">
          <form
            onSubmit={handleCreateSubject}
            className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Add New Subject / Topic
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubjName}
                onChange={(e) => setNewSubjName(e.target.value)}
                placeholder="Subject title (e.g. Organic Chemistry, Algorithms...)"
                className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl font-bold text-xs cursor-pointer"
                style={{
                  backgroundColor: themeConfig.hex,
                  color: '#000',
                }}
              >
                Add
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-neutral-400">Tag Color:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {COLOR_PALETTE.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setNewSubjColor(c)}
                    className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                      newSubjColor === c ? 'scale-125 border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </form>

          <div className="space-y-2">
            {subjects.map((subj) => (
              <div
                key={subj.id}
                className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between"
              >
                {editingSubjId === subj.id ? (
                  <div className="flex-1 flex items-center gap-2 mr-2">
                    <input
                      type="text"
                      value={editSubjName}
                      onChange={(e) => setEditSubjName(e.target.value)}
                      className="flex-1 px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-neutral-100"
                    />
                    <div className="flex items-center gap-1">
                      {COLOR_PALETTE.map((c) => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => setEditSubjColor(c)}
                          className={`w-4 h-4 rounded-full border ${
                            editSubjColor === c ? 'scale-110 border-white' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => handleSaveEditSubject(subj.id)}
                      className="p-1.5 rounded-lg bg-emerald-950 text-emerald-300 text-xs font-bold"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: subj.color }}
                    />
                    <span className="text-xs font-bold text-neutral-200">{subj.name}</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingSubjId(subj.id);
                      setEditSubjName(subj.name);
                      setEditSubjColor(subj.color);
                    }}
                    className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {subjects.length > 1 && (
                    <button
                      onClick={() => deleteSubject(subj.id)}
                      className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: APPS */}
      {activeSection === 'apps' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Study Mode Allowed & Blocked Apps
            </span>
            <button
              onClick={() => setShowAddAppModal(true)}
              className="py-1.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add App</span>
            </button>
          </div>

          {showAddAppModal && (
            <form onSubmit={handleCreateApp} className="p-4 rounded-2xl bg-neutral-900 border border-neutral-700 space-y-3 animate-in fade-in">
              <div className="text-xs font-bold text-neutral-100">Add Application to System</div>
              <input
                type="text"
                value={newAppName}
                onChange={(e) => setNewAppName(e.target.value)}
                placeholder="App Name (e.g. WolframAlpha, Notion...)"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100"
                required
              />
              <input
                type="text"
                value={newAppPackage}
                onChange={(e) => setNewAppPackage(e.target.value)}
                placeholder="Package Name (e.g. com.notion.id)"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100"
                required
              />
              <div className="flex items-center justify-between">
                <label className="text-xs text-neutral-300">Allow during Study Mode?</label>
                <input
                  type="checkbox"
                  checked={newAppAllowed}
                  onChange={(e) => setNewAppAllowed(e.target.checked)}
                  className="w-4 h-4 accent-neutral-300 cursor-pointer"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddAppModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg font-bold text-xs cursor-pointer"
                  style={{
                    backgroundColor: themeConfig.hex,
                    color: '#000',
                  }}
                >
                  Save App
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {apps.map((app) => (
              <div
                key={app.id}
                className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-100">{app.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 capitalize">
                      {app.category}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-neutral-500 truncate max-w-[200px]">
                    {app.packageName}
                  </div>
                </div>

                <button
                  onClick={() => toggleAppAllowed(app.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    app.isAllowed
                      ? 'bg-emerald-950/80 border border-emerald-700/80 text-emerald-300'
                      : 'bg-red-950/60 border border-red-800/60 text-red-300'
                  }`}
                >
                  {app.isAllowed ? '✓ ALLOWED' : '✕ BLOCKED'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 6: NATIVE ANDROID BLOCKER & GITHUB SETUP */}
      {activeSection === 'native' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                <GitBranch className="w-4 h-4" />
                <span>Native Android APK & Blocker Bridge</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300">
                Capacitor Ready
              </span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              This repository contains full <strong>Android Native AccessibilityService & UsageStats</strong> Kotlin code in the <code className="text-cyan-300 font-mono">android/</code> directory. When built into an APK, it physically detects when distracting apps (Instagram, YouTube, etc.) are launched and pulls you back to Study Mode.
            </p>

            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
              <div className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-neutral-400" />
                <span>1-Minute GitHub → Native APK Build Command:</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-900 font-mono text-[11px] text-cyan-300 select-all overflow-x-auto">
                npm install &amp;&amp; npm run build &amp;&amp; npx cap add android &amp;&amp; npx cap sync android &amp;&amp; npx cap open android
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleTestBlocker}
                className="py-2 px-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Test Blocker Trigger</span>
              </button>

              <span className="text-[11px] text-neutral-400">
                {NativeAppBlocker.isNativeAndroid() ? '🟢 Running on Native Android' : '⚪ Web Simulation Mode'}
              </span>
            </div>

            {blockerTestStatus && (
              <div className="text-xs text-cyan-300 font-medium animate-in fade-in p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/60">
                {blockerTestStatus}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 7: PERMISSIONS */}
      {activeSection === 'permissions' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Android & Browser API Integrity</div>
              <p className="mt-0.5 text-[11px] text-neutral-400">
                Study Mode adheres strictly to security policies. Notifications and WakeLock keep alarms and background cycles accurate.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={requestAllPermissions}
              className="py-2 px-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Verify & Request Browser APIs</span>
            </button>
          </div>

          <div className="space-y-3">
            {permissions.map((perm) => (
              <div
                key={perm.id}
                className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-100">{perm.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400">
                        {perm.badge}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-neutral-500 mt-0.5">{perm.code}</div>
                  </div>

                  <button
                    onClick={() => togglePermission(perm.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      perm.granted
                        ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                        : 'bg-neutral-800 border border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {perm.granted ? 'Granted' : 'Grant'}
                  </button>
                </div>

                <p className="text-[11px] text-neutral-300">{perm.description}</p>
                <div className="text-[10px] text-neutral-400 font-medium">
                  <strong>Why needed:</strong> {perm.whyNeeded}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 8: DATA & STORAGE */}
      {activeSection === 'data' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Real Data Retention Note */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Persistent Local Storage
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              All your study sessions, custom topics, notes, to-dos, flashcards, uploaded audio files, and settings are saved automatically in your local device storage. They will <strong>never reset</strong> on reload or restart.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleExportJSON}
                className="flex-1 py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Export JSON Backup</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Import Backup</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportFile}
                accept=".json"
                className="hidden"
              />
            </div>

            {importStatus && (
              <div className="text-xs text-neutral-300 font-medium">{importStatus}</div>
            )}
          </div>

          {/* Quick Clear History & Demo Data */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Session History Management
            </div>
            <p className="text-xs text-neutral-300">
              Clear your recorded study history or load sample 30-day metrics to test analytical charts.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleClearHistory}
                className="flex-1 py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Clear History Only
              </button>

              <button
                onClick={handleLoadDemo}
                className="flex-1 py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-cyan-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Load Sample Demo Data
              </button>
            </div>
          </div>

          {/* Reset All Data Section */}
          <div className="p-4 rounded-2xl bg-red-950/20 border border-red-900/40 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-400" />
              Reset All Application Data
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Clear all stored study history, custom topics, notes, to-dos, flashcards, uploaded custom ringtones, and return all settings back to default.
            </p>

            <button
              onClick={() => setShowResetModal(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Everything to Clean Slate</span>
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-800/80 flex items-center justify-center mx-auto text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-neutral-100 font-heading">
                Reset All Application Data?
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                This will wipe all study session records, custom topics, notes, flashcards, and settings. This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResetAllData}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-lg"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
