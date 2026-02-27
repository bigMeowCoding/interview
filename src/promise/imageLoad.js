// 用 Promise 实现一个异步加载图片的代码，用 loading 表示加载时，加载完成/失败
function imageLoad(src) {
  return new Promise((res, rej) => {
    const image = new Image(100, 100);
    image.src = src;
    src.onLoad = function () {
      res(true);
    };
    src.onerror = function (error) {
      rej(error);
    };
  });
}
