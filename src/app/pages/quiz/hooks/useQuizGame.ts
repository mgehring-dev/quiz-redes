import { useCallback, useMemo, useReducer } from "react";

import { usePostAnswer } from "./useQuiz";
import { shuffle } from "../../../shared/utils/shuffle";
import { errorResponse } from "../../../shared/utils/errorResponse";
import { playClick, playCorrect, playFinish, playWrong } from "../../../shared/utils/sounds";
import type { IAnswerResult, IQuestion } from "../../../shared/services/api/quiz";

export type TGameStatus = "answering" | "checking" | "answered" | "finished";

interface IQueueItem {
  id: number;
  /** a pergunta voltou porque o usuário errou antes */
  revisao: boolean;
}

/** como a pergunta foi mostrada da última vez (para a revisão vir diferente) */
interface ILastView {
  order: string[];
  corretas: string[];
}

interface IGameState {
  queue: IQueueItem[];
  /** ids das opções da pergunta atual, embaralhados */
  order: string[];
  /** unica: [id] · multipla: marcados · ordenar: sequência montada */
  selected: string[];
  result: IAnswerResult | null;
  status: TGameStatus;
  error: string | null;
  xp: number;
  streak: number;
  bestStreak: number;
  hits: number;
  misses: number;
  mastered: number[];
  lastViews: Record<number, ILastView>;
  /** muda a cada troca de pergunta, para reiniciar animações */
  turn: number;
}

type TAction =
  | { type: "pick"; optionId: string }
  | { type: "unplace"; index: number }
  | { type: "checking" }
  | { type: "checked"; result: IAnswerResult }
  | { type: "failed"; error: string }
  | { type: "next" }
  | { type: "restart" };

const positions = (order: string[], ids: string[]) => ids.map((id) => order.indexOf(id)).sort((a, b) => a - b).join(",");

/**
 * Embaralha as opções garantindo que:
 * - nunca fiquem na ordem original do cadastro;
 * - na revisão, as corretas mudem de posição em relação à vez anterior.
 */
function freshOrder(q: IQuestion, last?: ILastView): string[] {
  const ids = q.opcoes.map((o) => o.id);
  const original = ids.join(",");
  let best = shuffle(ids);
  for (let i = 0; i < 40; i++) {
    const candidate = i === 0 ? best : shuffle(ids);
    const differsFromOriginal = candidate.join(",") !== original;
    const differsFromLast =
      !last ||
      (candidate.join(",") !== last.order.join(",") &&
        (q.tipo === "ordenar" || positions(candidate, last.corretas) !== positions(last.order, last.corretas)));
    if (differsFromOriginal && differsFromLast) return candidate;
    best = candidate;
  }
  return best;
}

function start(questions: IQuestion[]): IGameState {
  let queue = shuffle(questions.map((q) => ({ id: q.id, revisao: false })));
  // só em desenvolvimento: ?pergunta=ID começa por essa pergunta (útil para testar)
  const forced = import.meta.env.DEV ? Number(new URLSearchParams(window.location.search).get("pergunta")) : NaN;
  if (forced) queue = [...queue.filter((i) => i.id === forced), ...queue.filter((i) => i.id !== forced)];
  const first = questions.find((q) => q.id === queue[0]?.id);
  return {
    queue,
    order: first ? freshOrder(first) : [],
    selected: [],
    result: null,
    status: queue.length ? "answering" : "finished",
    error: null,
    xp: 0,
    streak: 0,
    bestStreak: 0,
    hits: 0,
    misses: 0,
    mastered: [],
    lastViews: {},
    turn: 0,
  };
}

