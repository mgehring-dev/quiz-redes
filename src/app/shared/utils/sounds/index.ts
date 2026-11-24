import { duolingoPack } from "./duolingo";
import { miamiPack } from "./miami";
import type { ISoundPack } from "./types";
import type { TEstilo } from "../../services/api/settings";

/** Pacote de sons de cada estilo visual */
const packs: Record<TEstilo, ISoundPack> = {
  duolingo: duolingoPack,
  miami: miamiPack,
};

let current: ISoundPack = duolingoPack;

/** Troca o pacote de sons ativo (chamado quando o estilo muda nas configurações) */
export function setSoundStyle(estilo: TEstilo) {
  current = packs[estilo] ?? duolingoPack;
}

export const playCorrect = () => current.correct();
export const playWrong = () => current.wrong();
export const playClick = () => current.click();
export const playFinish = () => current.finish();
