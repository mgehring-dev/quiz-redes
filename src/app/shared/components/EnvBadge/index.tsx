/**
 * Faixa discreta no topo indicando o ambiente.
 * - produção (main): não aparece
 * - dev (branch dev): "DEV"
 * - outras prévias: "PRÉVIA · nome-da-branch"
 * - máquina local: "LOCAL"
 */
export const EnvBadge = () => {
  const { ambiente, branch, commit } = __APP_VERSION__;
  if (ambiente === "production") return null;

  const label = ambiente === "local" ? "Local" : branch === "dev" ? "Dev" : `Prévia · ${branch}`;
  const tone = ambiente === "local" ? "local" : branch === "dev" ? "dev" : "preview";

  return (
    <div className={`env-badge ${tone}`} role="note" aria-label={`Ambiente: ${label}`}>
      <span className="env-stripe" />
      <span className="env-tag" title={`commit ${commit}`}>
        {label}
      </span>
    </div>
  );
};
