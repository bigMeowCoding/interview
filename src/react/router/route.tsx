import React, { useContext } from "react";
import { FC } from "react";
import { RouterContext } from "./router";

interface Props {}

const Route: FC<Props> = ({ path, component }) => {
  const { currentPath } = useContext(RouterContext);
  if (currentPath !== path) {
    return null;
  }
  return React.createElement(component);
};

export default Route;
