import * as React from "react";

export const RouterContext = React.createContext<{
  currentPath: "";
  mode: "hash";
}>({ currentPath: "" });
