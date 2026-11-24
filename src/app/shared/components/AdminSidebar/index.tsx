import { useEffect, useState } from "react";

import { useSettings } from "../../contexts/Settings";
import { playCorrect, setSoundStyle } from "../../utils/sounds";
import type { TEstilo, TMenuVisivelPara, TTema } from "../../services/api/settings";

const TEMAS: { value: TTema; label: string; icon: JSX.Element }[] = [
  { value: "dark", label: "Escuro", icon: <MoonIcon /> },
  { value: "light", label: "Claro", icon: <SunIcon /> },
];

const ESTILOS: { value: TEstilo; label: string; hint: string; swatches: string[] }[] = [
  { value: "duolingo", label: "Duolingo", hint: "Verde e azul, botões 3D, sons suaves", swatches: ["#58cc02", "#1cb0f6", "#ffc800", "#ff4b4b"] },
  { value: "miami", label: "GTA 6 · Miami", hint: "Neon rosa e laranja, sons synthwave", swatches: ["#ff3e9a", "#ff8a3d", "#29e3ff", "#c07bff"] },
];

const VISIBILIDADES: { value: TMenuVisivelPara; label: string; hint: string; icon: JSX.Element }[] = [
  { value: "admins", label: "Somente administradores", hint: "Visitantes usam o padrão do site", icon: <ShieldIcon /> },
  { value: "todos", label: "Todos os usuários", hint: "Cada um escolhe tema e estilo só para si", icon: <UsersIcon /> },
];

/**
 * Menu lateral de configurações.
 * - Admin: altera o padrão do site e decide quem vê o menu.
 * - Demais usuários: só veem o menu se o admin liberar, e as escolhas valem só para eles.
 */
