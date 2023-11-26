import React, { useEffect, useState } from "react";
import { FC } from "react";
import { RouterContext } from "./context";

interface Props {}
function getHashPath() {
  let hashPath = window.location.hash;

  return hashPath.includes("#") ? hashPath.replace("#", "") : hashPath;
}
const HashRouter: FC<Props> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(getHashPath());
  function hashChange(path) {
    console.log("hashchange", window.location.hash);
    let hashPath = getHashPath();
    setCurrentPath(hashPath);
  }
  useEffect(() => {
    window.addEventListener("hashchange", hashChange);
    return () => {
      window.removeEventListener("hashchange", hashChange);
    };
  }, []);
  return (
    <RouterContext.Provider value={{ currentPath, mode: "hash" }}>
      {children}
    </RouterContext.Provider>
  );
};

export default HashRouter;
