import React from "react";
import { FC } from "react";
import Router from "./router";
import Route from "./route";
import Link from "./link";
import "./style.css";
interface Props {}
const Home = () => <h2>Home context</h2>;
const About = () => <h2>About context</h2>;
const RouterDemo: FC<Props> = () => {
  // return <div className="rect">rect</div>;
  return (
    <div className="parent">
      <div className="child">rect</div>
    </div>
  );
};

export default RouterDemo;
