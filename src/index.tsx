import React from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app/App";
import "./app/shared/styles/global.css";
import "./app/shared/styles/responsive.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
