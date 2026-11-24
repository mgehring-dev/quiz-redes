import { useMutation, useQuery, useQueryClient } from "react-query";

import { IAnswerResult, IPostAnswer, IProfile, QuizService } from "../../../shared/services/api/quiz";

export const quizKeys = {
  questions: ["getQuizQuestions"] as const,
  profile: ["getQuizProfile"] as const,
  explanation: (idPergunta: number) => ["getQuizExplanation", idPergunta] as const,
};

export const useGetQuestions = () => {
  return useQuery(quizKeys.questions, () => QuizService.getQuestions(), {
    staleTime: Infinity,
  });
};

/** Explicação detalhada; buscada assim que a pergunta é respondida (o modal abre na hora) */
export const useGetExplanation = (idPergunta: number, enabled: boolean) => {
  return useQuery(quizKeys.explanation(idPergunta), () => QuizService.getExplanation(idPergunta), {
    enabled,
    staleTime: Infinity,
    keepPreviousData: false,
  });
};

export const useGetProfile = () => {
  return useQuery(quizKeys.profile, () => QuizService.getProfile());
};

export const usePostAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation<IAnswerResult, string, IPostAnswer>(
    (payload) => QuizService.postAnswer(payload),
    {
      onSuccess: (result) => {
        // atualiza o cache do perfil com o XP que o servidor devolveu
        queryClient.setQueryData<IProfile | undefined>(quizKeys.profile, (old) =>
          old ? { ...old, xpTotal: result.xpTotal } : old,
        );
        queryClient.invalidateQueries(quizKeys.profile);
      },
    },
  );
};

export const useResetProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<void, string>(() => QuizService.deleteProfile(), {
    onSuccess: () => queryClient.invalidateQueries(quizKeys.profile),
  });
};
