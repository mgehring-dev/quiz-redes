import { useEffect, useRef, useState } from "react";

import { useGetQuestions } from "./hooks/useQuiz";
import { useQuizGame } from "./hooks/useQuizGame";
import { QuizHeader } from "./components/QuizHeader";
import { QuestionCard } from "./components/QuestionCard";
import { FeedbackFooter } from "./components/FeedbackFooter";
import { FinishedScreen } from "./components/FinishedScreen";
import { ExplanationModal } from "./components/ExplanationModal";
import { errorResponse } from "../../shared/utils/errorResponse";
import type { IQuestion } from "../../shared/services/api/quiz";

export const QuizPage = () => {
  const { data, isLoading, isError, error, refetch } = useGetQuestions();

  if (isLoading) return <LoadingState />;
  if (isError || !data) {
    return (
      <div className="app center">
        <p className="error-text">{errorResponse(error)}</p>
        <button className="cta" onClick={() => refetch()}>
          Tentar de novo
        </button>
      </div>
    );
  }
  return <QuizGame questions={data} />;
};

const QuizGame = ({ questions }: { questions: IQuestion[] }) => {
  const { state, current, isRevisao, total, canCheck, pick, unplace, check, next, restart } = useQuizGame(questions);
  const [xpPopKey, setXpPopKey] = useState(0);
  const [explainOpen, setExplainOpen] = useState(false);
  const lastXp = useRef(0);

  // ao trocar de pergunta, o modal fecha
  useEffect(() => setExplainOpen(false), [state.turn]);

  // anima "+10" no chip de XP quando o servidor credita XP
  useEffect(() => {
    if (state.xp > lastXp.current) setXpPopKey((k) => k + 1);
    lastXp.current = state.xp;
  }, [state.xp]);

  // atalhos: números escolhem/marcam, Backspace desfaz o último bloco, Enter verifica / continua, E explica
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (explainOpen) return;
      if ((e.key === "e" || e.key === "E") && state.status === "answered") {
        setExplainOpen(true);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (state.status === "answering") check();
        else if (state.status === "answered") next();
        return;
      }
      if (e.key === "Backspace" && current?.tipo === "ordenar" && state.selected.length) {
        unplace(state.selected.length - 1);
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= state.order.length) pick(state.order[n - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [explainOpen, state.status, state.order, state.selected, current, check, next, pick, unplace]);

  if (state.status === "finished" || !current) {
    return (
      <FinishedScreen
        xp={state.xp}
        hits={state.hits}
        misses={state.misses}
        bestStreak={state.bestStreak}
        total={total}
        onRestart={restart}
      />
    );
  }

  return (
    <div className="app">
      <QuizHeader
        progress={(state.mastered.length / total) * 100}
        streak={state.streak}
        xp={state.xp}
        xpPopKey={xpPopKey}
        xpPop={state.result?.xpGanho ?? 0}
        onRestart={restart}
      />
      <QuestionCard
        key={state.turn}
        question={current}
        order={state.order}
        selected={state.selected}
        result={state.result}
        status={state.status}
        isRevisao={isRevisao}
        mastered={state.mastered.length}
        total={total}
        onPick={pick}
        onUnplace={unplace}
      />
      <FeedbackFooter
        status={state.status}
        result={state.result}
        question={current}
        canCheck={canCheck}
        error={state.error}
        turn={state.turn}
        onCheck={check}
        onNext={next}
        onExplain={() => setExplainOpen(true)}
      />
      {explainOpen && state.result && (
        <ExplanationModal question={current} result={state.result} selected={state.selected} onClose={() => setExplainOpen(false)} />
      )}
    </div>
  );
};

const LoadingState = () => (
  <div className="app">
    <header className="top">
      <div className="skeleton" style={{ width: 36, height: 36 }} />
      <div className="bar" />
      <div className="skeleton" style={{ width: 120, height: 32 }} />
    </header>
    <main className="stage">
      <div className="skeleton" style={{ width: 140, height: 22 }} />
      <div className="skeleton" style={{ width: "85%", height: 30, marginTop: 18 }} />
      <div className="options">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: 58, marginTop: 12 }} />
        ))}
      </div>
    </main>
  </div>
);
