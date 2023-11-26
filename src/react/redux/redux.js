export function createStore(reducer, initialState) {
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
  return {
    getState,
    dispatch,
    subscribe,
  };
}
export function counterReducer(state = 0, action) {
  switch (action.type) {
    case "INCREMENT":
      return state + 1;
    case "DECREMENT":
      return state - 1;
    default:
      return state;
  }
}
// // 使用
// const store = createStore(counterReducer);
// store.subscribe(() => console.log("listener=======", store.getState()));
//
// store.dispatch({ type: "INCREMENT" }); // 1
// store.dispatch({ type: "INCREMENT" }); // 2
// store.dispatch({ type: "DECREMENT" }); // 1
