import React from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app/App";
import "./app/shared/styles/global.css";
import "./app/shared/styles/responsive.css";

// versão em produção visível no console (F12)
console.info(`Quiz Redes · versão ${__APP_VERSION__.commit} (${__APP_VERSION__.ambiente}) · ${__APP_VERSION__.geradoEm}`);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
