import { questions as unicas } from "./data/questions";
import { questionsListas } from "./data/questionsListas";
import { explanations } from "./data/explanations";
import { explanationsNovas } from "./data/explanationsNovas";
import { questionsNovas } from "./data/questionsNovas";
import { isSequencia, type IExplanation, type IProfile, type IQuestion, type TDificuldade } from "../services/api/quiz";
import type { IQuestionSeed } from "./types";

/** nível das perguntas que não declaram `dificuldade` no cadastro */
const DIFICEIS_PADRAO = new Set([5, 8, 10, 12, 13, 15, 16, 18, 19, 20, 26, 28, 30, 31, 34, 35, 36]);
export const nivel = (q: IQuestionSeed): TDificuldade => q.dificuldade ?? (DIFICEIS_PADRAO.has(q.id) ? "dificil" : "facil");

const questions: IQuestionSeed[] = [...unicas, ...questionsListas, ...questionsNovas];

/** gabarito sempre como lista de índices */
export const answerIndexes = (q: IQuestionSeed) => (Array.isArray(q.answer) ? q.answer : [q.answer]);
import { DEFAULT_SETTINGS, ISettings } from "../services/api/settings";
import type { ICurrentUser, IPreferences } from "../services/api/user";

/** "Banco" do mock: perguntas em memória; perfil e configurações no localStorage */

const PROFILE_KEY = "quiz-redes:perfil";
const SETTINGS_KEY = "quiz-redes:configuracoes";
const PREFS_KEY = "quiz-redes:preferencias";
const ADMIN_KEY = "quiz-redes:admin";
const EMPTY_PROFILE: IProfile = { xpTotal: 0, respostas: 0, acertos: 0 };

export const optionId = (questionId: number, index: number) => `p${questionId}-o${index}`;

export const db = {
  listQuestions(): IQuestion[] {
    return questions.map((q) => {
      const tipo = q.tipo ?? "unica";
      return {
        id: q.id,
        tipo,
        dificuldade: nivel(q),
        topico: q.topic,
        enunciado: q.prompt,
        opcoes: q.options.map((texto, i) => ({ id: optionId(q.id, i), texto })),
        // nos tipos de sequência o aluno precisa saber quantos blocos montar (não revela quais)
        ...(isSequencia(tipo) ? { qtdItens: answerIndexes(q).length } : {}),
        ...(q.rotulos ? { rotulos: q.rotulos } : {}),
      };
    });
  },

  findQuestion(id: number) {
    return questions.find((q) => q.id === id);
  },

  getExplanation(id: number): IExplanation | null {
    const q = db.findQuestion(id);
    const e = explanations[id] ?? explanationsNovas[id];
    if (!q || !e) return null;
    const corretas = answerIndexes(q);
    let alternativas = q.options.map((texto, i) => ({
      idOpcao: optionId(q.id, i),
      texto,
      correta: corretas.includes(i),
      motivo: e.motivos[i] ?? "",
      ...(isSequencia(q.tipo ?? "unica") && corretas.includes(i) ? { posicao: corretas.indexOf(i) + 1 } : {}),
    }));
    // nos tipos de sequência: na ordem certa e os blocos que sobram no fim
    if (isSequencia(q.tipo ?? "unica")) alternativas = [...alternativas].sort((a, b) => (a.posicao ?? 99) - (b.posicao ?? 99));
    return { idPergunta: q.id, porQue: e.porQue, conceito: e.conceito, alternativas, dica: e.dica };
  },

  getProfile(): IProfile {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      return raw ? { ...EMPTY_PROFILE, ...JSON.parse(raw) } : { ...EMPTY_PROFILE };
    } catch {
      return { ...EMPTY_PROFILE };
    }
  },

  saveProfile(profile: IProfile) {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      /* armazenamento indisponível: mantém só em memória */
    }
    return profile;
  },

  resetProfile() {
    return db.saveProfile({ ...EMPTY_PROFILE });
  },

  getSettings(): ISettings {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },

  saveSettings(settings: ISettings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* armazenamento indisponível */
    }
    return settings;
  },

  /**
   * Usuário logado simulado, até existir login de verdade.
   * É admin somente quem está com `?admin` no endereço — nada fica lembrado,
   * então abrir o link normal é sempre como visitante.
   * Em desenvolvimento (localhost) é admin por padrão; `?admin=0` simula visitante.
   */
  currentUser(): ICurrentUser {
    try {
      localStorage.removeItem(ADMIN_KEY); // limpa a marca antiga de versões anteriores
    } catch {
      /* sem armazenamento */
    }
    const param = new URLSearchParams(window.location.search).get("admin");
    const admin = param !== null ? param !== "0" && param !== "false" : import.meta.env.DEV;
    return admin ? { id: "u-admin", nome: "Admin", admin: true } : { id: "u-visitante", nome: "Visitante", admin: false };
  },

  getPreferences(): IPreferences {
    try {
      return JSON.parse(localStorage.getItem(PREFS_KEY) || "{}");
    } catch {
      return {};
    }
  },

  savePreferences(prefs: IPreferences) {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      /* armazenamento indisponível */
    }
    return prefs;
  },
};
