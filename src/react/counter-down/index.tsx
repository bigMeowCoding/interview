import React, { lazy, useEffect, useRef, useState } from "react";
import { FC } from "react";
import { Button } from "antd";

interface Props {}

const CounterDown: FC<Props> = () => {
  const [counter, setCounter] = useState(10);
  let lastTimeoutRef = useRef();
  let timerRef = useRef();

  useEffect(() => {
    console.log("ddd");
    console.log(counter);
    if (counter > 0) {
      timerRef.current = setTimeout(() => {
        setCounter((counter) => counter - 1);
      }, 1000);
    }
  }, [counter]);
  return <div>counter {counter}</div>;
};

export default CounterDown;
