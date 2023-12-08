import fs from "fs";
import readline from "readline";

function readfile() {
  fs.readFile("./a.md",  (err, data) => {
    console.log(err, data);
  });
}
function readStream() {
  const readStream = fs.createReadStream("./a.md", "utf8");
  console.log(readStream, "readstream");
  // 使用 readline 创建逐行读取的接口
  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  });
  // 逐行处理文件
  rl.on("line", (line) => {
    console.log(`文件的一行内容：${line}`);
  });

  // 当文件被完全读取时触发
  rl.on("close", () => {
    console.log("文件读取完毕。");
  });

  // 错误处理
  readStream.on("error", (error) => {
    console.error("读取文件时发生错误:", error);
  });
}

function writeFile() {
    const readStream = fs.createReadStream("./a.md", "utf8");
    const writeStream =fs.createWriteStream('./new.md','utf8');
    // 使用 readline 创建逐行读取的接口
    const rl = readline.createInterface({
        input: readStream,
        crlfDelay: Infinity,
    });
    // 逐行处理文件
    rl.on("line", (line) => {
        writeStream.write(`${line}\n`)
    });

    // 当文件被完全读取时触发
    rl.on("close", () => {
        console.log("文件读取完毕。");
        writeStream.end()
    });

    // 错误处理
    readStream.on("error", (error) => {
        console.error("读取文件时发生错误:", error);
    });
}
readfile();
