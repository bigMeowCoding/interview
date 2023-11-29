import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import RouterDemo from "./router";
import HashRouterDemo from "./router/hash-index";
import ReduxDemo from "./redux";
import WaterPrint from "./canvas/water-print";

const rootEl = document.getElementById("root");
const root = createRoot(rootEl);
root.render(
  <StrictMode>
    {/*<RouterDemo/>*/}
    {/*  <HashRouterDemo/>*/}
    {/*<ReduxDemo />*/}
      <WaterPrint></WaterPrint>
  </StrictMode>,
);
