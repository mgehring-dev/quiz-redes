export interface ISoundPack {
  correct: () => void;
  wrong: () => void;
  click: () => void;
  finish: () => void;
}

/** Envolve um som para nunca quebrar a tela se o áudio estiver indisponível */
export const safe = (fn: () => void) => () => {
  try {
    fn();
  } catch {
    /* áudio indisponível: segue sem som */
  }
};
