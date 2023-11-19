Function.prototype.myApply = function(context) {
  // 判断调用对象是否为函数
  if (typeof this !== "function") {
    throw new TypeError("Error");
  }
  let result = null;
  // 判断 context 是否存在，如果未传入则为 window
  context = context || window;
  console.log('context',context)
  // 将函数设为对象的方法
  context.fn = this;
  // 调用方法
  if (arguments[1]) {
    result = context.fn(...arguments[1]);
  } else {
    result = context.fn();
  }
  // 将属性删除
  delete context.fn;
  return result;
};

Function.prototype.myBind = function (context) {
  // 判断调用对象是否为函数
  if (typeof this !== "function") {
    throw new TypeError("Error");
  }
  // 获取参数
  var args = [...arguments].slice(1),
    fn = this;
  console.log("this", this,context);
  return function Fn() {
    console.log("thisin",this instanceof Fn ? this : context,);

    // 根据调用方式，传入不同绑定值
    return fn.myApply(
      this instanceof Fn ? this : context,
      args.concat(...arguments),
    );
  };
};
var bar = function () {
  console.log(this.x);
};
var foo = {
  x: 3,
};
var sed = {
  x: 4,
};
var func = bar.myBind(foo).myBind(sed);
func(); //?

// var fiv = {
//   x: 5,
// };
// var func = bar.myBind(foo).myBind(sed).myBind(fiv);
// func(); //
