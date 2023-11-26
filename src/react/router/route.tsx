import React, { useContext } from "react";
import { FC } from "react";
import { RouterContext } from "./context";

interface Props {}

const Route: FC<Props> = ({ path, component }) => {
  const { currentPath } = useContext(RouterContext);
  console.log(currentPath,path)
  if (currentPath !== path) {
    return null;
  }
  return React.createElement(component);
};

export default Route;
