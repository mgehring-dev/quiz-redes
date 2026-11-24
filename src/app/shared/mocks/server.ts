import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

import { answerIndexes, db, optionId } from "./db";
import { Environment } from "../environment";
import type { IAnswerResult, IPostAnswer } from "../services/api/quiz";
import type { ISettings, TEstilo, TMenuVisivelPara, TTema } from "../services/api/settings";
import type { IPreferences } from "../services/api/user";

/**
 * Servidor mock plugado como adapter do axios.
 * Simula as rotas do backend com latência, status HTTP e corpo JSON.
 *
 *   GET    /quiz/perguntas
 *   GET    /quiz/perguntas/:id/explicacao
 *   POST   /quiz/respostas   { idPergunta, idOpcoes[] }
 *   GET    /quiz/perfil
 *   DELETE /quiz/perfil
 *   GET    /usuarios/me
 *   GET    /usuarios/me/preferencias
 *   PUT    /usuarios/me/preferencias  { tema?, estilo? }   (se o menu estiver liberado)
 *   GET    /admin/configuracoes
 *   PUT    /admin/configuracoes  { tema?, estilo?, menuVisivelPara? }   (somente admin)
 */

type Handler = (body: any) => { status: number; data: unknown };

const TEMAS: TTema[] = ["dark", "light"];
const ESTILOS: TEstilo[] = ["duolingo", "miami"];
const VISIBILIDADES: TMenuVisivelPara[] = ["admins", "todos"];

function validateAppearance(body: Partial<ISettings> | IPreferences) {
  if (body?.tema != null && !TEMAS.includes(body.tema)) {
    return { status: 422, data: { mensagem: `Tema inválido. Use: ${TEMAS.join(", ")}.` } };
  }
  if (body?.estilo != null && !ESTILOS.includes(body.estilo)) {
    return { status: 422, data: { mensagem: `Estilo inválido. Use: ${ESTILOS.join(", ")}.` } };
  }
  return null;
}

const routes: Record<string, Handler> = {
  "GET /usuarios/me": () => ({ status: 200, data: db.currentUser() }),

  "GET /usuarios/me/preferencias": () => ({ status: 200, data: db.getPreferences() }),

  "PUT /usuarios/me/preferencias": (body: IPreferences) => {
    const user = db.currentUser();
    if (!user.admin && db.getSettings().menuVisivelPara !== "todos") {
      return { status: 403, data: { mensagem: "Personalização desativada pelo administrador." } };
    }
    const invalid = validateAppearance(body);
    if (invalid) return invalid;
    const merged = { ...db.getPreferences(), ...body };
    const clean = Object.fromEntries(Object.entries(merged).filter(([, v]) => v != null)) as IPreferences;
    return { status: 200, data: db.savePreferences(clean) };
  },

  "GET /admin/configuracoes": () => ({ status: 200, data: db.getSettings() }),

  "PUT /admin/configuracoes": (body: Partial<ISettings>) => {
    if (!db.currentUser().admin) return { status: 403, data: { mensagem: "Apenas administradores podem alterar configurações." } };
    const invalid = validateAppearance(body);
    if (invalid) return invalid;
    if (body?.menuVisivelPara !== undefined && !VISIBILIDADES.includes(body.menuVisivelPara)) {
      return { status: 422, data: { mensagem: `Visibilidade inválida. Use: ${VISIBILIDADES.join(", ")}.` } };
    }
    const next = { ...db.getSettings(), ...body };
    return { status: 200, data: db.saveSettings(next) };
  },

  "GET /quiz/perguntas": () => ({ status: 200, data: db.listQuestions() }),

  "POST /quiz/respostas": (body: IPostAnswer) => {
    const question = db.findQuestion(body?.idPergunta);
    if (!question) return { status: 404, data: { mensagem: "Pergunta não encontrada." } };

    const validIds = new Set(question.options.map((_, i) => optionId(question.id, i)));
    const enviados = Array.isArray(body?.idOpcoes) ? body.idOpcoes : [];
    if (enviados.length === 0 || enviados.some((id) => !validIds.has(id))) {
      return { status: 422, data: { mensagem: "Opção inválida para esta pergunta." } };
    }

    const tipo = question.tipo ?? "unica";
    const idOpcoesCorretas = answerIndexes(question).map((i) => optionId(question.id, i));
    let correta: boolean;
    if (tipo === "ordenar") {
      // sequência exata
      correta = enviados.length === idOpcoesCorretas.length && enviados.every((id, i) => id === idOpcoesCorretas[i]);
    } else {
      // mesmo conjunto, em qualquer ordem
      const set = new Set(enviados);
      correta = set.size === idOpcoesCorretas.length && idOpcoesCorretas.every((id) => set.has(id));
    }
    const xpGanho = correta ? Environment.XP_POR_ACERTO : 0;

    const profile = db.getProfile();
    const saved = db.saveProfile({
      xpTotal: profile.xpTotal + xpGanho,
      respostas: profile.respostas + 1,
      acertos: profile.acertos + (correta ? 1 : 0),
    });

    const result: IAnswerResult = {
      correta,
      idOpcoesCorretas,
      explicacao: question.explanation,
      xpGanho,
      xpTotal: saved.xpTotal,
    };
    return { status: 200, data: result };
  },

  "GET /quiz/perfil": () => ({ status: 200, data: db.getProfile() }),

  "DELETE /quiz/perfil": () => {
    db.resetProfile();
    return { status: 204, data: null };
  },
};

/** rotas com parâmetro na URL */
const paramRoutes: { method: string; pattern: RegExp; handler: (params: string[], body: any) => { status: number; data: unknown } }[] = [
  {
    method: "GET",
    pattern: /^\/quiz\/perguntas\/(\d+)\/explicacao$/,
    handler: ([id]) => {
      const explanation = db.getExplanation(Number(id));
      return explanation
        ? { status: 200, data: explanation }
        : { status: 404, data: { mensagem: "Explicação não encontrada para esta pergunta." } };
    },
  },
];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function mockAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  // pequena variação na latência para parecer rede de verdade
  await wait(Environment.MOCK_LATENCY_MS * (0.6 + Math.random() * 0.8));

  const method = (config.method ?? "get").toUpperCase();
  const path = (config.url ?? "").split("?")[0];
  const body = typeof config.data === "string" && config.data ? JSON.parse(config.data) : config.data;

  const handler = routes[`${method} ${path}`];
  const param = paramRoutes.find((r) => r.method === method && r.pattern.test(path));
  const { status, data } = handler
    ? handler(body)
    : param
      ? param.handler(path.match(param.pattern)!.slice(1), body)
      : { status: 404, data: { mensagem: `Rota ${method} ${path} não existe no mock.` } };

  const response: AxiosResponse = {
    data,
    status,
    statusText: String(status),
    headers: { "content-type": "application/json" },
    config,
    request: {},
  };

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug(`[mock] ${method} ${path} → ${status}`, body ?? "", data);
  }

  if (status >= 400) {
    throw new AxiosError(`Request failed with status code ${status}`, AxiosError.ERR_BAD_REQUEST, config, {}, response);
  }
  return response;
}
