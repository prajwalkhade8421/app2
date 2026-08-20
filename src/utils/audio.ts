import { AlarmRingtoneId } from '../types';

class SoundManager {
  private ctx: AudioContext | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private isPreviewPlaying = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playTone(freq: number, type: OscillatorType, duration: number, delay = 0, volume = 0.2) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume), ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration + 0.05);
    } catch {
      // Audio autoplay policy or error
    }
  }

  // Stop any currently playing audio / ringtone preview
  stopAllAudio() {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
    this.isPreviewPlaying = false;
  }

  // Play a specific ringtone with volume and optional custom audio base64 URL
  playRingtone(
    ringtoneId: AlarmRingtoneId = 'chime',
    volume = 0.8,
    customAudioUrl?: string | null
  ) {
    this.stopAllAudio();

    // If user selected custom uploaded ringtone and URL exists
    if (ringtoneId === 'custom' && customAudioUrl) {
      try {
        const audio = new Audio(customAudioUrl);
        audio.volume = Math.min(1, Math.max(0.1, volume));
        this.currentAudioElement = audio;
        this.isPreviewPlaying = true;
        audio.play().catch(() => {
          // Fallback to chime if custom playback fails
          this.playChime(volume);
        });
        audio.onended = () => {
          this.isPreviewPlaying = false;
          this.currentAudioElement = null;
        };
        return;
      } catch {
        this.playChime(volume);
        return;
      }
    }

    switch (ringtoneId) {
      case 'zen_bowl':
        this.playZenBowl(volume);
        break;
      case 'digital_beep':
        this.playDigitalBeep(volume);
        break;
      case 'radar':
        this.playRadar(volume);
        break;
      case 'bell':
        this.playBell(volume);
        break;
      case 'marimba':
        this.playMarimba(volume);
        break;
      case 'siren':
        this.playSiren(volume);
        break;
      case 'chime':
      default:
        this.playChime(volume);
        break;
    }
  }

  // 1. Classic 4-tone ascending marimba chime (E5 -> G#5 -> B5 -> E6)
  playChime(volume = 0.8) {
    const tones = [659.25, 830.61, 987.77, 1318.51];
    tones.forEach((freq, idx) => {
      this.playTone(freq, 'sine', 0.45, idx * 0.16, volume * 0.4);
    });
  }

  // 2. Zen Tibetan Singing Bowl (Resonant 432Hz with rich overtones)
  playZenBowl(volume = 0.8) {
    const fundamentals = [432, 864, 1296, 1728];
    fundamentals.forEach((freq, idx) => {
      const vol = (volume * 0.35) / (idx + 1);
      this.playTone(freq, 'sine', 2.2, 0, vol);
    });
  }

  // 3. Digital Dual Beep
  playDigitalBeep(volume = 0.8) {
    this.playTone(1760, 'square', 0.08, 0, volume * 0.25);
    this.playTone(1760, 'square', 0.08, 0.12, volume * 0.25);
    this.playTone(1760, 'square', 0.08, 0.35, volume * 0.25);
    this.playTone(1760, 'square', 0.08, 0.47, volume * 0.25);
  }

  // 4. Radar Sonar Sweep
  playRadar(volume = 0.8) {
    for (let i = 0; i < 3; i++) {
      const delay = i * 0.4;
      this.playTone(1200, 'sine', 0.3, delay, volume * 0.35);
      this.playTone(800, 'sine', 0.2, delay + 0.08, volume * 0.2);
    }
  }

  // 5. Meditation Temple Bell
  playBell(volume = 0.8) {
    this.playTone(587.33, 'triangle', 2.0, 0, volume * 0.4);
    this.playTone(1174.66, 'sine', 1.8, 0, volume * 0.25);
    this.playTone(1760, 'sine', 1.2, 0, volume * 0.15);
  }

  // 6. Upbeat Energetic Marimba
  playMarimba(volume = 0.8) {
    const melody = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    melody.forEach((freq, idx) => {
      this.playTone(freq, 'triangle', 0.15, idx * 0.1, volume * 0.35);
    });
  }

  // 7. High Urgency Alert / Siren
  playSiren(volume = 0.8) {
    for (let i = 0; i < 4; i++) {
      const baseDelay = i * 0.28;
      this.playTone(950, 'sawtooth', 0.12, baseDelay, volume * 0.35);
      this.playTone(700, 'sawtooth', 0.12, baseDelay + 0.12, volume * 0.35);
    }
  }

  // 60-Minute Cycle Complete Chime
  playCycleCompleteSound(ringtoneId: AlarmRingtoneId = 'chime', volume = 0.8, customAudioUrl?: string | null) {
    this.playRingtone(ringtoneId, volume, customAudioUrl);
  }

  // 5-Minute Warning: "GET BACK TO STUDY"
  play5MinWarningSound(ringtoneId: AlarmRingtoneId = 'digital_beep', volume = 0.8, customAudioUrl?: string | null) {
    this.playRingtone(ringtoneId, volume, customAudioUrl);
  }

  // 10-Minute Strong Urgency Alarm
  play10MinAlarmSound(ringtoneId: AlarmRingtoneId = 'siren', volume = 0.8, customAudioUrl?: string | null) {
    this.playRingtone(ringtoneId, volume, customAudioUrl);
  }

  // Break return tone
  playBreakReturnSound() {
    this.playTone(523.25, 'sine', 0.15, 0, 0.2);
    this.playTone(659.25, 'sine', 0.25, 0.12, 0.2);
  }

  // Penalty added notification
  playPenaltySound() {
    this.playTone(440, 'sawtooth', 0.2, 0, 0.25);
    this.playTone(330, 'sawtooth', 0.35, 0.18, 0.25);
  }

  // Daily goal completed fanfare
  playGoalCelebrationSound() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'triangle', 0.4, idx * 0.12, 0.3);
    });
  }

  // Tactile button click / tick
  playTickSound() {
    this.playTone(1200, 'sine', 0.04, 0, 0.08);
  }
}

export const soundManager = new SoundManager();

