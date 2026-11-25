// Posta no Microsoft Teams o resultado de um deploy da Vercel.
// Chamado pela Action .github/workflows/notify-teams.yml (evento deployment_status).
// O webhook vem do secret TEAMS_WEBHOOK_URL (Teams → Workflows → "Send webhook alerts to a chat/channel").

const {
  TEAMS_WEBHOOK_URL,
  STATE, // success | failure | error
  REF, // branch do deploy
  SHA,
  ENV_NAME, // ex.: "Preview – quiz-redes" / "Production – quiz-redes"
  TARGET_URL, // URL única do deploy na Vercel
  LOG_URL, // página do deploy na Vercel (logs)
  COMMIT_MESSAGE,
} = process.env;

if (!TEAMS_WEBHOOK_URL) {
  console.log("::warning::Secret TEAMS_WEBHOOK_URL não configurado — notificação no Teams ignorada.");
  process.exit(0);
}

// endereço fixo de cada ambiente (o link único da prévia é protegido e muda a cada deploy)
const FIXED_URLS = {
  main: "https://quiz-redes-six.vercel.app",
  dev: "https://quiz-redes-dev.vercel.app",
};

const ok = STATE === "success";
const isProd = /production/i.test(ENV_NAME ?? "") || REF === "main";
const ambiente = isProd ? "Produção" : REF === "dev" ? "Dev" : `Prévia (${REF})`;
const link = FIXED_URLS[REF] ?? TARGET_URL;
const shortSha = (SHA ?? "").slice(0, 7);
const titulo = (COMMIT_MESSAGE ?? "").split("\n")[0] || "(sem mensagem)";

// cartão enxuto: uma linha de título, uma linha discreta com o commit e um botão
const card = {
  $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
  type: "AdaptiveCard",
  version: "1.4",
  body: [
    {
      type: "TextBlock",
      weight: "Bolder",
      text: ok ? `✅ Quiz Redes · ${ambiente} atualizado` : `❌ Quiz Redes · falha no deploy de ${ambiente}`,
      wrap: true,
    },
    {
      type: "TextBlock",
      text: `${shortSha} · ${titulo}`,
      isSubtle: true,
      size: "Small",
      spacing: "None",
      wrap: true,
    },
  ],
  actions: [ok ? { type: "Action.OpenUrl", title: "Abrir", url: link } : { type: "Action.OpenUrl", title: "Ver logs", url: LOG_URL ?? link }],
};

const payload = {
  type: "message",
  attachments: [{ contentType: "application/vnd.microsoft.card.adaptive", contentUrl: null, content: card }],
};

const res = await fetch(TEAMS_WEBHOOK_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

if (!res.ok) {
  console.log(`::error::Teams respondeu HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  process.exit(1);
}
console.log(`Notificação enviada ao Teams (${ambiente}, ${shortSha}, HTTP ${res.status}).`);
