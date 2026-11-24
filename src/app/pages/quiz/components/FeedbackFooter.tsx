import { useLayoutEffect, useMemo, useRef } from "react";

import { BookIcon, CheckIcon, XIcon } from "./Icons";
import { useGetExplanation } from "../hooks/useQuiz";
import type { IAnswerResult, IQuestion } from "../../../shared/services/api/quiz";
import type { TGameStatus } from "../hooks/useQuizGame";

const PRAISES = ["Mandou bem!", "Perfeito!", "Isso aí!", "Excelente!", "Muito bem!"];

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
  const separator = question.tipo === "ordenar" ? " → " : " · ";
  const correctText = answered ? result!.idOpcoesCorretas.map((id) => textById[id]).join(separator) : "";
  const idleText =
    question.tipo === "ordenar" ? "Monte a sequência" : question.tipo === "multipla" ? "Marque todas as corretas" : "Selecione uma resposta";

  return (
    <footer ref={footerRef} className={`footer ${tone}`}>
      <div className="footer-inner">
        {answered ? (
          <div className="feedback" role="status">
            <div className="badge">{result!.correta ? <CheckIcon /> : <XIcon />}</div>
            <div>
              <strong>
                {result!.correta
                  ? praise
                  : question.tipo === "ordenar"
                    ? "Sequência correta:"
                    : question.tipo === "multipla"
                      ? "Respostas corretas:"
                      : "Resposta correta:"}
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
