// 组合继承
function superType() {
  this.color = ["red"];
}
superType.prototype.getColors = function () {
  return this.color.join(",");
};
function subType() {
  superType.call(this);
}
subType.prototype=new superType()
subType.prototype.constructor=subType

const type = new subType();

type.color.push("black");
console.log(type.color);
console.log(type.getColors())

const t2 = new subType();
console.log(t2.color);
console.log(t2.getColors())

