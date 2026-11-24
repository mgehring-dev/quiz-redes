import { Api } from "../axios-config/AxiosConfig";
import { errorResponse } from "../../../utils/errorResponse";

export interface IQuestionOption {
  id: string;
  texto: string;
}

/**
 * - unica: uma alternativa correta
 * - multipla: marque todas as corretas (perguntas de "cite / dê exemplos")
 * - ordenar: monte a sequência na ordem certa (fluxos e handshakes)
 */
export type TTipoPergunta = "unica" | "multipla" | "ordenar";

export interface IQuestion {
  id: number;
  tipo: TTipoPergunta;
  topico: string;
  enunciado: string;
  opcoes: IQuestionOption[];
  /** só em "ordenar": quantos blocos compõem a resposta */
  qtdItens?: number;
}

export interface IPostAnswer {
  idPergunta: number;
  /** unica: 1 id · multipla: os marcados · ordenar: na ordem montada */
  idOpcoes: string[];
}

export interface IAnswerResult {
  correta: boolean;
  /** em "ordenar", já na sequência correta */
  idOpcoesCorretas: string[];
  explicacao: string;
  xpGanho: number;
  xpTotal: number;
}

export interface IProfile {
  xpTotal: number;
  respostas: number;
  acertos: number;
}

/** GET /quiz/perguntas — lista as perguntas (sem o gabarito) */
const getQuestions = async (): Promise<IQuestion[]> => {
  try {
    const response = await Api.get("/quiz/perguntas");
    return response.data;
  } catch (error) {
    return Promise.reject(errorResponse(error));
  }
};

/** POST /quiz/respostas — valida a resposta no servidor e credita o XP */
const postAnswer = async (payload: IPostAnswer): Promise<IAnswerResult> => {
  try {
    const response = await Api.post("/quiz/respostas", payload);
    return response.data;
  } catch (error) {
    return Promise.reject(errorResponse(error));
  }
};

/** GET /quiz/perfil — XP acumulado do usuário */
const getProfile = async (): Promise<IProfile> => {
  try {
    const response = await Api.get("/quiz/perfil");
    return response.data;
  } catch (error) {
    return Promise.reject(errorResponse(error));
  }
};

export interface IExplanationOption {
  idOpcao: string;
  texto: string;
  correta: boolean;
  /** só em "ordenar": posição (1, 2, 3…) na sequência correta */
  posicao?: number;
  motivo: string;
}

export interface IExplanation {
  idPergunta: number;
  /** por que a resposta é essa */
  porQue: string;
  /** o conceito por trás, em parágrafos curtos */
  conceito: string[];
  /** cada alternativa (em "ordenar": na ordem correta, distratores no fim) */
  alternativas: IExplanationOption[];
  dica: string;
}

/** GET /quiz/perguntas/:id/explicacao — explicação detalhada da pergunta */
const getExplanation = async (idPergunta: number): Promise<IExplanation> => {
  try {
    const response = await Api.get(`/quiz/perguntas/${idPergunta}/explicacao`);
    return response.data;
  } catch (error) {
    return Promise.reject(errorResponse(error));
  }
};

/** DELETE /quiz/perfil — zera o progresso */
const deleteProfile = async (): Promise<void> => {
  try {
    await Api.delete("/quiz/perfil");
  } catch (error) {
    return Promise.reject(errorResponse(error));
  }
};

export const QuizService = {
  getQuestions,
  postAnswer,
  getExplanation,
  getProfile,
  deleteProfile,
};
