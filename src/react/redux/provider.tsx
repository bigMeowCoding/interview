import React from "react";
import { FC } from "react";
import { ReduxContext } from "./context";
interface Props {}

const Provider: FC<Props> = ({ store, children }) => {
  return (
      <ReduxContext.Provider value={store}>
        {children}
      </ReduxContext.Provider>
  );
};

export default Provider;
