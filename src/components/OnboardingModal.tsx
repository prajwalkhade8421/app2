import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { Shield, Target, BookOpen, Check, ArrowRight, Sparkles, Activity, Bell, Layers, Zap } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const {
    showOnboarding,
    setShowOnboarding,
    updateSettings,
    settings,
    permissions,
    togglePermission,
    requestAllPermissions,
    subjects,
    apps,
    toggleAppAllowed,
  } = useStudy();

  const [step, setStep] = useState<number>(1);

  if (!showOnboarding) return null;

  const handleFinish = () => {
    updateSettings({ onboardingCompleted: true });
    setShowOnboarding(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-bold tracking-[0.25em] text-amber-500 uppercase">
            TIMESKIP ONBOARDING • STEP {step} OF 5
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={`w-2 h-2 rounded-full transition-all ${
                  step === s ? 'w-5 bg-amber-500' : step > s ? 'bg-amber-600' : 'bg-neutral-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: WELCOME & CONCEPT */}
        {step === 1 && (
          <div className="space-y-4 text-center py-2 animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white font-heading">
                Welcome to Study Mode
              </h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Designed around the <strong className="text-neutral-200">TIMESKIP MODE</strong> discipline: strict 1-hour repeating cycles, predefined breaks with a 2× time penalty, and app blocking.
              </p>
            </div>

            <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-2xl text-left text-xs text-neutral-300 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Zap className="w-4 h-4" /> 1-Hour Focus Cycles
              </div>
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Shield className="w-4 h-4" /> 2× Break Penalties (2m break = +4m penalty)
              </div>
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <Target className="w-4 h-4" /> 30-Day Local Performance Analytics
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2"
            >
              <span>Continue to Permissions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: ANDROID PERMISSIONS */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-lg font-black text-white font-heading">
                Android Permissions
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Required for reliable timer backgrounding and app detection.
              </p>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {permissions.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs flex items-start justify-between gap-2"
                >
                  <div>
                    <div className="font-bold text-neutral-200">{p.name}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">{p.whyNeeded}</div>
                  </div>
                  <button
                    onClick={() => togglePermission(p.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 ${
                      p.granted
                        ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {p.granted ? '✓ Granted' : 'Grant'}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => {
                  requestAllPermissions();
                  setStep(3);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2"
              >
                <span>Confirm Permissions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DEFAULT ALLOWED APPS */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-lg font-black text-white font-heading">
                Default Allowed Apps
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Select tools permitted during Timeskip Mode.
              </p>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {apps.slice(0, 7).map((app) => (
                <div
                  key={app.id}
                  onClick={() => toggleAppAllowed(app.id)}
                  className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs flex items-center justify-between cursor-pointer hover:bg-neutral-900"
                >
                  <span className="font-bold text-neutral-200">{app.name}</span>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      app.isAllowed
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-red-950 text-red-400 border border-red-800'
                    }`}
                  >
                    {app.isAllowed ? 'Allowed' : 'Blocked'}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep(2)}
                className="py-3 px-4 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SUBJECTS & DAILY GOAL */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-lg font-black text-white font-heading">
                Subjects & Daily Goal
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Verify default subjects and set your daily focus target.
              </p>
            </div>

            <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-2">
              <label className="text-xs font-bold text-neutral-300 block">
                Daily Study Goal: <span className="text-amber-400">{settings.dailyGoalHours} hours</span>
              </label>
              <input
                type="range"
                min={2}
                max={12}
                value={settings.dailyGoalHours}
                onChange={(e) => updateSettings({ dailyGoalHours: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                Default Subjects:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {subjects.map((s) => (
                  <span
                    key={s.id}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-neutral-950 border border-neutral-800 flex items-center gap-1.5 text-neutral-200"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span>{s.name}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setStep(3)}
                className="py-3 px-4 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setStep(5)}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2"
              >
                <span>Review Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: READY */}
        {step === 5 && (
          <div className="space-y-4 text-center py-2 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <Check className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white font-heading">
                Ready for Focus
              </h3>
              <p className="text-xs text-neutral-400 mt-2">
                Study Mode is fully armed. Pick a subject and hit START STUDY MODE to enter your first 60-minute cycle.
              </p>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-sm transition-all shadow-xl shadow-amber-500/20 active:scale-[0.98]"
            >
              LAUNCH TIMESKIP MODE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
