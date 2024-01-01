function setTimeoutByInterval(cb, times) {
  let timer = null;

  timer = setInterval(()=> {
    cb()
    clearInterval(timer)
  }, times);

  return {
    cancel() {
      clearInterval(timer);
    },
  };
}
let count = 1;
let { cancel } = setTimeoutByInterval(() => {
  console.log(count);
  count++;
}, 1000);
