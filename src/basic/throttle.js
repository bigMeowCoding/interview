// 函数节流是指规定一个单位时间，在这个单位时间内，只能有一次触发事件的回调函数执行，
// 如果在同一个单位时间内某事件被触发多次，只有一次能生效
function throttle(fn, delay) {
  let timer = null;
  return function () {
    const now = new Date().getTime();
    if (timer && now - timer < delay) {
      return;
    }
    const context=this;
    fn.apply(context,arguments);
    timer = new Date().getTime();
  };
}

let count = 1;
const throttleFn = throttle((a,b) => {
  console.log("call", count);
    console.log('sum',a+b)
  count++;
}, 1000);

throttleFn(1,2);
throttleFn(2,3);
// setTimeout(() => {
//   throttleFn();
// }, 500);
setTimeout(() => {
  throttleFn(3,3);
}, 1000);
