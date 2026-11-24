import { useMutation, useQuery, useQueryClient } from "react-query";

import { ISettings, SettingsService } from "../services/api/settings";
import { IPreferences, UserService } from "../services/api/user";

export const settingsKeys = {
  settings: ["getSettings"] as const,
  currentUser: ["getCurrentUser"] as const,
  preferences: ["getPreferences"] as const,
};

export const useGetCurrentUser = () => {
  return useQuery(settingsKeys.currentUser, () => UserService.getCurrentUser(), {
    staleTime: Infinity,
  });
};

export const useGetSettings = (initialData?: ISettings) => {
  return useQuery(settingsKeys.settings, () => SettingsService.getSettings(), {
    staleTime: Infinity,
    placeholderData: initialData,
  });
};

export const useGetPreferences = () => {
  return useQuery(settingsKeys.preferences, () => UserService.getPreferences(), {
    staleTime: Infinity,
  });
};

/** Atualização otimista genérica: a tela muda na hora e volta se a API recusar */
function useOptimistic<T extends object>(key: readonly string[], fn: (payload: Partial<T>) => Promise<T>) {
  const queryClient = useQueryClient();

  return useMutation<T, string, Partial<T>, { previous?: T }>(fn, {
    onMutate: async (payload) => {
      await queryClient.cancelQueries(key);
      const previous = queryClient.getQueryData<T>(key);
      queryClient.setQueryData<T>(key, { ...(previous as T), ...payload });
      return { previous };
    },
    onError: (_error, _payload, context) => {
      queryClient.setQueryData(key, context?.previous);
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(key, saved);
    },
  });
}

/** Admin: altera o padrão do site */
export const useUpdateSettings = () =>
  useOptimistic<ISettings>(settingsKeys.settings, (payload) => SettingsService.putSettings(payload));

/** Usuário: altera a própria preferência */
export const useUpdatePreferences = () =>
  useOptimistic<IPreferences>(settingsKeys.preferences, (payload) => UserService.putPreferences(payload));
