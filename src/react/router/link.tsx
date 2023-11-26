import React, { useContext } from "react";
import { FC } from "react";
import { RouterContext } from "./context";

interface Props {}

const Link: FC<Props> = ({ to, children }) => {
  const { mode } = useContext(RouterContext);
  return (
    <a
      onClick={() => {
        console.log("click");
        if (mode === "browser") {
          history.pushState({}, "", to);
          window.dispatchEvent(new PopStateEvent("popstate"));
        } else {
          location.hash = to;
        }
      }}
    >
      {children}
    </a>
  );
};

export default Link;
