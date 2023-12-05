import React, { lazy } from "react";
import { FC } from "react";
import { Button } from "antd";

interface Props {}

const Counter: FC<Props> = () => {
  return    <Button
      onClick={() => {
        alert("click");
      }}
  >
    button
  </Button>;
};

export default Counter;
