
import React from "react";
export function customeLazy(importFuction) {
  let component = null,
    promise = null;
  return function (props) {
    if (!component) {
      if (!promise) {
        promise = importFuction().then((module) => {
          component = module.default;
        });
      }
        throw promise;
    }
    console.log('comp',component)
    return React.createElement(component,props);
  };
}
