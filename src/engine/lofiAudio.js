/**
 * clemverter - Cozy Lo-Fi Ambient Audio Synthesizer (Web Audio API)
 * Generates soothing rain & vinyl crackle textures locally without any external audio files.
 */

let audioCtx = null;
let masterGain = null;
let isPlaying = false;
let currentTrack = 'rain'; // 'rain', 'vinyl'

let rainNode = null;
let vinylNode = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Creates pink noise buffer for soft ambient rain
 */
function createPinkNoiseBuffer(ctx, durationSec = 5) {
  const bufferSize = ctx.sampleRate * durationSec;
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
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
    b6 = white * 0.115926;
  }

  return buffer;
}

function startRain(ctx) {
  stopSounds();
  const buffer = createPinkNoiseBuffer(ctx, 4);
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;
  noiseSource.loop = true;

  // Lowpass filter to simulate rain behind a cozy window
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.setValueAtTime(800, ctx.currentTime);

  // Subtle resonance
  lowpass.Q.setValueAtTime(1.5, ctx.currentTime);

  noiseSource.connect(lowpass);
  lowpass.connect(masterGain);
  noiseSource.start();

  rainNode = { source: noiseSource, filter: lowpass };
}

function startVinyl(ctx) {
  stopSounds();
  const bufferSize = ctx.sampleRate * 3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    // Rare vinyl pop/crackle clicks
    const isClick = Math.random() < 0.0008;
    if (isClick) {
      data[i] = (Math.random() * 2 - 1) * 0.6;
    } else {
      data[i] = (Math.random() * 2 - 1) * 0.015;
    }
  }

  const vinylSource = ctx.createBufferSource();
  vinylSource.buffer = buffer;
  vinylSource.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1200, ctx.currentTime);
  filter.Q.setValueAtTime(1.2, ctx.currentTime);

  vinylSource.connect(filter);
  filter.connect(masterGain);
  vinylSource.start();

  vinylNode = { source: vinylSource, filter };
}

function stopSounds() {
  if (rainNode) {
    try { rainNode.source.stop(); } catch {}
    rainNode = null;
  }
  if (vinylNode) {
    try { vinylNode.source.stop(); } catch {}
    vinylNode = null;
  }
}

export const lofiAudio = {
  toggle() {
    const ctx = getAudioContext();
    if (isPlaying) {
      stopSounds();
      isPlaying = false;
    } else {
      isPlaying = true;
      if (currentTrack === 'rain') {
        startRain(ctx);
      } else {
        startVinyl(ctx);
      }
    }
    return isPlaying;
  },

  setTrack(track) {
    currentTrack = track;
    if (isPlaying) {
      const ctx = getAudioContext();
      if (track === 'rain') startRain(ctx);
      else startVinyl(ctx);
    }
  },

  setVolume(val) {
    if (!masterGain) return;
    const v = Math.max(0, Math.min(1, val));
    masterGain.gain.setValueAtTime(v * 0.3, audioCtx ? audioCtx.currentTime : 0);
  },

  isPlaying() {
    return isPlaying;
  },

  getTrack() {
    return currentTrack;
  }
};
