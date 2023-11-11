function interval(cb, interval) {
  console.log("my");
  let timer = null;
  let startTime = Date.now();
  let endTime = startTime;
  function loop() {
    endTime = Date.now();
    timer = requestAnimationFrame(loop);
    if (endTime - startTime >= interval) {
      cb(timer);
      startTime = Date.now();
      endTime = startTime;
    }
  }
  timer = requestAnimationFrame(loop);

  return timer;
}
let count = 1;
interval((timer) => {
  console.log(count);
  if (count === 3) {
    cancelAnimationFrame(timer);
  }
  count++;
}, 1000);
