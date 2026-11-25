import { useEffect, useRef } from "react";

import { CheckIcon, XIcon } from "./Icons";
import { useGetExplanation } from "../hooks/useQuiz";
import { errorResponse } from "../../../shared/utils/errorResponse";
import { isSequencia, type IAnswerResult, type IQuestion } from "../../../shared/services/api/quiz";

interface IExplanationModalProps {
  question: IQuestion;
  result: IAnswerResult;
  /** o que o usuário respondeu (para marcar "sua escolha") */
  selected: string[];
  onClose: () => void;
}

export const ExplanationModal = ({ question, result, selected, onClose }: IExplanationModalProps) => {
  const { data, isLoading, isError, error, refetch } = useGetExplanation(question.id, true);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isSequence = isSequencia(question.tipo);
  const tipo = question.tipo;
  const rotulo = (pos: number) => question.rotulos?.[pos - 1] ?? "";

  /** título da lista de alternativas, por tipo */
  const listTitle =
    tipo === "ordenar"
      ? "Passo a passo"
      : tipo === "lacuna"
        ? "Lacuna por lacuna"
        : tipo === "associar"
          ? "Par por par"
          : "Alternativa por alternativa";

  /** como mostrar onde o usuário colocou o bloco */
  const placedTag = (pos: number) =>
    tipo === "lacuna" ? `você pôs na lacuna ${pos}` : tipo === "associar" ? `você ligou a ${rotulo(pos)}` : `você pôs em ${pos}º`;

  /** prefixo do texto do bloco correto (lacuna N / rótulo →) */
  const correctPrefix = (pos?: number) =>
    !pos ? "" : tipo === "lacuna" ? `Lacuna ${pos}: ` : tipo === "associar" ? `${rotulo(pos)} → ` : "";

  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const yourPosition = (id: string) => selected.indexOf(id) + 1;

  return (
    <div className="modal-root" role="presentation">
      <div className="modal-backdrop" onClick={onClose} />
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="explain-title"
        onKeyDown={(e) => {
          // o modal tem os próprios atalhos; os do jogo não disparam aqui
          e.stopPropagation();
          if (e.key === "Escape") onClose();
        }}
      >
        <header className="modal-head">
          <div>
            <span className="modal-kicker">{question.topico}</span>
            <h2 id="explain-title">Entenda a resposta</h2>
          </div>
          <button ref={closeRef} className="icon-btn" onClick={onClose} aria-label="Fechar">
            <XIcon size={18} />
          </button>
        </header>

        <div className="modal-body">
          <p className="modal-question">{question.enunciado}</p>
          <span className={`result-pill ${result.correta ? "ok" : "err"}`}>
            {result.correta ? <CheckIcon /> : <XIcon size={16} />}
            {result.correta ? "Você acertou" : "Você errou"}
          </span>

          {isLoading && <ModalSkeleton />}

          {isError && (
            <div className="modal-error">
              <p>{errorResponse(error)}</p>
              <button className="link-btn" onClick={() => refetch()}>
                Tentar de novo
              </button>
            </div>
          )}

          {data && (
            <>
              <section className="explain-block why">
                <h3>Por que essa é a resposta</h3>
                <p>{data.porQue}</p>
              </section>

              <section className="explain-block">
                <h3>{listTitle}</h3>
                <ul className="alt-list">
                  {data.alternativas.map((alt) => {
                    const chosen = selected.includes(alt.idOpcao);
                    const tone = alt.correta ? "ok" : "err";
                    // na sequência, um passo certo colocado na posição errada também conta como erro
                    const misplaced = isSequence && chosen && yourPosition(alt.idOpcao) !== alt.posicao;
                    return (
                      <li key={alt.idOpcao} className={`alt ${tone} ${chosen ? "chosen" : ""} ${misplaced ? "misplaced" : ""}`}>
                        <span className="alt-mark" aria-hidden>
                          {isSequence && alt.posicao ? alt.posicao : alt.correta ? <CheckIcon /> : <XIcon size={14} />}
                        </span>
                        <div className="alt-text">
                          <strong>
                            {correctPrefix(alt.posicao)}
                            {alt.texto}
                            {chosen && (
                              <span className="chosen-tag">{isSequence ? placedTag(yourPosition(alt.idOpcao)) : "sua escolha"}</span>
                            )}
                            {isSequence && !alt.posicao && <span className="extra-tag">não entra</span>}
                          </strong>
                          <span>{alt.motivo}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section className="explain-block">
                <h3>Entenda o conceito</h3>
                {data.conceito.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </section>

              <aside className="tip">
                <span className="tip-label">Dica para lembrar</span>
                <p>{data.dica}</p>
              </aside>
            </>
          )}
        </div>

        <footer className="modal-foot">
          <button className="cta" onClick={onClose}>
            Entendi
          </button>
        </footer>
      </section>
    </div>
  );
};

const ModalSkeleton = () => (
  <div className="explain-block">
    <div className="skeleton" style={{ height: 16, width: "40%" }} />
    <div className="skeleton" style={{ height: 14, marginTop: 12 }} />
    <div className="skeleton" style={{ height: 14, marginTop: 8, width: "85%" }} />
    {[0, 1, 2].map((i) => (
      <div key={i} className="skeleton" style={{ height: 56, marginTop: 14 }} />
    ))}
  </div>
);
