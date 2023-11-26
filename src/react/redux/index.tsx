import React from "react";
import { FC } from "react";
import Provider from "./provider";
import { connection } from "./connection";

import { counterReducer, createStore } from "./redux";

interface Props {}
const store = createStore(counterReducer,0);

const ReduxDemo: FC<Props> = () => {
  return (
    <Provider store={store}>
      <ConnectedCounter />
    </Provider>
  );
};

// 创建Redux store

// 一个简单的计数器组件
const Counter = ({ value, onIncrement, onDecrement }) => {
  return (
    <div>
      <span>{value}</span>
      <button onClick={onIncrement}>+</button>
      <button onClick={onDecrement}>-</button>
    </div>
  );
};

// 映射Redux state到组件的props
const mapStateToProps = (state) => ({
  value: state,
});

// 映射dispatch到组件的props
const mapDispatchToProps = (dispatch) => ({
  onIncrement: () => dispatch({ type: "INCREMENT" }),
  onDecrement: () => dispatch({ type: "DECREMENT" }),
});

// 连接组件
const ConnectedCounter = connection(
  mapStateToProps,
  mapDispatchToProps,
)(Counter);

export default ReduxDemo;
