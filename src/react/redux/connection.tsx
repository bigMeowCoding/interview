import React, { useContext, useEffect, useState } from "react";
import { ReduxContext } from "./context";

export function connection(mapStateToProps, mapDispatchToProps) {
  return (WrapperComponent) => (props) => {
    const store = useContext(ReduxContext);
    const [state, setState] = useState(store.getState());
    useEffect(() => {
      const { unsubscribe } = store.subscribe(() => {
        setState(store.getState());
      });
      return unsubscribe;
    }, []);
    return (
      <WrapperComponent
        {...mapStateToProps(state)}
        {...mapDispatchToProps(store.dispatch)}
      />
    );
  };
}
