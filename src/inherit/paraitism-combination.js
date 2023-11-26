// 寄生组合继承

function inherit(subType, superType) {
  subType.prototype = Object.create(superType.prototype);
  subType.constructor = subType;
}

function superType() {
  this.name = "zhangsan";
}
superType.prototype.getName = function () {
  console.log(this.name);
};
function subType() {
  superType.call(this);
  this.age = 18;
}
inherit(subType, superType);
subType.prototype.sayAge = function () {
  console.log(this.age);
};
const type = new subType();

type.sayAge();
type.getName();
