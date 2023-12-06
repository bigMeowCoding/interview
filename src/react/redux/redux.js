const actionType = {
  add: "INCREMENT",
  minus: "DECREMENT",
};
export function createStore(reducer, initialState) {
  let state = initialState;
  const listeners = [];
  function getState() {
    return state;
  }
  function dispatch(action) {
    state = reducer(action, state);
    listeners.forEach((listener) => {
      listener();
    });
  }

  function subscribe(listener) {
    listeners.push(listener);

    return {
      unsubscribe() {
        const index = listeners.findIndex(listener);
        listeners.splice(index, 1);
      },
    };
  }

  return {
    getState,
    dispatch,
    subscribe,
  };
}
export function counterReducer(action, state) {
  switch (action.type) {
    case actionType.add:
      return state + 1;
    case actionType.minus:
      return state - 1;
    default:
      return state;
  }
}

const loggerMiddleware =
  ({ getState }) =>
  (next) =>
  (action) => {
    console.log(next, action, "lllll");
    // console.log("prev state", getState());
    next(action);
    // console.log("next state", getState());
  };
const testMiddleware =
  ({ getState }) =>
  (next) =>
  (action) => {
    console.log(next, action, "test");
    // console.log("prev state", getState());
    next(action);
    // console.log("next state", getState());
  };
// 使用
const store = createStore(counterReducer, 0, [
  loggerMiddleware,
  testMiddleware,
]);
store.subscribe(() => console.log("listener=======", store.getState()));

store.dispatch({ type: "INCREMENT" }); // 1
store.dispatch({ type: "INCREMENT" }); // 2
store.dispatch({ type: "DECREMENT" }); // 1
