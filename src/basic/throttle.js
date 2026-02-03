// 函数节流是指规定一个单位时间，在这个单位时间内，只能有一次触发事件的回调函数执行，
// 如果在同一个单位时间内某事件被触发多次，只有一次能生效
function throttle(fn, delay) {
  let _timer = null;
  return function (...args) {
    const now = new Date().getTime();
    if (now - _timer < delay) {
      return;
    }
    fn.apply(this, args);
    _timer = now;
  };
}
export default throttle;
