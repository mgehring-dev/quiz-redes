import { safe, ISoundPack } from "./types";

// Sons suaves e curtos (senoide/triângulo), no espírito de app de idiomas.

let ctx: AudioContext | undefined;

const audio = () => {
  if (!ctx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
};

interface ITone {
  freq: number;
  start?: number;
  dur?: number;
  type?: OscillatorType;
  vol?: number;
  slideTo?: number;
}

function tone({ freq, start = 0, dur = 0.18, type = "sine", vol = 0.12, slideTo }: ITone) {
  const ac = audio();
  const t = ac.currentTime + start;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  const filter = ac.createBiquadFilter();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);

  filter.type = "lowpass";
  filter.frequency.value = 2400;

  // envelope com ataque e release macios (sem "clique")
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  osc.connect(filter).connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

/** Dois toques ascendentes (Mi5 → Lá5) com leve brilho */
const correct = safe(() => {
  tone({ freq: 659.25, dur: 0.16, vol: 0.1 });
  tone({ freq: 880, start: 0.09, dur: 0.28, vol: 0.11 });
  tone({ freq: 1760, start: 0.09, dur: 0.22, vol: 0.02, type: "triangle" });
});

/** Dois toques graves descendentes, abafados */
const wrong = safe(() => {
  tone({ freq: 311.13, dur: 0.16, type: "triangle", vol: 0.1 });
  tone({ freq: 233.08, start: 0.12, dur: 0.3, type: "triangle", vol: 0.09, slideTo: 220 });
});

const click = safe(() => {
  tone({ freq: 520, dur: 0.05, vol: 0.035, type: "triangle" });
});

const finish = safe(() => {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone({ freq: f, start: i * 0.09, dur: 0.3, vol: 0.08 }));
});

export const duolingoPack: ISoundPack = { correct, wrong, click, finish };
