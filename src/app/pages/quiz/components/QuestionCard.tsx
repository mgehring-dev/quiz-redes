import { CheckIcon, RepeatIcon } from "./Icons";
import type { IAnswerResult, IQuestion } from "../../../shared/services/api/quiz";
import type { TGameStatus } from "../hooks/useQuizGame";

interface IQuestionCardProps {
  question: IQuestion;
  order: string[];
  selected: string[];
  result: IAnswerResult | null;
  status: TGameStatus;
  isRevisao: boolean;
  mastered: number;
  total: number;
  onPick: (optionId: string) => void;
  onUnplace: (index: number) => void;
}

const HINTS: Record<IQuestion["tipo"], string | null> = {
  unica: null,
  multipla: "Marque todas as corretas",
  ordenar: "Toque nos blocos na ordem certa",
};

export const QuestionCard = (props: IQuestionCardProps) => {
  const { question, isRevisao, mastered, total } = props;
  const hint = HINTS[question.tipo];

  return (
    <main className="stage">
      <div className="meta">
        <span className="tag">{question.topico}</span>
        {isRevisao && (
          <span className="tag retry">
            <RepeatIcon /> Revisão
          </span>
        )}
        <span className="counter">
          {mastered}/{total} <span className="counter-label">concluídas</span>
        </span>
      </div>

      <h1 className="prompt">{question.enunciado}</h1>
      {hint && <p className="prompt-hint">{hint}</p>}

      {question.tipo === "ordenar" ? <SequenceBuilder {...props} /> : <OptionList {...props} />}
    </main>
  );
};

/** Alternativas: única (radio) ou marque todas (checkbox) */
const OptionList = ({ question, order, selected, result, status, onPick }: IQuestionCardProps) => {
  const answered = status === "answered" && !!result;
  const locked = status !== "answering";
  const multi = question.tipo === "multipla";
  const textById = Object.fromEntries(question.opcoes.map((o) => [o.id, o.texto]));
  const corretas = new Set(result?.idOpcoesCorretas ?? []);

  return (
    <ul className={`options ${multi ? "multi" : ""}`}>
      {order.map((optionId, pos) => {
        const isSelected = selected.includes(optionId);
        const isRight = answered && corretas.has(optionId);
        const isWrong = answered && isSelected && !corretas.has(optionId);
        const isMissed = answered && multi && isRight && !isSelected;
        const cls = [
          "option",
          isSelected && "selected",
          isRight && !isMissed && "right",
          isMissed && "missed",
          isWrong && "wrong",
          answered && !isRight && !isSelected && "dim",
          status === "checking" && isSelected && "pending",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <li key={optionId} style={{ animationDelay: `${60 + pos * 45}ms` }}>
            <button
              className={cls}
              onClick={() => onPick(optionId)}
              disabled={locked}
              role={multi ? "checkbox" : "radio"}
              aria-checked={isSelected}
            >
              <span className={`key ${multi ? "box" : ""}`}>{multi && isSelected ? <CheckIcon /> : pos + 1}</span>
              <span className="text">{textById[optionId]}</span>
              {isMissed && <span className="missed-tag">faltou marcar</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
};

/** Monte a sequência: blocos do banco vão para a linha de resposta */
const SequenceBuilder = ({ question, order, selected, result, status, onPick, onUnplace }: IQuestionCardProps) => {
  const answered = status === "answered" && !!result;
  const locked = status !== "answering";
  const textById = Object.fromEntries(question.opcoes.map((o) => [o.id, o.texto]));
  const slots = question.qtdItens ?? selected.length;

  return (
    <div className="sequence">
      <ol className="seq-answer" aria-label="Sua sequência">
        {Array.from({ length: slots }, (_, i) => {
          const id = selected[i];
          if (!id) {
            return (
              <li key={`empty-${i}`} className="seq-slot empty">
                <span className="seq-n">{i + 1}</span>
              </li>
            );
          }
          const tone = answered ? (result!.idOpcoesCorretas[i] === id ? "right" : "wrong") : "";
          return (
            <li key={id} className={`seq-slot filled ${tone}`}>
              <button className="chip-btn placed" onClick={() => onUnplace(i)} disabled={locked} title="Remover">
                <span className="seq-n">{i + 1}</span>
                {textById[id]}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="seq-bank" aria-label="Blocos disponíveis">
        {order.map((id, pos) => {
          const used = selected.includes(id);
          return (
            <span key={id} className="bank-cell" style={{ animationDelay: `${60 + pos * 35}ms` }}>
              <button className={`chip-btn ${used ? "used" : ""}`} onClick={() => onPick(id)} disabled={locked || used} aria-hidden={used}>
                <span className="chip-key">{pos + 1}</span>
                {textById[id]}
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
};
