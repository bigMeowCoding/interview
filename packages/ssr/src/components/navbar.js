import { Link } from "react-router-dom";
import React from "react";

export default () => {
  return (
    <>
      <Link to={"/"}>home</Link>
      <Link to={"/about"}>about</Link>
    </>
  );
};
