const actionType = {
  add: "INCREMENT",
  minus: "DECREMENT",
};
export function createStore(reducer, initialState, middlewares = []) {
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
  const middlewareApi = {
    getState,
  };
  middlewares = middlewares.map((middleware) => {
    return middleware(middlewareApi);
  });
  if (middlewares.length) {
    dispatch = compose(middlewares)(dispatch);
  }

  return {
    getState,
    dispatch,
    subscribe,
  };
}

function compose(funcs) {
  if (!funcs) {
    return (args) => args;
  }
  if (funcs.length === 1) {
    return funcs[0];
  }
  return funcs.reduce((a, b) => {
    return (...args) => {
      return a(b(...args));
    };
  });
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
    console.log(next, action, "loggerMiddleware");
    // console.log("prev state", getState());
    next(action);
    // console.log("next state", getState());
  };
const testMiddleware =
  ({ getState }) =>
  (next) =>
  (action) => {
    console.log(next, action, "testMiddleware");
    // console.log("prev state", getState());
    next(action);
    // console.log("next state", getState());
  };
// 使用
const store = createStore(counterReducer, 0, [
  loggerMiddleware,
  // testMiddleware,
]);
store.subscribe(() => console.log("listener=======", store.getState()));

store.dispatch({ type: "INCREMENT" }); // 1
store.dispatch({ type: "INCREMENT" }); // 2
store.dispatch({ type: "DECREMENT" }); // 1