export const AdminSidebar = () => {
  const {
    appearance,
    site,
    isAdmin,
    canSeeMenu,
    hasPersonalPreference,
    updateAppearance,
    setMenuVisibility,
    resetPreferences,
    isSaving,
    error,
  } = useSettings();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("has-rail", canSeeMenu);
    if (!canSeeMenu) setOpen(false);
  }, [canSeeMenu]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!canSeeMenu) return null;

  const chooseStyle = (estilo: TEstilo) => {
    if (estilo === appearance.estilo) return;
    updateAppearance({ estilo });
    // prévia: toca o som de acerto do novo estilo
    setSoundStyle(estilo);
    playCorrect();
  };

  const tab = open ? 0 : -1;

  return (
    <>
      <nav className="rail" aria-label="Menu de configurações">
        <button
          className={`rail-btn ${open ? "active" : ""}`}
          onClick={() => setOpen((o) => !o)}
          title="Configurações"
          aria-expanded={open}
          aria-controls="settings-panel"
        >
          <GearIcon />
        </button>
        {isAdmin && (
          <span className="rail-badge" title="Você é administrador">
            ADM
          </span>
        )}
      </nav>

      {open && <div className="panel-backdrop" onClick={() => setOpen(false)} />}

      <aside
        id="settings-panel"
        className={`panel ${open ? "open" : ""}`}
        aria-hidden={!open}
        onKeyDown={(e) => {
          // atalhos do jogo (1–4, Enter) não devem disparar com o menu em foco
          e.stopPropagation();
          if (e.key === "Escape") setOpen(false);
        }}
      >
        <header className="panel-head">
          <div>
            <span className="panel-kicker">{isAdmin ? "Administração" : "Preferências"}</span>
            <h2>Configurações</h2>
          </div>
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Fechar" tabIndex={tab}>
            <CloseIcon />
          </button>
        </header>

        <div className="panel-body">
          <p className="panel-note">
            {isAdmin
              ? "Tema e estilo definem o padrão do site para todos os visitantes."
              : "Tema e estilo valem só para você."}
          </p>

          <section className="panel-section">
            <h3>Tema</h3>
            <div className="segmented" role="radiogroup" aria-label="Tema">
              {TEMAS.map((t) => (
                <button
                  key={t.value}
                  role="radio"
                  aria-checked={appearance.tema === t.value}
                  className={appearance.tema === t.value ? "on" : ""}
                  onClick={() => updateAppearance({ tema: t.value })}
                  tabIndex={tab}
                >
                  {t.icon}
                  {t.label}
                  {t.value === "dark" && <span className="default-tag">padrão</span>}
                </button>
              ))}
            </div>
          </section>

          <section className="panel-section">
            <h3>Estilo</h3>
            <div className="choice-list" role="radiogroup" aria-label="Estilo">
              {ESTILOS.map((s) => (
                <button
                  key={s.value}
                  role="radio"
                  aria-checked={appearance.estilo === s.value}
                  className={`choice-card ${appearance.estilo === s.value ? "on" : ""}`}
                  onClick={() => chooseStyle(s.value)}
                  tabIndex={tab}
                >
                  <span className="swatches">
                    {s.swatches.map((c) => (
                      <i key={c} style={{ background: c }} />
                    ))}
                  </span>
                  <span className="choice-text">
                    <strong>{s.label}</strong>
                    <small>{s.hint}</small>
                  </span>
                  <span className="radio-dot" />
                </button>
              ))}
            </div>
            {hasPersonalPreference && (
              <button className="link-btn" onClick={resetPreferences} tabIndex={tab}>
                Usar o padrão do site
              </button>
            )}
          </section>

          {isAdmin && (
            <section className="panel-section admin-only">
              <h3>
                Acesso <span className="lock-tag"><ShieldIcon /> só admin</span>
              </h3>
              <p className="section-hint">Quem pode ver este menu</p>
              <div className="choice-list" role="radiogroup" aria-label="Quem pode ver este menu">
                {VISIBILIDADES.map((v) => (
                  <button
                    key={v.value}
                    role="radio"
                    aria-checked={site.menuVisivelPara === v.value}
                    className={`choice-card ${site.menuVisivelPara === v.value ? "on" : ""}`}
                    onClick={() => setMenuVisibility(v.value)}
                    tabIndex={tab}
                  >
                    <span className="choice-icon">{v.icon}</span>
                    <span className="choice-text">
                      <strong>{v.label}</strong>
                      <small>{v.hint}</small>
                    </span>
                    <span className="radio-dot" />
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        <footer className="panel-foot">
          {error ? (
            <span className="err">{error}</span>
          ) : (
            <span>{isSaving ? "Salvando…" : isAdmin ? "Alterações salvas como padrão do site" : "Preferência salva"}</span>
          )}
          <span className="build-version" title={`${__APP_VERSION__.mensagem}\n${__APP_VERSION__.branch} · ${__APP_VERSION__.ambiente}`}>
            Versão {__APP_VERSION__.commit} · {new Date(__APP_VERSION__.geradoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
          </span>
        </footer>
      </aside>
    </>
  );
};

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path
        d="M12 15.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4zm7.4-2.2l1.6 1.3-1.8 3.1-2-.6a7 7 0 01-1.8 1l-.4 2.1h-3.6l-.4-2.1a7 7 0 01-1.8-1l-2 .6-1.8-3.1L4.6 13a7 7 0 010-2l-1.6-1.3 1.8-3.1 2 .6a7 7 0 011.8-1L9 4.1h3.6l.4 2.1a7 7 0 011.8 1l2-.6 1.8 3.1-1.6 1.3a7 7 0 010 2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" fill="currentColor" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
      <path d="M12 3l7 3v5.5c0 4.3-3 8-7 9.5-4-1.5-7-5.2-7-9.5V6l7-3z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <circle cx="9" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M3 19c.6-3.2 3-5 6-5s5.4 1.8 6 5M16 5.2a3 3 0 010 5.6M18 14.4c1.7.7 2.8 2.3 3 4.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
