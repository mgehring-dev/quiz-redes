import { createContext, ReactNode, useContext, useEffect, useMemo } from "react";

import {
  useGetCurrentUser,
  useGetPreferences,
  useGetSettings,
  useUpdatePreferences,
  useUpdateSettings,
} from "../hooks/useSettings";
import { DEFAULT_SETTINGS, IAppearance, ISettings, TMenuVisivelPara } from "../services/api/settings";
import { setSoundStyle } from "../utils/sounds";

/** Cópia local da última aparência, só para a tela abrir sem "piscar" antes da API responder */
const UI_CACHE_KEY = "quiz-redes:ui";

function readCache(): ISettings {
  try {
    const raw = localStorage.getItem(UI_CACHE_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

interface ISettingsContext {
  /** aparência em uso (padrão do site + preferência pessoal) */
  appearance: IAppearance;
  /** configurações globais do site */
  site: ISettings;
  isAdmin: boolean;
  /** o usuário atual pode ver o menu? */
  canSeeMenu: boolean;
  /** usuário comum tem preferência própria diferente do padrão? */
  hasPersonalPreference: boolean;
  /** admin muda o padrão do site; usuário comum muda só a própria preferência */
  updateAppearance: (patch: Partial<IAppearance>) => void;
  /** somente admin */
  setMenuVisibility: (value: TMenuVisivelPara) => void;
  /** usuário comum volta a seguir o padrão do site */
  resetPreferences: () => void;
  isSaving: boolean;
  error: string | null;
}

const SettingsContext = createContext<ISettingsContext | null>(null);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const cached = useMemo(readCache, []);
  const { data: user } = useGetCurrentUser();
  const { data: siteData } = useGetSettings(cached);
  const { data: preferences } = useGetPreferences();
  const updateSettings = useUpdateSettings();
  const updatePreferences = useUpdatePreferences();

  const site = siteData ?? cached;
  const isAdmin = !!user?.admin;
  const canSeeMenu = isAdmin || (!!user && site.menuVisivelPara === "todos");
  // preferência pessoal só vale para usuário comum e se o admin liberou o menu
  const usePersonal = !isAdmin && site.menuVisivelPara === "todos";
  const appearance: IAppearance = {
    tema: (usePersonal && preferences?.tema) || site.tema,
    estilo: (usePersonal && preferences?.estilo) || site.estilo,
  };

  // aplica tema, estilo e pacote de sons em todo o sistema
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = appearance.tema;
    root.dataset.style = appearance.estilo;
    root.style.colorScheme = appearance.tema;
    setSoundStyle(appearance.estilo);
    try {
      localStorage.setItem(UI_CACHE_KEY, JSON.stringify({ ...site, ...appearance }));
    } catch {
      /* sem cache local */
    }
  }, [appearance.tema, appearance.estilo, site.menuVisivelPara]);

  const error = (isAdmin ? updateSettings.error : updatePreferences.error) ?? null;

  const value: ISettingsContext = {
    appearance,
    site,
    isAdmin,
    canSeeMenu,
    hasPersonalPreference: usePersonal && !!(preferences?.tema || preferences?.estilo),
    updateAppearance: (patch) => (isAdmin ? updateSettings.mutate(patch) : updatePreferences.mutate(patch)),
    setMenuVisibility: (menuVisivelPara) => isAdmin && updateSettings.mutate({ menuVisivelPara }),
    resetPreferences: () => updatePreferences.mutate({ tema: null, estilo: null }),
    isSaving: updateSettings.isLoading || updatePreferences.isLoading,
    error,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings precisa estar dentro de <SettingsProvider>");
  return ctx;
};
