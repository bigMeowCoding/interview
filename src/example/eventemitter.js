import EventEmitter from "events";
// 创建 EventEmitter 实例
const myEmitter = new EventEmitter();

// 定义事件监听器
myEmitter.on("event", () => {
  console.log("An event occurred!");
});

// 触发事件
myEmitter.emit("event");
