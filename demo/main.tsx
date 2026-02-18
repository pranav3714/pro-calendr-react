import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./demo.css";
import "../packages/core/src/styles/calendar.css";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
