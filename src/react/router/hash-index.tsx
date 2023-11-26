import React from "react";
import { FC } from "react";
import Router from "./router";
import Route from "./route";
import Link from "./link";
import HashRouter from "./hash-router";

interface Props {}
const Home = () => <h2>Home context</h2>;
const About = () => <h2>About context</h2>;
const HashRouterDemo: FC<Props> = () => {
  return (
    <HashRouter>
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
    </HashRouter>
  );
};

export default HashRouterDemo;
