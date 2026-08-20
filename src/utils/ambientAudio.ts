// Web Audio API ambient audio synthesizer
class AmbientSoundManager {
  private ctx: AudioContext | null = null;
  private currentNodes: {
    sources: AudioNode[];
    gain: GainNode;
  } | null = null;
  private volume: number = 0.5;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.currentNodes) {
      this.currentNodes.gain.gain.setTargetAtTime(this.volume * 0.4, this.getContext().currentTime, 0.05);
    }
  }

  public stop() {
    if (this.currentNodes) {
      this.currentNodes.sources.forEach((node) => {
        try {
          if ('stop' in node) {
            (node as AudioScheduledSourceNode).stop();
          }
          node.disconnect();
        } catch {}
      });
      try {
        this.currentNodes.gain.disconnect();
      } catch {}
      this.currentNodes = null;
    }
  }

  public play(soundId: string, initialVolume = 0.5) {
    this.stop();
    this.volume = initialVolume;
    const ctx = this.getContext();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const sources: AudioNode[] = [];

    switch (soundId) {
      case 'alpha_binaural': {
        // Left ear 200Hz, right ear 210Hz => 10Hz Alpha beat
        const merger = ctx.createChannelMerger(2);
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();

        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(200, ctx.currentTime);

        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(210, ctx.currentTime);

        const gainL = ctx.createGain();
        gainL.gain.value = 0.5;
        const gainR = ctx.createGain();
        gainR.gain.value = 0.5;

        oscL.connect(gainL);
        gainL.connect(merger, 0, 0);

        oscR.connect(gainR);
        gainR.connect(merger, 0, 1);

        merger.connect(masterGain);

        oscL.start();
        oscR.start();
        sources.push(oscL, oscR, gainL, gainR, merger);
        break;
      }

      case 'gamma_binaural': {
        // 200Hz and 240Hz => 40Hz Gamma beat for high problem solving
        const merger = ctx.createChannelMerger(2);
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();

        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(220, ctx.currentTime);

        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(260, ctx.currentTime);

        const gainL = ctx.createGain();
        gainL.gain.value = 0.4;
        const gainR = ctx.createGain();
        gainR.gain.value = 0.4;

        oscL.connect(gainL);
        gainL.connect(merger, 0, 0);

        oscR.connect(gainR);
        gainR.connect(merger, 0, 1);

        merger.connect(masterGain);

        oscL.start();
        oscR.start();
        sources.push(oscL, oscR, gainL, gainR, merger);
        break;
      }

      case 'brown_noise': {
        // Brown noise using filtered noise buffer
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        noise.connect(filter);
        filter.connect(masterGain);
        noise.start();
        sources.push(noise, filter);
        break;
      }

      case 'pink_noise': {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          data[i] *= 0.11;
          b6 = white * 0.115926;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        noise.connect(masterGain);
        noise.start();
        sources.push(noise);
        break;
      }

      case 'white_noise': {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.15;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        noise.connect(masterGain);
        noise.start();
        sources.push(noise);
        break;
      }

      case 'rain': {
        // Filtered pink noise + resonant drips
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.2;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1200;

        const band = ctx.createBiquadFilter();
        band.type = 'peaking';
        band.frequency.value = 3500;
        band.gain.value = -6;

        noise.connect(filter);
        filter.connect(band);
        band.connect(masterGain);
        noise.start();
        sources.push(noise, filter, band);
        break;
      }

      case 'coffee_shop': {
        // Warm low rumble + soft murmur simulation
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.2;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 600;
        filter.Q.value = 1.2;

        noise.connect(filter);
        filter.connect(masterGain);
        noise.start();
        sources.push(noise, filter);
        break;
      }

      default:
        break;
    }

    this.currentNodes = {
      sources,
      gain: masterGain,
    };
  }
}

export const ambientSoundManager = new AmbientSoundManager();
