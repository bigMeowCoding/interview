 function createStore(reducer, initialState, middlewares = []) {
  let state = initialState,
    listeners = [];
  function getState() {
    return state;
  }

  function dispatch(action) {
    state = reducer(state, action);
    listeners.forEach((item) => item());
  }
  function subscribe(listener) {
    listeners.push(listener);
    return function unsubscribe() {
      const index = listeners.findIndex((item) => {
        return item === listener;
      });
      index !== -1 && listeners.splice(index, 1);
    };
  }

  const middlewareAPI = {
    getState,
    dispatch,
  };
  const chain = middlewares.map((item) => item(middlewareAPI));
  dispatch = compose(...chain)(dispatch);
  return {
    getState,
    dispatch,
    subscribe,
  };
}
function compose(...func) {
  if (!func.length) {
    return (arg) => arg;
  }

  if (func.length === 1) {
    return func[0];
  }
  return func.reduce(
    (a, b) =>
      (...args) =>
        a(b(...args)),
  );
}
 function counterReducer(state = 0, action) {
  switch (action.type) {
    case "INCREMENT":
      return state + 1;
    case "DECREMENT":
      return state - 1;
    default:
      return state;
  }
}
const loggerMiddleware =
  ({ getState }) =>
  (next) =>
  (action) => {
      console.log(next,action,'lllll')
    // console.log("prev state", getState());
    next(action);
    // console.log("next state", getState());
  };
 const testMiddleware =
     ({ getState }) =>
         (next) =>
             (action) => {
                 console.log(next,action,'test')
                 // console.log("prev state", getState());
                 next(action);
                 // console.log("next state", getState());
             };
// 使用
const store = createStore(counterReducer, 0, [loggerMiddleware,testMiddleware]);
store.subscribe(() => console.log("listener=======", store.getState()));

store.dispatch({ type: "INCREMENT" }); // 1
store.dispatch({ type: "INCREMENT" }); // 2
store.dispatch({ type: "DECREMENT" }); // 1
