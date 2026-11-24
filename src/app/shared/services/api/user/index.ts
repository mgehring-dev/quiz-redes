import { Api } from "../axios-config/AxiosConfig";
import { errorResponse } from "../../../utils/errorResponse";
import type { IAppearance } from "../settings";

export interface ICurrentUser {
  id: string;
  nome: string;
  admin: boolean;
}

/** Preferência pessoal de aparência; campos vazios = segue o padrão do site */
export type IPreferences = { [K in keyof IAppearance]?: IAppearance[K] | null };

/** GET /usuarios/me — usuário logado (define se é admin) */
const getCurrentUser = async (): Promise<ICurrentUser> => {
  try {
    const response = await Api.get("/usuarios/me");
    return response.data;
  } catch (error) {
    return Promise.reject(errorResponse(error));
  }
};

/** GET /usuarios/me/preferencias */
const getPreferences = async (): Promise<IPreferences> => {
  try {
    const response = await Api.get("/usuarios/me/preferencias");
    return response.data;
  } catch (error) {
    return Promise.reject(errorResponse(error));
  }
};

/** PUT /usuarios/me/preferencias */
const putPreferences = async (payload: IPreferences): Promise<IPreferences> => {
  try {
    const response = await Api.put("/usuarios/me/preferencias", payload);
    return response.data;
  } catch (error) {
    return Promise.reject(errorResponse(error));
  }
};

export const UserService = {
  getCurrentUser,
  getPreferences,
  putPreferences,
};
