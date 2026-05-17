import { createRoot } from "react-dom/client";
import PerformancePanelDemo from "./performance-panel-demo/PerformancePanelDemo";
// import RouterDemo from "./router";
// import HashRouterDemo from "./router/hash-index";
// import ReduxDemo from "./redux";
// import WaterPrint from "./canvas/water-print/water-print";
// import ClipDemo from "./canvas/clip";
// import Counter from "./counter";
// import CounterDown from "./counter-down";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("#root not found");
}
const root = createRoot(rootEl);

root.render(
  <>
    <PerformancePanelDemo />
    {/* import RouterDemo from "./router" 后可切换 */}
    {/*  <HashRouterDemo/>*/}
    {/*<ReduxDemo />*/}
    {/*<CounterDown/>*/}
    {/*  <WaterPrint/>*/}
    {/* <ClipDemo/> */}
  </>,
);
