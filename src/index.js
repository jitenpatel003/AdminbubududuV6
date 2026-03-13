import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// ── PWA Service Worker ────────────────────────────────────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${process.env.PUBLIC_URL}/sw.js`)
      .then((reg) => console.log("SW registered:", reg.scope))
      .catch((err) => console.log("SW failed:", err));
  });
}
