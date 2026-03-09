import React, { useEffect } from "react";
import { FC } from "react";
import { useRef } from "react";
import "./style.css";
interface Props {}

const RouterDemo: FC<Props> = () => {
  // return <div className="rect">rect</div>;
  const count = useRef(0);
  useEffect(() => {
    console.log("ddd");
    alert(count.current);
  }, [count.current]);
  return (
    <div
      className="parent"
      onClick={() => console.log("click", count.current++)}
    >
      {count.current}
    </div>
  );
};

export default RouterDemo;
