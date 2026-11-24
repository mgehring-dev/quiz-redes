import { execSync } from "node:child_process";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Versão do build: commit, branch e data.
 * Na Vercel vem das variáveis do deploy; localmente, do próprio git.
 */
function readVersion() {
  const git = (cmd: string) => {
    try {
      return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
    } catch {
      return "";
    }
  };
  const commit = process.env.VERCEL_GIT_COMMIT_SHA || git("git rev-parse HEAD") || "desconhecido";
  return {
    commit: commit.slice(0, 7),
    branch: process.env.VERCEL_GIT_COMMIT_REF || git("git rev-parse --abbrev-ref HEAD") || "",
    mensagem: (process.env.VERCEL_GIT_COMMIT_MESSAGE || git("git log -1 --format=%s")).split("\n")[0],
    ambiente: process.env.VERCEL_ENV || "local",
    geradoEm: new Date().toISOString(),
  };
}

const version = readVersion();

/** Publica /version.json junto com o site, para conferir qual commit está no ar */
function versionFile(): Plugin {
  return {
    name: "version-file",
    apply: "build",
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "version.json", source: JSON.stringify(version, null, 2) });
    },
  };
}

export default defineConfig({
  base: "/",
  envPrefix: "REACT_APP_",
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  server: {
    port: 3010,
    strictPort: true,
  },
  plugins: [react(), versionFile()],
});
