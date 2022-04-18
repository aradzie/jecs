import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/App";

const container = document.getElementById("root");
if (container != null) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} else {
  throw new Error();
}
