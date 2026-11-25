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
  verdadeiro_falso: "Verdadeiro ou falso?",
  ordenar: "Toque nos blocos na ordem certa",
  lacuna: "Complete a frase tocando nos blocos",
  associar: "Toque nos blocos para ligar cada item ao seu par",
};

export const QuestionCard = (props: IQuestionCardProps) => {
  const { question, isRevisao, mastered, total } = props;
  const hint = HINTS[question.tipo];

  return (
    <main className="stage">
      <div className="meta">
        <span className="tag">{question.topico}</span>
        <span className={`level-pill ${question.dificuldade}`}>{question.dificuldade === "dificil" ? "Difícil" : "Fácil"}</span>
        {isRevisao && (
          <span className="tag retry">
            <RepeatIcon /> Revisão
          </span>
        )}
        <span className="counter">
          {mastered}/{total} <span className="counter-label">concluídas</span>
        </span>
      </div>

      {question.tipo === "lacuna" ? <FillBlanksPrompt {...props} /> : <h1 className="prompt">{question.enunciado}</h1>}
      {hint && <p className="prompt-hint">{hint}</p>}

      {question.tipo === "ordenar" && <SequenceBuilder {...props} />}
      {question.tipo === "lacuna" && <Bank {...props} />}
      {question.tipo === "associar" && <MatchPairs {...props} />}
      {question.tipo === "verdadeiro_falso" && <TrueFalse {...props} />}
      {(question.tipo === "unica" || question.tipo === "multipla") && <OptionList {...props} />}
    </main>
  );
};

/** tom de cada bloco já colocado, depois de corrigir */
const slotTone = (result: IAnswerResult | null, status: TGameStatus, index: number, id: string) =>
  status === "answered" && result ? (result.idOpcoesCorretas[index] === id ? "right" : "wrong") : "";

/** Banco de blocos (compartilhado por sequência, lacunas e associação) */
const Bank = ({ question, order, selected, status, onPick }: IQuestionCardProps) => {
  const locked = status !== "answering";
  const textById = Object.fromEntries(question.opcoes.map((o) => [o.id, o.texto]));
  return (
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
  );
};

/** Complete a frase: o enunciado vira texto com lacunas preenchidas pelos blocos */
const FillBlanksPrompt = ({ question, selected, result, status, onUnplace }: IQuestionCardProps) => {
  const locked = status !== "answering";
  const textById = Object.fromEntries(question.opcoes.map((o) => [o.id, o.texto]));
  const raw = question.enunciado.split("___");
  // a pontuação logo depois de uma lacuna fica grudada nela (não quebra linha sozinha)
  const lead = raw.map((p, i) => (i === 0 ? "" : (p.match(/^[,.;:!?]+/)?.[0] ?? "")));
  const parts = raw.map((p, i) => p.slice(lead[i].length));

  return (
    <h1 className="prompt fill-prompt">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && <span className="blank-wrap">{renderBlank(i)}{lead[i + 1]}</span>}
        </span>
      ))}
    </h1>
  );

  function renderBlank(i: number) {
    return selected[i] ? (
      <button
        className={`blank filled ${slotTone(result, status, i, selected[i])}`}
        onClick={() => onUnplace(i)}
        disabled={locked}
        title="Remover"
      >
        {textById[selected[i]]}
      </button>
    ) : (
      <span className={`blank empty ${selected.length === i ? "next" : ""}`} aria-label={`lacuna ${i + 1}`}>
        {i + 1}
      </span>
    );
  }
};

/** Associe os pares: cada rótulo da esquerda recebe um bloco do banco */
const MatchPairs = (props: IQuestionCardProps) => {
  const { question, selected, result, status, onUnplace } = props;
  const locked = status !== "answering";
  const textById = Object.fromEntries(question.opcoes.map((o) => [o.id, o.texto]));

  return (
    <div className="match">
      <ol className="match-rows">
        {(question.rotulos ?? []).map((rotulo, i) => {
          const id = selected[i];
          return (
            <li key={rotulo} className={`match-row ${!id && selected.length === i ? "next" : ""}`}>
              <span className="match-label">{rotulo}</span>
              <span className="match-arrow" aria-hidden>
                →
              </span>
              {id ? (
                <button className={`chip-btn placed match-slot ${slotTone(result, status, i, id)}`} onClick={() => onUnplace(i)} disabled={locked}>
                  {textById[id]}
                </button>
              ) : (
                <span className="match-slot empty">toque num bloco</span>
              )}
            </li>
          );
        })}
      </ol>
      <Bank {...props} />
    </div>
  );
};

/** Verdadeiro ou falso: dois botões grandes */
const TrueFalse = ({ question, order, selected, result, status, onPick }: IQuestionCardProps) => {
  const answered = status === "answered" && !!result;
  const locked = status !== "answering";
  const textById = Object.fromEntries(question.opcoes.map((o) => [o.id, o.texto]));

  return (
    <div className="tf" role="radiogroup">
      {order.map((id, pos) => {
        const isSelected = selected.includes(id);
        const isRight = answered && result!.idOpcoesCorretas.includes(id);
        const isWrong = answered && isSelected && !isRight;
        const cls = [
          "option tf-option",
          pos === 0 ? "tf-true" : "tf-false",
          isSelected && "selected",
          isRight && "right",
          isWrong && "wrong",
          answered && !isRight && !isSelected && "dim",
          status === "checking" && isSelected && "pending",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <button key={id} className={cls} onClick={() => onPick(id)} disabled={locked} role="radio" aria-checked={isSelected}>
            <span className="tf-icon" aria-hidden>
              {pos === 0 ? "✓" : "✕"}
            </span>
            <span className="tf-text">{textById[id]}</span>
            <span className="key">{pos + 1}</span>
          </button>
        );
      })}
    </div>
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

      <Bank question={question} order={order} selected={selected} result={result} status={status} onPick={onPick} onUnplace={onUnplace} isRevisao={false} mastered={0} total={0} />
    </div>
  );
};
