import React, { useContext, useEffect, useState } from "react";
import { ReduxContext } from "./context";

export function connection(mapStateToProps, mapDispatchToProps) {
  return (WrapperComponent) => {
    return (props) => {
      const store = useContext(ReduxContext);
      const [state, setState] = useState(mapStateToProps(store.getState?.()));

      useEffect(() => {
        return store.subscribe(() => {
          setState(mapStateToProps(store.getState()));
        });
      }, []);
      const dispatchProps = mapDispatchToProps
        ? mapDispatchToProps(store.dispatch)
        : { dispatch: store.dispatch };
      return <WrapperComponent {...state} {...dispatchProps} />;
    };
  };
}
