import axios from "axios";

import { Environment } from "../../../environment";
import { mockAdapter } from "../../../mocks/server";

/**
 * Instância única de HTTP da aplicação.
 *
 * Com `REACT_APP_USE_MOCK=true` o adapter do axios é trocado pelo servidor mock,
 * que responde às mesmas rotas que o backend real terá. Os services não mudam.
 */
const Api = axios.create({
  baseURL: Environment.URL_BASE,
  headers: { "Content-Type": "application/json" },
  ...(Environment.USE_MOCK ? { adapter: mockAdapter } : {}),
});

export { Api };
