import React, { lazy, Suspense } from "react";
import { FC } from "react";
import Router from "./router";
import Route from "./route";
import Link from "./link";
import HashRouter from "./hash-router";
import { Spin } from "antd";
import { customeLazy } from "../../basic/lazy";
const LazyButton = customeLazy(() => {
  return import("../counter/index");
});
interface Props {}
const Home = () => (
  <div>
    home
    <Suspense fallback={<Spin />}>
      <h2>Preview</h2>
      <LazyButton />
    </Suspense>
  </div>
);
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
