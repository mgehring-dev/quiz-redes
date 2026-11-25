import { useLayoutEffect, useMemo, useRef } from "react";

import { BookIcon, CheckIcon, XIcon } from "./Icons";
import { useGetExplanation } from "../hooks/useQuiz";
import type { IAnswerResult, IQuestion, TTipoPergunta } from "../../../shared/services/api/quiz";
import type { TGameStatus } from "../hooks/useQuizGame";

const PRAISES = ["Mandou bem!", "Perfeito!", "Isso aí!", "Excelente!", "Muito bem!"];

const IDLE: Record<TTipoPergunta, string> = {
  unica: "Selecione uma resposta",
  multipla: "Marque todas as corretas",
  verdadeiro_falso: "Verdadeiro ou falso?",
  ordenar: "Monte a sequência",
  lacuna: "Complete as lacunas",
  associar: "Associe os pares",
};

const WRONG_LABEL: Record<TTipoPergunta, string> = {
  unica: "Resposta correta:",
  multipla: "Respostas corretas:",
  verdadeiro_falso: "Resposta correta:",
  ordenar: "Sequência correta:",
  lacuna: "Frase correta:",
  associar: "Pares corretos:",
};

/** resposta correta em texto, no formato de cada tipo */
function formatAnswer(question: IQuestion, textos: string[]): string {
  switch (question.tipo) {
    case "ordenar":
      return textos.join(" → ");
    case "lacuna": {
      const parts = question.enunciado.split("___");
      return parts.map((p, i) => p + (i < textos.length ? textos[i] : "")).join("");
    }
    case "associar":
      return (question.rotulos ?? []).map((r, i) => `${r} → ${textos[i]}`).join(" · ");
    default:
      return textos.join(" · ");
  }
}

interface IFeedbackFooterProps {
  status: TGameStatus;
  result: IAnswerResult | null;
  question: IQuestion;
  canCheck: boolean;
  error: string | null;
  turn: number;
  onCheck: () => void;
  onNext: () => void;
  onExplain: () => void;
}

export const FeedbackFooter = ({ status, result, question, canCheck, error, turn, onCheck, onNext, onExplain }: IFeedbackFooterProps) => {
  const praise = useMemo(() => PRAISES[Math.floor(Math.random() * PRAISES.length)], [turn]);
  const answered = status === "answered" && !!result;
  const footerRef = useRef<HTMLElement>(null);

  // publica a altura real do rodapé fixo em --footer-h, para o conteúdo nunca ficar escondido atrás dele
  useLayoutEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const root = document.documentElement;
    const update = () => root.style.setProperty("--footer-h", `${Math.ceil(el.getBoundingClientRect().height)}px`);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // já busca a explicação em segundo plano, para o modal abrir sem espera
  useGetExplanation(question.id, answered);
  const tone = answered ? (result!.correta ? "correct" : "wrong") : "";
  const textById = Object.fromEntries(question.opcoes.map((o) => [o.id, o.texto]));
  const correctText = answered ? formatAnswer(question, result!.idOpcoesCorretas.map((id) => textById[id])) : "";
  const idleText = IDLE[question.tipo];
  const wrongLabel = WRONG_LABEL[question.tipo];

  return (
    <footer ref={footerRef} className={`footer ${tone}`}>
      <div className="footer-inner">
        {answered ? (
          <div className="feedback" role="status">
            <div className="badge">{result!.correta ? <CheckIcon /> : <XIcon />}</div>
            <div>
              <strong>
                {result!.correta ? praise : wrongLabel}
              </strong>
              {!result!.correta && <p className="answer">{correctText}</p>}
              <p className="explain">{result!.explicacao}</p>
              {!result!.correta && <p className="hint">Essa pergunta volta depois da próxima.</p>}
            </div>
          </div>
        ) : (
          <div className={`feedback idle ${error ? "error" : ""}`}>
            {error ?? (canCheck ? "Pronto para verificar" : idleText)}
          </div>
        )}

        {answered ? (
          <div className="footer-actions">
            <button className={`explain-btn ${tone}`} onClick={onExplain} title="Atalho: E">
              <BookIcon />
              Entenda a resposta
            </button>
            <button className={`cta ${tone}`} onClick={onNext} autoFocus>
              Continuar
            </button>
          </div>
        ) : (
          <button className={`cta ${status === "checking" ? "loading" : ""}`} onClick={onCheck} disabled={!canCheck || status === "checking"}>
            {status === "checking" ? <span className="spinner" aria-label="Verificando" /> : "Verificar"}
          </button>
        )}
      </div>
    </footer>
  );
};
