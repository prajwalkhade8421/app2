import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { X, ShieldAlert, ShieldCheck, ExternalLink, Lock, AlertTriangle, ArrowLeft, Search, Bot, MessageCircle, Calculator, FileText, Smartphone } from 'lucide-react';

export const AppLockShieldModal: React.FC = () => {
  const { showAppLauncherModal, setShowAppLauncherModal, apps, activeState, setCurrentTab } = useStudy();
  const [blockedAttemptApp, setBlockedAttemptApp] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');

  if (!showAppLauncherModal) return null;

  const allowedApps = apps.filter((a) => a.isAllowed && (a.name.toLowerCase().includes(filterQuery.toLowerCase()) || a.packageName.includes(filterQuery)));
  const blockedApps = apps.filter((a) => !a.isAllowed && (a.name.toLowerCase().includes(filterQuery.toLowerCase()) || a.packageName.includes(filterQuery)));

  const handleLaunchAllowedApp = (app: (typeof apps)[0]) => {
    if (app.id === 'calculator_builtin') {
      setShowAppLauncherModal(false);
      setCurrentTab('tools');
    } else if (app.id === 'quick_notes') {
      setShowAppLauncherModal(false);
      setCurrentTab('tools');
    } else if (app.launchUrl) {
      window.open(app.launchUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert(`Allowed app "${app.name}" is authorized for study.`);
    }
  };

  const handleTapBlockedApp = (appName: string) => {
    setBlockedAttemptApp(appName);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      {/* Blocked App Alert Overlay Simulation */}
      {blockedAttemptApp ? (
        <div className="bg-neutral-950 border-2 border-red-600 rounded-3xl max-w-md w-full p-6 text-center space-y-4 animate-in zoom-in-95 duration-150 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-red-950 border border-red-600 flex items-center justify-center mx-auto text-red-500 animate-pulse">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <div className="text-[10px] font-bold tracking-[0.25em] text-red-400 uppercase">
              TIMESKIP MODE ACTIVE
            </div>
            <h3 className="text-xl font-black text-white font-heading mt-1">
              Access Blocked: {blockedAttemptApp}
            </h3>
          </div>

          <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-200 text-left flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p>
              This app is registered in your <strong>Blocked Apps list</strong>. To access unauthorized apps, you must first deliberately stop Study Mode with a recorded reason or take a penalized break.
            </p>
          </div>

          <button
            onClick={() => setBlockedAttemptApp(null)}
            className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Study Mode</span>
          </button>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in slide-in-from-bottom-6 duration-200 max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-100 font-heading">
                  App Shield & Launcher
                </h3>
                <p className="text-xs text-neutral-400">
                  {activeState ? 'Only allowed applications can be opened' : 'Manage allowed focus tools'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAppLauncherModal(false)}
              className="p-2 text-neutral-400 hover:text-neutral-200 rounded-full hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative my-3 shrink-0">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search apps..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Apps Scroll Area */}
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            {/* Allowed Apps Section */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Allowed Applications ({allowedApps.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allowedApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => handleLaunchAllowedApp(app)}
                    className="p-3 rounded-2xl bg-neutral-950/80 hover:bg-neutral-800 border border-emerald-900/40 hover:border-emerald-700/60 text-left flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">
                        {app.name[0]}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-neutral-200 group-hover:text-white truncate">
                          {app.name}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-medium">Authorized</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-cyan-400 shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>

            {/* Blocked Apps Section */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-red-400 mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Blocked Applications ({blockedApps.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {blockedApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => handleTapBlockedApp(app.name)}
                    className="p-3 rounded-2xl bg-neutral-950/40 hover:bg-red-950/30 border border-neutral-800/80 hover:border-red-900/60 text-left flex items-center justify-between group transition-all opacity-85 hover:opacity-100"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-xl bg-red-950/40 border border-red-900/40 flex items-center justify-center text-red-400 text-xs font-bold shrink-0">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-neutral-400 group-hover:text-red-300 truncate">
                          {app.name}
                        </div>
                        <div className="text-[10px] text-red-500 font-medium">Restricted in Study Mode</div>
                      </div>
                    </div>
                    <Lock className="w-3 h-3 text-red-500 shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
