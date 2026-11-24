import { Api } from "../axios-config/AxiosConfig";
import { errorResponse } from "../../../utils/errorResponse";

export type TTema = "dark" | "light";
export type TEstilo = "duolingo" | "miami";
export type TMenuVisivelPara = "admins" | "todos";

/** Configurações globais do site (definidas pelo admin) */
export interface ISettings {
  tema: TTema;
  estilo: TEstilo;
  /** quem enxerga o menu de configurações */
  menuVisivelPara: TMenuVisivelPara;
}

/** Aparência que pode ser personalizada por usuário */
export type IAppearance = Pick<ISettings, "tema" | "estilo">;

export const DEFAULT_SETTINGS: ISettings = { tema: "dark", estilo: "duolingo", menuVisivelPara: "admins" };

/** GET /admin/configuracoes — configurações globais do site */
const getSettings = async (): Promise<ISettings> => {
  try {
    const response = await Api.get("/admin/configuracoes");
    return response.data;
  } catch (error) {
    return Promise.reject(errorResponse(error));
  }
};

/** PUT /admin/configuracoes — atualiza parte das configurações (somente admin) */
const putSettings = async (payload: Partial<ISettings>): Promise<ISettings> => {
  try {
    const response = await Api.put("/admin/configuracoes", payload);
    return response.data;
  } catch (error) {
    return Promise.reject(errorResponse(error));
  }
};

export const SettingsService = {
  getSettings,
  putSettings,
};
