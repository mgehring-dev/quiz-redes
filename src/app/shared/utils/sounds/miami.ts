import { safe, ISoundPack } from "./types";

// Sons synthwave (anos 80, neon de Miami) sintetizados com Web Audio API.
// Cadeia: vozes → compressor → saída, com envios para eco (delay) e reverb.
// Tudo gerado em tempo real, sem arquivos de áudio.

interface IEngine {
  ac: AudioContext;
  bus: GainNode;
  delay: GainNode;
  reverb: GainNode;
}

let engine: IEngine | undefined;

function impulse(ac: AudioContext, seconds: number, decay: number) {
  const len = Math.floor(ac.sampleRate * seconds);
  const buf = ac.createBuffer(2, len, ac.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

function getEngine(): IEngine {
  if (engine) {
    if (engine.ac.state === "suspended") void engine.ac.resume();
    return engine;
  }
  const Ctor = window.AudioContext || (window as any).webkitAudioContext;
  const ac: AudioContext = new Ctor();

  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 4;
  comp.attack.value = 0.003;
  comp.release.value = 0.2;

  const master = ac.createGain();
  master.gain.value = 0.55;
  comp.connect(master).connect(ac.destination);

  const bus = ac.createGain();
  bus.connect(comp);

  // eco "ping" típico de synth dos anos 80
  const delay = ac.createGain();
  delay.gain.value = 1;
  const dl = ac.createDelay(1);
  dl.delayTime.value = 0.19;
  const fb = ac.createGain();
  fb.gain.value = 0.32;
  const dlFilter = ac.createBiquadFilter();
  dlFilter.type = "lowpass";
  dlFilter.frequency.value = 2200;
  const dlOut = ac.createGain();
  dlOut.gain.value = 0.35;
  delay.connect(dl);
  dl.connect(dlFilter).connect(fb).connect(dl);
  dlFilter.connect(dlOut).connect(comp);

  // reverb de sala grande
  const reverb = ac.createGain();
  const conv = ac.createConvolver();
  conv.buffer = impulse(ac, 1.8, 2.6);
  const rvOut = ac.createGain();
  rvOut.gain.value = 0.28;
  reverb.connect(conv).connect(rvOut).connect(comp);

  engine = { ac, bus, delay, reverb };
  return engine;
}

interface IVoice {
  freq: number;
  start?: number;
  dur?: number;
  type?: OscillatorType;
  vol?: number;
  /** desafinação entre os osciladores (cents) — o "chorus" do synth */
  detune?: number;
  voices?: number;
  attack?: number;
  /** corte do filtro no início e no fim da nota */
  cutoff?: [number, number];
  q?: number;
  bendTo?: number;
  delaySend?: number;
  reverbSend?: number;
}

function voice({
  freq,
  start = 0,
  dur = 0.3,
  type = "sawtooth",
  vol = 0.1,
  detune = 12,
  voices = 2,
  attack = 0.008,
  cutoff = [3200, 900],
  q = 6,
  bendTo,
  delaySend = 0.25,
  reverbSend = 0.3,
}: IVoice) {
  const { ac, bus, delay, reverb } = getEngine();
  const t = ac.currentTime + 0.01 + start;

  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = q;
  filter.frequency.setValueAtTime(cutoff[0], t);
  filter.frequency.exponentialRampToValueAtTime(cutoff[1], t + dur);

  const amp = ac.createGain();
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(vol, t + attack);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  // panorâmica alternada para espalhar o som no estéreo
  const pan = ac.createStereoPanner();
  pan.pan.value = (Math.random() - 0.5) * 0.4;

  filter.connect(amp).connect(pan);
  pan.connect(bus);
  if (delaySend) {
    const s = ac.createGain();
    s.gain.value = delaySend;
    pan.connect(s).connect(delay);
  }
  if (reverbSend) {
    const s = ac.createGain();
    s.gain.value = reverbSend;
    pan.connect(s).connect(reverb);
  }

  for (let i = 0; i < voices; i++) {
    const osc = ac.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (bendTo) osc.frequency.exponentialRampToValueAtTime(bendTo, t + dur * 0.8);
    osc.detune.value = voices > 1 ? (i / (voices - 1) - 0.5) * 2 * detune : 0;
    osc.connect(filter);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }
}

/** pancada curta de ruído filtrado (o "snap" de bateria eletrônica) */
function snap(start = 0, vol = 0.06, freq = 2400) {
  const { ac, bus, reverb } = getEngine();
  const t = ac.currentTime + 0.01 + start;
  const len = Math.floor(ac.sampleRate * 0.12);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = freq;
  bp.Q.value = 1.2;
  const amp = ac.createGain();
  amp.gain.setValueAtTime(vol, t);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
  src.connect(bp).connect(amp);
  amp.connect(bus);
  const s = ac.createGain();
  s.gain.value = 0.5;
  amp.connect(s).connect(reverb);
  src.start(t);
}

// notas (Hz)
const N = {
  A2: 110, C3: 130.81, E3: 164.81, F3: 174.61, G3: 196, Ab3: 207.65, A3: 220,
  C4: 261.63, E4: 329.63, G4: 392, A4: 440, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, B5: 987.77, C6: 1046.5, E6: 1318.5,
};

/** Acerto: arpejo brilhante de Cmaj9 subindo, com eco e um "shimmer" no topo */
const correct = safe(() => {
  [N.C5, N.E5, N.G5, N.B5].forEach((f, i) =>
    voice({ freq: f, start: i * 0.055, dur: 0.38, vol: 0.075, cutoff: [5200, 1400], q: 4, delaySend: 0.35 }),
  );
  voice({ freq: N.D5 * 2, start: 0.2, dur: 0.6, type: "triangle", vol: 0.035, voices: 1, cutoff: [8000, 3000], reverbSend: 0.6 });
  voice({ freq: N.C3, dur: 0.35, type: "sine", vol: 0.12, voices: 1, cutoff: [600, 300], delaySend: 0, reverbSend: 0 });
  snap(0, 0.045, 5000);
});

/** Erro: acorde menor grave e desafinado que "despenca", abafado */
const wrong = safe(() => {
  [N.A3, N.C4, N.E4].forEach((f) =>
    voice({ freq: f, dur: 0.5, vol: 0.06, detune: 22, cutoff: [1600, 260], q: 8, bendTo: f * 0.84, delaySend: 0.2 }),
  );
  voice({ freq: N.A2, dur: 0.45, type: "square", vol: 0.05, voices: 1, cutoff: [700, 120], bendTo: 82, delaySend: 0, reverbSend: 0.15 });
  snap(0, 0.04, 900);
});

/** Clique na opção: pluck curto de synth com um eco discreto */
const click = safe(() => {
  voice({ freq: N.E5, dur: 0.09, vol: 0.05, voices: 2, detune: 8, cutoff: [6000, 900], q: 10, delaySend: 0.3, reverbSend: 0.12 });
  voice({ freq: N.E4, dur: 0.07, type: "square", vol: 0.02, voices: 1, cutoff: [2500, 600], delaySend: 0, reverbSend: 0 });
});

/** Fim da lição: arpejo longo ao estilo "sunset drive" */
const finish = safe(() => {
  const seq = [N.C4, N.E4, N.G4, N.B4, N.C5, N.E5, N.G5, N.B5, N.C6, N.E6];
  seq.forEach((f, i) => voice({ freq: f, start: i * 0.075, dur: 0.45, vol: 0.06, cutoff: [6000, 1500], delaySend: 0.4 }));
  [N.C3, N.G3].forEach((f) => voice({ freq: f, dur: 1.6, vol: 0.05, detune: 18, voices: 3, attack: 0.25, cutoff: [1800, 600], reverbSend: 0.6 }));
});
export const miamiPack: ISoundPack = { correct, wrong, click, finish };
