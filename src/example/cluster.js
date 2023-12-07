import cluster from "cluster";

import http from "http";

import { cpus } from "os"; // 获取 CPU 核心数

const numCPUs = cpus().length;
console.log("num===cpus", numCPUs);
if (cluster.isMaster) {
  console.log(`主进程 ${process.pid} 正在运行`);

  // 衍生工作进程
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`工作进程 ${worker.process.pid} 已退出`);
  });
} else {
  // 工作进程可以共享任何 TCP 连接
  // 在本例子中，共享的是一个 HTTP 服务器
  http
    .createServer((req, res) => {
      res.writeHead(200);
      res.end("hello world\n");
    })
    .listen(8000);

  console.log(`工作进程 ${process.pid} 已启动`);
}
