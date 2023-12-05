const mc = new MessageChannel();
let messageCb = null;
const frameDuration = 60; // 大约 60fps

mc.port1.onmessage = function () {
  if (!messageCb) {
    console.error("没有message callback");
  }
  let startTime = performance.now();
  requestAnimationFrame(() => {
    messageCb({
      timeRemaining() {
        return Math.max(0, frameDuration - performance.now() + startTime);
      },
    });
  });
};

export function reqestIdleCallBackShim(cb) {
  messageCb = cb;
  mc.port2.postMessage(null);
}

function workLoop(e) {
  console.log(e && e.didTimeout, e && e.timeRemaining());
  
  reqestIdleCallBackShim(workLoop);
}

reqestIdleCallBackShim(workLoop);
