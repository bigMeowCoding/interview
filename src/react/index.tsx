import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import RouterDemo from "./router";
import HashRouterDemo from "./router/hash-index";

const rootEl = document.getElementById("root");
const root = createRoot(rootEl);
root.render(
  <StrictMode>
    {/*<RouterDemo/>*/}
      <HashRouterDemo/>
  </StrictMode>,
);
