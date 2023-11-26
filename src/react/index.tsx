import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import RouterDemo from "./router";

const rootEl = document.getElementById("root");
const root = createRoot(rootEl);
root.render(
  <StrictMode>
    <RouterDemo/>
  </StrictMode>,
);
