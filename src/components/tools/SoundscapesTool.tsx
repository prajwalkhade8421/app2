import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { Play, Pause, Volume2, VolumeX, Sparkles, Waves, CloudRain, Coffee, Wind, Radio } from 'lucide-react';
import { ambientSoundManager } from '../../utils/ambientAudio';

export const SoundscapesTool: React.FC = () => {
  const { themeConfig } = useStudy();
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);

  const SOUND_OPTIONS = [
    { id: 'alpha_binaural', label: 'Binaural Alpha Wave', desc: '10Hz alpha frequency for deep, effortless study focus', icon: Sparkles },
    { id: 'gamma_binaural', label: 'Binaural Gamma (40Hz)', desc: '40Hz high cognitive processing & problem solving', icon: Radio },
    { id: 'brown_noise', label: 'Deep Brown Noise', desc: 'Low frequency rumble that masks speech & room echoes', icon: Waves },
    { id: 'pink_noise', label: 'Balanced Pink Noise', desc: 'Natural 1/f sound spectrum for prolonged reading', icon: Wind },
    { id: 'white_noise', label: 'Pure White Noise', desc: 'Full-spectrum mask for noisy libraries and transit', icon: Waves },
    { id: 'rain', label: 'Gentle Rain on Glass', desc: 'Calming drizzle backdrop with randomized natural drops', icon: CloudRain },
    { id: 'coffee_shop', label: 'Library & Ambient Hum', desc: 'Soft low-level ambient murmur that boosts creativity', icon: Coffee },
  ];

  const handleToggleSound = (soundId: string) => {
    if (activeSound === soundId) {
      ambientSoundManager.stop();
      setActiveSound(null);
    } else {
      ambientSoundManager.play(soundId, volume);
      setActiveSound(soundId);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    ambientSoundManager.setVolume(newVol);
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-neutral-200">Study Soundscapes & Binaural Beats</div>
            <div className="text-[11px] text-neutral-400 mt-0.5">
              Synthesized in real-time via Web Audio API — works 100% offline
            </div>
          </div>
          {activeSound && (
            <button
              onClick={() => {
                ambientSoundManager.stop();
                setActiveSound(null);
              }}
              className="py-1 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-red-400 flex items-center gap-1"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>Stop Audio</span>
            </button>
          )}
        </div>

        {/* Master Volume Slider */}
        <div className="flex items-center gap-3 pt-2 border-t border-neutral-800/60">
          <Volume2 className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="flex-1 accent-neutral-300 cursor-pointer"
          />
          <span className="text-xs font-mono font-bold text-neutral-400 w-10 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Sound Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {SOUND_OPTIONS.map((item) => {
          const Icon = item.icon;
          const isPlaying = activeSound === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleToggleSound(item.id)}
              className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                isPlaying
                  ? 'bg-neutral-900 border-neutral-600 ring-1 ring-neutral-600'
                  : 'bg-neutral-900/60 border-neutral-800 hover:bg-neutral-900 hover:border-neutral-700'
              }`}
            >
              <div
                className={`p-2 rounded-xl mt-0.5 shrink-0 transition-colors ${
                  isPlaying ? 'bg-neutral-100 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isPlaying ? 'text-neutral-100' : 'text-neutral-200'}`}>
                    {item.label}
                  </span>
                  {isPlaying && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                  {item.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
