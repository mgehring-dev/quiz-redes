/// <reference types="vite/client" />

/** Versão do build, injetada pelo vite.config.ts */
declare const __APP_VERSION__: {
  commit: string;
  branch: string;
  mensagem: string;
  ambiente: string;
  geradoEm: string;
};
