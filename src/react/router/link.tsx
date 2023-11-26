import React from "react";
import { FC } from "react";

interface Props {}

const Link: FC<Props> = ({ to, children }) => {
  return (
    <a
      onClick={() => {
        console.log("click");
        history.pushState({}, "", to);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }}
    >
      {children}
    </a>
  );
};

export default Link;
