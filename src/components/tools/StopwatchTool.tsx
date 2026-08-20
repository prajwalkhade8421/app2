import React, { useState, useEffect, useRef } from 'react';
import { useStudy } from '../../context/StudyContext';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';

export const StopwatchTool: React.FC = () => {
  const { themeConfig } = useStudy();
  const [swTimeMs, setSwTimeMs] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [laps, setLaps] = useState<{ id: number; timeMs: number; deltaMs: number }[]>([]);
  const swIntervalRef = useRef<number | null>(null);
  const swStartTimeRef = useRef<number>(0);

  useEffect(() => {
    if (swRunning) {
      swStartTimeRef.current = Date.now() - swTimeMs;
      swIntervalRef.current = window.setInterval(() => {
        setSwTimeMs(Date.now() - swStartTimeRef.current);
      }, 25);
    } else if (swIntervalRef.current) {
      clearInterval(swIntervalRef.current);
    }
    return () => {
      if (swIntervalRef.current) clearInterval(swIntervalRef.current);
    };
  }, [swRunning]);

  const handleSwStart = () => setSwRunning(true);
  const handleSwPause = () => setSwRunning(false);
  const handleSwReset = () => {
    setSwRunning(false);
    setSwTimeMs(0);
    setLaps([]);
  };
  const handleSwLap = () => {
    if (!swRunning) return;
    const lastLapTime = laps.length > 0 ? laps[0].timeMs : 0;
    const delta = swTimeMs - lastLapTime;
    setLaps([{ id: laps.length + 1, timeMs: swTimeMs, deltaMs: delta }, ...laps]);
  };

  const formatStopwatch = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSecs / 60);
    const seconds = totalSecs % 60;
    const millis = Math.floor((ms % 1000) / 10);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(minutes)}:${pad(seconds)}.${pad(millis)}`;
  };

  return (
    <div className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-6 animate-in fade-in">
      <div className="text-center space-y-2">
        <div className="text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase">
          PRECISION STOPWATCH
        </div>
        <div
          className="text-5xl sm:text-6xl font-black font-mono-numbers tracking-tight"
          style={{ color: themeConfig.hex }}
        >
          {formatStopwatch(swTimeMs)}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        {!swRunning ? (
          <button
            onClick={handleSwStart}
            className="flex-1 max-w-[140px] py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            style={{ backgroundColor: themeConfig.hex, color: '#0a0a0a' }}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start</span>
          </button>
        ) : (
          <button
            onClick={handleSwPause}
            className="flex-1 max-w-[140px] py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Pause className="w-4 h-4 fill-current" />
            <span>Pause</span>
          </button>
        )}

        <button
          onClick={handleSwLap}
          disabled={!swRunning}
          className="py-3 px-4 rounded-2xl bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 disabled:opacity-30 text-neutral-200 font-bold text-xs flex items-center gap-1.5 transition-all"
        >
          <Flag className="w-4 h-4" />
          <span>Lap</span>
        </button>

        <button
          onClick={handleSwReset}
          disabled={swTimeMs === 0}
          className="py-3 px-4 rounded-2xl bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 disabled:opacity-30 text-neutral-400 hover:text-neutral-200 font-bold text-xs flex items-center gap-1.5 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>

      {/* Laps List */}
      {laps.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-neutral-800/80">
          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Split Laps ({laps.length})
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1 pr-1 font-mono-numbers">
            {laps.map((lap) => (
              <div
                key={lap.id}
                className="flex items-center justify-between text-xs p-2 rounded-xl bg-neutral-950/60 border border-neutral-900"
              >
                <span className="text-neutral-400">Lap #{lap.id}</span>
                <div className="space-x-2">
                  <span className="font-semibold" style={{ color: themeConfig.hex }}>
                    {formatStopwatch(lap.timeMs)}
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    (+{formatStopwatch(lap.deltaMs)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
