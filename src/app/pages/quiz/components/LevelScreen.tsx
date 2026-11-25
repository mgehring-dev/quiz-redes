import { useEffect } from "react";

import type { IQuestion } from "../../../shared/services/api/quiz";
import { Environment } from "../../../shared/environment";
import { playClick } from "../../../shared/utils/sounds";

export type TNivel = "facil" | "dificil" | "todas";

interface ILevelScreenProps {
  questions: IQuestion[];
  onChoose: (nivel: TNivel) => void;
}

/** Tela inicial: escolha do nível (Fácil, Difícil ou Todas) */
export const LevelScreen = ({ questions, onChoose }: ILevelScreenProps) => {
  const faceis = questions.filter((q) => q.dificuldade === "facil").length;
  const dificeis = questions.filter((q) => q.dificuldade === "dificil").length;

  const levels: { value: TNivel; title: string; desc: string; meta: string; tone: string; bars: number }[] = [
    {
      value: "facil",
      title: "Fácil",
      desc: "Conceitos diretos, verdadeiro ou falso, complete e associe.",
      meta: `${faceis} perguntas · ${Environment.XP_POR_ACERTO} XP cada`,
      tone: "easy",
      bars: 1,
    },
    {
      value: "dificil",
      title: "Difícil",
      desc: "Cenários práticos e alternativas mais elaboradas.",
      meta: `${dificeis} perguntas · ${Environment.XP_POR_ACERTO_DIFICIL} XP cada`,
      tone: "hard",
      bars: 3,
    },
    {
      value: "todas",
      title: "Todas",
      desc: "As duas misturadas, numa lição só.",
      meta: `${questions.length} perguntas`,
      tone: "all",
      bars: 2,
    },
  ];

  const choose = (n: TNivel) => {
    playClick();
    onChoose(n);
  };

  // atalhos 1, 2 e 3
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const i = Number(e.key) - 1;
      if (i >= 0 && i < levels.length) choose(levels[i].value);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="app level-screen">
      <header className="level-head">
        <span className="level-kicker">Lista de Exercícios 2</span>
        <h1>Redes de Computadores</h1>
        <p>Aplicação e Transporte · escolha o nível para começar</p>
      </header>

      <div className="level-list">
        {levels.map((l, i) => (
          <button key={l.value} className={`level-card ${l.tone}`} onClick={() => choose(l.value)} style={{ animationDelay: `${60 + i * 60}ms` }}>
            <span className="level-bars" aria-hidden>
              {[1, 2, 3].map((b) => (
                <i key={b} className={b <= l.bars ? "on" : ""} />
              ))}
            </span>
            <span className="level-text">
              <strong>{l.title}</strong>
              <span>{l.desc}</span>
              <small>{l.meta}</small>
            </span>
            <span className="key">{i + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
