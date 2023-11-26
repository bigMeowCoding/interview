import React from "react";
import { FC } from "react";
import Router from "./router";
import Route from "./route";
import Link from "./link";

interface Props {}
const Home = () => <h2>Home context</h2>;
const About = () => <h2>About context</h2>;
const RouterDemo: FC<Props> = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
          </ul>
        </nav>

        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
      </div>
    </Router>
  );
};

export default RouterDemo;
