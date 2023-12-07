process.on("uncaughtException", (err) => {
  // 记录错误，清理资源等
  process.exit(1); // 推荐退出进程
  console.log("uncaughterror", err);
});
process.on("unhandledRejection", (reason, promise) => {
  // 记录未处理的拒绝
  console.log("unhandledRejection", reason, promise);
});
// a.c = "3";

Promise.reject("reject").then((a) => console.log(a));
throw new Error('errrrr')