import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import RouterDemo from "./router";
import HashRouterDemo from "./router/hash-index";
import ReduxDemo from "./redux";
import WaterPrint from "./canvas/water-print/water-print";
import ClipDemo from "./canvas/clip";
import Counter from "./counter";
import CounterDown from "./counter-down";

const rootEl = document.getElementById("root");
const root = createRoot(rootEl);
root.render(
  <>
    {/*<RouterDemo/>*/}
    {/*  <HashRouterDemo/>*/}
    {/*<ReduxDemo />*/}
      {/*<CounterDown/>*/}
    {/*  <WaterPrint/>*/}
      <ClipDemo/>
  </>,
);
