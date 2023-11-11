Function.prototype.myCall = function (context) {
  if (typeof this !== "function") {
    return;
  }
  const args = Array.from(arguments).slice(1);
  context = context || window;
  context.fn = this;
  const result = context.fn(...args);
  delete context.fn;
  return result;
};
Function.prototype.myBind = function (context) {
  if (typeof this !== "function") {
    return;
  }
  const args = Array.from(arguments).slice(1);
  let _this = this;
  function fun(...arg) {
    context = context || window;
    context.fn = _this;
    const result = context.fn(...args, ...arg);
    delete context.fn;
    return result;
  }
  return fun;
};
function sum(a, b,c) {
    console.log('abc',a,b,c)
  return this.a + this.b;
}

// const ret = sum.myCall({ a: 1, b: 2 });
// console.log("ret", ret);
const bindSum = sum.myBind({ a: 1, b: 2 },1,2);
const ret = bindSum(3);
console.log(ret);
