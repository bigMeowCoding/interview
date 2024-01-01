function setIntervalByTimeout(cb, timeout) {
  let timer = null;
  function interval() {
    timer = setTimeout(interval, timeout);
      cb();
  }

    interval()
  return {
    cancel() {

      clearTimeout(timer);
    },
  };
}
let count = 1;
let { cancel } = setIntervalByTimeout(() => {
  console.log(count);
  if (count === 5) {
    cancel();
  }
  count++;
}, 1000);
