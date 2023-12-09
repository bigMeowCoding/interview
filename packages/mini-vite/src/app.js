#!/usr/bin/env node
// 配置运行node的位置

// 导入所需的koa模块
const Koa = require("koa");
const send = require("koa-send");
const path = require("path");
const compilerSFC = require("@vue/compiler-sfc");
const { Readable } = require("stream");

// 创建 实例 koa
const app = new Koa();

const stremToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    // 注册 stream 的 data 事件， 去监听读取到的 buffer
    stream.on("data", (chunk) => chunks.push(chunk));
    // 数据读取完毕，调用 resolve 并传递数据
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    // 注册错误事件
    stream.on("error", reject);
  });
const stringToStream = (text) => {
  const stream = new Readable();
  stream.push(text);
  stream.push(null); // 标记结束
  return stream;
};

app.use(async (ctx, next) => {
  if (ctx.path.startsWith("/@modules/")) {
    // 拿到模块的名称
    const moduleName = ctx.path.substring(10);
    // package.json 文件的路径
    const pkgPath = path.join(
      process.cwd(),
      "node_modules",
      moduleName,
      "package.json",
    );
    const pkg = require(pkgPath);
    // 为请求路径进行赋值
    ctx.path = path.join("/node_modules", moduleName, pkg.module);
  }
  await next();
});
// 将服务器变为静态资源库
app.use(async (ctx, next) => {
  /**
   * @param ctx 当前上下文
   * @param ctx.path 请求的路径
   * @param 根目录
   */
  await send(ctx, ctx.path, { root: process.cwd(), index: "index.html" });
  // 接下来 让他运行其他的中间件
  await next();
});
app.use(async (ctx, next) => {
  if (ctx.path.endsWith(".vue")) {
    // 需要转换流
    const contents = await stremToString(ctx.body);
    const { descriptor } = compilerSFC.parse(contents);
    let code;
    // 如果没有type请求，那就是第一次请求
    if (!ctx.query.type) {
      code = descriptor.script.content;
      code = code.replace(/export\s+default\s+/g, "const __script = ");
      code += `
      import { render as __render } from "${ctx.path}?type=template"
      __script.render = __render
      export default __script
      `;
    } else if (ctx.query.type === "template") {
      const templateRender = compilerSFC.compileTemplate({
        source: descriptor.template.content,
      });
      code = templateRender.code;
    }
    ctx.type = "application/javascript";
    ctx.body = stringToStream(code);
  }
  await next();
});
app.use(async (ctx, next) => {
  if (ctx.type === "application/javascript") {
    const contents = await stremToString(ctx.body);
    // console.log("contents====", contents);
    // import vue from 'vue'
    // import App from './App.vue'
    ctx.body = contents
      .replace(/(from\s+['"])(?![\.\/])/g, "$1/@modules/")
      .replace(/process\.env\.NODE_ENV/g, '"development"');
  }
  await next();
});

app.listen(3000);
console.log("Asever running http://localhost:3000");
