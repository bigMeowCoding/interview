// 函数防抖是指在事件被触发 n 秒后再执行回调，如果在这 n 秒内事件又被触发，
// 则重新计时。这可以使用在一些点击请求的事件上，避免因为用户的多次点击向后端发送多次请求。
function debounce(fn, delay) {
  let timer = null;
  return function () {
    const context = this,
      args = arguments;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
}

let count = 1;
const debounceFn = debounce((a,b) => {
    console.log("call", count);
    console.log('sum',a+b)
    count++;
}, 1000);

debounceFn(1,2);
debounceFn(2,3);
// setTimeout(() => {
//   throttleFn();
// }, 500);
setTimeout(() => {
    debounceFn(3,3);
}, 500);

