import type { TDificuldade, TTipoPergunta } from "../services/api/quiz";

/** Formato da pergunta como fica "no banco" do mock (inclui gabarito) */
export interface IQuestionSeed {
  id: number;
  /** padrão: "unica" */
  tipo?: TTipoPergunta;
  /** padrão: definido em DIFICULDADE_PADRAO (db.ts) */
  dificuldade?: TDificuldade;
  topic: string;
  /** em "lacuna", cada "___" é uma lacuna */
  prompt: string;
  options: string[];
  /** só em "associar": itens da esquerda */
  rotulos?: string[];
  /**
   * - unica / verdadeiro_falso: índice da opção correta
   * - multipla: índices de todas as corretas (qualquer ordem)
   * - ordenar / lacuna / associar: índices na sequência correta
   *   (lacuna: na ordem das lacunas; associar: na ordem dos rótulos).
   *   Opções fora da lista são distratores.
   */
  answer: number | number[];
  explanation: string;
}
