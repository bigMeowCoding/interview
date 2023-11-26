import React, { useEffect, useState } from "react";
import { FC } from "react";
import { RouterContext } from "./context";

interface Props {}

const Router: FC<Props> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  function locationChange(path) {
    console.log("locationChange", path);
    setCurrentPath(window.location.pathname);
  }
  useEffect(() => {
    window.addEventListener("popstate", locationChange);
    return () => {
      window.removeEventListener("popstate", locationChange);
    };
  }, []);
  return (
    <RouterContext.Provider value={{ currentPath, mode: "browser" }}>
      {children}
    </RouterContext.Provider>
  );
};

export default Router;
