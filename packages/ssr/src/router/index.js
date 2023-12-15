import { Route, Routes } from "react-router-dom";
import Home from "../containers/Home";
import About from "../containers/About";
import React from "react";

export default (
  <Routes>

      <Route path="/about" exact  element={<About />}></Route>
      <Route path="/" exact element={<Home />}></Route>

  </Routes>
);
