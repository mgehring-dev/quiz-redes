/**
 * Contém variáveis de ambiente para mais fácil utilização
 */
export const Environment = {
  /**
   * Url base da API do quiz
   */
  URL_BASE: import.meta.env.REACT_APP_API_URL ?? "http://localhost:5000/api",
  /**
   * Quando `true`, as requisições são respondidas pelo servidor mock (sem backend)
   */
  USE_MOCK: (import.meta.env.REACT_APP_USE_MOCK ?? "true") === "true",
  /**
   * Latência simulada (ms) das respostas do mock
   */
  MOCK_LATENCY_MS: Number(import.meta.env.REACT_APP_MOCK_LATENCY_MS ?? 350),
  /**
   * XP ganho a cada resposta correta
   */
  XP_POR_ACERTO: 10,
};
