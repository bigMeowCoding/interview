// 创建一个包含 ASCII 字符 'hello' 的 Buffer
const buf1 = Buffer.from('hello', 'ascii');

// 创建一个长度为 10 的初始化 Buffer
const buf2 = Buffer.alloc(10);

// 创建一个长度为 10 的未初始化 Buffer
const buf3 = Buffer.allocUnsafe(10);

// console.log(buf1,buf2,buf3)
console.log(buf1.toString('hex')); // 将 Buffer 数据以十六进制形式输出
console.log(buf1.toString('base64')); // 将 Buffer 数据以 base64 形式输出
console.log(buf1.toString())