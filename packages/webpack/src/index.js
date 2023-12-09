import clone from "lodash-es/clone";
import _ from "lodash";
import sum from "./sum";
const obj = { a: 1 };
let ret = clone(obj);
console.log(ret);
console.log(sum(2, 3));
console.log(_.eq(obj, ret));
