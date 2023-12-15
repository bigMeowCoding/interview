import Home from "../containers/Home";
import React from "react";
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import router from "../router";

const root = hydrateRoot(document.getElementById("root"));
root.render(<BrowserRouter basename='/' >{router}</BrowserRouter>);