function reducer(questions: IQuestion[]) {
  const byId = new Map(questions.map((q) => [q.id, q]));

  return (s: IGameState, a: TAction): IGameState => {
    const current = byId.get(s.queue[0]?.id);

    switch (a.type) {
      case "pick": {
        if (s.status !== "answering" || !current) return s;
        let selected = s.selected;
        if (current.tipo === "unica") selected = [a.optionId];
        else if (current.tipo === "multipla")
          selected = s.selected.includes(a.optionId) ? s.selected.filter((id) => id !== a.optionId) : [...s.selected, a.optionId];
        else if (!s.selected.includes(a.optionId) && s.selected.length < (current.qtdItens ?? Infinity))
          selected = [...s.selected, a.optionId];
        return { ...s, selected, error: null };
      }

      case "unplace":
        if (s.status !== "answering") return s;
        return { ...s, selected: s.selected.filter((_, i) => i !== a.index), error: null };

      case "checking":
        return { ...s, status: "checking", error: null };

      case "failed":
        return { ...s, status: "answering", error: a.error };

      case "checked": {
        const { result } = a;
        const streak = result.correta ? s.streak + 1 : 0;
        const id = s.queue[0].id;
        return {
          ...s,
          status: "answered",
          result,
          xp: s.xp + result.xpGanho,
          hits: s.hits + (result.correta ? 1 : 0),
          misses: s.misses + (result.correta ? 0 : 1),
          streak,
          bestStreak: Math.max(s.bestStreak, streak),
          mastered: result.correta ? [...s.mastered, id] : s.mastered,
          lastViews: { ...s.lastViews, [id]: { order: s.order, corretas: result.idOpcoesCorretas } },
        };
      }

      case "next": {
        if (s.status !== "answered" || !s.result) return s;
        const [head, ...rest] = s.queue;
        // Errou: a pergunta volta logo depois da próxima
        const queue = s.result.correta ? rest : [...rest.slice(0, 1), { id: head.id, revisao: true }, ...rest.slice(1)];

        if (queue.length === 0) return { ...s, queue, status: "finished", turn: s.turn + 1 };

        const nextQuestion = byId.get(queue[0].id)!;
        return {
          ...s,
          queue,
          order: freshOrder(nextQuestion, s.lastViews[nextQuestion.id]),
          selected: [],
          result: null,
          status: "answering",
          turn: s.turn + 1,
        };
      }

      case "restart":
        return start(questions);
    }
  };
}

export function useQuizGame(questions: IQuestion[]) {
  const reduce = useMemo(() => reducer(questions), [questions]);
  const [state, dispatch] = useReducer(reduce, questions, start);
  const postAnswer = usePostAnswer();

  const current = useMemo(
    () => questions.find((q) => q.id === state.queue[0]?.id) ?? null,
    [questions, state.queue],
  );

  const canCheck =
    !!current &&
    state.status === "answering" &&
    (current.tipo === "ordenar" ? state.selected.length === current.qtdItens : state.selected.length > 0);

  const pick = useCallback(
    (optionId: string) => {
      if (state.status !== "answering") return;
      playClick();
      dispatch({ type: "pick", optionId });
    },
    [state.status],
  );

  const unplace = useCallback(
    (index: number) => {
      if (state.status !== "answering") return;
      playClick();
      dispatch({ type: "unplace", index });
    },
    [state.status],
  );

  const check = useCallback(() => {
    if (!canCheck || !current) return;
    dispatch({ type: "checking" });
    postAnswer.mutate(
      { idPergunta: current.id, idOpcoes: state.selected },
      {
        onSuccess: (result) => {
          if (result.correta) playCorrect();
          else playWrong();
          dispatch({ type: "checked", result });
        },
        onError: (error) => dispatch({ type: "failed", error: errorResponse(error) }),
      },
    );
  }, [canCheck, current, state.selected, postAnswer]);

  const next = useCallback(() => {
    if (state.status !== "answered") return;
    if (state.queue.length === 1 && state.result?.correta) playFinish();
    dispatch({ type: "next" });
  }, [state.status, state.queue.length, state.result]);

  const restart = useCallback(() => dispatch({ type: "restart" }), []);

  return {
    state,
    current,
    isRevisao: state.queue[0]?.revisao ?? false,
    total: questions.length,
    canCheck,
    pick,
    unplace,
    check,
    next,
    restart,
  };
}
