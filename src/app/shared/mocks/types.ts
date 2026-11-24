import type { TTipoPergunta } from "../services/api/quiz";

/** Formato da pergunta como fica "no banco" do mock (inclui gabarito) */
export interface IQuestionSeed {
  id: number;
  /** padrão: "unica" */
  tipo?: TTipoPergunta;
  topic: string;
  prompt: string;
  options: string[];
  /**
   * - unica: índice da opção correta
   * - multipla: índices de todas as corretas (qualquer ordem)
   * - ordenar: índices na sequência correta (opções fora da lista são distratores)
   */
  answer: number | number[];
  explanation: string;
}
